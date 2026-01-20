import React from "react";
import LlmSettings from "./components/LlmSettings";
import PromptPanel from "./components/PromptPanel";
import DiagramCanvas from "./components/DiagramCanvas";

export default function App() {
  return (
    <div className="app">
      <div className="sidebar">
        <LlmSettings />
        <PromptPanel />
      </div>
      <div className="main">
        <DiagramCanvas />
      </div>
    </div>
  );
}
