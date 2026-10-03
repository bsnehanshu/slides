# slides

Presentation decks built with the AWS Slides skill (`deck-stage.js` + `colors_and_type.css`).

Each folder is a self-contained deck, served via GitHub Pages at:

```
https://bsnehanshu.github.io/slides/<deck-name>/
```

## Decks
- [bedrock-whiteboard](https://bsnehanshu.github.io/slides/bedrock-whiteboard/) — **start here.** Both Excalidraw stories in one click-through reference deck: Claude Desktop on Bedrock (5 steps) and Claude on Bedrock under the hood (7 diagrams), each with notes and a "say it like this" line. Deep-link a slide with `#a3`, `#b5`, etc.
- [aws-datadog-gameday-intro](https://bsnehanshu.github.io/slides/aws-datadog-gameday-intro/) — AWS × Datadog Game Day, intro and mechanics (template — names/venue redacted)
- [claude-desktop-bedrock-story](https://bsnehanshu.github.io/slides/claude-desktop-bedrock-story/) — Claude Desktop on Amazon Bedrock, 5-slide step-by-step build of the story view

## Architecture diagrams
Standalone diagrams live in [`architecture-diagrams/`](architecture-diagrams/), one folder each (SVG source + PNG export + README).
- [claude-desktop-bedrock](architecture-diagrams/claude-desktop-bedrock/) — Claude Desktop on Amazon Bedrock (3P) reference architecture, fact-checked Oct 2026
- [claude-on-bedrock](architecture-diagrams/claude-on-bedrock/) — Claude on Amazon Bedrock: runtime vs. mantle endpoints, cross-Region inference, quotas and residency, fact-checked Oct 2026
- [claude-on-bedrock-excalidraw](architecture-diagrams/claude-on-bedrock-excalidraw/) — the same topic as 7 hand-drawn Excalidraw diagrams with the full write-up (compute stack, distribution, endpoints, endpoint picker, CRIS path, quota burndown, decode)

## Presenting
Open the deck URL in a browser. `←`/`→` to navigate, `N` for speaker notes, `Cmd/Ctrl+P` to export to PDF.

`bedrock-whiteboard/index.html` is generated: edit `slides.json` or `template.html`, then run `python3 bedrock-whiteboard/build.py`. It inlines the Excalidraw SVGs from `architecture-diagrams/` and `claude-desktop-bedrock-story/diagrams/`.
