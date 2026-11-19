# Screen AI

A website that watches a shared screen, reads the question on it, and answers it.
No install needed: it is a static site.

## Run locally
    python -m http.server 8000
Then open http://localhost:8000 in Chrome or Edge (ES modules do not load from file://).

## Host free
Push this folder to GitHub and enable GitHub Pages. Submit the page link.

## Engines
- **Claude:** paste an Anthropic API key in Settings. Fast = Haiku 5.5, Detailed = Sonnet 5.5.
- **Free local model:** leave the key empty. SmolVLM runs in your browser via WebGPU (first use downloads a few hundred MB, then it is cached). Slower and less accurate than Claude.

## Privacy
The key is stored only in your browser (localStorage) and sent directly to Anthropic. Do not use it on shared computers.

## Tests
    npm test
