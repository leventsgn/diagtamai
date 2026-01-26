import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";

export default function LlmSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const llm = useAppStore((s) => s.llm);
  const setLlm = useAppStore((s) => s.setLlm);

  return (
    <div className="block collapsible-block">
      <div 
        className="collapsible-header" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3>
          <span className="settings-icon">⚙️</span>
          LLM Ayarları
        </h3>
        <span className={`chevron ${isOpen ? 'open' : ''}`}>›</span>
      </div>
      
      <div className={`collapsible-content ${isOpen ? 'open' : ''}`}>
        <label>URL (/v1/chat/completions)</label>
        <input 
          value={llm.url} 
          onChange={(e) => setLlm({ url: e.target.value })} 
          placeholder="https://api.example.com/v1/chat/completions"
        />

        <label>Model</label>
        <input 
          value={llm.model} 
          onChange={(e) => setLlm({ model: e.target.value })} 
          placeholder="gpt-4"
        />

        <label>Bearer Token</label>
        <input 
          type="password"
          value={llm.token} 
          onChange={(e) => setLlm({ token: e.target.value })} 
          placeholder="sk-..."
        />
        <small>🔒 Token tarayıcıda localStorage içinde güvenli şekilde saklanır.</small>
      </div>
    </div>
  );
}
