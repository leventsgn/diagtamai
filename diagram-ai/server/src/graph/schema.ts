import { z } from "zod";

export const NodeType = z.enum([
  "process",
  "decision",
  "start",
  "end",
  "datastore",
  "actor",
  "note",
]);

export const GraphNode = z.object({
  id: z.string().min(1),
  type: NodeType,
  x: z.number(),
  y: z.number(),
  label: z.string().min(1),
});

export const GraphEdge = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  label: z.string().optional().default(""),
});

export const Graph = z.object({
  version: z.string().min(1),
  nodes: z.array(GraphNode),
  edges: z.array(GraphEdge),
});

export type Graph = z.infer<typeof Graph>;

export const PatchOp = z.discriminatedUnion("op", [
  z.object({ op: z.literal("add_node"), id: z.string().min(1), type: NodeType, label: z.string().min(1) }),
  z.object({
    op: z.literal("update_node"),
    id: z.string().min(1),
    patch: z.object({ label: z.string().optional(), type: NodeType.optional() }),
  }),
  z.object({ op: z.literal("delete_node"), id: z.string().min(1) }),

  z.object({
    op: z.literal("add_edge"),
    id: z.string().min(1),
    from: z.string().min(1),
    to: z.string().min(1),
    label: z.string().optional().default(""),
  }),
  z.object({ op: z.literal("update_edge"), id: z.string().min(1), patch: z.object({ label: z.string().optional() }) }),
  z.object({ op: z.literal("delete_edge"), id: z.string().min(1) }),

  z.object({ op: z.literal("layout_hint"), mode: z.enum(["preserve_positions", "auto"]) }),
]);

export const Patch = z.object({
  base_version: z.string().min(1),
  ops: z.array(PatchOp),
});

export type Patch = z.infer<typeof Patch>;
