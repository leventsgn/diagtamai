import React, { useEffect, useState } from "react";
import LlmSettings from "./components/LlmSettings";
import PromptPanel from "./components/PromptPanel";
import DiagramCanvas from "./components/DiagramCanvas";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as any) || "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => prev === "light" ? "dark" : "light");
  };

  const getThemeIcon = () => {
    return theme === "light" ? "☀️" : "🌙";
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>✨ Diagram AI</h1>
          <button className="theme-toggle" onClick={toggleTheme} title="Tema Değiştir">
            {getThemeIcon()}
          </button>
        </div>
        <LlmSettings />
        <PromptPanel />
      </div>
      <div className="main">
        <DiagramCanvas />
      </div>
    </div>
  );
}
