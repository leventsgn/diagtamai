import React from "react";
import { useAppStore } from "../store/useAppStore";

export default function LlmSettings() {
  const llm = useAppStore((s) => s.llm);
  const setLlm = useAppStore((s) => s.setLlm);

  return (
    <div className="block">
      <h3>LLM Ayarları</h3>
      <label>URL (/v1/chat/completions)</label>
      <input value={llm.url} onChange={(e) => setLlm({ url: e.target.value })} />

      <label>Model</label>
      <input value={llm.model} onChange={(e) => setLlm({ model: e.target.value })} />

      <label>Bearer Token</label>
      <input value={llm.token} onChange={(e) => setLlm({ token: e.target.value })} placeholder="Bearer token" />
      <small>Token tarayıcıda localStorage içinde saklanır. Proje exportuna dahil etmeyin.</small>
    </div>
  );
}
