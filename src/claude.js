export const PROMPT =
  "You are a patient tutor. Look carefully at this screenshot and find the question on screen. " +
  "Read every detail (numbers, options, units). First explain the key idea needed, step by step. " +
  "Then explain why the correct answer is right and why each of the other options is wrong. " +
  "End with the answer on its own line. Keep it short and clear. " +
  "If no question is visible, say so plainly.";

export const QUICK_PROMPT =
  "Find the question on screen. Reply with ONLY the final answer on the first line, formatted as 'Answer: <answer>'. " +
  "Then give one short sentence of reason. No preamble. If no question is visible, say 'No question visible'.";

const MODELS = { instant: "claude-haiku-5-5", fast: "claude-haiku-5-5", detailed: "claude-sonnet-5-5" };

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
        max_tokens: mode === "instant" ? 200 : 4096,
        ...(mode === "instant" ? { stream: true } : {}),
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
            { type: "text", text: mode === "instant" ? QUICK_PROMPT : PROMPT },
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

// Streams the answer token by token so the first words show up in ~a second.
export async function askClaudeStream(apiKey, imageBase64, onText, fetchImpl = fetch) {
  if (!/^[!-~]+$/.test(apiKey)) {
    throw new Error("API key contains invalid characters. Re-paste it without spaces or quotes.");
  }
  const { url, init } = buildRequest(apiKey, "instant", imageBase64);
  let res;
  try {
    res = await fetchImpl(url, init);
  } catch {
    throw new Error("Network error: could not reach Anthropic. Check your connection.");
  }
  if (res.status === 401) throw new Error("Invalid API key");
  if (res.status === 429) throw new Error("Rate limited, try again");
  if (!res.ok) throw new Error(`Claude request failed (HTTP ${res.status})`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      try {
        const ev = JSON.parse(line.slice(5));
        if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
          text += ev.delta.text;
          onText(text);
        } else if (ev.type === "error") {
          throw new Error(ev.error?.message ?? "API error");
        }
      } catch (e) {
        if (e.message && !(e instanceof SyntaxError)) throw e;
      }
    }
  }
  if (!text.trim()) throw new Error("No answer returned. Try again.");
  return text;
}
