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
  }[];
  edges: { id: string; from: string; to: string; label?: string }[];
};

function loadLlm(): LlmConfig {
  const raw = localStorage.getItem("llm_config");
  if (!raw) {
    return {
      url: "http://127.0.0.1:8000/v1/chat/completions",
      token: "",
      model: "gpt-oss-120b",
    };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {
      url: "http://127.0.0.1:8000/v1/chat/completions",
      token: "",
      model: "gpt-oss-120b",
    };
  }
}

function saveLlm(cfg: LlmConfig) {
  localStorage.setItem("llm_config", JSON.stringify(cfg));
}

const initialGraph: GraphState = {
  version: "init0001",
  nodes: [
    { id: "USR", type: "actor", x: 100, y: 100, label: "Kullanıcı" },
    { id: "START", type: "start", x: 300, y: 100, label: "Başla" },
    { id: "END", type: "end", x: 500, y: 100, label: "Bitti" },
  ],
  edges: [
    { id: "E1", from: "USR", to: "START", label: "tıklar" },
    { id: "E2", from: "START", to: "END", label: "devam" },
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

  // Layout direction
  layoutDirection: 'TB' | 'LR';
  setLayoutDirection: (v: 'TB' | 'LR') => void;

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
    type: "smoothstep",
    animated: true,
    style: { 
      stroke: '#2563eb',
      strokeWidth: 2,
    },
    markerEnd: {
      type: 'arrowclosed',
      color: '#2563eb',
      width: 15,
      height: 15,
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

  layoutDirection: 'TB',
  setLayoutDirection: (v) => set({ layoutDirection: v }),

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
      type: "smoothstep",
      animated: true,
      style: { 
        stroke: '#2563eb',
        strokeWidth: 2,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: '#2563eb',
        width: 15,
        height: 15,
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
