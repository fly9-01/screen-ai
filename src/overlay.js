export async function openOverlay() {
  if (!("documentPictureInPicture" in window)) return null;
  try {
    const win = await window.documentPictureInPicture.requestWindow({ width: 360, height: 220 });
    win.document.body.style.cssText = "margin:0;padding:12px;background:#181b24;color:#e8eaf0;font:15px/1.4 system-ui,sans-serif;white-space:pre-wrap";
    const box = win.document.createElement("div");
    box.textContent = "Waiting for an answer...";
    win.document.body.append(box);
    return {
      setText(text) { box.textContent = text; },
      close() { win.close(); },
    };
  } catch {
    return null;
  }
}
