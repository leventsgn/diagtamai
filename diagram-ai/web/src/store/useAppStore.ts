import { create } from "zustand";
import type { Edge, Node, NodeChange, EdgeChange, Connection } from "reactflow";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "reactflow";

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
  edges: {
    id: string;
    from: string;
    to: string;
    label?: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
  }[];
};

function loadLlm(): LlmConfig {
  const raw = localStorage.getItem("llm_config");
  if (!raw) {
    return {
      url: "https://api.groq.com/openai/v1/chat/completions",
      token: "",
      model: "llama-3.3-70b-versatile",
    };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {
      url: "https://api.groq.com/openai/v1/chat/completions",
      token: "",
      model: "llama-3.3-70b-versatile",
    };
  }
}

function saveLlm(cfg: LlmConfig) {
  localStorage.setItem("llm_config", JSON.stringify(cfg));
}

const initialGraph: GraphState = {
  version: "init",
  nodes: [
    { id: "USR", type: "actor", x: 100, y: 100, label: "Müşteri" },
    { id: "WEB", type: "web_client", x: 100, y: 100, label: "Web Client" },
    { id: "MOB", type: "mobile_app", x: 100, y: 100, label: "Mobil App" },
    { id: "CDN", type: "cdn", x: 100, y: 100, label: "CDN" },
    { id: "LB", type: "load_balancer", x: 100, y: 100, label: "Load Balancer" },
    { id: "GW", type: "api_gateway", x: 100, y: 100, label: "API Gateway" },
    { id: "API", type: "api_server", x: 100, y: 100, label: "API Server" },
    { id: "AUTH", type: "auth_service", x: 100, y: 100, label: "Auth Service" },
    { id: "CAT", type: "microservice", x: 100, y: 100, label: "Catalog Service" },
    { id: "ORD", type: "microservice", x: 100, y: 100, label: "Order Service" },
    { id: "PAY", type: "payment_gateway", x: 100, y: 100, label: "Payment Gateway" },
    { id: "INV", type: "microservice", x: 100, y: 100, label: "Inventory Service" },
    { id: "SHIP", type: "microservice", x: 100, y: 100, label: "Shipping Service" },
    { id: "MQ", type: "message_broker", x: 100, y: 100, label: "Event Bus" },
    { id: "JOB", type: "background_job", x: 100, y: 100, label: "Async Worker" },
    { id: "SQL", type: "sql_database", x: 100, y: 100, label: "Primary DB" },
    { id: "CACHE", type: "cache", x: 100, y: 100, label: "Redis Cache" },
    { id: "OBJ", type: "object_storage", x: 100, y: 100, label: "Object Storage" },
    { id: "SEARCH", type: "analytics", x: 100, y: 100, label: "Search Index" },
    { id: "MAIL", type: "email_service", x: 100, y: 100, label: "Email Provider" },
    { id: "SMS", type: "sms_service", x: 100, y: 100, label: "SMS Gateway" },
    { id: "OBS", type: "monitoring", x: 100, y: 100, label: "Monitoring" },
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

// --- UTILS FOR DYNAMIC HANDLES ---

export const getNodeDimensions = (node: Node) => {
  const nodeType = (node.data as any)?.nodeType || "process";
  if (nodeType === "group") {
    return {
      width: Number(node.style?.width || (node.data as any).width || 400),
      height: Number(node.style?.height || (node.data as any).height || 300),
    };
  }
  return { width: 180, height: 80 }; // Standardized height for better center calc
};

export const getAbsolutePosition = (node: Node, nodes: Node[]): { x: number; y: number } => {
  if (!node.parentNode) return node.position;
  const parent = nodes.find((n) => n.id === node.parentNode);
  if (!parent) return node.position;
  const parentPos = getAbsolutePosition(parent, nodes);
  return {
    x: parentPos.x + node.position.x,
    y: parentPos.y + node.position.y,
  };
};

export const calculateEdgeHandles = (currentNodes: Node[], currentEdges: Edge[]) => {
  return currentEdges.map((edge) => {
    const sourceNode = currentNodes.find((n) => n.id === edge.source);
    const targetNode = currentNodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return edge;

    const sourceDim = getNodeDimensions(sourceNode);
    const targetDim = getNodeDimensions(targetNode);
    const sourcePos = getAbsolutePosition(sourceNode, currentNodes);
    const targetPos = getAbsolutePosition(targetNode, currentNodes);

    const sx = sourcePos.x + sourceDim.width / 2;
    const sy = sourcePos.y + sourceDim.height / 2;
    const tx = targetPos.x + targetDim.width / 2;
    const ty = targetPos.y + targetDim.height / 2;

    const dx = tx - sx;
    const dy = ty - sy;

    let sourceDir = "r";
    let targetDir = "l";

    if (Math.abs(dx) > Math.abs(dy)) {
      sourceDir = dx > 0 ? "r" : "l";
      targetDir = dx > 0 ? "l" : "r";
    } else {
      sourceDir = dy > 0 ? "b" : "t";
      targetDir = dy > 0 ? "t" : "b";
    }

    const finalSourceHandle = `${sourceDir}-s`;
    const finalTargetHandle = `${targetDir}-t`;

    if (edge.sourceHandle === finalSourceHandle && edge.targetHandle === finalTargetHandle) {
      return edge;
    }

    return { ...edge, sourceHandle: finalSourceHandle, targetHandle: finalTargetHandle };
  });
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
  updateReactFlowCache: (g?: GraphState) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, label: string, position: { x: number; y: number }) => void;
  deleteSelection: () => void;
  layoutTrigger: number;
  layoutDirection: 'LR' | 'TB' | 'RL' | 'BT';
  layoutRanker: 'network-simplex' | 'tight-tree' | 'longest-path';
  triggerLayout: () => void;
}>((set, get) => ({
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
    data: { label: n.label, nodeType: n.type, parent: n.parent },
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

  updateReactFlowCache: (g) => {
    const graph = g || get().graph;
    const nodes: Node[] = graph.nodes.map((n) => ({
      id: n.id,
      position: { x: n.x, y: n.y },
      data: {
        label: n.label,
        nodeType: n.type,
        width: n.width,
        height: n.height,
        color: n.color,
        icon: n.icon,
        description: n.description,
        parent: n.parent,
      },
      type: "default",
      style: n.width && n.height ? {
        width: n.width,
        height: n.height,
      } : undefined,
      parentNode: n.parent,
      extent: n.parent ? 'parent' : undefined,
    }));
    const edges: Edge[] = calculateEdgeHandles(nodes, graph.edges.map((e) => ({
      id: e.id,
      source: e.from,
      target: e.to,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      label: e.label ?? "",
      type: "simplebezier",
      animated: true,
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
    })));
    set({ rfNodes: nodes, rfEdges: edges });
  },

  onNodesChange: (changes) => {
    const rfNodes = get().rfNodes;
    const rfEdges = get().rfEdges;
    const nextNodes = applyNodeChanges(changes, rfNodes);

    // Always recalculate handles when positions change for real-time dynamic arrows
    const hasPositionChange = changes.some(c => c.type === 'position');
    let nextEdges = rfEdges;

    if (hasPositionChange) {
      nextEdges = calculateEdgeHandles(nextNodes, rfEdges);
    }

    set({ rfNodes: nextNodes, rfEdges: nextEdges });

    // Sync to graph if drag ended
    const isDragEnd = changes.some(c => c.type === 'position' && 'dragging' in c && !c.dragging);
    if (isDragEnd) {
      get().fromReactFlow(nextNodes, nextEdges);
    }
  },

  onEdgesChange: (changes) => {
    set({ rfEdges: applyEdgeChanges(changes, get().rfEdges) });
  },

  onConnect: (connection) => {
    const rfNodes = get().rfNodes;
    const rfEdges = get().rfEdges;

    let normalizedSource = connection.source;
    let normalizedTarget = connection.target;
    let normalizedSourceHandle = connection.sourceHandle;
    let normalizedTargetHandle = connection.targetHandle;

    // Smart swap: if user drags from a 'target' handle (ends with -t) 
    // we swap source/target so the arrow head (always at Target) follows the drag direction.
    if (connection.sourceHandle?.endsWith('-t')) {
      normalizedSource = connection.target;
      normalizedTarget = connection.source;
      normalizedSourceHandle = connection.targetHandle;
      normalizedTargetHandle = connection.sourceHandle;
    }

    const baseEdge: Edge = {
      id: `e-${Date.now()}`,
      source: normalizedSource!,
      target: normalizedTarget!,
      sourceHandle: normalizedSourceHandle,
      targetHandle: normalizedTargetHandle,
      label: "",
      type: "simplebezier",
      animated: true,
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
    };

    const tempEdges = addEdge(baseEdge, rfEdges);
    const nextEdges = calculateEdgeHandles(rfNodes, tempEdges);

    set({ rfEdges: nextEdges });
    get().fromReactFlow(rfNodes, nextEdges);
  },

  addNode: (type, label, position) => {
    const newNode: Node = {
      id: "node_" + Date.now(),
      type: "default",
      position,
      data: { label, nodeType: type },
    };
    const nextNodes = [...get().rfNodes, newNode];
    // No handles to calculate for a single new node usually, but let's be safe
    const nextEdges = calculateEdgeHandles(nextNodes, get().rfEdges);

    set({ rfNodes: nextNodes, rfEdges: nextEdges });
    get().fromReactFlow(nextNodes, nextEdges);
  },

  deleteSelection: () => {
    const rfNodes = get().rfNodes;
    const rfEdges = get().rfEdges;
    const selectedNodes = rfNodes.filter(n => n.selected);
    const selectedEdges = rfEdges.filter(e => e.selected);

    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

    const remainingNodes = rfNodes.filter(n => !n.selected);
    const remainingEdges = rfEdges.filter(e =>
      !e.selected &&
      !selectedNodes.some(sn => sn.id === e.source || sn.id === e.target)
    );

    set({ rfNodes: remainingNodes, rfEdges: remainingEdges });
    get().fromReactFlow(remainingNodes, remainingEdges);
  },

  toReactFlow: () => {
    return { nodes: get().rfNodes, edges: get().rfEdges };
  },

  fromReactFlow: (nodes, edges) => {
    const nextVersion = "local_" + Date.now();
    const next: GraphState = {
      version: nextVersion,
      nodes: nodes.map((n) => {
        const data = n.data as any;
        const style = n.style as any;
        return {
          id: n.id,
          type: data?.nodeType ?? "process",
          x: n.position.x,
          y: n.position.y,
          label: data?.label ?? n.id,
          width: Number(style?.width || data?.width || 0) || undefined,
          height: Number(style?.height || data?.height || 0) || undefined,
          parent: n.parentNode || data?.parent,
          color: data?.color,
          icon: data?.icon,
          description: data?.description,
        };
      }),
      edges: edges.map((e) => ({
        id: e.id,
        from: e.source,
        to: e.target,
        label: (e.label as string) ?? "",
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      })),
    };
    set({ graph: next });
    get().updateReactFlowCache(next);
    return nextVersion;
  },

  layoutTrigger: 0,
  layoutDirection: 'LR',
  layoutRanker: 'network-simplex',
  triggerLayout: () => {
    const directions: ('LR' | 'TB' | 'RL' | 'BT')[] = ['LR', 'TB', 'RL', 'BT'];
    const rankers: ('network-simplex' | 'tight-tree' | 'longest-path')[] = ['network-simplex', 'tight-tree', 'longest-path'];

    set((s) => {
      const nextDirIdx = (directions.indexOf(s.layoutDirection) + 1) % directions.length;
      // Cycle ranker if direction wraps around
      const nextRankerIdx = nextDirIdx === 0
        ? (rankers.indexOf(s.layoutRanker) + 1) % rankers.length
        : rankers.indexOf(s.layoutRanker);

      return {
        layoutTrigger: s.layoutTrigger + 1,
        layoutDirection: directions[nextDirIdx],
        layoutRanker: rankers[nextRankerIdx]
      };
    });
  },
}));
