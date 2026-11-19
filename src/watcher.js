import { frameChanged } from "./framediff.js";

export function createWatcher({ intervalMs, grabSmallRgba, onChange, setTimer = setInterval, clearTimer = clearInterval }) {
  let prev = null;
  let busy = false;
  let timer = null;

  function tick() {
    if (busy) return;
    const next = Uint8ClampedArray.from(grabSmallRgba());
    if (frameChanged(prev, next)) {
      prev = next;
      onChange();
    }
  }

  return {
    start() {
      prev = null;
      timer = setTimer(tick, intervalMs);
    },
    stop() {
      if (timer !== null) clearTimer(timer);
      timer = null;
    },
    setBusy(b) {
      busy = b;
    },
  };
}
