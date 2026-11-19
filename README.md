# Screen AI

A study helper website: it reads a question on your shared screen and explains why the answer is right and why the other options are wrong.
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

## Pitch

**Screen AI: a tutor that learns from whatever is on your screen.**

**Problem:** When you are stuck on a question, getting the answer does not help you learn it. Most AI tools also make you copy, paste and retype the question.

**Idea:** Share your screen and Screen AI reads the question on it. It explains the key idea step by step, says why the right answer is right, and why each wrong option is wrong. Watch mode re-explains automatically when the screen changes, and a floating window keeps the explanation next to your work.

**Why it is different:**
- Nothing to install: it is a website.
- No backend or accounts: your API key stays in your own browser and goes straight to Anthropic.
- A free option: with no key, an open-source vision model runs in your browser using WebGPU.
- It teaches: explaining why each wrong option is wrong makes it a study tool, not an answer machine.

**How it is built:** plain JavaScript and the browser screen-capture API. A downscaled screenshot goes to Claude (Haiku for speed, Sonnet for detail). Watch mode uses a cheap frame-difference check so it only calls the AI when something changes. The core logic has automated tests.

**Next:** a quiz mode that turns what is on screen into practice questions, and saved review sets for questions you got wrong.

**30-second version:** "Studying means staring at questions you do not understand. Screen AI is a website that looks at your screen, reads the question, and explains why the answer is right and why the other choices are wrong. No install, no account, and it runs free in your browser, or faster with your own Claude key."
