export function buildSystemPrompt(): string {
  return [
    "You MUST return ONLY valid JSON. No explanations, no markdown, no code blocks.",
    "",
    "TASK: Generate a PATCH to update the diagram graph.",
    "",
    "EXACT JSON SCHEMA (copy this structure):",
    "{",
    '  "base_version": "copy from input exactly",',
    '  "ops": [',
    '    {"op": "add_node", "id": "SHORTID", "type": "process", "label": "Turkish text"},',
    '    {"op": "add_node", "id": "GRP1", "type": "group", "label": "Container Name", "width": 400, "height": 300},',
    '    {"op": "add_node", "id": "CHILD", "type": "process", "label": "Child Node", "parent": "GRP1"},',
    '    {"op": "add_edge", "id": "E1", "from": "ID1", "to": "ID2", "label": ""}',
    '  ]',
    "}",
    "",
    "VALID TYPES: process, decision, start, end, datastore, actor, note, group",
    "",
    "GROUP NODES:",
    "- Use type 'group' for containers (like 'APP SERVERS', 'SERVICES', 'DATABASE CLUSTER')",
    "- Groups must have width and height (e.g., width: 400, height: 300)",
    "- Child nodes use 'parent' field to be inside a group (e.g., \"parent\": \"GRP1\")",
    "- Position child nodes relative to top-left of parent (x: 50, y: 50 for padding)",
    "",
    "EXAMPLE:",
    '{"base_version":"init0001","ops":[{"op":"add_node","id":"LOGIN","type":"process","label":"Giriş Yap"}]}',
    "",
    "CRITICAL: Return ONLY the JSON object. No text before or after.",
  ].join("\n");
}

export function buildUserPrompt(input: {
  base_version: string;
  lock_positions: boolean;
  node_limit: number;
  current_graph_json: string;
  instruction: string;
}): string {
  return [
    `base_version to use: "${input.base_version}"`,
    `Max nodes: ${input.node_limit}`,
    "",
    "Current graph:",
    input.current_graph_json,
    "",
    "User request (use Turkish labels in response):",
    input.instruction,
    "",
    "Return ONLY the JSON patch object now:",
  ].join("\n");
}

export function buildRepairSystemPrompt(): string {
  return [
    "Türkçe sorulara Türkçe cevap ver.",
    "SADECE JSON döndür. JSON dışında tek karakter yazma.",
    "",
    "GÖREV: HATALI PATCH'i düzelt ve VALID PATCH döndür.",
    "",
    "KURALLAR:",
    "- base_version aynen korunmalı.",
    "- Şemaya %100 uy.",
    "- Açıklama yazma, sadece JSON.",
  ].join("\n");
}

export function buildRepairUserPrompt(input: {
  base_version: string;
  current_graph_json: string;
  instruction: string;
  error_summary: string;
  raw_patch: string;
}): string {
  return [
    `BASE_VERSION: ${input.base_version}`,
    "",
    "MEVCUT_GRAPH(JSON):",
    input.current_graph_json,
    "",
    "YENİ_İSTEK:",
    input.instruction,
    "",
    "HATA ÖZETİ:",
    input.error_summary,
    "",
    "HATALI PATCH (DÜZELT):",
    input.raw_patch,
  ].join("\n");
}
