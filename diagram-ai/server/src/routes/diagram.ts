import { Router } from "express";
import { z } from "zod";
import { Graph, Patch } from "../graph/schema.ts";
import { applyPatch } from "../graph/applyPatch.ts";
import { callLlm } from "../llm/client.ts";
import {
  buildSystemPrompt,
  buildUserPrompt,
  buildRepairSystemPrompt,
  buildRepairUserPrompt,
} from "../llm/prompts.ts";

const router = Router();

const ReqSchema = z.object({
  llm: z.object({
    url: z.string().url(),
    token: z.string().min(1),
    model: z.string().min(1),
  }),
  request_id: z.string().min(1),
  base_version: z.string().min(1),
  instruction: z.string().min(1),
  current_graph: Graph,
  constraints: z.object({
    language: z.literal("tr").default("tr"),
    node_limit: z.number().int().min(10).max(500).default(80),
    lock_positions: z.boolean().default(false),
  }),
});

function stripCodeFences(raw: string): string {
  return raw.trim().replace(/^```(json)?/i, "").replace(/```$/i, "").trim();
}

router.post("/patch", async (req, res) => {
  const parsed = ReqSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { llm, request_id, base_version, instruction, current_graph, constraints } = parsed.data;

  if (base_version !== current_graph.version) {
    return res.status(409).json({ error: "base_version does not match current_graph.version" });
  }

  const system = buildSystemPrompt();
  const user = buildUserPrompt({
    base_version,
    lock_positions: constraints.lock_positions,
    node_limit: constraints.node_limit,
    current_graph_json: JSON.stringify(current_graph, null, 2),
    instruction,
  });

  let raw: string;
  try {
    raw = await callLlm({ llm, system, user, temperature: 0.3, max_tokens: 2000 });
  } catch (e: any) {
    return res.status(502).json({ error: "LLM call failed", details: String(e?.message ?? e) });
  }

  raw = stripCodeFences(raw);

  // 1) parse JSON
  let patchObj: unknown;
  try {
    patchObj = JSON.parse(raw);
  } catch {
    // Repair attempt
    try {
      const repairSystem = buildRepairSystemPrompt();
      const repairUser = buildRepairUserPrompt({
        base_version,
        current_graph_json: JSON.stringify(current_graph, null, 2),
        instruction,
        error_summary: "LLM geçerli JSON dönmedi (parse failed).",
        raw_patch: raw,
      });
      let repaired = await callLlm({ llm, system: repairSystem, user: repairUser, temperature: 0.2, max_tokens: 1200 });
      repaired = stripCodeFences(repaired);
      patchObj = JSON.parse(repaired);
    } catch {
      return res.status(502).json({ error: "LLM did not return valid JSON", raw });
    }
  }

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
      let repaired = await callLlm({ llm, system: repairSystem, user: repairUser, temperature: 0.2, max_tokens: 1200 });
      repaired = stripCodeFences(repaired);
      const repairedObj = JSON.parse(repaired);
      patchParsed = Patch.safeParse(repairedObj);
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
