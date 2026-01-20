export function buildSystemPrompt(): string {
  return [
    "You MUST return ONLY valid JSON. No explanations, no markdown, no code blocks.",
    "",
    "TASK: Generate a PATCH to create professional, well-organized architecture diagrams.",
    "",
    "EXACT JSON SCHEMA (copy this structure):",
    "{",
    '  "base_version": "copy from input exactly",',
    '  "ops": [',
    '    {"op": "add_node", "id": "SHORTID", "type": "api_server", "label": "Turkish text", "color": "#10b981", "icon": "🖥️"},',
    '    {"op": "add_node", "id": "GRP1", "type": "group", "label": "BACKEND SERVICES", "width": 500, "height": 400},',
    '    {"op": "add_node", "id": "CHILD", "type": "microservice", "label": "User Service", "parent": "GRP1"},',
    '    {"op": "add_edge", "id": "E1", "from": "ID1", "to": "ID2", "label": "HTTPS"}',
    '  ]',
    "}",
    "",
    "AVAILABLE NODE TYPES:",
    "Web/Frontend: web_client, mobile_app, cdn, load_balancer, api_gateway",
    "Backend: api_server, microservice, background_job, queue, message_broker, cron_job",
    "Database: sql_database, nosql_database, cache, object_storage, file_storage, data_warehouse",
    "Infrastructure: server, container, kubernetes, cloud_service, vm",
    "Communication: email_service, sms_service, notification, webhook, websocket",
    "Security: auth_service, firewall, vpn",
    "Monitoring: monitoring, logging, analytics",
    "Integration: third_party_api, payment_gateway",
    "Basic: process, decision, start, end, datastore, actor, note, group",
    "",
    "ARCHITECTURE PATTERNS - Use groups to organize:",
    "1. FRONTEND TIER: Group web_client, mobile_app, cdn together",
    "2. API LAYER: Group api_gateway, load_balancer",
    "3. APPLICATION TIER: Group microservices, api_servers",
    "4. DATA TIER: Group databases, cache, storage",
    "5. INFRASTRUCTURE: Group servers, containers, kubernetes",
    "6. EXTERNAL SERVICES: Group third_party_api, payment services",
    "",
    "GROUPING RULES:",
    "- Use 'group' type for containers with meaningful names (e.g., 'BACKEND SERVICES', 'DATABASE CLUSTER')",
    "- Groups should have width: 400-600, height: 300-500 depending on child count",
    "- Position children relative to group top-left with 60px padding",
    "- Distribute children vertically inside groups (y: 80, 180, 280, etc.)",
    "- Group labels should be UPPERCASE and descriptive",
    "",
    "LAYOUT STRATEGY for 20+ nodes:",
    "- Left to right flow: Frontend -> API -> Backend -> Database",
    "- Use x coordinates: Frontend(100), API(400), Backend(700), Database(1000)",
    "- Vertical spacing: 150px between nodes in same tier",
    "- Group similar components together",
    "- Add load balancers before server groups",
    "- Add caching layer between API and database",
    "",
    "EDGE LABELS - Be specific:",
    "- Use protocol names: HTTPS, REST, GraphQL, WebSocket, TCP, gRPC",
    "- Use action verbs: 'Stores', 'Fetches', 'Publishes', 'Subscribes'",
    "- Use data flow: 'User Data', 'Logs', 'Metrics', 'Events'",
    "",
    "COLOR CODING (optional but recommended):",
    "- Frontend: blues (#3b82f6, #06b6d4)",
    "- Backend: greens (#10b981, #14b8a6)",
    "- Database: teals (#0891b2, #06b6d4)",
    "- Cache: orange (#f97316)",
    "- Security: reds (#dc2626)",
    "- Monitoring: purples (#7c3aed)",
    "",
    "EXAMPLE COMPLEX ARCHITECTURE:",
    '{"base_version":"init0001","ops":[',
    '{"op":"add_node","id":"GRP_FE","type":"group","label":"FRONTEND","width":500,"height":300},',
    '{"op":"add_node","id":"WEB","type":"web_client","label":"Web Client","parent":"GRP_FE"},',
    '{"op":"add_node","id":"MOB","type":"mobile_app","label":"Mobile App","parent":"GRP_FE"},',
    '{"op":"add_node","id":"CDN","type":"cdn","label":"CDN","parent":"GRP_FE"},',
    '{"op":"add_node","id":"LB","type":"load_balancer","label":"Load Balancer"},',
    '{"op":"add_node","id":"GRP_API","type":"group","label":"API SERVERS","width":500,"height":400},',
    '{"op":"add_node","id":"API1","type":"api_server","label":"API Server 1","parent":"GRP_API"},',
    '{"op":"add_node","id":"API2","type":"api_server","label":"API Server 2","parent":"GRP_API"},',
    '{"op":"add_node","id":"CACHE","type":"cache","label":"Redis Cache"},',
    '{"op":"add_node","id":"DB","type":"sql_database","label":"PostgreSQL"},',
    '{"op":"add_edge","id":"E1","from":"WEB","to":"LB","label":"HTTPS"},',
    '{"op":"add_edge","id":"E2","from":"LB","to":"API1","label":"REST"},',
    '{"op":"add_edge","id":"E3","from":"API1","to":"CACHE","label":"Fetch"},',
    '{"op":"add_edge","id":"E4","from":"API1","to":"DB","label":"Query"}',
    ']}',
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
    "IMPORTANT INSTRUCTIONS:",
    "- Create a WELL-ORGANIZED architecture with GROUPS",
    "- Use appropriate node types (not just 'process')",
    "- Add meaningful edge labels (protocols, actions)",
    "- Group related components together",
    "- Follow left-to-right flow pattern",
    "- Use colors to differentiate tiers",
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
