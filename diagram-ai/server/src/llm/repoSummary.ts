type RepoSummaryOptions = {
  repoUrl: string;
  requesterId?: string;
};

type RepoLocation = {
  owner: string;
  repo: string;
};

type TreeEntry = {
  path: string;
  type: "blob" | "tree";
  size?: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 6;
const MAX_FILES = 200;
const MAX_TOTAL_BYTES = 300_000;
const MAX_FILE_BYTES = 40_000;
const MAX_KEY_FILES = 6;
const MAX_CONTENT_CHARS = 4_000;
const MAX_SAMPLE_PATHS_PER_EXT = 5;

const rateLimiters = new Map<string, { resetAt: number; count: number }>();

const PREFERRED_FILE_PATTERNS = [
  /^README(\.|$)/i,
  /^package\.json$/i,
  /^pnpm-lock\.yaml$/i,
  /^yarn\.lock$/i,
  /^package-lock\.json$/i,
  /^tsconfig\.json$/i,
  /^pyproject\.toml$/i,
  /^requirements\.txt$/i,
  /^Cargo\.toml$/i,
  /^go\.mod$/i,
  /^pom\.xml$/i,
  /^Dockerfile$/i,
  /^docker-compose\.ya?ml$/i,
  /^Makefile$/i,
];

function enforceRateLimit(requesterId: string): void {
  const now = Date.now();
  const existing = rateLimiters.get(requesterId);
  if (!existing || now > existing.resetAt) {
    rateLimiters.set(requesterId, { resetAt: now + RATE_LIMIT_WINDOW_MS, count: 1 });
    return;
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    const waitMs = existing.resetAt - now;
    throw new Error(`Rate limit exceeded. Retry after ${Math.ceil(waitMs / 1000)}s.`);
  }

  existing.count += 1;
}

function parseRepoUrl(repoUrl: string): RepoLocation {
  let parsed: URL;
  try {
    parsed = new URL(repoUrl);
  } catch {
    throw new Error("Invalid repo URL.");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Only https URLs are allowed.");
  }

  if (parsed.hostname !== "github.com") {
    throw new Error("Only github.com repositories are allowed.");
  }

  const parts = parsed.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  if (parts.length < 2) {
    throw new Error("Repo URL must include owner and repo.");
  }

  const owner = parts[0];
  let repo = parts[1];
  if (repo.endsWith(".git")) repo = repo.slice(0, -4);

  if (!owner || !repo) {
    throw new Error("Repo URL must include owner and repo.");
  }

  return { owner, repo };
}

function toExtension(path: string): string {
  const basename = path.split("/").pop() ?? path;
  const idx = basename.lastIndexOf(".");
  if (idx <= 0) return "no_ext";
  return basename.slice(idx).toLowerCase();
}

function truncateText(text: string, limit: number): string {
  if (text.length <= limit) return text.trim();
  return `${text.slice(0, limit).trim()}…`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "diagram-ai",
    },
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`GitHub API ${res.status}: ${message}`);
  }

  return (await res.json()) as T;
}

async function fetchRawText(url: string, maxBytes: number): Promise<string | null> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "diagram-ai",
    },
  });

  if (!res.ok) {
    return null;
  }

  const contentLength = res.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    return null;
  }

  const text = await res.text();
  if (text.length > maxBytes) {
    return null;
  }

  return text;
}

export async function buildRepoSummary(options: RepoSummaryOptions): Promise<string> {
  const requesterId = options.requesterId ?? "anonymous";
  enforceRateLimit(requesterId);

  const { owner, repo } = parseRepoUrl(options.repoUrl);
  const repoInfo = await fetchJson<{ default_branch: string }>(
    `https://api.github.com/repos/${owner}/${repo}`,
  );
  const branch = repoInfo.default_branch ?? "main";
  const ref = await fetchJson<{ object: { sha: string } }>(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
  );
  const commit = await fetchJson<{ tree: { sha: string } }>(
    `https://api.github.com/repos/${owner}/${repo}/git/commits/${ref.object.sha}`,
  );
  const tree = await fetchJson<{ tree: TreeEntry[] }>(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${commit.tree.sha}?recursive=1`,
  );

  const blobs = tree.tree.filter((entry) => entry.type === "blob");
  let totalBytes = 0;
  const limitedFiles: TreeEntry[] = [];
  for (const entry of blobs) {
    const size = entry.size ?? 0;
    if (limitedFiles.length >= MAX_FILES) break;
    if (totalBytes + size > MAX_TOTAL_BYTES) break;
    limitedFiles.push(entry);
    totalBytes += size;
  }

  const extensionStats = new Map<string, { count: number; bytes: number; samples: string[] }>();
  for (const entry of limitedFiles) {
    const ext = toExtension(entry.path);
    const stats = extensionStats.get(ext) ?? { count: 0, bytes: 0, samples: [] };
    stats.count += 1;
    stats.bytes += entry.size ?? 0;
    if (stats.samples.length < MAX_SAMPLE_PATHS_PER_EXT) {
      stats.samples.push(entry.path);
    }
    extensionStats.set(ext, stats);
  }

  const preferredFiles = limitedFiles
    .filter((entry) => PREFERRED_FILE_PATTERNS.some((pattern) => pattern.test(entry.path.split("/").pop() ?? "")))
    .slice(0, MAX_KEY_FILES);

  const keyFileSummaries: string[] = [];
  let fetchedBytes = 0;
  for (const entry of preferredFiles) {
    if (fetchedBytes >= MAX_TOTAL_BYTES) break;
    const fileBytes = entry.size ?? 0;
    if (fileBytes > MAX_FILE_BYTES) continue;
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${entry.path}`;
    const content = await fetchRawText(rawUrl, MAX_FILE_BYTES);
    if (!content) continue;
    fetchedBytes += Math.min(content.length, MAX_FILE_BYTES);
    keyFileSummaries.push(
      `- ${entry.path}: ${truncateText(content.replace(/\s+/g, " ").trim(), MAX_CONTENT_CHARS)}`,
    );
  }

  const extensionLines = Array.from(extensionStats.entries())
    .sort((a, b) => b[1].bytes - a[1].bytes)
    .slice(0, 12)
    .map(([ext, stats]) => {
      const sampleList = stats.samples.join(", ");
      return `- ${ext}: ${stats.count} files, ${formatBytes(stats.bytes)} (samples: ${sampleList})`;
    });

  return [
    `Repo: ${owner}/${repo} (branch: ${branch})`,
    `Files scanned: ${limitedFiles.length}/${blobs.length} (size cap ${formatBytes(MAX_TOTAL_BYTES)}, scanned ${formatBytes(totalBytes)})`,
    "",
    "FILE TYPES:",
    ...extensionLines,
    "",
    "KEY FILE SNAPSHOTS:",
    ...(keyFileSummaries.length > 0 ? keyFileSummaries : ["- None (size/limit constraints)."]),
  ].join("\n");
}
