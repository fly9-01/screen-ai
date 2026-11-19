const KEY = "screenai.settings";
export const DEFAULT_SETTINGS = { apiKey: "", mode: "fast", watch: false };

export function loadSettings(storage) {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(storage, settings) {
  try {
    storage.setItem(KEY, JSON.stringify({ ...settings, apiKey: String(settings.apiKey ?? "").trim() }));
  } catch {
    /* storage unavailable: run with in-memory settings */
  }
}
