# Screen AI — Design (approved 2026-11-19)

## Intent
A website where the AI watches a shared screen, reads the question on it, and gives the answer. Built as a mini-hackathon submission judged on speed and attention to detail. Judges open a link; nothing to install.

## Goals
- Static website (HTML/CSS/JS), no backend, hostable free (e.g. GitHub Pages).
- Screen capture via browser `getDisplayMedia`.
- Two engines:
  - **Claude API**: user pastes key; stored only in `localStorage`; called directly from the browser (`anthropic-dangerous-direct-browser-access` header). Default fast model Haiku 5.5, optional Sonnet 5.5 for "detailed" mode.
  - **Free fallback**: open-source vision model in-browser via WebGPU (Transformers.js, small model such as SmolVLM). Cached after first download. Used when no key is set.
- Modes: **Ask** button (+ in-page shortcut, Space) and **Watch** toggle (capture every 1–2s, call AI only when frame-diff shows change).
- Floating answer overlay via Document Picture-in-Picture (fallback: in-page panel).
- Settings: API key, engine, fast/detailed.

## Non-goals / anti-goals
- No backend, no accounts, no global hotkeys, no mobile support.
- No features to hide use from proctoring or screen capture.

## Approaches considered
- A: hotkey/button only — simple but weak "watching" demo.
- B: always-watching only — best demo, riskier.
- **C (chosen):** Ask first, then Watch toggle, so a working submission exists early.

## Constraints / trade-offs
- Chrome/Edge desktop recommended (screen share, WebGPU, PiP).
- In-browser model is slower/less accurate than Claude; demo with a Claude key.
- Dev machine has an NVIDIA RTX 5050 Laptop GPU, so WebGPU fallback should run well for testing.

## Build order
1. Capture + Claude Ask. 2. Watch mode. 3. In-browser fallback. 4. Overlay + polish.

## Left to the builder
Exact UI layout, frame-diff threshold, prompt wording, small-model choice among Transformers.js-supported VLMs.
