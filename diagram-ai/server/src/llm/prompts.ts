export function buildSystemPrompt(): string {
  return [
    "Türkçe sorulara Türkçe cevap ver.",
    "SADECE JSON döndür. JSON dışında tek karakter yazma.",
    "",
    "GÖREV: Mevcut diyagram grafiğini güncellemek için PATCH üret.",
    "",
    "PATCH ŞEMASI:",
    "{\"base_version\":\"string\",\"ops\":[{\"op\":\"add_node\"|\"update_node\"|\"delete_node\"|\"add_edge\"|\"update_edge\"|\"delete_edge\"|\"layout_hint\", ...}]}",
    "",
    "KURALLAR:",
    "- base_version input ile birebir aynı olmalı.",
    "- Minimal değişiklik yap. Gereksiz silme/yeniden yazma yok.",
    "- Yeni id'ler anlamlı kısaltma olsun: USR, CHK, ODME, AUTH, ERR, DB gibi.",
    "- Node type yalnızca: process, decision, start, end, datastore, actor, note.",
    "- lock_positions=true ise layout_hint: preserve_positions; değilse auto.",
    "- Asla açıklama yazma, sadece JSON.",
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
    `BASE_VERSION: ${input.base_version}`,
    `LOCK_POSITIONS: ${input.lock_positions}`,
    `NODE_LIMIT: ${input.node_limit}`,
    "",
    "MEVCUT_GRAPH(JSON):",
    input.current_graph_json,
    "",
    "YENİ_İSTEK:",
    input.instruction,
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
