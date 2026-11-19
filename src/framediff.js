export function frameChanged(prev, next, threshold = 0.02) {
  if (!prev || prev.length !== next.length) return true;
  const pixels = next.length / 4;
  let diff = 0;
  for (let i = 0; i < next.length; i += 4) {
    const d = Math.abs(prev[i] - next[i]) + Math.abs(prev[i + 1] - next[i + 1]) + Math.abs(prev[i + 2] - next[i + 2]);
    if (d > 30) diff++;
  }
  return diff / pixels > threshold;
}
