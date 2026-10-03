#!/usr/bin/env python3
"""Build the Bedrock Whiteboard deck.

Reads slides.json + template.html, inlines each Excalidraw SVG as a data URI,
and writes:
  index.html        full HTML document (GitHub Pages)
  <out>             optional: page body only (for publishing as a claude.ai artifact)

Usage: python3 build.py [artifact-out.html]
"""
import base64, json, pathlib, sys

here = pathlib.Path(__file__).resolve().parent
root = here.parent
slides = json.loads((here / "slides.json").read_text())
for s in slides:
    svg = (root / s.pop("img")).read_bytes()
    s["src"] = "data:image/svg+xml;base64," + base64.b64encode(svg).decode()
body = (here / "template.html").read_text().replace("/*SLIDES*/", json.dumps(slides, ensure_ascii=False))

doc = ('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       '<style>body{margin:0}img{max-width:100%}</style>\n</head>\n<body>\n' + body + '\n</body>\n</html>\n')
(here / "index.html").write_text(doc)
if len(sys.argv) > 1:
    pathlib.Path(sys.argv[1]).write_text(body)
print(f"{len(slides)} slides, index.html {len(doc)//1024} KB")
