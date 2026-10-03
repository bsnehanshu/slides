#!/usr/bin/env python3
"""Build an Excalidraw story deck.

Usage: python3 build.py <deck-dir> [artifact-out.html]

Reads <deck-dir>/deck.json, inlines each slide's diagram (SVG/PNG, path relative
to <deck-dir>) as a data URI into assets/template.html, and writes:
  <deck-dir>/index.html   full HTML document (GitHub Pages / open locally)
  artifact-out.html       optional: page body only, for publishing as a claude.ai artifact
"""
import base64, html, json, pathlib, sys

MIME = {".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}

def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    deck_dir = pathlib.Path(sys.argv[1]).resolve()
    template = (pathlib.Path(__file__).resolve().parent.parent / "assets" / "template.html").read_text()
    deck = json.loads((deck_dir / "deck.json").read_text())
    slides = deck["slides"]
    ids = [s["id"] for s in slides]
    if len(set(ids)) != len(ids):
        sys.exit("duplicate slide ids")
    for s in slides:
        if s["story"] not in deck["stories"]:
            sys.exit(f"slide {s['id']}: unknown story {s['story']!r}")
        img = (deck_dir / s.pop("img")).resolve()
        s["src"] = f"data:{MIME[img.suffix.lower()]};base64," + base64.b64encode(img.read_bytes()).decode()
    body = (template
            .replace("/*TITLE*/", html.escape(deck["title"]))
            .replace("/*SUBTITLE*/", html.escape(deck.get("subtitle", "")))
            .replace("/*FIRSTID*/", html.escape(ids[min(1, len(ids) - 1)]))
            .replace("/*STORIES*/", json.dumps(deck["stories"], ensure_ascii=False))
            .replace("/*SLIDES*/", json.dumps(slides, ensure_ascii=False)))
    doc = ('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
           '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
           '<style>body{margin:0}img{max-width:100%}</style>\n</head>\n<body>\n' + body + '\n</body>\n</html>\n')
    (deck_dir / "index.html").write_text(doc)
    if len(sys.argv) > 2:
        pathlib.Path(sys.argv[2]).write_text(body)
    print(f"{len(slides)} slides -> {deck_dir / 'index.html'} ({len(doc) // 1024} KB)")

if __name__ == "__main__":
    main()
