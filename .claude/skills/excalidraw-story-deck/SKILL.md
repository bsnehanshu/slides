---
name: excalidraw-story-deck
description: Turn a technical topic (an architecture, a request flow, a service's internals) into a click-through "whiteboard" reference deck of hand-drawn Excalidraw diagrams, one idea per slide, with notes and a one-line talk track hidden behind a toggle. Use when the user wants to understand something well enough to explain it, asks for Excalidraw / whiteboard / story-style slides, or wants a reference they can come back to for context. Produces one self-contained HTML file, published as a claude.ai artifact link (and optionally committed to a repo for GitHub Pages).
---

# Excalidraw story deck

The output is a deck for reference and explaining, not a pitch. The diagram does the explaining: it fills the screen, and the notes ("what's going on" plus a "say it like this" line) stay hidden until the user presses `N`.

Paths below are relative to this skill's folder (the folder holding this file).

| File | What it is |
|---|---|
| `assets/template.html` | Deck shell: diagram-first, slide list on `S`, notes on `N`, zoom on `Z` |
| `scripts/build.py` | `deck.json` + diagrams → one self-contained HTML file |
| `scripts/excalidraw/render.sh` | Renders Excalidraw scenes from a `diagrams.js` file to `.excalidraw`, `.excalidraw.svg` and `.png` |
| `references/diagrams.example.js` | 7 worked scenes (Claude on Amazon Bedrock) showing the scene API |
| `references/deck.example.json` | Example `deck.json` |

## 1. Shape the story

- Structure it as one story: open with a single **"whole story in one picture"** slide, then chapters in the order a listener needs them, then a **recap** slide that reuses the opening picture. Each chapter is a `stories` entry in `deck.json`.
- Split the topic into chapters (or 1–3 separate stories for unrelated topics). A story is either a flow someone can follow ("how a request gets from laptop to model") or a set of related questions ("how Bedrock serves Claude").
- Give each story 4–8 slides. Open a flow story with one **overview** slide, then one slide per numbered step.
- One idea per diagram. The diagram can be rich, but it should read top to bottom as one picture you can talk through.
- **Make it concrete.** Use one worked example with real values instead of placeholders: a real Region (`ap-southeast-2`), real hostnames, model IDs and API calls, real hardware (AWS Trainium, NVIDIA GPUs), real numbers ("1,000 output tokens = 5,000 TPM"). Fact-check every value against current docs. Keep a placeholder like `{region}` only where you can't confirm the real value, and tell the user which ones are left.

## 2. Draw the diagrams

The style: hand-drawn boxes in Excalifont, a soft fill per zone (customer account, laptop, AWS service and so on), numbered arrows for steps, white background.

Pick the first option that's available:

1. **Generated scenes** (best for a series, because the layout stays consistent). Write a `diagrams.js` modelled on `references/diagrams.example.js`. Each `D["name"] = () => { const s = new Scene(); ...; return s; }` builds one diagram with `s.header`, `s.box`, `s.card`, `s.zone`, `s.text` and `s.arrow`. Then run:
   ```sh
   bash scripts/excalidraw/render.sh my-diagrams.js out/diagrams
   ```
   It needs node/npm with registry access, python3 and a Chromium binary (it looks under `/opt/pw-browsers`, or set `CHROME=`). The scratch work happens in `$TMPDIR`, so this folder stays read-only.
2. **Excalidraw MCP** (`read_me`, then `create_view`), if it's connected. Good for one-off drawings. Read `read_me` first for the element format.
3. Neither available: write the `.excalidraw` JSON by hand, and tell the user to open it at excalidraw.com and export an SVG.

Rules for the drawings:
- For step-by-step flows, draw the full diagram once. For step N, fade what isn't relevant yet (opacity ~25) and highlight step N. Keep the canvas the same size so slides don't jump.
- Leave room between stacked boxes for the arrows. If an arrow renders as a dot, push the boxes apart.
- Look at every PNG before using it.

## 3. Write `deck.json`

Copy the shape of `references/deck.example.json`. `img` paths are relative to the folder `deck.json` sits in.

- `id`: short and unique, a story letter plus a number (`a0` for an overview). It's also the deep link, as in `#a1`.
- `story`: a key of `stories`. `eyebrow`: e.g. "Story A · Step 1 of 5".
- `title`: the claim the slide makes, in plain words ("Prompts go straight to Bedrock"), not a topic label.
- `what`: exactly 3 bullets of under ~25 words each, with real names (config keys, API names, limits). Inline HTML is allowed, so wrap identifiers in `<code>` and escape `<` as `&lt;`.
- `say`: one or two sentences the user could say to a customer.

## 4. Build

```sh
python3 scripts/build.py <deck-dir> <deck-dir>/artifact.html
```

This writes `<deck-dir>/index.html`, a full HTML document with every diagram inlined. The second argument writes the body-only version used for an artifact. Never hand-edit the output. Change `deck.json` or the template and rebuild.

## 5. Check and ship

1. If a browser is available, take one screenshot at 1440×900 and one at 400px wide. Check that the diagram fills the stage, then press `N` and check the notes. Hand-drawn web fonts may not load in a sandbox, so fallback fonts in the screenshot are expected.
2. Publish `artifact.html` as a claude.ai artifact with `icon: "slides"`. That link is the deliverable, and it works anywhere. To update the deck, republish the same file path, which keeps the URL.
3. If you're working in a git repo, also commit the deck folder (`deck.json`, `index.html`, the diagrams and `diagrams.js`) so it can be served from GitHub Pages. A Pages site needs Settings → Pages → Source = GitHub Actions, plus a standard `actions/deploy-pages` workflow.
