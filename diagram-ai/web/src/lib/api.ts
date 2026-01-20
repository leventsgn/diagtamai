import { GraphState, LlmConfig } from "../store/useAppStore";

export async function requestPatch(args: {
  llm: LlmConfig;
  request_id: string;
  base_version: string;
  instruction: string;
  current_graph: GraphState;
  nodeLimit: number;
  lockPositions: boolean;
  signal?: AbortSignal;
}) {
  const res = await fetch("/api/diagram/patch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: args.signal,
    body: JSON.stringify({
      llm: args.llm,
      request_id: args.request_id,
      base_version: args.base_version,
      instruction: args.instruction,
      current_graph: args.current_graph,
      constraints: {
        language: "tr",
        node_limit: args.nodeLimit,
        lock_positions: args.lockPositions,
      },
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error ? `${json.error}` : `HTTP ${res.status}`);
  }
  return json as { request_id: string; applied: boolean; new_graph: GraphState };
}

export function uuid() {
  return crypto.randomUUID();
}
