import React, { useMemo, useRef, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { debounce } from "../lib/debounce";
import { isValidGithubRepoUrl, requestPatch, uuid } from "../lib/api";

export default function PromptPanel() {
  const prompt = useAppStore((s) => s.prompt);
  const setPrompt = useAppStore((s) => s.setPrompt);

  const live = useAppStore((s) => s.live);
  const setLive = useAppStore((s) => s.setLive);

  const lockPositions = useAppStore((s) => s.lockPositions);
  const setLockPositions = useAppStore((s) => s.setLockPositions);

  const nodeLimit = useAppStore((s) => s.nodeLimit);
  const setNodeLimit = useAppStore((s) => s.setNodeLimit);

  const llm = useAppStore((s) => s.llm);
  const graph = useAppStore((s) => s.graph);
  const setGraph = useAppStore((s) => s.setGraph);

  const repoUrl = useAppStore((s) => s.repoUrl);
  const setRepoUrl = useAppStore((s) => s.setRepoUrl);

  const status = useAppStore((s) => s.status);
  const setStatus = useAppStore((s) => s.setStatus);

  const inflight = useRef<{ requestId: string; baseVersion: string; abort: AbortController } | null>(null);
  const [refreshRepo, setRefreshRepo] = useState(false);

  async function runOnce(instruction: string) {
    if (!llm.url || !llm.model || !llm.token) {
      setStatus("LLM ayarları eksik (URL/Model/Token).");
      return;
    }

    if (repoUrl && !isValidGithubRepoUrl(repoUrl)) {
      setStatus("GitHub Repo URL formatı hatalı. Örn: https://github.com/org/repo");
      return;
    }

    if (inflight.current) inflight.current.abort.abort();

    const requestId = uuid();
    const baseVersion = graph.version;
    const abort = new AbortController();
    inflight.current = { requestId, baseVersion, abort };

    setStatus("Üretiliyor...");

    try {
      const resp = await requestPatch({
        llm,
        request_id: requestId,
        base_version: baseVersion,
        instruction,
        current_graph: graph,
        nodeLimit,
        lockPositions,
        refreshRepo,
        signal: abort.signal,
      });

      if (!inflight.current || inflight.current.requestId !== requestId) return;
      if (graph.version !== baseVersion) {
        setStatus("Sonuç discard edildi (state değişti).");
        return;
      }

      setGraph(resp.new_graph);
      setStatus("Güncellendi.");
    } catch (e: any) {
      if (String(e?.name) === "AbortError") return;
      setStatus(`Hata: ${String(e?.message ?? e)}`);
    }
  }

  const debouncedLive = useMemo(
    () =>
      debounce((text: string) => {
        runOnce(text);
      }, 400),
    // deps intentionally limited
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [llm.url, llm.model, llm.token, graph.version, nodeLimit, lockPositions, repoUrl]
  );

  const repoUrlIsValid = !repoUrl || isValidGithubRepoUrl(repoUrl);

  return (
    <div className="block">
      <h3>Prompt</h3>
      <label>Chat / İstek</label>
      <textarea
        value={prompt}
        onChange={(e) => {
          const v = e.target.value;
          setPrompt(v);
          if (live) debouncedLive(v);
        }}
      />

      <div className="row">
        <div>
          <label>Live Mode</label>
          <select value={live ? "on" : "off"} onChange={(e) => setLive(e.target.value === "on")}>
            <option value="on">Açık</option>
            <option value="off">Kapalı</option>
          </select>
        </div>
        <div>
          <label>Konumları Koru</label>
          <select value={lockPositions ? "yes" : "no"} onChange={(e) => setLockPositions(e.target.value === "yes")}>
            <option value="no">Hayır</option>
            <option value="yes">Evet</option>
          </select>
        </div>
      </div>

      <div className="block">
        <label>Node Limit</label>
        <input type="number" value={nodeLimit} min={10} max={500} onChange={(e) => setNodeLimit(Number(e.target.value))} />
      </div>

      <div className="block">
        <label className="row">
          <input
            type="checkbox"
            checked={refreshRepo}
            onChange={(e) => setRefreshRepo(e.target.checked)}
          />
          <span>Repo bağlamını yenile</span>
        </label>
      </div>

      <div className="btnrow">
        <button onClick={() => runOnce(prompt)}>Generate</button>
        <button onClick={() => setGraph({ version: "init", nodes: [], edges: [] })}>Clear</button>
      </div>

      <div className="block status">{status}</div>
    </div>
  );
}
