// Tiny Excalidraw scene builder. Runs in the browser so text is measured with the real Excalifont.
window.loadFonts = async () => {
  const base = window.EXCALIDRAW_ASSET_PATH + "fonts/Excalifont/";
  await Promise.all(window.EXC_FONTS.map(async (f) => {
    const ff = new FontFace("ExcalifontM", `url(${base}${f})`);
    await ff.load(); document.fonts.add(ff);
  }));
};
const _ctx = document.createElement("canvas").getContext("2d");
const LH = 1.25;
function measure(text, fs) {
  _ctx.font = `${fs}px ExcalifontM`;
  const lines = text.split("\n");
  return { w: Math.ceil(Math.max(...lines.map((l) => _ctx.measureText(l).width))) + 2, h: lines.length * fs * LH };
}

const C = {
  ink: "#1e1e1e", muted: "#757575",
  blue: ["#1971c2", "#a5d8ff"], green: ["#2f9e44", "#b2f2bb"], orange: ["#e8590c", "#ffd8a8"],
  purple: ["#6741d9", "#d0bfff"], red: ["#e03131", "#ffc9c9"], yellow: ["#f08c00", "#fff3bf"],
  gray: ["#868e96", "#e9ecef"], teal: ["#0c8599", "#99e9f2"],
};

class Scene {
  constructor() { this.els = []; this.byId = {}; this.seed = 1000; this.n = 0; }
  _id(p) { return `${p}${++this.n}`; }
  _base(type, id, x, y, w, h, o = {}) {
    const e = {
      id, type, x, y, width: w, height: h, angle: 0,
      strokeColor: o.stroke || C.ink, backgroundColor: o.fill || "transparent",
      fillStyle: "solid", strokeWidth: o.sw || 2, strokeStyle: o.dashed ? "dashed" : "solid",
      roughness: 1, opacity: 100, groupIds: o.groupIds || [], frameId: null,
      roundness: o.roundness === undefined ? { type: 3 } : o.roundness,
      seed: ++this.seed * 7919 % 2147483647, version: 1, versionNonce: this.seed * 104729 % 2147483647,
      isDeleted: false, boundElements: [], updated: 1, link: null, locked: false,
    };
    this.els.push(e); this.byId[id] = e; return e;
  }
  text(x, y, str, o = {}) {
    const fs = o.fs || 18; const m = measure(str, fs); const align = o.align || "left";
    const tx = align === "center" ? x - m.w / 2 : align === "right" ? x - m.w : x;
    const e = this._base("text", o.id || this._id("t"), tx, y, m.w, m.h, { stroke: o.color || C.ink, roundness: null, groupIds: o.groupIds });
    Object.assign(e, { text: str, originalText: str, fontSize: fs, fontFamily: 5, textAlign: align,
      verticalAlign: "top", containerId: null, autoResize: true, lineHeight: LH });
    return e;
  }
  _bound(container, str, fs, color, align = "center") {
    const m = measure(str, fs);
    const t = this._base("text", container.id + "-label", 0, 0, m.w, m.h, { stroke: color || C.ink, roundness: null });
    Object.assign(t, { text: str, originalText: str, fontSize: fs, fontFamily: 5, textAlign: align,
      verticalAlign: "middle", containerId: container.id, autoResize: true, lineHeight: LH });
    container.boundElements.push({ type: "text", id: t.id });
    return t;
  }
  // Shape with one centred bound label; auto-sizes unless w/h given.
  box(id, x, y, str, o = {}) {
    const fs = o.fs || 18, pad = o.pad || 18; const m = measure(str, fs);
    const shape = o.shape || "rectangle";
    const k = shape === "diamond" ? 2 : shape === "ellipse" ? 1.45 : 1;
    const w = o.w || Math.max(o.minW || 0, m.w * k + pad * 2), h = o.h || Math.max(o.minH || 0, m.h * k + pad * 2);
    const [stroke, fill] = o.color || [C.ink, "transparent"];
    const e = this._base(shape, id, x, y, w, h, { stroke, fill, dashed: o.dashed, roundness: shape === "rectangle" ? { type: 3 } : { type: 2 } });
    const t = this._bound(e, str, fs, o.textColor);
    t.x = x + (w - m.w) / 2; t.y = y + (h - m.h) / 2;
    return e;
  }
  // Rectangle with a bold-ish title and smaller muted body, both free text grouped with the rect.
  card(id, x, y, title, body, o = {}) {
    const tfs = o.tfs || 21, bfs = o.bfs || 16, pad = o.pad || 18, gap = 8;
    const align = o.align || "center";
    const tm = measure(title, tfs), bm = body ? measure(body, bfs) : { w: 0, h: 0 };
    const w = o.w || Math.max(tm.w, bm.w) + pad * 2;
    const h = o.h || tm.h + (body ? gap + bm.h : 0) + pad * 2;
    const [stroke, fill] = o.color || [C.ink, "transparent"];
    const g = `g-${id}`;
    const e = this._base("rectangle", id, x, y, w, h, { stroke, fill, dashed: o.dashed, groupIds: [g] });
    const top = y + (h - (tm.h + (body ? gap + bm.h : 0))) / 2;
    const ax = align === "center" ? x + w / 2 : x + pad;
    this.text(ax, top, title, { fs: tfs, align, groupIds: [g], color: o.titleColor || C.ink });
    if (body) this.text(ax, top + tm.h + gap, body, { fs: bfs, align, groupIds: [g], color: o.bodyColor || "#495057" });
    return e;
  }
  zone(id, x, y, w, h, label, o = {}) {
    const [stroke, fill] = o.color || [C.gray[0], "transparent"];
    const e = this._base("rectangle", id, x, y, w, h, { stroke, fill: o.fill || "transparent", dashed: true, sw: 2 });
    e.opacity = 100;
    if (label) this.text(x + 16, y + 10, label, { fs: o.fs || 20, color: stroke });
    return e;
  }
  _port(e, side, t = 0.5, gap = 6) {
    const { x, y, width: w, height: h } = e;
    if (side === "t") return [x + w * t, y - gap];
    if (side === "b") return [x + w * t, y + h + gap];
    if (side === "l") return [x - gap, y + h * t];
    if (side === "r") return [x + w + gap, y + h * t];
  }
  // Arrow between two shapes by side (t/b/l/r) with optional via points and label.
  arrow(a, sa, b, sb, o = {}) {
    const A = this.byId[a], B = this.byId[b];
    const p0 = Array.isArray(sa) ? sa : this._port(A, sa, o.ta ?? 0.5);
    const p1 = Array.isArray(sb) ? sb : this._port(B, sb, o.tb ?? 0.5);
    const pts = [p0, ...(o.via || []), p1];
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const id = o.id || this._id("a");
    const e = this._base("arrow", id, p0[0], p0[1], Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys),
      { stroke: o.stroke || C.ink, dashed: o.dashed, roundness: o.via ? null : { type: 2 }, sw: o.sw || 2 });
    Object.assign(e, {
      points: pts.map((p) => [p[0] - p0[0], p[1] - p0[1]]), lastCommittedPoint: null,
      startBinding: Array.isArray(sa) ? null : { elementId: a, focus: 0, gap: 6 },
      endBinding: Array.isArray(sb) ? null : { elementId: b, focus: 0, gap: 6 },
      startArrowhead: o.both ? "arrow" : null, endArrowhead: o.none ? null : "arrow", elbowed: false,
    });
    if (!Array.isArray(sa)) A.boundElements.push({ type: "arrow", id });
    if (!Array.isArray(sb)) B.boundElements.push({ type: "arrow", id });
    if (o.label) {
      const fs = o.lfs || 16; const t = this._bound(e, o.label, fs, o.labelColor || C.ink);
      // place at midpoint of the path by length
      let L = 0; const seg = [];
      for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
      let r = L * (o.at ?? 0.5), i = 0; while (i < seg.length - 1 && r > seg[i]) { r -= seg[i]; i++; }
      const f = seg[i] ? r / seg[i] : 0;
      const mx = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, my = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
      t.x = mx - t.width / 2; t.y = my - t.height / 2;
    }
    return e;
  }
  line(pts, o = {}) {
    const p0 = pts[0]; const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const e = this._base("line", o.id || this._id("l"), p0[0], p0[1], Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys),
      { stroke: o.stroke || C.ink, dashed: o.dashed, roundness: null });
    Object.assign(e, { points: pts.map((p) => [p[0] - p0[0], p[1] - p0[1]]), lastCommittedPoint: null,
      startBinding: null, endBinding: null, startArrowhead: null, endArrowhead: null });
    return e;
  }
  header(x, y, title, sub) {
    this.text(x, y, title, { fs: 34, id: "title" });
    if (sub) this.text(x, y + 48, sub, { fs: 20, color: C.muted, id: "subtitle" });
  }

  // --- Story kit: icons, people, bubbles, badges, panels, legends ---------------------------
  _shape(type, x, y, w, h, o = {}) {
    return this._base(type, o.id || this._id("s"), x, y, w, h, { stroke: o.stroke, fill: o.fill, sw: o.sw,
      dashed: o.dashed, groupIds: o.groupIds, roundness: type === "rectangle" ? (o.sharp ? null : { type: 3 }) : { type: 2 } });
  }
  // Polyline; closed and filled when o.fill is set.
  _poly(pts, o = {}) {
    if (o.fill && o.fill !== "transparent") pts = [...pts, pts[0]];
    const p0 = pts[0]; const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const e = this._base("line", o.id || this._id("l"), p0[0], p0[1], Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys),
      { stroke: o.stroke || C.ink, fill: o.fill, sw: o.sw, dashed: o.dashed, roundness: o.round ? { type: 2 } : null, groupIds: o.groupIds });
    Object.assign(e, { points: pts.map((p) => [p[0] - p0[0], p[1] - p0[1]]), lastCommittedPoint: null, polygon: !!o.fill,
      startBinding: null, endBinding: null, startArrowhead: null, endArrowhead: null });
    return e;
  }
  // Icon drawn in a 60x60 box at (x, y), scaled by o.size. o.id adds an invisible anchor that arrows can bind to.
  // o.label puts a caption underneath; o.color overrides the kind's default [stroke, fill].
  icon(kind, x, y, o = {}) {
    const S = o.size || 60, u = S / 60, G = [o.group || `g-${this._id("ic")}`];
    const def = ICONS[kind]; if (!def) throw new Error(`unknown icon: ${kind}`);
    const [st, fl] = o.color || def.color || [C.ink, "#ffffff"];
    if (o.id) this._shape("rectangle", x, y, S, S, { id: o.id, stroke: "transparent", fill: "transparent", groupIds: G, sharp: true });
    const I = {
      st, fl, u,
      R: (px, py, w, h, q = {}) => this._shape("rectangle", x + px * u, y + py * u, w * u, h * u, { stroke: q.stroke || st, fill: q.fill ?? fl, sw: q.sw, sharp: q.sharp, groupIds: G }),
      E: (px, py, w, h, q = {}) => this._shape("ellipse", x + px * u, y + py * u, w * u, h * u, { stroke: q.stroke || st, fill: q.fill ?? fl, sw: q.sw, groupIds: G }),
      L: (pts, q = {}) => this._poly(pts.map(([a, b]) => [x + a * u, y + b * u]), { stroke: q.stroke || st, fill: q.fill, sw: q.sw, round: q.round, groupIds: G }),
      T: (px, py, str, fs, q = {}) => { const f = Math.max(10, fs * u); return this.text(x + px * u, y + py * u - (f * LH) / 2, str, { fs: f, align: "center", color: q.color || st, groupIds: G }); },
    };
    def.draw(I, o);
    if (o.label) this.text(x + S / 2, y + S + 6, o.label, { fs: o.lfs || 16, align: "center", color: o.labelColor || C.ink, groupIds: G });
    return { x, y, w: S, h: S };
  }
  // Row of the same icon, e.g. a crowd of people or a stack of chips.
  icons(kind, x, y, n, o = {}) {
    const S = o.size || 60, gap = o.gap ?? 8;
    for (let i = 0; i < n; i++) this.icon(kind, x + i * (S + gap), y, { ...o, label: undefined });
    if (o.label) this.text(x + (n * (S + gap) - gap) / 2, y + S + 6, o.label, { fs: o.lfs || 16, align: "center", color: o.labelColor || C.ink });
  }
  // Speech bubble with a tail on the bottom-left (o.tail: "bl" | "br" | "tl" | "tr").
  bubble(id, x, y, str, o = {}) {
    const fs = o.fs || 17, pad = o.pad || 12; const m = measure(str, fs);
    const w = o.w || m.w + pad * 2, h = o.h || m.h + pad * 2;
    const [stroke, fill] = o.color || [C.ink, "#ffffff"]; const G = [`g-${id}`];
    const tail = o.tail || "bl";
    const tx = tail.endsWith("l") ? x + 18 : x + w - 18, top = tail.startsWith("t");
    const ty = top ? y : y + h, dy = top ? -16 : 16, dx = tail.endsWith("l") ? -4 : 4;
    this._poly([[tx, ty], [tx + dx, ty + dy], [tx + (tail.endsWith("l") ? 14 : -14), ty]], { stroke, fill, groupIds: G });
    const e = this._shape("rectangle", x, y, w, h, { id, stroke, fill, groupIds: G });
    const t = this._bound(e, str, fs, o.textColor); t.x = x + (w - m.w) / 2; t.y = y + (h - m.h) / 2; t.groupIds = G;
    return e;
  }
  // Numbered circle, like the step markers on a hand-drawn story.
  badge(x, y, n, o = {}) {
    const S = o.size || 34; const [stroke, fill] = o.color || [C.ink, C.yellow[1]];
    const G = [`g-${this._id("bd")}`];
    this._shape("ellipse", x, y, S, S, { stroke, fill, groupIds: G });
    const fs = o.fs || Math.round(S * 0.55); const m = measure(String(n), fs);
    this.text(x + S / 2, y + (S - m.h) / 2, String(n), { fs, align: "center", groupIds: G });
  }
  // Story panel: a big rounded frame with a numbered badge and a title in the top-left corner.
  panel(id, x, y, w, h, n, title, o = {}) {
    const [stroke, fill] = o.color || [C.ink, "transparent"];
    const e = this._shape("rectangle", x, y, w, h, { id, stroke, fill, sw: o.sw || 2, dashed: o.dashed });
    let tx = x + 18;
    if (n !== null && n !== undefined) { this.badge(x + 14, y + 14, n); tx = x + 58; }
    if (title) this.text(tx, y + 17, title, { fs: o.fs || 22, color: o.titleColor || C.ink });
    return e;
  }
  // Legend chips: [[label, C.red], ...] laid out left to right.
  legend(items, x, y, o = {}) {
    let cx = x; const fs = o.fs || 16;
    for (const [label, [stroke, fill]] of items) {
      this._shape("rectangle", cx, y, 20, 20, { stroke, fill });
      this.text(cx + 28, y - 1, label, { fs, color: C.ink });
      cx += 28 + measure(label, fs).w + (o.gap || 36);
    }
  }
  // Small tag label (e.g. "external", "us.* profile").
  tag(id, x, y, str, o = {}) {
    return this.box(id, x, y, str, { fs: o.fs || 14, pad: o.pad || 7, color: o.color || [C.teal[0], "#ffffff"], ...o });
  }
  // Red strike-through line, for "not this".
  strike(x1, y, x2, o = {}) { return this._poly([[x1, y], [x2, y]], { stroke: o.stroke || C.red[0], sw: o.sw || 3 }); }
  toJSON() {
    return { type: "excalidraw", version: 2, source: "https://excalidraw.com", elements: this.els,
      appState: { gridSize: 20, viewBackgroundColor: "#ffffff" }, files: {} };
  }
}
// Icon library. Each draw() works in a 60x60 box; R/E/L/T are rect, ellipse, polyline and centred text.
const ring = (cx, cy, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, i) => {
  const a = a0 + ((a1 - a0) * i) / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});
const ICONS = {
  person: { color: [C.blue[0], C.blue[1]], draw: (I) => {
    I.E(22, 2, 16, 16); I.L([[30, 18], [30, 40]]); I.L([[17, 33], [30, 25], [43, 33]]); I.L([[20, 58], [30, 40], [40, 58]]);
  } },
  people: { color: [C.blue[0], C.blue[1]], draw: (I) => {
    for (const [dx, dy] of [[-14, 6], [14, 6], [0, 0]]) {
      I.E(25 + dx, 4 + dy, 10, 10); I.L([[30 + dx, 14 + dy], [30 + dx, 32 + dy]]);
      I.L([[22 + dx, 26 + dy], [30 + dx, 20 + dy], [38 + dx, 26 + dy]]); I.L([[24 + dx, 46 + dy], [30 + dx, 32 + dy], [36 + dx, 46 + dy]]);
    }
  } },
  globe: { color: [C.blue[0], C.blue[1]], draw: (I) => {
    I.E(4, 4, 52, 52); I.E(19, 4, 22, 52, { fill: "transparent" }); I.L([[4, 30], [56, 30]]);
    I.L([[9, 17], [51, 17]]); I.L([[9, 43], [51, 43]]);
  } },
  phone: { color: [C.ink, "#ffffff"], draw: (I) => { I.R(16, 2, 28, 56); I.E(27, 48, 6, 6); I.L([[25, 8], [35, 8]]); } },
  laptop: { color: [C.ink, "#ffffff"], draw: (I, o) => {
    I.R(8, 6, 44, 32); I.L([[2, 48], [8, 40], [52, 40], [58, 48]], { fill: "#ffffff" }); I.T(30, 22, o.glyph || "</>", 14);
  } },
  terminal: { color: [C.ink, "#343a40"], draw: (I) => { I.R(2, 8, 56, 44); I.T(22, 30, ">_", 18, { color: "#ffffff" }); } },
  doc: { color: [C.ink, "#ffffff"], draw: (I) => {
    I.R(10, 2, 40, 56, { sharp: true }); for (const y of [14, 22, 30, 38, 46]) I.L([[18, y], [42, y]], { sw: 1 });
  } },
  docs: { color: [C.ink, "#ffffff"], draw: (I) => {
    I.R(4, 10, 34, 46, { sharp: true }); I.R(14, 4, 34, 46, { sharp: true }); I.R(24, -2, 34, 46, { sharp: true });
    for (const y of [10, 18, 26, 34]) I.L([[31, y], [51, y]], { sw: 1 });
  } },
  shield: { color: [C.orange[0], C.orange[1]], draw: (I) => { I.L([[30, 2], [54, 10], [52, 34], [30, 58], [8, 34], [6, 10]], { fill: I.fl }); } },
  lock: { color: [C.orange[0], C.orange[1]], draw: (I) => {
    I.L([[18, 28], ...ring(30, 22, 12, Math.PI, 2 * Math.PI, 8), [42, 28]], { round: true });
    I.R(10, 26, 40, 30); I.E(26, 35, 8, 8, { fill: I.st });
  } },
  key: { color: [C.orange[0], C.orange[1]], draw: (I) => {
    I.E(2, 18, 22, 22); I.L([[24, 29], [58, 29]], { sw: 3 }); I.L([[46, 29], [46, 39]], { sw: 3 }); I.L([[54, 29], [54, 37]], { sw: 3 });
  } },
  eye: { color: [C.orange[0], C.orange[1]], draw: (I) => {
    I.L([[2, 30], [16, 18], [30, 14], [44, 18], [58, 30], [44, 42], [30, 46], [16, 42]], { fill: I.fl, round: true });
    I.E(20, 20, 20, 20, { fill: "#ffffff" }); I.E(25, 25, 10, 10, { fill: I.st });
  } },
  chip: { color: [C.teal[0], C.teal[1]], draw: (I, o) => {
    for (const p of [20, 30, 40]) {
      I.L([[p, 4], [p, 12]]); I.L([[p, 48], [p, 56]]); I.L([[4, p], [12, p]]); I.L([[48, p], [56, p]]);
    }
    I.R(12, 12, 36, 36, { sharp: true }); if (o.glyph) I.T(30, 30, o.glyph, 12, { color: C.ink }); else I.R(22, 22, 16, 16, { sharp: true, fill: "#ffffff" });
  } },
  ram: { color: [C.teal[0], C.teal[1]], draw: (I) => {
    I.R(2, 16, 56, 26, { sharp: true }); for (const px of [8, 21, 34, 47]) I.R(px, 21, 8, 12, { sharp: true, fill: "#ffffff" });
    for (const px of [10, 18, 26, 34, 42, 50]) I.L([[px, 42], [px, 48]]);
  } },
  rack: { color: [C.gray[0], C.gray[1]], draw: (I) => {
    I.R(12, 2, 36, 56, { sharp: true });
    for (const py of [7, 20, 33, 46]) { I.R(16, py, 28, 9, { sharp: true, fill: "#ffffff" }); I.E(38, py + 3, 4, 4, { fill: C.green[0], stroke: C.green[0] }); }
  } },
  building: { color: [C.gray[0], C.gray[1]], draw: (I) => {
    I.R(6, 12, 48, 46, { sharp: true }); I.L([[6, 12], [30, 2], [54, 12]]);
    for (const py of [20, 32]) for (const px of [13, 26, 39]) I.R(px, py, 8, 8, { sharp: true, fill: "#ffffff" });
    I.R(25, 44, 10, 14, { sharp: true, fill: "#ffffff" });
  } },
  cloud: { color: [C.blue[0], C.blue[1]], draw: (I) => {
    I.L([[12, 46], [4, 38], [8, 28], [18, 25], [22, 15], [34, 10], [45, 16], [48, 25], [56, 31], [56, 41], [48, 46]], { fill: I.fl, round: true });
  } },
  db: { color: [C.orange[0], C.orange[1]], draw: (I) => {
    I.R(8, 11, 44, 40, { sharp: true, stroke: "transparent" });
    I.L([[8, 11], [8, 49]]); I.L([[52, 11], [52, 49]]); I.L(ring(30, 49, 22, 0, Math.PI, 8).map(([a, b]) => [a, 49 + (b - 49) * 0.35]), { round: true, fill: I.fl });
    I.L(ring(30, 30, 22, 0, Math.PI, 8).map(([a, b]) => [a, 30 + (b - 30) * 0.35]), { round: true, sw: 1 });
    I.E(8, 4, 44, 14);
  } },
  coin: { color: [C.orange[0], C.orange[1]], draw: (I, o) => { I.E(4, 4, 52, 52); I.T(30, 30, o.glyph || "$", 30); } },
  clock: { color: [C.green[0], C.green[1]], draw: (I) => { I.E(4, 4, 52, 52); I.L([[30, 30], [30, 13]], { sw: 3 }); I.L([[30, 30], [43, 37]], { sw: 3 }); } },
  check: { color: [C.green[0], "transparent"], draw: (I) => { I.L([[6, 32], [24, 50], [54, 10]], { sw: 4 }); } },
  cross: { color: [C.red[0], "transparent"], draw: (I) => { I.L([[10, 10], [50, 50]], { sw: 4 }); I.L([[50, 10], [10, 50]], { sw: 4 }); } },
  no: { color: [C.red[0], "transparent"], draw: (I) => { I.E(4, 4, 52, 52, { sw: 3 }); I.L([[12, 12], [48, 48]], { sw: 3 }); } },
  gear: { color: [C.gray[0], C.gray[1]], draw: (I) => {
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; I.L([[30 + 17 * Math.cos(a), 30 + 17 * Math.sin(a)], [30 + 27 * Math.cos(a), 30 + 27 * Math.sin(a)]], { sw: 6 }); }
    I.E(12, 12, 36, 36); I.E(23, 23, 14, 14, { fill: "#ffffff" });
  } },
  bolt: { color: [C.yellow[0], C.yellow[1]], draw: (I) => { I.L([[36, 2], [10, 34], [28, 34], [22, 58], [50, 22], [32, 22]], { fill: I.fl }); } },
  search: { color: [C.ink, "#ffffff"], draw: (I) => { I.E(4, 4, 36, 36); I.L([[35, 35], [56, 56]], { sw: 5 }); } },
  warning: { color: [C.yellow[0], C.yellow[1]], draw: (I) => { I.L([[30, 4], [58, 54], [2, 54]], { fill: I.fl }); I.T(30, 36, "!", 26, { color: C.ink }); } },
  claude: { color: [C.purple[0], C.purple[1]], draw: (I) => {
    for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6, r = k % 2 ? 18 : 27; I.L([[30, 30], [30 + r * Math.cos(a), 30 + r * Math.sin(a)]], { sw: 4 }); }
  } },
  play: { color: [C.green[0], C.green[1]], draw: (I) => { I.L([[4, 10], [30, 30], [4, 50]], { fill: I.fl }); I.L([[30, 10], [56, 30], [30, 50]], { fill: I.fl }); } },
  pin: { color: [C.orange[0], C.orange[1]], draw: (I) => {
    I.L([[30, 58], [14, 34], [10, 22], [15, 10], [30, 3], [45, 10], [50, 22], [46, 34]], { fill: I.fl, round: true }); I.E(22, 14, 16, 16, { fill: "#ffffff" });
  } },
  gauge: { color: [C.ink, "#ffffff"], draw: (I) => {
    I.L(ring(30, 46, 26, Math.PI, 2 * Math.PI, 10), { round: true }); I.L([[4, 46], [56, 46]]);
    I.L(ring(30, 46, 26, 1.65 * Math.PI, 2 * Math.PI, 4), { round: true, sw: 5, stroke: C.red[0] });
    I.L([[30, 46], [44, 26]], { sw: 3 }); I.E(26, 42, 8, 8, { fill: I.st });
  } },
  flag: { color: [C.red[0], C.red[1]], draw: (I) => { I.L([[12, 58], [12, 4]], { sw: 3, stroke: C.ink }); I.L([[12, 6], [52, 12], [40, 22], [52, 32], [12, 30]], { fill: I.fl }); } },
  mail: { color: [C.ink, "#ffffff"], draw: (I) => { I.R(4, 12, 52, 36, { sharp: true }); I.L([[4, 12], [30, 34], [56, 12]]); } },
  bucket: { color: [C.blue[0], C.blue[1]], draw: (I) => { I.L([[6, 10], [12, 56], [48, 56], [54, 10]], { fill: I.fl }); I.E(6, 4, 48, 12, { fill: "#ffffff" }); } },
  scale: { color: [C.ink, "#ffffff"], draw: (I) => {
    I.L([[30, 6], [30, 54]], { sw: 3 }); I.L([[18, 54], [42, 54]], { sw: 3 }); I.L([[6, 14], [54, 14]], { sw: 3 });
    I.L([[2, 34], [10, 14], [18, 34]]); I.L([[42, 34], [50, 14], [58, 34]]);
    I.L(ring(10, 34, 8, 0, Math.PI, 6), { fill: C.yellow[1], round: true }); I.L(ring(50, 34, 8, 0, Math.PI, 6), { fill: C.yellow[1], round: true });
  } },
};
window.Scene = Scene; window.C = C; window.ICONS = ICONS;
