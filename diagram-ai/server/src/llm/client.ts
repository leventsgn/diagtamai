export type LlmConfig = {
  url: string; // full URL incl. /v1/chat/completions
  token: string; // bearer token
  model: string;
};

export async function callLlm(args: {
  llm: LlmConfig;
  system: string;
  user: string;
  temperature: number;
  max_tokens: number;
}): Promise<string> {
  const { llm, system, user, temperature, max_tokens } = args;

  const res = await fetch(llm.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${llm.token}`,
    },
    body: JSON.stringify({
      model: llm.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature,
      max_tokens,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`LLM HTTP ${res.status}: ${t}`);
  }

  const json: any = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("LLM response content missing (expected choices[0].message.content)");
  }

  return content;
}
