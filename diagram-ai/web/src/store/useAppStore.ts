import { create } from "zustand";
import type { Edge, Node, MarkerType } from "reactflow";

export type LlmConfig = {
  url: string;
  token: string;
  model: string;
};

export type GraphState = {
  version: string;
  nodes: { 
    id: string; 
    type: string; 
    x: number; 
    y: number; 
    label: string;
    width?: number;
    height?: number;
    parent?: string;
    color?: string;
    icon?: string;
    description?: string;
  }[];
  edges: { id: string; from: string; to: string; label?: string }[];
};

function loadLlm(): LlmConfig {
  const raw = localStorage.getItem("llm_config");
  if (!raw) {
    return {
      url: "https://diagtamai-8.onrender.com/v1/chat/completions",
      token: "",
      model: "gpt-4o-mini",
    };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {
      url: "https://diagtamai-1.onrender.com/v1/chat/completions",
      token: "",
      model: "gpt-4o-mini",
    };
  }
}

function saveLlm(cfg: LlmConfig) {
  localStorage.setItem("llm_config", JSON.stringify(cfg));
}

const initialGraph: GraphState = {
  version: "init0001",
  nodes: [
    { id: "USR", type: "actor", x: 100, y: 100, label: "Müşteri" },
    { id: "WEB", type: "web_client", x: 300, y: 100, label: "Web Client" },
    { id: "MOB", type: "mobile_app", x: 300, y: 260, label: "Mobil App" },
    { id: "CDN", type: "cdn", x: 520, y: 160, label: "CDN" },
    { id: "LB", type: "load_balancer", x: 720, y: 160, label: "Load Balancer" },
    { id: "GW", type: "api_gateway", x: 920, y: 160, label: "API Gateway" },
    { id: "API", type: "api_server", x: 1120, y: 160, label: "API Server" },
    { id: "AUTH", type: "auth_service", x: 1120, y: 320, label: "Auth Service" },
    { id: "CAT", type: "microservice", x: 1320, y: 80, label: "Catalog Service" },
    { id: "ORD", type: "microservice", x: 1320, y: 200, label: "Order Service" },
    { id: "PAY", type: "payment_gateway", x: 1320, y: 320, label: "Payment Gateway" },
    { id: "INV", type: "microservice", x: 1320, y: 440, label: "Inventory Service" },
    { id: "SHIP", type: "microservice", x: 1320, y: 560, label: "Shipping Service" },
    { id: "MQ", type: "message_broker", x: 1520, y: 260, label: "Event Bus" },
    { id: "JOB", type: "background_job", x: 1720, y: 260, label: "Async Worker" },
    { id: "SQL", type: "sql_database", x: 1520, y: 80, label: "Primary DB" },
    { id: "CACHE", type: "cache", x: 1520, y: 160, label: "Redis Cache" },
    { id: "OBJ", type: "object_storage", x: 1520, y: 360, label: "Object Storage" },
    { id: "SEARCH", type: "analytics", x: 1520, y: 480, label: "Search Index" },
    { id: "MAIL", type: "email_service", x: 1720, y: 360, label: "Email Provider" },
    { id: "SMS", type: "sms_service", x: 1720, y: 440, label: "SMS Gateway" },
    { id: "OBS", type: "monitoring", x: 1720, y: 520, label: "Monitoring" },
  ],
  edges: [
    { id: "E1", from: "USR", to: "WEB", label: "ziyaret" },
    { id: "E2", from: "USR", to: "MOB", label: "kullanır" },
    { id: "E3", from: "WEB", to: "CDN", label: "statik içerik" },
    { id: "E4", from: "MOB", to: "CDN", label: "statik içerik" },
    { id: "E5", from: "CDN", to: "LB", label: "proxy" },
    { id: "E6", from: "LB", to: "GW", label: "routing" },
    { id: "E7", from: "GW", to: "API", label: "API çağrısı" },
    { id: "E8", from: "API", to: "AUTH", label: "kimlik" },
    { id: "E9", from: "API", to: "CAT", label: "ürün listesi" },
    { id: "E10", from: "API", to: "ORD", label: "sipariş" },
    { id: "E11", from: "ORD", to: "PAY", label: "ödeme" },
    { id: "E12", from: "ORD", to: "INV", label: "stok kontrol" },
    { id: "E13", from: "ORD", to: "SHIP", label: "kargo" },
    { id: "E14", from: "CAT", to: "SQL", label: "okuma" },
    { id: "E15", from: "CAT", to: "CACHE", label: "önbellek" },
    { id: "E16", from: "ORD", to: "SQL", label: "yazma" },
    { id: "E17", from: "INV", to: "SQL", label: "stok" },
    { id: "E18", from: "SHIP", to: "SQL", label: "adres" },
    { id: "E19", from: "PAY", to: "OBJ", label: "dekont" },
    { id: "E20", from: "ORD", to: "MQ", label: "event" },
    { id: "E21", from: "MQ", to: "JOB", label: "tüket" },
    { id: "E22", from: "JOB", to: "MAIL", label: "mail" },
    { id: "E23", from: "JOB", to: "SMS", label: "sms" },
    { id: "E24", from: "API", to: "SEARCH", label: "arama" },
    { id: "E25", from: "API", to: "OBS", label: "metrics" },
  ],
};

export const useAppStore = create<{
  llm: LlmConfig;
  setLlm: (p: Partial<LlmConfig>) => void;

  graph: GraphState;
  setGraph: (g: GraphState) => void;

  // Cached ReactFlow data
  rfNodes: Node[];
  rfEdges: Edge[];

  prompt: string;
  setPrompt: (v: string) => void;

  live: boolean;
  setLive: (v: boolean) => void;

  lockPositions: boolean;
  setLockPositions: (v: boolean) => void;

  nodeLimit: number;
  setNodeLimit: (v: number) => void;

  status: string;
  setStatus: (v: string) => void;

  toReactFlow: () => { nodes: Node[]; edges: Edge[] };
  fromReactFlow: (nodes: Node[], edges: Edge[]) => void;
  updateReactFlowCache: () => void;
}>( (set, get) => ({
  llm: loadLlm(),
  setLlm: (p) => {
    const next = { ...get().llm, ...p };
    saveLlm(next);
    set({ llm: next });
  },

  graph: initialGraph,
  setGraph: (g) => {
    set({ graph: g });
    get().updateReactFlowCache();
  },

  // Initialize cached ReactFlow data
  rfNodes: initialGraph.nodes.map((n) => ({
    id: n.id,
    position: { x: n.x, y: n.y },
    data: { label: n.label, nodeType: n.type },
    type: "default" as const,
  })),
  rfEdges: initialGraph.edges.map((e) => ({
    id: e.id,
    source: e.from,
    target: e.to,
    label: e.label ?? "",
    type: "simplebezier",
    animated: true,
    sourceHandle: undefined,
    targetHandle: undefined,
    style: { 
      stroke: '#6366f1',
      strokeWidth: 2,
    },
    markerEnd: {
      type: 'arrowclosed' as any,
      color: '#6366f1',
      width: 20,
      height: 20,
    },
  })),

  prompt: "Basit bir login + dashboard + ödeme akışı çiz.",
  setPrompt: (v) => set({ prompt: v }),

  live: false,
  setLive: (v) => set({ live: v }),

  lockPositions: false,
  setLockPositions: (v) => set({ lockPositions: v }),

  nodeLimit: 80,
  setNodeLimit: (v) => set({ nodeLimit: v }),

  status: "Hazır",
  setStatus: (v) => set({ status: v }),

  applyLayout: () => {
    // Bu fonksiyon artık buton tıklamasıyla çağrılacak
    // DiagramCanvas component'inden kullanılacak
  },

  updateReactFlowCache: () => {
    const g = get().graph;
    const nodes: Node[] = g.nodes.map((n) => ({
      id: n.id,
      position: { x: n.x, y: n.y },
      data: { 
        label: n.label, 
        nodeType: n.type,
        width: (n as any).width,
        height: (n as any).height,
        color: (n as any).color,
        icon: (n as any).icon,
        description: (n as any).description,
      },
      type: "default",
      style: (n as any).width && (n as any).height ? {
        width: (n as any).width,
        height: (n as any).height,
      } : undefined,
      parentNode: (n as any).parent,
      extent: (n as any).parent ? 'parent' : undefined,
    } as Node));
    const edges: Edge[] = g.edges.map((e) => ({
      id: e.id,
      source: e.from,
      target: e.to,
      label: e.label ?? "",
      type: "simplebezier",
      animated: true,
      sourceHandle: undefined,  // Dinamik routing için undefined
      targetHandle: undefined,  // Dinamik routing için undefined
      style: { 
        stroke: '#6366f1',
        strokeWidth: 2,
      },
      markerEnd: {
        type: 'arrowclosed' as any,
        color: '#6366f1',
        width: 20,
        height: 20,
      },
    }));
    console.log("updateReactFlowCache - Creating edges:", edges);
    set({ rfNodes: nodes, rfEdges: edges });
  },

  toReactFlow: () => {
    return { nodes: get().rfNodes, edges: get().rfEdges };
  },

  fromReactFlow: (nodes, edges) => {
    const g = get().graph;
    const next: GraphState = {
      version: g.version,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: (n.data as any)?.nodeType ?? "process",
        x: n.position.x,
        y: n.position.y,
        label: (n.data as any)?.label ?? n.id,
        ...(n.style?.width && { width: n.style.width as number }),
        ...(n.style?.height && { height: n.style.height as number }),
        ...(n.parentNode && { parent: n.parentNode }),
        ...((n.data as any)?.color && { color: (n.data as any).color }),
        ...((n.data as any)?.icon && { icon: (n.data as any).icon }),
        ...((n.data as any)?.description && { description: (n.data as any).description }),
      })),
      edges: edges.map((e) => ({
        id: e.id,
        from: e.source,
        to: e.target,
        label: (e.label as string) ?? "",
      })),
    };
    set({ graph: next });
    get().updateReactFlowCache();
  },
}) );
