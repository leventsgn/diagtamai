import { Router } from "express";
import { z } from "zod";
import { createHash } from "crypto";
import { Graph, Patch } from "../graph/schema.js";
import { applyPatch } from "../graph/applyPatch.js";
import { callLlm } from "../llm/client.js";
import {
  buildSystemPrompt,
  buildUserPrompt,
  buildRepairSystemPrompt,
  buildRepairUserPrompt,
} from "../llm/prompts.js";
import { buildRepoSummary } from "../llm/repoSummary.js";

const router = Router();

type RepoCacheEntry = {
  summary: string;
  etag: string;
  updatedAt: number;
};

type RepoContext = {
  repoUrl: string;
  summary?: string;
  etag?: string;
};

const repoSummaryCache = new Map<string, RepoCacheEntry>();

const ReqSchema = z.object({
  llm: z.object({
    url: z.string().url(),
    token: z.string().min(1),
    model: z.string().min(1),
  }),
  request_id: z.string().min(1),
  base_version: z.string().min(1),
  instruction: z.string().min(1),
  repo_url: z.string().url().optional(),
  current_graph: Graph,
  repo_url: z.string().url().optional(),
  repo_summary: z.string().min(1).optional(),
  refresh_repo: z.boolean().optional().default(false),
  constraints: z.object({
    language: z.literal("tr").default("tr"),
    node_limit: z.number().int().min(10).max(500).default(80),
    lock_positions: z.boolean().default(false),
  }),
});

function buildRepoEtag(summary: string): string {
  return createHash("sha256").update(summary).digest("hex");
}

function resolveRepoContext(args: {
  repoUrl?: string;
  repoSummary?: string;
  refreshRepo?: boolean;
}): RepoContext | null {
  if (!args.repoUrl) return null;

  const repoUrl = args.repoUrl.trim();
  if (!repoUrl) return null;

  if (args.refreshRepo) {
    repoSummaryCache.delete(repoUrl);
  }

  if (args.repoSummary && args.repoSummary.trim()) {
    const summary = args.repoSummary.trim();
    const etag = buildRepoEtag(summary);
    repoSummaryCache.set(repoUrl, {
      summary,
      etag,
      updatedAt: Date.now(),
    });
    return { repoUrl, summary, etag };
  }

  const cached = repoSummaryCache.get(repoUrl);
  if (cached) {
    return { repoUrl, summary: cached.summary, etag: cached.etag };
  }

  return { repoUrl };
}

function stripCodeFences(raw: string): string {
  let cleaned = raw.trim();
  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```(json)?/i, "").replace(/```$/i, "").trim();

  // If it still doesn't look like JSON (doesn't start with {), try to find the first { and last }
  if (!cleaned.startsWith('{')) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      cleaned = match[0];
    }
  }

  return cleaned;
}

// Robust sanitization: Normalizes IDs, validates types, and auto-creates missing nodes
function sanitizePatch(patchObj: any, currentGraph: any): any {
  if (!patchObj || typeof patchObj !== 'object' || !Array.isArray(patchObj.ops)) return patchObj;

  const validTypes = [
    "process", "decision", "start", "end", "datastore", "actor", "note", "group",
    "web_client", "mobile_app", "cdn", "load_balancer", "api_gateway",
    "api_server", "microservice", "background_job", "queue", "message_broker", "cron_job",
    "sql_database", "nosql_database", "cache", "object_storage", "file_storage", "data_warehouse",
    "server", "container", "kubernetes", "cloud_service", "vm",
    "email_service", "sms_service", "notification", "webhook", "websocket",
    "auth_service", "firewall", "vpn", "azure", "aws", "gcp",
    "windows", "linux", "ubuntu", "macos", "mssql", "postgres", "mysql", "redis", "mongodb", "elasticsearch",
    "dotnet", "python", "nodejs", "java", "go", "rust", "monitoring", "logging", "analytics", "observability",
    "third_party_api", "payment_gateway", "gateway", "auth", "api", "client", "user", "lb", "db", "service"
  ];

  const defaultType = "microservice";

  // Track all node IDs (existing + newly added in this patch)
  const nodeIds = new Set(currentGraph.nodes.map((n: any) => n.id));

  // 1. Normalize all IDs in ops (slugify)
  const slugify = (id: string) => id.toString().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

  patchObj.ops = patchObj.ops.map((op: any) => {
    if (op.id) op.id = slugify(op.id);
    if (op.from) op.from = slugify(op.from);
    if (op.to) op.to = slugify(op.to);
    if (op.parent) op.parent = slugify(op.parent);

    // Normalize types
    if (op.op === "add_node" && op.type && !validTypes.includes(op.type)) {
      const typeMap: Record<string, string> = {
        "middleware": "microservice", "proxy": "api_gateway", "reverse_proxy": "load_balancer",
        "database": "sql_database", "storage": "object_storage", "app": "web_client",
      };
      op.type = typeMap[op.type.toLowerCase()] || defaultType;
    }

    if (op.op === "add_node") nodeIds.add(op.id);
    return op;
  });

  // 2. Auto-create missing nodes referenced in edges
  const newNodes: any[] = [];
  patchObj.ops.forEach((op: any) => {
    if (op.op === "add_edge") {
      [op.from, op.to].forEach(id => {
        if (!nodeIds.has(id)) {
          // Create missing node
          const label = id.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          newNodes.push({
            op: "add_node",
            id: id,
            type: "process",
            label: label
          });
          nodeIds.add(id);
        }
      });
    }
  });

  // Prepend new nodes to ops so they exist before edges
  if (newNodes.length > 0) {
    patchObj.ops = [...newNodes, ...patchObj.ops];
  }

  return patchObj;
}

router.post("/patch", async (req, res) => {
  const parsed = ReqSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const {
    llm,
    request_id,
    base_version,
    instruction,
    current_graph,
    constraints,
    repo_url,
    repo_summary,
    refresh_repo,
  } = parsed.data;

  if (base_version !== current_graph.version) {
    return res.status(409).json({ error: "base_version does not match current_graph.version" });
  }

  const repoContext = resolveRepoContext({
    repoUrl: repo_url,
    repoSummary: repo_summary,
    refreshRepo: refresh_repo,
  });

  const system = buildSystemPrompt();
  const user = buildUserPrompt({
    base_version,
    lock_positions: constraints.lock_positions,
    node_limit: constraints.node_limit,
    current_graph_json: JSON.stringify(current_graph, null, 2),
    instruction,
    repo_url: repoContext?.repoUrl,
    repo_summary: repoContext?.summary,
    repo_etag: repoContext?.etag,
  });

  console.log("--- REQUEST ---");
  console.log("Instruction:", instruction);
  console.log("Model:", llm.model);

  let raw: string;
  try {
    raw = await callLlm({ llm, system, user, temperature: 0.3, max_tokens: 1024 });
    console.log("--- RESPONSE ---");
    console.log("Raw Response:", raw);
  } catch (e: any) {
    console.error("--- LLM ERROR ---");
    console.error(e);
    return res.status(502).json({ error: "LLM call failed", details: String(e?.message ?? e) });
  }

  if (raw.toLowerCase().includes("unsafe")) {
    return res.status(403).json({
      error: "LLM Safety Filter Triggered",
      details: "Sistem, prompt'un veya cevabın güvenli olmadığını tespit etti. Lütfen isteğinizi farklı şekilde ifade etmeyi deneyin.",
      raw
    });
  }

  raw = stripCodeFences(raw);

  // Helper to close truncated JSON
  const ensureClosed = (json: string): string => {
    let cleaned = json.trim();

    // Backtrack to the last structural comma or open bracket to avoid "key": "val (truncated)
    let lastValidIdx = cleaned.length - 1;
    while (lastValidIdx > 0) {
      const char = cleaned[lastValidIdx];
      if (char === ',' || char === '{' || char === '[') {
        cleaned = cleaned.substring(0, lastValidIdx);
        break;
      }
      lastValidIdx--;
    }

    let stack: string[] = [];
    let inString = false;
    let escaped = false;

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (escaped) { escaped = false; continue; }
      if (char === '\\') { escaped = true; continue; }
      if (char === '"' && !escaped) { inString = !inString; continue; }
      if (inString) continue;

      if (char === '{' || char === '[') stack.push(char === '{' ? '}' : ']');
      else if (char === '}' || char === ']') stack.pop();
    }

    let closed = cleaned;
    if (inString) closed += '"';
    while (stack.length > 0) closed += stack.pop();
    return closed;
  };

  // 1) parse JSON
  let patchObj: unknown;
  try {
    patchObj = JSON.parse(raw);
  } catch {
    // Try to salvage truncated JSON
    try {
      const closed = ensureClosed(raw);
      patchObj = JSON.parse(closed);
    } catch {
      // Repair attempt with LLM
      try {
        const repairSystem = buildRepairSystemPrompt();
        const repairUser = buildRepairUserPrompt({
          base_version,
          current_graph_json: JSON.stringify(current_graph, null, 2),
          instruction,
          error_summary: "LLM geçerli JSON dönmedi (parse failed).",
          raw_patch: raw,
        });
        let repaired = await callLlm({ llm, system: repairSystem, user: repairUser, temperature: 0.2, max_tokens: 1024 });
        repaired = stripCodeFences(repaired);
        patchObj = JSON.parse(repaired);
      } catch {
        return res.status(502).json({ error: "LLM did not return valid JSON", raw });
      }
    }
  }

  // Normalize and auto-fix patch before validation
  patchObj = sanitizePatch(patchObj, current_graph);

  // 2) schema validate
  let patchParsed = Patch.safeParse(patchObj);
  if (!patchParsed.success) {
    // Repair attempt (1 retry)
    try {
      const repairSystem = buildRepairSystemPrompt();
      const repairUser = buildRepairUserPrompt({
        base_version,
        current_graph_json: JSON.stringify(current_graph, null, 2),
        instruction,
        error_summary: JSON.stringify(patchParsed.error.flatten()),
        raw_patch: JSON.stringify(patchObj, null, 2),
      });
      let repaired = await callLlm({ llm, system: repairSystem, user: repairUser, temperature: 0.2, max_tokens: 1024 });
      repaired = stripCodeFences(repaired);
      const repairedObj = JSON.parse(repaired);
      // Normalize and auto-fix repaired patch as well
      const normalizedRepaired = sanitizePatch(repairedObj, current_graph);
      patchParsed = Patch.safeParse(normalizedRepaired);
    } catch {
      // fallthrough
    }
  }

  if (!patchParsed.success) {
    return res.status(502).json({ error: "Invalid patch schema", details: patchParsed.error.flatten(), raw: patchObj });
  }

  // 3) apply patch atomically
  try {
    const new_graph = applyPatch(current_graph, patchParsed.data);
    return res.json({
      request_id,
      applied: true,
      new_graph,
      patch: patchParsed.data,
      warnings: [],
    });
  } catch (e: any) {
    return res.status(409).json({ error: String(e?.message ?? e) });
  }
});

export default router;
