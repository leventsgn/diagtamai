import React, { useCallback, useEffect, useRef } from "react";
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
  ReactFlowProvider,
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
import { uuid } from "../lib/api";

// Custom node component that displays the label
function CustomNode({ data, selected }: NodeProps) {
  const nodeType = data.nodeType || 'process';
  
  const getNodeStyle = (type: string) => {
    const styles: Record<string, any> = {
      // Basic
      start: { background: 'transparent', color: '#10b981', borderColor: '#10b981' },
      end: { background: 'transparent', color: '#ef4444', borderColor: '#ef4444' },
      actor: { background: 'transparent', color: '#f59e0b', borderColor: '#f59e0b' },
      decision: { background: 'transparent', color: '#8b5cf6', borderColor: '#8b5cf6' },
      process: { background: 'transparent', color: '#2563eb', borderColor: '#2563eb' },
      group: { background: 'transparent', color: '#94a3b8', borderColor: '#475569' },
      note: { background: 'transparent', color: '#fbbf24', borderColor: '#fbbf24' },
      datastore: { background: 'transparent', color: '#14b8a6', borderColor: '#14b8a6' },
      
      // Web & Frontend
      web_client: { background: 'transparent', color: '#3b82f6', borderColor: '#3b82f6' },
      mobile_app: { background: 'transparent', color: '#06b6d4', borderColor: '#06b6d4' },
      cdn: { background: 'transparent', color: '#6366f1', borderColor: '#6366f1' },
      load_balancer: { background: 'transparent', color: '#8b5cf6', borderColor: '#8b5cf6' },
      api_gateway: { background: 'transparent', color: '#a855f7', borderColor: '#a855f7' },
      
      // Backend & Services
      api_server: { background: 'transparent', color: '#10b981', borderColor: '#10b981' },
      microservice: { background: 'transparent', color: '#14b8a6', borderColor: '#14b8a6' },
      background_job: { background: 'transparent', color: '#0ea5e9', borderColor: '#0ea5e9' },
      queue: { background: 'transparent', color: '#f59e0b', borderColor: '#f59e0b' },
      message_broker: { background: 'transparent', color: '#ef4444', borderColor: '#ef4444' },
      cron_job: { background: 'transparent', color: '#84cc16', borderColor: '#84cc16' },
      
      // Database & Storage
      sql_database: { background: 'transparent', color: '#0891b2', borderColor: '#0891b2' },
      nosql_database: { background: 'transparent', color: '#06b6d4', borderColor: '#06b6d4' },
      cache: { background: 'transparent', color: '#f97316', borderColor: '#f97316' },
      object_storage: { background: 'transparent', color: '#14b8a6', borderColor: '#14b8a6' },
      file_storage: { background: 'transparent', color: '#22c55e', borderColor: '#22c55e' },
      data_warehouse: { background: 'transparent', color: '#2563eb', borderColor: '#2563eb' },
      
      // Infrastructure
      server: { background: 'transparent', color: '#64748b', borderColor: '#64748b' },
      container: { background: 'transparent', color: '#0ea5e9', borderColor: '#0ea5e9' },
      kubernetes: { background: 'transparent', color: '#3b82f6', borderColor: '#3b82f6' },
      cloud_service: { background: 'transparent', color: '#8b5cf6', borderColor: '#8b5cf6' },
      vm: { background: 'transparent', color: '#6366f1', borderColor: '#6366f1' },
      
      // Communication
      email_service: { background: 'transparent', color: '#ec4899', borderColor: '#ec4899' },
      sms_service: { background: 'transparent', color: '#f43f5e', borderColor: '#f43f5e' },
      notification: { background: 'transparent', color: '#eab308', borderColor: '#eab308' },
      webhook: { background: 'transparent', color: '#a855f7', borderColor: '#a855f7' },
      websocket: { background: 'transparent', color: '#d946ef', borderColor: '#d946ef' },
      
      // Security & Auth
      auth_service: { background: 'transparent', color: '#dc2626', borderColor: '#dc2626' },
      firewall: { background: 'transparent', color: '#b91c1c', borderColor: '#b91c1c' },
      vpn: { background: 'transparent', color: '#991b1b', borderColor: '#991b1b' },
      
      // Monitoring & Analytics
      monitoring: { background: 'transparent', color: '#7c3aed', borderColor: '#7c3aed' },
      logging: { background: 'transparent', color: '#6366f1', borderColor: '#6366f1' },
      analytics: { background: 'transparent', color: '#4f46e5', borderColor: '#4f46e5' },
      
      // Integration
      third_party_api: { background: 'transparent', color: '#f59e0b', borderColor: '#f59e0b' },
      payment_gateway: { background: 'transparent', color: '#22c55e', borderColor: '#22c55e' },
    };
    return styles[type] || styles.process;
  };

  const nodeStyle = getNodeStyle(nodeType);
  
  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      // Basic
      start: '▶️',
      end: '⏹️',
      actor: '👤',
      decision: '🔀',
      process: '⚙️',
      group: '📁',
      note: '📝',
      datastore: '💾',
      
      // Web & Frontend
      web_client: '🌐',
      mobile_app: '📱',
      cdn: '🚀',
      load_balancer: '⚖️',
      api_gateway: '🚪',
      
      // Backend & Services
      api_server: '🖥️',
      microservice: '🔧',
      background_job: '⏰',
      queue: '📬',
      message_broker: '📨',
      cron_job: '⏱️',
      
      // Database & Storage
      sql_database: '🗄️',
      nosql_database: '📊',
      cache: '⚡',
      object_storage: '☁️',
      file_storage: '📦',
      data_warehouse: '🏢',
      
      // Infrastructure
      server: '💻',
      container: '📦',
      kubernetes: '☸️',
      cloud_service: '☁️',
      vm: '🖥️',
      
      // Communication
      email_service: '✉️',
      sms_service: '💬',
      notification: '🔔',
      webhook: '🔗',
      websocket: '🔌',
      
      // Security & Auth
      auth_service: '🔐',
      firewall: '🛡️',
      vpn: '🔒',
      
      // Monitoring & Analytics
      monitoring: '📈',
      logging: '📋',
      analytics: '📊',
      
      // Integration
      third_party_api: '🔌',
      payment_gateway: '💳',
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
        border: `2px dashed ${data.color || nodeStyle.borderColor}`,
        color: data.color || nodeStyle.color,
        minWidth: data.width || '300px',
        minHeight: data.height || '200px',
        position: 'relative',
        boxShadow: selected ? `0 0 20px ${data.color || nodeStyle.borderColor}60` : 'none',
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
          <span>{data.icon || getIcon(nodeType)}</span>
          <span>{data.label}</span>
        </div>
      </div>
    );
  }

  // Custom renk desteği
  const finalColor = data.color || nodeStyle.color;
  const finalBorderColor = data.color || nodeStyle.borderColor;
  
  // Handle stil - modern ve sade
  const handleStyle = {
    background: finalBorderColor,
    width: '10px',
    height: '10px',
    border: `2px solid var(--card-bg)`,
    boxShadow: `0 2px 8px ${finalBorderColor}30`,
  };

  // Container/Kubernetes (hexagon) için özel render
  if (nodeType === 'container' || nodeType === 'kubernetes') {
    return (
      <div style={{ position: 'relative', width: '160px', height: '160px' }}>
        <svg width="160" height="160" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={`container-grad-${data.label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: finalBorderColor, stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: finalBorderColor, stopOpacity: 0.05 }} />
            </linearGradient>
            <filter id={`glow-${data.label}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <polygon 
            points="80,20 135,50 135,110 80,140 25,110 25,50"
            fill={`url(#container-grad-${data.label})`}
            stroke={finalBorderColor}
            strokeWidth="2.5"
            filter={selected ? `url(#glow-${data.label})` : ''}
            style={{ transition: 'all 0.3s' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: finalColor,
          fontSize: '13px',
          fontWeight: 700,
          textAlign: 'center',
          maxWidth: '90px',
          zIndex: 1,
        }}>
          <div style={{ fontSize: '28px', marginBottom: '6px' }}>{data.icon || getIcon(nodeType)}</div>
          <div style={{ letterSpacing: '0.5px' }}>{data.label}</div>
        </div>
        <Handle type="source" position={Position.Top} id="t" style={handleStyle} />
        <Handle type="source" position={Position.Right} id="r" style={handleStyle} />
        <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} />
        <Handle type="source" position={Position.Left} id="l" style={handleStyle} />
        <Handle type="target" position={Position.Top} id="t" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Right} id="r" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Bottom} id="b" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Left} id="l" style={{...handleStyle, zIndex: -1}} />
      </div>
    );
  }

  // API Gateway / Load Balancer (shield şekli) için özel render
  if (nodeType === 'api_gateway' || nodeType === 'load_balancer') {
    return (
      <div style={{ position: 'relative', width: '180px', height: '180px' }}>
        <svg width="180" height="180" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={`shield-grad-${data.label}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: finalBorderColor, stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: finalBorderColor, stopOpacity: 0.1 }} />
            </linearGradient>
          </defs>
          <path 
            d="M 90 30 L 140 50 L 140 100 Q 140 150, 90 160 Q 40 150, 40 100 L 40 50 Z"
            fill={`url(#shield-grad-${data.label})`}
            stroke={finalBorderColor}
            strokeWidth="2.5"
            style={{ 
              filter: `drop-shadow(0 4px 12px ${finalBorderColor}40)`,
              transition: 'all 0.3s'
            }}
          />
          {/* Merkez çizgi */}
          <line x1="90" y1="35" x2="90" y2="155" 
            stroke={finalBorderColor} 
            strokeWidth="1.5" 
            opacity="0.3" 
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: finalColor,
          fontSize: '13px',
          fontWeight: 700,
          textAlign: 'center',
          maxWidth: '100px',
          zIndex: 1,
        }}>
          <div style={{ fontSize: '32px', marginBottom: '6px' }}>{data.icon || getIcon(nodeType)}</div>
          <div>{data.label}</div>
        </div>
        <Handle type="source" position={Position.Top} id="t" style={handleStyle} />
        <Handle type="source" position={Position.Right} id="r" style={handleStyle} />
        <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} />
        <Handle type="source" position={Position.Left} id="l" style={handleStyle} />
        <Handle type="target" position={Position.Top} id="t" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Right} id="r" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Bottom} id="b" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Left} id="l" style={{...handleStyle, zIndex: -1}} />
      </div>
    );
  }

  // Queue / Message Broker (paralel çizgiler) için özel render
  if (nodeType === 'queue' || nodeType === 'message_broker') {
    return (
      <div style={{ position: 'relative', width: '180px', height: '100px' }}>
        <svg width="180" height="100" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={`queue-grad-${data.label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: finalBorderColor, stopOpacity: 0.15 }} />
              <stop offset="50%" style={{ stopColor: finalBorderColor, stopOpacity: 0.25 }} />
              <stop offset="100%" style={{ stopColor: finalBorderColor, stopOpacity: 0.15 }} />
            </linearGradient>
          </defs>
          {/* Ana kutu */}
          <rect x="15" y="20" width="150" height="60" rx="8"
            fill={`url(#queue-grad-${data.label})`}
            stroke={finalBorderColor}
            strokeWidth="2.5"
            style={{ filter: `drop-shadow(0 4px 8px ${finalBorderColor}30)` }}
          />
          {/* İç çizgiler */}
          <line x1="60" y1="25" x2="60" y2="75" stroke={finalBorderColor} strokeWidth="2" opacity="0.4" />
          <line x1="90" y1="25" x2="90" y2="75" stroke={finalBorderColor} strokeWidth="2" opacity="0.4" />
          <line x1="120" y1="25" x2="120" y2="75" stroke={finalBorderColor} strokeWidth="2" opacity="0.4" />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '30px',
          transform: 'translateY(-50%)',
          color: finalColor,
          fontSize: '24px',
          zIndex: 1,
        }}>
          {data.icon || getIcon(nodeType)}
        </div>
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '15px',
          transform: 'translateY(-50%)',
          color: finalColor,
          fontSize: '12px',
          fontWeight: 700,
          maxWidth: '80px',
        }}>
          {data.label}
        </div>
        <Handle type="source" position={Position.Top} id="t" style={handleStyle} />
        <Handle type="source" position={Position.Right} id="r" style={handleStyle} />
        <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} />
        <Handle type="source" position={Position.Left} id="l" style={handleStyle} />
        <Handle type="target" position={Position.Top} id="t" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Right} id="r" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Bottom} id="b" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Left} id="l" style={{...handleStyle, zIndex: -1}} />
      </div>
    );
  }

  // Monitoring/Analytics (grafik) için özel render
  if (nodeType === 'monitoring' || nodeType === 'analytics' || nodeType === 'logging') {
    return (
      <div style={{ position: 'relative', width: '160px', height: '140px' }}>
        <svg width="160" height="140" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={`monitor-grad-${data.label}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" style={{ stopColor: finalBorderColor, stopOpacity: 0.05 }} />
              <stop offset="100%" style={{ stopColor: finalBorderColor, stopOpacity: 0.2 }} />
            </linearGradient>
          </defs>
          {/* Çerçeve */}
          <rect x="15" y="15" width="130" height="110" rx="8"
            fill={`url(#monitor-grad-${data.label})`}
            stroke={finalBorderColor}
            strokeWidth="2.5"
          />
          {/* Grafik çizgisi */}
          <polyline 
            points="25,90 45,60 65,75 85,45 105,65 125,35"
            fill="none"
            stroke={finalBorderColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
          {/* Noktalar */}
          <circle cx="25" cy="90" r="4" fill={finalBorderColor} />
          <circle cx="45" cy="60" r="4" fill={finalBorderColor} />
          <circle cx="65" cy="75" r="4" fill={finalBorderColor} />
          <circle cx="85" cy="45" r="4" fill={finalBorderColor} />
          <circle cx="105" cy="65" r="4" fill={finalBorderColor} />
          <circle cx="125" cy="35" r="4" fill={finalBorderColor} />
        </svg>
        <div style={{
          position: 'absolute',
          bottom: '-25px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: finalColor,
          fontSize: '13px',
          fontWeight: 700,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontSize: '20px', marginBottom: '2px' }}>{data.icon || getIcon(nodeType)}</div>
          {data.label}
        </div>
        <Handle type="source" position={Position.Top} id="t" style={handleStyle} />
        <Handle type="source" position={Position.Right} id="r" style={handleStyle} />
        <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} />
        <Handle type="source" position={Position.Left} id="l" style={handleStyle} />
        <Handle type="target" position={Position.Top} id="t" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Right} id="r" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Bottom} id="b" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Left} id="l" style={{...handleStyle, zIndex: -1}} />
      </div>
    );
  }

  // Server/VM (server rack) için özel render
  if (nodeType === 'server' || nodeType === 'vm' || nodeType === 'api_server') {
    return (
      <div style={{ position: 'relative', width: '160px', height: '140px' }}>
        <svg width="160" height="140" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={`server-grad-${data.label}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: finalBorderColor, stopOpacity: 0.25 }} />
              <stop offset="100%" style={{ stopColor: finalBorderColor, stopOpacity: 0.1 }} />
            </linearGradient>
          </defs>
          {/* Server rack */}
          <rect x="30" y="15" width="100" height="35" rx="4"
            fill={`url(#server-grad-${data.label})`}
            stroke={finalBorderColor}
            strokeWidth="2"
          />
          <rect x="30" y="55" width="100" height="35" rx="4"
            fill={`url(#server-grad-${data.label})`}
            stroke={finalBorderColor}
            strokeWidth="2"
          />
          <rect x="30" y="95" width="100" height="35" rx="4"
            fill={`url(#server-grad-${data.label})`}
            stroke={finalBorderColor}
            strokeWidth="2"
          />
          {/* LED göstergeleri */}
          <circle cx="45" cy="32" r="3" fill={finalBorderColor} opacity="0.8" />
          <circle cx="55" cy="32" r="3" fill={finalBorderColor} opacity="0.4" />
          <circle cx="45" cy="72" r="3" fill={finalBorderColor} opacity="0.6" />
          <circle cx="55" cy="72" r="3" fill={finalBorderColor} opacity="0.8" />
          <circle cx="45" cy="112" r="3" fill={finalBorderColor} opacity="0.5" />
          <circle cx="55" cy="112" r="3" fill={finalBorderColor} opacity="0.7" />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '15px',
          transform: 'translateY(-50%)',
          color: finalColor,
          fontSize: '12px',
          fontWeight: 700,
          textAlign: 'right',
          maxWidth: '70px',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>{data.icon || getIcon(nodeType)}</div>
          {data.label}
        </div>
        <Handle type="source" position={Position.Top} id="t" style={handleStyle} />
        <Handle type="source" position={Position.Right} id="r" style={handleStyle} />
        <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} />
        <Handle type="source" position={Position.Left} id="l" style={handleStyle} />
        <Handle type="target" position={Position.Top} id="t" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Right} id="r" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Bottom} id="b" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Left} id="l" style={{...handleStyle, zIndex: -1}} />
      </div>
    );
  }

  // Mobile/Web Client (device) için özel render
  if (nodeType === 'mobile_app' || nodeType === 'web_client') {
    const isMobile = nodeType === 'mobile_app';
    return (
      <div style={{ position: 'relative', width: isMobile ? '100px' : '160px', height: '140px' }}>
        <svg width={isMobile ? '100' : '160'} height="140" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={`device-grad-${data.label}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: finalBorderColor, stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: finalBorderColor, stopOpacity: 0.05 }} />
            </linearGradient>
          </defs>
          {isMobile ? (
            <>
              {/* Mobile phone */}
              <rect x="25" y="10" width="50" height="100" rx="8"
                fill={`url(#device-grad-${data.label})`}
                stroke={finalBorderColor}
                strokeWidth="2.5"
              />
              <rect x="30" y="18" width="40" height="70" rx="2"
                fill="transparent"
                stroke={finalBorderColor}
                strokeWidth="1"
                opacity="0.5"
              />
              <circle cx="50" cy="100" r="4" fill="transparent" stroke={finalBorderColor} strokeWidth="1.5" />
            </>
          ) : (
            <>
              {/* Monitor */}
              <rect x="20" y="15" width="120" height="80" rx="6"
                fill={`url(#device-grad-${data.label})`}
                stroke={finalBorderColor}
                strokeWidth="2.5"
              />
              <rect x="28" y="23" width="104" height="64" rx="2"
                fill="transparent"
                stroke={finalBorderColor}
                strokeWidth="1"
                opacity="0.5"
              />
              {/* Stand */}
              <rect x="70" y="95" width="20" height="15" rx="2"
                fill={`url(#device-grad-${data.label})`}
                stroke={finalBorderColor}
                strokeWidth="2"
              />
              <line x1="80" y1="95" x2="80" y2="95" stroke={finalBorderColor} strokeWidth="3" />
            </>
          )}
        </svg>
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '-25px' : '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: finalColor,
          fontSize: '12px',
          fontWeight: 700,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontSize: '20px', marginBottom: '2px' }}>{data.icon || getIcon(nodeType)}</div>
          {data.label}
        </div>
        <Handle type="source" position={Position.Top} id="t" style={handleStyle} />
        <Handle type="source" position={Position.Right} id="r" style={handleStyle} />
        <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} />
        <Handle type="source" position={Position.Left} id="l" style={handleStyle} />
        <Handle type="target" position={Position.Top} id="t" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Right} id="r" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Bottom} id="b" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Left} id="l" style={{...handleStyle, zIndex: -1}} />
      </div>
    );
  }

  // Decision (elmas) node için özel render
  if (nodeType === 'decision') {
    return (
      <div style={{ 
        width: '180px',
        height: '180px',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(45deg)',
          width: '140px',
          height: '140px',
          background: 'transparent',
          border: `2px solid ${finalBorderColor}`,
          boxShadow: selected ? `0 8px 20px ${finalBorderColor}40` : `0 2px 8px ${finalBorderColor}30`,
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: finalColor,
          fontSize: '14px',
          fontWeight: 600,
          textAlign: 'center',
          maxWidth: '100px',
          zIndex: 1,
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>{data.icon || getIcon(nodeType)}</div>
          <div>{data.label}</div>
        </div>
        <Handle type="source" position={Position.Top} id="t" style={handleStyle} />
        <Handle type="source" position={Position.Right} id="r" style={handleStyle} />
        <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} />
        <Handle type="source" position={Position.Left} id="l" style={handleStyle} />
        <Handle type="target" position={Position.Top} id="t" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Right} id="r" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Bottom} id="b" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Left} id="l" style={{...handleStyle, zIndex: -1}} />
      </div>
    );
  }

  // Database/Storage (silindir) node için özel render
  if (nodeType === 'sql_database' || nodeType === 'nosql_database' || 
      nodeType === 'cache' || nodeType === 'datastore' || 
      nodeType === 'data_warehouse' || nodeType === 'object_storage') {
    return (
      <div style={{ position: 'relative' }}>
        <svg width="180" height="120" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={`grad-${nodeType}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: finalBorderColor, stopOpacity: 0.1 }} />
              <stop offset="100%" style={{ stopColor: finalBorderColor, stopOpacity: 0.3 }} />
            </linearGradient>
          </defs>
          <ellipse cx="90" cy="20" rx="70" ry="15" 
            fill={`url(#grad-${nodeType})`}
            stroke={finalBorderColor} 
            strokeWidth="2" />
          <rect x="20" y="20" width="140" height="80" 
            fill={`url(#grad-${nodeType})`}
            stroke="none" />
          <line x1="20" y1="20" x2="20" y2="100" 
            stroke={finalBorderColor} strokeWidth="2" />
          <line x1="160" y1="20" x2="160" y2="100" 
            stroke={finalBorderColor} strokeWidth="2" />
          <ellipse cx="90" cy="100" rx="70" ry="15" 
            fill="transparent"
            stroke={finalBorderColor} 
            strokeWidth="2" />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: finalColor,
          fontSize: '14px',
          fontWeight: 600,
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>{data.icon || getIcon(nodeType)}</div>
          <div>{data.label}</div>
        </div>
        <Handle type="source" position={Position.Top} id="t" style={handleStyle} />
        <Handle type="source" position={Position.Right} id="r" style={handleStyle} />
        <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} />
        <Handle type="source" position={Position.Left} id="l" style={handleStyle} />
        <Handle type="target" position={Position.Top} id="t" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Right} id="r" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Bottom} id="b" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Left} id="l" style={{...handleStyle, zIndex: -1}} />
      </div>
    );
  }

  // Cloud/Server (bulut/server şekli) node için özel render  
  if (nodeType === 'cloud_service' || nodeType === 'cdn') {
    return (
      <div style={{ position: 'relative' }}>
        <svg width="200" height="100" style={{ overflow: 'visible' }}>
          <path d="M 50 60 Q 50 40, 70 40 Q 70 20, 100 20 Q 130 20, 130 40 Q 150 40, 150 60 Q 150 80, 130 80 L 70 80 Q 50 80, 50 60 Z"
            fill="transparent"
            stroke={finalBorderColor}
            strokeWidth="2"
            style={{ filter: `drop-shadow(0 2px 8px ${finalBorderColor}30)` }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: finalColor,
          fontSize: '14px',
          fontWeight: 600,
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>{data.icon || getIcon(nodeType)}</div>
          <div>{data.label}</div>
        </div>
        <Handle type="source" position={Position.Top} id="t" style={handleStyle} />
        <Handle type="source" position={Position.Right} id="r" style={handleStyle} />
        <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} />
        <Handle type="source" position={Position.Left} id="l" style={handleStyle} />
        <Handle type="target" position={Position.Top} id="t" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Right} id="r" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Bottom} id="b" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Left} id="l" style={{...handleStyle, zIndex: -1}} />
      </div>
    );
  }

  // Actor (insan figürü) için özel render
  if (nodeType === 'actor') {
    return (
      <div style={{ position: 'relative' }}>
        <svg width="100" height="140" style={{ overflow: 'visible' }}>
          <circle cx="50" cy="30" r="20" 
            fill="transparent"
            stroke={finalBorderColor} 
            strokeWidth="2" />
          <line x1="50" y1="50" x2="50" y2="90" 
            stroke={finalBorderColor} strokeWidth="2" />
          <line x1="50" y1="60" x2="25" y2="80" 
            stroke={finalBorderColor} strokeWidth="2" />
          <line x1="50" y1="60" x2="75" y2="80" 
            stroke={finalBorderColor} strokeWidth="2" />
          <line x1="50" y1="90" x2="30" y2="120" 
            stroke={finalBorderColor} strokeWidth="2" />
          <line x1="50" y1="90" x2="70" y2="120" 
            stroke={finalBorderColor} strokeWidth="2" />
        </svg>
        <div style={{
          position: 'absolute',
          bottom: '-25px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: finalColor,
          fontSize: '14px',
          fontWeight: 600,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>
          {data.label}
        </div>
        <Handle type="source" position={Position.Top} id="t" style={handleStyle} />
        <Handle type="source" position={Position.Right} id="r" style={handleStyle} />
        <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} />
        <Handle type="source" position={Position.Left} id="l" style={handleStyle} />
        <Handle type="target" position={Position.Top} id="t" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Right} id="r" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Bottom} id="b" style={{...handleStyle, zIndex: -1}} />
        <Handle type="target" position={Position.Left} id="l" style={{...handleStyle, zIndex: -1}} />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '16px 28px', 
      borderRadius: '12px',
      background: 'rgba(12, 14, 18, 0.75)',
      border: `1.25px solid ${finalBorderColor}`,
      color: finalColor,
      minWidth: '170px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: 600,
      letterSpacing: '0.2px',
      boxShadow: selected 
        ? `0 10px 24px ${finalBorderColor}30, 0 0 0 2px ${finalBorderColor}30`
        : `0 8px 18px rgba(0,0,0,0.35)`,
      transition: 'all 0.2s ease',
      cursor: 'grab',
      transform: selected ? 'scale(1.02)' : 'scale(1)',
      position: 'relative',
      overflow: 'visible',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        position: 'absolute',
        top: '-1px',
        left: '-1px',
        right: '-1px',
        bottom: '-1px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${finalBorderColor}00, ${finalBorderColor}14)`,
        pointerEvents: 'none',
        opacity: selected ? 1 : 0,
        transition: 'opacity 0.2s',
      }} />
      
      {/* 4 yönden handle - pozisyon bazlı ID'ler */}
      <Handle 
        type="source"
        position={Position.Top}
        id="t"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle 
        type="source"
        position={Position.Right}
        id="r"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle 
        type="source"
        position={Position.Bottom}
        id="b"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle 
        type="source"
        position={Position.Left}
        id="l"
        style={handleStyle}
        isConnectable={true}
      />
      
      {/* Target handles - aynı ID'ler, aynı pozisyonlar */}
      <Handle 
        type="target"
        position={Position.Top}
        id="t"
        style={{...handleStyle, zIndex: -1}}
        isConnectable={true}
      />
      <Handle 
        type="target"
        position={Position.Right}
        id="r"
        style={{...handleStyle, zIndex: -1}}
        isConnectable={true}
      />
      <Handle 
        type="target"
        position={Position.Bottom}
        id="b"
        style={{...handleStyle, zIndex: -1}}
        isConnectable={true}
      />
      <Handle 
        type="target"
        position={Position.Left}
        id="l"
        style={{...handleStyle, zIndex: -1}}
        isConnectable={true}
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
          fontSize: '18px',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))',
        }}>
          {data.icon || getIcon(nodeType)}
        </span>
        <span style={{
          letterSpacing: '0.3px',
          textShadow: selected ? `0 0 14px ${finalBorderColor}45` : 'none',
        }}>
          {data.label}
        </span>
      </div>
    </div>
  );
}

const nodeTypes = {
  default: CustomNode,
};

// Dagre layout fonksiyonu - geliştirilmiş
type LayoutDensity = 'compact' | 'comfortable' | 'spacious';
type LayoutRanker = 'network-simplex' | 'tight-tree' | 'longest-path';
type LayoutDirection = 'TB' | 'LR';

const resolveLayoutOptions = (nodes: Node[], edges: Edge[]) => {
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const avgDegree = nodeCount > 0 ? edgeCount / nodeCount : 0;

  let density: LayoutDensity = 'comfortable';
  if (nodeCount >= 30 || avgDegree >= 1.6) {
    density = 'spacious';
  } else if (nodeCount <= 10 && avgDegree <= 1.0) {
    density = 'compact';
  }

  let ranker: LayoutRanker = 'network-simplex';
  if (edgeCount <= Math.max(1, nodeCount - 1) && avgDegree <= 1.2) {
    ranker = 'longest-path';
  } else if (avgDegree <= 1.4) {
    ranker = 'tight-tree';
  }

  const direction: LayoutDirection = nodeCount >= 20 || avgDegree >= 1.4 ? 'LR' : 'TB';

  return { density, ranker, direction };
};

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection,
  density: LayoutDensity,
  ranker: LayoutRanker
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Node boyutlarını hesapla
  const getNodeDimensions = (node: Node) => {
    const nodeType = (node.data as any)?.nodeType || 'process';
    
    // Özel şekiller için boyutlar
    if (nodeType === 'decision') return { width: 180, height: 180 };
    if (nodeType === 'sql_database' || nodeType === 'nosql_database' || 
        nodeType === 'cache' || nodeType === 'datastore' || 
        nodeType === 'data_warehouse' || nodeType === 'object_storage') {
      return { width: 180, height: 120 };
    }
    if (nodeType === 'cloud_service' || nodeType === 'cdn') return { width: 200, height: 100 };
    if (nodeType === 'actor') return { width: 100, height: 165 };
    if (nodeType === 'container' || nodeType === 'kubernetes') return { width: 160, height: 160 };
    if (nodeType === 'api_gateway' || nodeType === 'load_balancer') return { width: 180, height: 180 };
    if (nodeType === 'queue' || nodeType === 'message_broker') return { width: 180, height: 100 };
    if (nodeType === 'monitoring' || nodeType === 'analytics' || nodeType === 'logging') return { width: 160, height: 165 };
    if (nodeType === 'server' || nodeType === 'vm' || nodeType === 'api_server') return { width: 160, height: 140 };
    if (nodeType === 'mobile_app') return { width: 100, height: 165 };
    if (nodeType === 'web_client') return { width: 160, height: 170 };
    if (nodeType === 'group') {
      return { 
        width: (node.data as any).width || 500, 
        height: (node.data as any).height || 400 
      };
    }
    
    // Default boyut
    return { width: 220, height: 100 };
  };

  const groupPadding = 80;

  const densityMap = {
    compact: { nodesep: 120, ranksep: 180, edgesep: 60, marginx: 60, marginy: 60 },
    comfortable: { nodesep: 180, ranksep: 250, edgesep: 100, marginx: 100, marginy: 100 },
    spacious: { nodesep: 240, ranksep: 320, edgesep: 140, marginx: 140, marginy: 140 },
  } as const;
  const baseSpacing = densityMap[density];
  const scale = Math.min(1.4, 1 + Math.max(0, nodes.length - 25) / 80);

  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: Math.round(baseSpacing.nodesep * scale),
    ranksep: Math.round(baseSpacing.ranksep * scale),
    edgesep: Math.round(baseSpacing.edgesep * scale),
    marginx: Math.round(baseSpacing.marginx * scale),
    marginy: Math.round(baseSpacing.marginy * scale),
    ranker,
  });

  // Önce parent node'ları, sonra child'ları ekle
  const parentNodes = nodes.filter(n => !(n.data as any).parent);
  const childNodes = nodes.filter(n => (n.data as any).parent);
  
  // Parent node'ları layout'a ekle
  parentNodes.forEach((node) => {
    const dims = getNodeDimensions(node);
    dagreGraph.setNode(node.id, dims);
  });

  // Edge'leri sadece parent node'lar arasında ekle
  edges.forEach((edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    // Sadece parent-to-parent edge'leri layout için kullan
    if (sourceNode && targetNode && 
        !(sourceNode.data as any).parent && 
        !(targetNode.data as any).parent) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  // Parent node pozisyonlarını hesapla
  const layoutedNodes = parentNodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const dims = getNodeDimensions(node);
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - dims.width / 2,
        y: nodeWithPosition.y - dims.height / 2,
      },
    };
  });

  // Child node'ları parent'ın içine yerleştir
  childNodes.forEach((childNode) => {
    const parentId = (childNode.data as any).parent;
    const parent = layoutedNodes.find(n => n.id === parentId);
    
    if (parent) {
      // Parent'ın çocuklarını bul
      const siblings = childNodes.filter(n => (n.data as any).parent === parentId);
      const childIndex = siblings.findIndex(n => n.id === childNode.id);
      
      // Çocukları parent içinde dikey olarak dağıt
      const childrenCount = siblings.length;
      const parentHeight = (parent.data as any).height || 400;
      const parentWidth = (parent.data as any).width || 500;
      
      // Grid layout: 2 sütun
      const cols = Math.min(2, childrenCount);
      const row = Math.floor(childIndex / cols);
      const col = childIndex % cols;
      
      const xSpacing = (parentWidth - groupPadding * 2) / cols;
      const ySpacing = Math.min(150, (parentHeight - groupPadding * 2 - 40) / Math.ceil(childrenCount / cols));
      
      layoutedNodes.push({
        ...childNode,
        position: {
          x: parent.position.x + groupPadding + col * xSpacing + 20,
          y: parent.position.y + groupPadding + 50 + row * ySpacing,
        },
      });
    }
  });

  return { nodes: layoutedNodes, edges };
};

function DiagramCanvasInner() {
  const rfNodes = useAppStore((s) => s.rfNodes);
  const rfEdges = useAppStore((s) => s.rfEdges);
  const graphVersion = useAppStore((s) => s.graph.version);
  const fromReactFlow = useAppStore((s) => s.fromReactFlow);
  const reactFlow = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [toolsOpen, setToolsOpen] = React.useState(false);

  const [nodes, setNodes] = React.useState<Node[]>([]);
  const [edges, setEdges] = React.useState<Edge[]>([]);
  const lastLayoutVersion = React.useRef<string | null>(null);
  const prevPositions = React.useRef<Map<string, { x: number; y: number }>>(new Map());

  // En uygun handle'ı hesaplayan yardımcı fonksiyon - önce tanımla
  const updateEdgeHandles = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    return currentEdges.map(edge => {
      const sourceNode = currentNodes.find(n => n.id === edge.source);
      const targetNode = currentNodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return edge;

      // Node pozisyonlarına göre en uygun handle'ı hesapla
      const dx = targetNode.position.x - sourceNode.position.x;
      const dy = targetNode.position.y - sourceNode.position.y;

      let sourceHandle = 'r';
      let targetHandle = 'l';

      // Yatay mı dikey mi daha uzak?
      if (Math.abs(dx) > Math.abs(dy)) {
        // Yatay bağlantı
        sourceHandle = dx > 0 ? 'r' : 'l';
        targetHandle = dx > 0 ? 'l' : 'r';
      } else {
        // Dikey bağlantı
        sourceHandle = dy > 0 ? 'b' : 't';
        targetHandle = dy > 0 ? 't' : 'b';
      }

      // Sadece değişiklik varsa güncelle
      if (edge.sourceHandle === sourceHandle && edge.targetHandle === targetHandle) {
        return edge;
      }

      return {
        ...edge,
        sourceHandle,
        targetHandle,
      };
    });
  }, []);

  // Güncellemelerde mevcut node pozisyonlarını koru
  React.useEffect(() => {
    console.log("DiagramCanvas - Store updated:", rfNodes.length, "nodes", rfEdges.length, "edges");
    // requestAnimationFrame kullanarak render döngüsünün dışında güncelle
    requestAnimationFrame(() => {
      const hasExistingPositions = prevPositions.current.size > 0;
      const shouldAutoLayout =
        rfNodes.length > 0 &&
        graphVersion !== lastLayoutVersion.current &&
        !hasExistingPositions;

      if (shouldAutoLayout) {
        const { density, ranker, direction } = resolveLayoutOptions(rfNodes, rfEdges);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          rfNodes,
          rfEdges,
          direction,
          density,
          ranker
        );
        lastLayoutVersion.current = graphVersion;
        setNodes(layoutedNodes);
        setEdges(updateEdgeHandles(layoutedNodes, layoutedEdges));
        fromReactFlow(layoutedNodes, layoutedEdges);
        prevPositions.current = new Map(layoutedNodes.map((node) => [node.id, node.position]));
      } else {
        const nodesWithPreservedPositions = rfNodes.map((node) => {
          const prev = prevPositions.current.get(node.id);
          return prev ? { ...node, position: prev } : node;
        });
        lastLayoutVersion.current = graphVersion;
        setNodes(nodesWithPreservedPositions);
        setEdges(updateEdgeHandles(nodesWithPreservedPositions, rfEdges));
        fromReactFlow(nodesWithPreservedPositions, rfEdges);
        prevPositions.current = new Map(nodesWithPreservedPositions.map((node) => [node.id, node.position]));
      }
      
    });
  }, [rfNodes, rfEdges, updateEdgeHandles, fromReactFlow, graphVersion]);

  React.useEffect(() => {
    if (nodes.length === 0) return;
    requestAnimationFrame(() => {
      reactFlow.fitView({
        padding: 0.3,
        maxZoom: 1,
        minZoom: 0.05,
        duration: 300,
      });
    });
  }, [nodes, graphVersion, reactFlow]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const next = applyNodeChanges(changes, nds);
        
        // Pozisyon değişikliği varsa edge'leri güncelle
        const hasPositionChange = changes.some(c => c.type === 'position');
        
        if (hasPositionChange) {
          // requestAnimationFrame kullanarak render sonrası edge güncelle
          requestAnimationFrame(() => {
            setEdges((eds) => updateEdgeHandles(next, eds));
          });
          
          // Sürükleme bittiyse store'a kaydet
          const isDragEnd = changes.some(c => c.type === 'position' && 'dragging' in c && !c.dragging);
          if (isDragEnd) {
            // Asenkron olarak store'u güncelle - render döngüsünün dışında
            requestAnimationFrame(() => {
              setEdges((eds) => {
                fromReactFlow(next, eds);
                return eds;
              });
            });
          }
        }
        
        return next;
      });
    },
    [fromReactFlow, updateEdgeHandles]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const next = applyEdgeChanges(changes, eds);
        return next;
      });
    },
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        // Yeni bağlantı için en uygun handle'ı hesapla
        const sourceNode = nodes.find(n => n.id === connection.source);
        const targetNode = nodes.find(n => n.id === connection.target);
        
        let newEdge: any = { 
          ...connection, 
          label: "",
        };

        if (sourceNode && targetNode) {
          const dx = targetNode.position.x - sourceNode.position.x;
          const dy = targetNode.position.y - sourceNode.position.y;

          if (Math.abs(dx) > Math.abs(dy)) {
            newEdge.sourceHandle = dx > 0 ? 'r' : 'l';
            newEdge.targetHandle = dx > 0 ? 'l' : 'r';
          } else {
            newEdge.sourceHandle = dy > 0 ? 'b' : 't';
            newEdge.targetHandle = dy > 0 ? 't' : 'b';
          }
        }

        const next = addEdge(newEdge, eds);
        fromReactFlow(nodes, next);
        return next;
      });
    },
    [fromReactFlow, nodes]
  );

  const addNode = useCallback(
    (type: string, label: string) => {
      const bounds = wrapperRef.current?.getBoundingClientRect();
      const center = bounds
        ? { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }
        : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const position = reactFlow.screenToFlowPosition(center);
      const newNode: Node = {
        id: uuid(),
        type: "default",
        position,
        data: { label, nodeType: type },
      };
      setNodes((prev) => {
        const next = [...prev, newNode];
        setEdges((currentEdges) => {
          fromReactFlow(next, currentEdges);
          return currentEdges;
        });
        return next;
      });
    },
    [fromReactFlow, reactFlow]
  );

  const duplicateSelection = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    if (selectedNodes.length === 0) return;
    const clones = selectedNodes.map((node) => ({
      ...node,
      id: uuid(),
      selected: false,
      position: {
        x: node.position.x + 40,
        y: node.position.y + 40,
      },
    }));
    const next = [...nodes, ...clones];
    setNodes(next);
    setEdges((currentEdges) => {
      fromReactFlow(next, currentEdges);
      return currentEdges;
    });
  }, [nodes, fromReactFlow]);

  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    fromReactFlow([], []);
  }, [fromReactFlow]);

  const deleteSelection = useCallback(() => {
    setNodes((prev) => {
      const remainingNodes = prev.filter((node) => !node.selected);
      setEdges((currentEdges) => {
        const remainingEdges = currentEdges.filter(
          (edge) =>
            !edge.selected &&
            !prev.find((node) => node.selected && (edge.source === node.id || edge.target === node.id))
        );
        fromReactFlow(remainingNodes, remainingEdges);
        return remainingEdges;
      });
      return remainingNodes;
    });
  }, [fromReactFlow]);

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
          display: "flex",
          gap: 8,
          padding: "8px 10px",
          borderRadius: 12,
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        }}
      >
        <button type="button" onClick={() => setToolsOpen((prev) => !prev)}>
          {toolsOpen ? "Araçları Gizle" : "Araçlar"}
        </button>
        {toolsOpen && (
          <>
            <button type="button" onClick={() => addNode("process", "Yeni Adım")}>+ Süreç</button>
            <button type="button" onClick={() => addNode("decision", "Karar")}>+ Karar</button>
            <button type="button" onClick={() => addNode("note", "Not")}>+ Not</button>
            <button type="button" onClick={() => addNode("actor", "Aktör")}>+ Aktör</button>
            <button type="button" onClick={() => addNode("datastore", "Depo")}>+ Veri Deposu</button>
            <button type="button" onClick={() => addNode("cloud_service", "Bulut")}>+ Bulut</button>
            <button type="button" onClick={() => addNode("message_broker", "Mesajlaşma")}>+ Mesajlaşma</button>
            <button type="button" onClick={() => addNode("monitoring", "İzleme")}>+ İzleme</button>
            <button type="button" onClick={duplicateSelection}>Kopyala</button>
            <button type="button" onClick={deleteSelection}>Sil</button>
            <button type="button" onClick={clearAll}>Temizle</button>
          </>
        )}
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.1, minZoom: 0.05, duration: 500 }}
        minZoom={0.05}
        maxZoom={2}
        edgesUpdatable={true}
        edgesFocusable={true}
        elevateEdgesOnSelect={true}
        connectionLineStyle={{ 
          stroke: '#6366f1', 
          strokeWidth: 3,
          strokeDasharray: '5,5',
        }}
        defaultEdgeOptions={{
          type: 'simplebezier',
          animated: true,
          style: { 
            stroke: '#6366f1',
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#6366f1',
            width: 20,
            height: 20,
          },
        }}
        connectionMode="loose"
        snapToGrid={false}
        snapGrid={[15, 15]}
        autoPanOnConnect={true}
        autoPanOnNodeDrag={true}
        reconnectRadius={100}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
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

export default function DiagramCanvas() {
  return (
    <ReactFlowProvider>
      <DiagramCanvasInner />
    </ReactFlowProvider>
  );
}
