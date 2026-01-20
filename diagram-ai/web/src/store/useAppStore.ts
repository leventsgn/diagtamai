import { create } from "zustand";
import type { Edge, Node } from "reactflow";

export type LlmConfig = {
  url: string;
  token: string;
  model: string;
};

export type GraphState = {
  version: string;
  nodes: { id: string; type: string; x: number; y: number; label: string }[];
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
    { id: "USR", type: "actor", x: 80, y: 80, label: "Kullanıcı" },
    { id: "START", type: "start", x: 320, y: 80, label: "Başla" },
    { id: "END", type: "end", x: 560, y: 80, label: "Bitti" },
  ],
  edges: [
    { id: "E1", from: "USR", to: "START", label: "" },
    { id: "E2", from: "START", to: "END", label: "" },
  ],
};

export const useAppStore = create<{
  llm: LlmConfig;
  setLlm: (p: Partial<LlmConfig>) => void;

  graph: GraphState;
  setGraph: (g: GraphState) => void;

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
}>( (set, get) => ({
  llm: loadLlm(),
  setLlm: (p) => {
    const next = { ...get().llm, ...p };
    saveLlm(next);
    set({ llm: next });
  },

  graph: initialGraph,
  setGraph: (g) => set({ graph: g }),

  prompt: "Basit bir login + dashboard + ödeme akışı çiz.",
  setPrompt: (v) => set({ prompt: v }),

  live: true,
  setLive: (v) => set({ live: v }),

  lockPositions: false,
  setLockPositions: (v) => set({ lockPositions: v }),

  nodeLimit: 80,
  setNodeLimit: (v) => set({ nodeLimit: v }),

  status: "Hazır",
  setStatus: (v) => set({ status: v }),

  toReactFlow: () => {
    const g = get().graph;
    const nodes: Node[] = g.nodes.map((n) => ({
      id: n.id,
      position: { x: n.x, y: n.y },
      data: { label: n.label, nodeType: n.type },
      type: "default",
    }));
    const edges: Edge[] = g.edges.map((e) => ({
      id: e.id,
      source: e.from,
      target: e.to,
      label: e.label ?? "",
    }));
    return { nodes, edges };
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
      })),
      edges: edges.map((e) => ({
        id: e.id,
        from: e.source,
        to: e.target,
        label: (e.label as string) ?? "",
      })),
    };
    set({ graph: next });
  },
}) );
