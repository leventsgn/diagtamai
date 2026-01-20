import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  MarkerType,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import "reactflow/dist/base.css";
import dagre from "dagre";
import { useAppStore } from "../store/useAppStore";

// Custom node component that displays the label
function CustomNode({ data, selected }: NodeProps) {
  const nodeType = data.nodeType || 'process';
  
  const getNodeStyle = (type: string) => {
    const styles: Record<string, any> = {
      start: {
        background: 'transparent',
        color: '#10b981',
        borderColor: '#10b981',
      },
      end: {
        background: 'transparent',
        color: '#ef4444',
        borderColor: '#ef4444',
      },
      actor: {
        background: 'transparent',
        color: '#f59e0b',
        borderColor: '#f59e0b',
      },
      decision: {
        background: 'transparent',
        color: '#8b5cf6',
        borderColor: '#8b5cf6',
      },
      process: {
        background: 'transparent',
        color: '#2563eb',
        borderColor: '#2563eb',
      },
      group: {
        background: 'transparent',
        color: '#94a3b8',
        borderColor: '#475569',
      },
    };
    return styles[type] || styles.process;
  };

  const nodeStyle = getNodeStyle(nodeType);
  
  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      start: '▶️',
      end: '⏹️',
      actor: '👤',
      decision: '🔀',
      process: '⚙️',
      group: '📁',
    };
    return icons[type] || '📦';
  };

  // Group node için özel render
  if (nodeType === 'group') {
    return (
      <div style={{ 
        padding: '12px', 
        borderRadius: '8px',
        background: 'transparent',
        border: `2px dashed ${nodeStyle.borderColor}`,
        color: nodeStyle.color,
        minWidth: data.width || '300px',
        minHeight: data.height || '200px',
        position: 'relative',
        boxShadow: selected ? `0 0 20px ${nodeStyle.borderColor}60` : 'none',
      }}>
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '12px',
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span>{getIcon(nodeType)}</span>
          <span>{data.label}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '16px 32px', 
      borderRadius: '12px',
      background: nodeStyle.background,
      border: `2px solid ${selected ? nodeStyle.borderColor : nodeStyle.borderColor}`,
      color: nodeStyle.color,
      minWidth: '160px',
      textAlign: 'center',
      fontSize: '15px',
      fontWeight: 600,
      boxShadow: selected 
        ? `0 8px 20px ${nodeStyle.borderColor}40, 0 0 0 3px ${nodeStyle.borderColor}20`
        : `0 2px 8px ${nodeStyle.borderColor}30`,
      transition: 'all 0.2s ease',
      cursor: 'grab',
      transform: selected ? 'scale(1.05)' : 'scale(1)',
      position: 'relative',
      overflow: 'visible',
    }}>
      <div style={{
        position: 'absolute',
        top: '-2px',
        left: '-2px',
        right: '-2px',
        bottom: '-2px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${nodeStyle.borderColor}00, ${nodeStyle.borderColor}30)`,
        pointerEvents: 'none',
        opacity: selected ? 1 : 0,
        transition: 'opacity 0.2s',
      }} />
      
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{
          background: selected ? 'var(--accent)' : nodeStyle.borderColor,
          width: '8px',
          height: '8px',
          border: 'none',
          opacity: 0,
        }}
      />
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <span style={{ 
          fontSize: '20px',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        }}>
          {getIcon(nodeType)}
        </span>
        <span style={{
          letterSpacing: '0.3px',
          textShadow: selected ? `0 0 20px ${nodeStyle.borderColor}60` : 'none',
        }}>
          {data.label}
        </span>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{
          background: selected ? 'var(--accent)' : nodeStyle.borderColor,
          width: '8px',
          height: '8px',
          border: 'none',
          opacity: 0,
        }}
      />
    </div>
  );
}

const nodeTypes = {
  default: CustomNode,
};

// Dagre layout fonksiyonu
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 250;
  const nodeHeight = 80;

  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 100,  // Node'lar arası yatay mesafe
    ranksep: 150,  // Seviyeler arası dikey mesafe
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function DiagramCanvas() {
  const rfNodes = useAppStore((s) => s.rfNodes);
  const rfEdges = useAppStore((s) => s.rfEdges);
  const layoutDirection = useAppStore((s) => s.layoutDirection);
  const fromReactFlow = useAppStore((s) => s.fromReactFlow);

  const [nodes, setNodes] = React.useState<Node[]>([]);
  const [edges, setEdges] = React.useState<Edge[]>([]);

  // LLM'den gelen pozisyonları olduğu gibi kullan
  React.useEffect(() => {
    console.log("DiagramCanvas - Store updated:", rfNodes.length, "nodes", rfEdges.length, "edges");
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [rfNodes, rfEdges]);

  // Manuel layout uygulama fonksiyonu
  const applyLayout = useCallback(() => {
    if (nodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, layoutDirection);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      // Layouted pozisyonları store'a kaydet
      fromReactFlow(layoutedNodes, layoutedEdges);
    }
  }, [nodes, edges, layoutDirection, fromReactFlow]);

  // Global applyLayout fonksiyonunu expose et
  React.useEffect(() => {
    (window as any).applyDiagramLayout = applyLayout;
    return () => {
      delete (window as any).applyDiagramLayout;
    };
  }, [applyLayout]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const next = applyNodeChanges(changes, nds);
        fromReactFlow(next, edges);
        return next;
      });
    },
    [fromReactFlow, edges]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const next = applyEdgeChanges(changes, eds);
        fromReactFlow(nodes, next);
        return next;
      });
    },
    [fromReactFlow, nodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const next = addEdge({ ...connection, label: "" }, eds);
        fromReactFlow(nodes, next);
        return next;
      });
    },
    [fromReactFlow, nodes]
  );

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.2, duration: 500 }}
        minZoom={0.1}
        maxZoom={4}
        edgesUpdatable={true}
        edgesFocusable={true}
        elevateEdgesOnSelect={true}
        connectionLineStyle={{ 
          stroke: '#6366f1', 
          strokeWidth: 3,
          strokeDasharray: '5,5',
        }}
      >
        <svg width="0" height="0">
          <defs>
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <Background gap={16} size={1} color="var(--border)" />
        <MiniMap 
          nodeColor={(node) => {
            const type = (node.data as any)?.nodeType || 'process';
            const colors: Record<string, string> = {
              start: '#10b981',
              end: '#ef4444',
              actor: '#f59e0b',
              decision: '#8b5cf6',
              process: '#6366f1',
            };
            return colors[type] || '#6366f1';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{
            background: 'var(--card-bg)',
          }}
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
