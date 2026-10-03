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
  toJSON() {
    return { type: "excalidraw", version: 2, source: "https://excalidraw.com", elements: this.els,
      appState: { gridSize: 20, viewBackgroundColor: "#ffffff" }, files: {} };
  }
}
window.Scene = Scene; window.C = C;
