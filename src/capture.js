const MAX_EDGE = 1568;

export async function startCapture() {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("Screen sharing isn't supported in this browser. Use Chrome or Edge on desktop.");
  }
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false, selfBrowserSurface: "exclude" });
  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  await video.play();
  const canvas = document.createElement("canvas");
  const small = document.createElement("canvas");
  small.width = 64;
  small.height = 36;
  const endedCbs = [];
  stream.getVideoTracks()[0].addEventListener("ended", () => endedCbs.forEach((cb) => cb()));

  return {
    async grabJpegBase64(maxEdge = MAX_EDGE, quality = 0.85) {
      const w = video.videoWidth;
      const h = video.videoHeight;
      const scale = Math.min(1, maxEdge / Math.max(w, h));
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", quality).split(",")[1];
    },
    grabSmallRgba() {
      const ctx = small.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, 64, 36);
      return ctx.getImageData(0, 0, 64, 36).data;
    },
    stop() {
      stream.getTracks().forEach((t) => t.stop());
    },
    onEnded(cb) {
      endedCbs.push(cb);
    },
  };
}
