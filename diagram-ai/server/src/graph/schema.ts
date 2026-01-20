import { z } from "zod";

export const NodeType = z.enum([
  // Basic
  "process",
  "decision",
  "start",
  "end",
  "datastore",
  "actor",
  "note",
  "group",
  
  // Web & Frontend
  "web_client",
  "mobile_app",
  "cdn",
  "load_balancer",
  "api_gateway",
  
  // Backend & Services
  "api_server",
  "microservice",
  "background_job",
  "queue",
  "message_broker",
  "cron_job",
  
  // Database & Storage
  "sql_database",
  "nosql_database",
  "cache",
  "object_storage",
  "file_storage",
  "data_warehouse",
  
  // Infrastructure
  "server",
  "container",
  "kubernetes",
  "cloud_service",
  "vm",
  
  // Communication
  "email_service",
  "sms_service",
  "notification",
  "webhook",
  "websocket",
  
  // Security & Auth
  "auth_service",
  "firewall",
  "vpn",
  
  // Monitoring & Analytics
  "monitoring",
  "logging",
  "analytics",
  
  // Integration
  "third_party_api",
  "payment_gateway",
]);

export const GraphNode = z.object({
  id: z.string().min(1),
  type: NodeType,
  x: z.number(),
  y: z.number(),
  label: z.string().min(1),
  width: z.number().optional(),
  height: z.number().optional(),
  parent: z.string().optional(),
  color: z.string().optional(), // hex color
  icon: z.string().optional(), // emoji or icon name
  description: z.string().optional(), // tooltip text
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
  z.object({ 
    op: z.literal("add_node"), 
    id: z.string().min(1), 
    type: NodeType, 
    label: z.string().min(1),
    width: z.number().optional(),
    height: z.number().optional(),
    parent: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    description: z.string().optional(),
  }),
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
