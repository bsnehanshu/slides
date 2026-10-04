# slides

Excalidraw reference decks and architecture diagrams for Claude on Amazon Bedrock.

Each folder is a self-contained deck, served via GitHub Pages at:

```
https://bsnehanshu.github.io/slides/<deck-name>/
```

## Decks
- [bedrock-whiteboard](https://bsnehanshu.github.io/slides/bedrock-whiteboard/) — **start here.** Claude on Bedrock as one Excalidraw story: the whole picture first, then six chapters (hardware, building the model, serving a request, calling Claude on Bedrock, where the data goes, a Claude Desktop example) and a recap. Updated for Opus 5.5 and Sonnet 5.5. Deep-link a slide with `#lineup`, `#c4`, etc.

## Architecture diagrams
Standalone diagrams live in [`architecture-diagrams/`](architecture-diagrams/), one folder each (SVG source + PNG export + README).
- [claude-desktop-bedrock](architecture-diagrams/claude-desktop-bedrock/) — Claude Desktop on Amazon Bedrock (3P) reference architecture, fact-checked Oct 2026
- [claude-on-bedrock](architecture-diagrams/claude-on-bedrock/) — Claude on Amazon Bedrock: runtime vs. mantle endpoints, cross-Region inference, quotas and residency, fact-checked Oct 2026
- [claude-anz-infra-excalidraw](architecture-diagrams/claude-anz-infra-excalidraw/) — Claude in Australia and New Zealand, L300–400: training vs serving silicon, how weights reach a Region, prefill/decode and HBM, prompt caching, sizing, APIs, AU/NZ data residency, tokens to dollars
- [claude-on-bedrock-excalidraw](architecture-diagrams/claude-on-bedrock-excalidraw/) — the same topic as 7 hand-drawn Excalidraw diagrams with the full write-up (compute stack, distribution, endpoints, endpoint picker, CRIS path, quota burndown, decode)

## Presenting
Open the deck URL in a browser. `←`/`→` to move, `S` for the slide list, `N` for notes, `Z` to zoom.

`bedrock-whiteboard/index.html` is generated from `bedrock-whiteboard/deck.json` by the `excalidraw-story-deck` skill (`.claude/skills/excalidraw-story-deck/`). Edit the JSON, then run `python3 .claude/skills/excalidraw-story-deck/scripts/build.py bedrock-whiteboard`.

GitHub Pages deploys from `.github/workflows/pages.yml` on every push to `main` (Settings → Pages → Source must be **GitHub Actions**).
