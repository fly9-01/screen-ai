export function chooseEngine(settings) {
  return String(settings.apiKey ?? "").trim() ? "claude" : "local";
}
