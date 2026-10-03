---
name: excalidraw-story-deck
description: Turn a technical topic (an architecture, a request flow, a service's internals) into a click-through "whiteboard" reference deck of hand-drawn Excalidraw diagrams, one idea per slide, each with short notes and a one-line talk track. Use when the user wants to understand something well enough to explain it, asks for Excalidraw / whiteboard / story-style slides, or wants a reference they can come back to for context. Builds one self-contained HTML file for GitHub Pages and a claude.ai artifact link.
---

# Excalidraw story deck

The output is a deck for reference and explaining, not a pitch. Every slide answers "what's going on here" in a hand-drawn diagram, three bullets and one sentence the user can say out loud. Live example: `bedrock-whiteboard/` in this repo.

## 1. Shape the story first

- Split the topic into 1–3 **stories**. A story is a flow someone can follow ("how a request gets from laptop to model") or a set of related questions ("how Bedrock serves Claude").
- Give each story 4–8 slides. Open a flow story with one **overview** slide that shows the whole picture, then one slide per numbered step.
- One idea per diagram, at most ~6 boxes and ~4 short lines per box. If a diagram turns into a feature table (like a full endpoint comparison), draw a short version for the deck and keep the detailed one in the README as the reference. Details such as config keys, edge cases and gotchas go in the bullets, not on the drawing.
- Fact-check claims against current docs before drawing. Put sources in a README next to the diagrams.

## 2. Draw the diagrams

Excalidraw style: hand-drawn boxes, Excalifont, a soft fill per zone (customer account, laptop, AWS service and so on), numbered arrows for steps.

- **Excalidraw MCP** (`mcp__Excalidraw__read_me`, then `create_view`): best for one-off drawings. Read `read_me` first for the element format.
- **Generated scenes**: for a series, generate the scenes from code so the layout stays consistent. See `architecture-diagrams/claude-on-bedrock-excalidraw/tools/` (`diagrams.js` defines the scenes, `export.mjs` renders `.excalidraw.svg` + PNG in headless Chromium).
- **Step builds**: for a flow, draw the full diagram once. For step N, keep everything but fade what isn't relevant yet (opacity ~25) and highlight step N's arrow and boxes. Same canvas size for every step so the slides don't jump.
- Export as `.excalidraw.svg`. It renders on GitHub and reopens for editing at excalidraw.com, because the scene is embedded in the file. Use a white background: the deck shows diagrams on a white "board" in both light and dark mode.

## 3. Write `deck.json`

Put it in a new top-level deck folder (e.g. `my-topic-whiteboard/deck.json`). `img` paths are relative to that folder.

```json
{
  "title": "Bedrock Whiteboard",
  "subtitle": "Two stories, drawn in Excalidraw. Come back here when you need the context.",
  "stories": { "A": "Story A · Claude Desktop on Bedrock", "B": "Story B · Claude on Bedrock, under the hood" },
  "slides": [
    {
      "id": "a1",
      "story": "A",
      "eyebrow": "Story A · Step 1 of 5",
      "title": "IT pushes the config",
      "img": "../claude-desktop-bedrock-story/diagrams/step1.svg",
      "what": ["Jamf or Intune pushes managed settings ...", "...", "..."],
      "say": "IT owns the setup. The user can't point the app at another provider."
    }
  ]
}
```

- `id`: short and unique, story letter + number (`a0` for an overview). It's the deep link: `index.html#a1`.
- `title`: the claim the slide makes, in plain words ("Prompts go straight to Bedrock"), not a topic label.
- `what`: exactly 3 bullets under ~25 words each. Use real names: config keys, API names, IAM fields, limits. Inline HTML is allowed, so use `<code>` for identifiers and escape `<`/`>` as `&lt;`/`&gt;`.
- `say`: one or two sentences the user would say to a customer, with no jargon the diagram doesn't show.

## 4. Build

```sh
python3 .claude/skills/excalidraw-story-deck/scripts/build.py <deck-dir> [<scratchpad>/<deck>.html]
```

This writes `<deck-dir>/index.html`, a single file with every diagram inlined. The optional second argument writes the body-only version used for the artifact. Don't hand-edit `index.html`. Change `deck.json` or `assets/template.html` and rebuild.

The template gives you: a left rail listing every slide grouped by story, ←/→, 1–9 and swipe navigation, `#id` deep links, light/dark mode, and a stacked layout on phones.

## 5. Check and ship

1. Take one screenshot at desktop width (1440×900) and one at phone width (400px) with Playwright. Use `executablePath` from `/opt/pw-browsers/chromium-*/chrome-linux/chrome`. Look for clipped notes or unreadable diagrams. Hand-drawn web fonts won't load in the container, so fallback fonts in the screenshot are expected.
2. Publish the body-only file as a claude.ai artifact (`icon: "slides"`). That gives the user a private link that works without GitHub Pages. Republish the same path to update it.
3. Add the deck to the root `README.md` under **Decks**, commit and push. `.github/workflows/pages.yml` deploys it to `https://bsnehanshu.github.io/slides/<deck-dir>/` when it lands on `main`.
