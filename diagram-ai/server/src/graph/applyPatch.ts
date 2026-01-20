import crypto from "crypto";
import { Graph, Patch } from "./schema.ts";

function hashGraph(graph: Omit<Graph, "version">): string {
  const s = JSON.stringify(graph);
  return crypto.createHash("sha256").update(s).digest("hex").slice(0, 8);
}

function stableNewNodePosition(existingCount: number): { x: number; y: number } {
  // Basit grid layout (V1). V2'de dagre/elk eklenebilir.
  const col = existingCount % 5;
  const row = Math.floor(existingCount / 5);
  return { x: 80 + col * 220, y: 60 + row * 120 };
}

export function applyPatch(current: Graph, patch: Patch): Graph {
  if (patch.base_version !== current.version) {
    throw new Error(`base_version mismatch: got ${patch.base_version}, expected ${current.version}`);
  }

  const nodes = new Map(current.nodes.map((n) => [n.id, { ...n }]));
  const edges = new Map(current.edges.map((e) => [e.id, { ...e }]));

  for (const op of patch.ops) {
    switch (op.op) {
      case "add_node": {
        if (nodes.has(op.id)) throw new Error(`node exists: ${op.id}`);
        const pos = stableNewNodePosition(nodes.size);
        nodes.set(op.id, { id: op.id, type: op.type, label: op.label, x: pos.x, y: pos.y });
        break;
      }

      case "update_node": {
        const n = nodes.get(op.id);
        if (!n) throw new Error(`node not found: ${op.id}`);
        nodes.set(op.id, {
          ...n,
          type: op.patch.type ?? n.type,
          label: op.patch.label ?? n.label,
        });
        break;
      }

      case "delete_node": {
        nodes.delete(op.id);
        for (const [eid, e] of edges.entries()) {
          if (e.from === op.id || e.to === op.id) edges.delete(eid);
        }
        break;
      }

      case "add_edge": {
        if (edges.has(op.id)) throw new Error(`edge exists: ${op.id}`);
        if (!nodes.has(op.from) || !nodes.has(op.to)) throw new Error(`edge endpoints missing: ${op.from} -> ${op.to}`);
        edges.set(op.id, { id: op.id, from: op.from, to: op.to, label: op.label ?? "" });
        break;
      }

      case "update_edge": {
        const e = edges.get(op.id);
        if (!e) throw new Error(`edge not found: ${op.id}`);
        edges.set(op.id, { ...e, label: op.patch.label ?? e.label });
        break;
      }

      case "delete_edge": {
        edges.delete(op.id);
        break;
      }

      case "layout_hint":
        // V1: ignore (positions preserved by default). V2: implement if desired.
        break;
    }
  }

  const nextNoVersion = { nodes: [...nodes.values()], edges: [...edges.values()] };
  const version = hashGraph(nextNoVersion);
  return { version, ...nextNoVersion };
}
