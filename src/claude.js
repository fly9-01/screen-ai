export const PROMPT =
  "Look carefully at this screenshot, find the question on screen, and answer it directly and accurately. " +
  "Read every detail (numbers, options, units) before answering. Be concise. " +
  "If no question is visible, say so plainly.";

const MODELS = { fast: "claude-haiku-5-5", detailed: "claude-sonnet-5-5" };

export function buildRequest(apiKey, mode, imageBase64) {
  return {
    url: "https://api.anthropic.com/v1/messages",
    init: {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODELS[mode] ?? MODELS.fast,
        max_tokens: 4096,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
            { type: "text", text: PROMPT },
          ],
        }],
      }),
    },
  };
}

export function parseAnswer(json) {
  if (json?.error) throw new Error(json.error.message ?? "API error");
  const text = (json?.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  if (!text.trim()) {
    throw new Error(`No answer returned (stop reason: ${json?.stop_reason ?? "unknown"}). Try again.`);
  }
  return text;
}

export async function askClaude(apiKey, mode, imageBase64, fetchImpl = fetch) {
  if (!/^[!-~]+$/.test(apiKey)) {
    throw new Error("API key contains invalid characters. Re-paste it without spaces or quotes.");
  }
  const { url, init } = buildRequest(apiKey, mode, imageBase64);
  let res;
  try {
    res = await fetchImpl(url, init);
  } catch {
    throw new Error("Network error: could not reach Anthropic. Check your connection.");
  }
  if (res.status === 401) throw new Error("Invalid API key");
  if (res.status === 429) throw new Error("Rate limited, try again");
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json())?.error?.message ?? "";
    } catch {
      /* body not JSON */
    }
    throw new Error(detail ? `Claude error: ${detail}` : `Claude request failed (HTTP ${res.status})`);
  }
  return parseAnswer(await res.json());
}
