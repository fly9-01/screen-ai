import { loadSettings, saveSettings } from "./settings.js";
import { askClaude } from "./claude.js";
import { startCapture } from "./capture.js";
import { createWatcher } from "./watcher.js";
import { chooseEngine } from "./engine.js";
import { askLocal } from "./local.js";
import { openOverlay } from "./overlay.js";

const $ = (id) => document.getElementById(id);
const el = {
  share: $("share"), ask: $("ask"), watch: $("watch"), popout: $("popout"), copy: $("copy"),
  answer: $("answer"), spinner: $("spinner"), apikey: $("apikey"), mode: $("mode"),
  status: $("status"), banner: $("banner"), progress: $("progress"), bar: $("bar"),
};

let storage = null;
try { storage = window.localStorage; } catch { /* blocked */ }
const settings = loadSettings(storage ?? { getItem() { throw new Error("none"); }, setItem() { throw new Error("none"); } });
el.apikey.value = settings.apiKey;
el.mode.value = settings.mode;
let capture = null;
let busy = false;
let watcher = null;
let overlay = null;

function persist() {
  settings.apiKey = el.apikey.value.trim();
  settings.mode = el.mode.value;
  if (storage) saveSettings(storage, settings);
}
el.apikey.addEventListener("change", persist);
el.mode.addEventListener("change", persist);

function show(text, isError = false) {
  el.answer.textContent = text;
  el.answer.classList.toggle("error", isError);
  overlay?.setText(text);
  el.copy.disabled = isError || !text;
}

function setSharing(on) {
  el.ask.disabled = !on;
  el.watch.disabled = !on;
  el.share.textContent = on ? "Stop sharing" : "Share screen";
  if (!on) {
    el.watch.checked = false;
    stopWatching();
  }
}

function stopWatching() {
  watcher?.stop();
  watcher = null;
}

async function ask() {
  if (!capture || busy) return;
  persist();
  busy = true;
  watcher?.setBusy(true);
  el.spinner.hidden = false;
  el.ask.disabled = true;
  try {
    const img = await capture.grabJpegBase64();
    const engine = chooseEngine(settings);
    el.status.textContent = engine === "claude" ? "Engine: Claude" : "Engine: free local model (first run downloads it)";
    const text = engine === "claude"
      ? await askClaude(settings.apiKey, settings.mode, img)
      : await askLocal(img, (pct) => {
          el.progress.hidden = pct >= 100;
          el.bar.style.width = pct + "%";
        });
    show(text);
  } catch (e) {
    show(e.message, true);
  } finally {
    busy = false;
    watcher?.setBusy(false);
    el.spinner.hidden = true;
    el.ask.disabled = !capture;
  }
}

el.share.addEventListener("click", async () => {
  if (capture) {
    capture.stop();
    capture = null;
    setSharing(false);
    return;
  }
  try {
    capture = await startCapture();
    capture.onEnded(() => {
      capture = null;
      setSharing(false);
    });
    setSharing(true);
  } catch (e) {
    show(e.message, true);
  }
});
el.ask.addEventListener("click", ask);
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(e.target.tagName)) {
    e.preventDefault();
    ask();
  }
});
el.copy.addEventListener("click", () => navigator.clipboard?.writeText(el.answer.textContent));
el.watch.addEventListener("change", () => {
  if (el.watch.checked && capture) {
    watcher = createWatcher({ intervalMs: 1500, grabSmallRgba: () => capture.grabSmallRgba(), onChange: ask });
    watcher.start();
  } else {
    stopWatching();
  }
});

if (!navigator.mediaDevices?.getDisplayMedia) {
  el.banner.hidden = false;
  el.banner.textContent = "Screen sharing is not supported here. Use Chrome or Edge on a desktop.";
}
el.popout.disabled = false;
el.popout.addEventListener("click", async () => {
  overlay = await openOverlay();
  if (!overlay) show("Pop-out is not supported in this browser. The answer stays on this page.", true);
  else overlay.setText(el.answer.textContent);
});
