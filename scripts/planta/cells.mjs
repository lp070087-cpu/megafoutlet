// Detect each stand cell as the box of stroke walls surrounding its number label.
import fs from "node:fs";
const raw = JSON.parse(fs.readFileSync("out/plan-raw.json", "utf8"));
const { shapes, lines, texts } = raw;

// ---- axis-aligned segments from all stroked paths (and fill outlines that are stroked) ----
const H = [], V = [];
const addSeg = (x1, y1, x2, y2) => {
  if (Math.abs(y1 - y2) < 0.35 && Math.abs(x1 - x2) > 1.5) H.push([Math.min(x1, x2), (y1 + y2) / 2, Math.max(x1, x2)]);
  else if (Math.abs(x1 - x2) < 0.35 && Math.abs(y1 - y2) > 1.5) V.push([(x1 + x2) / 2, Math.min(y1, y2), Math.max(y1, y2)]);
};
const parse = (d) => {
  const pts = []; const re = /([MLZ])([-\d.]+)?,?([-\d.]+)?/g; let m; let start = null; let prev = null;
  while ((m = re.exec(d))) {
    if (m[1] === "Z") { if (prev && start) addSeg(prev[0], prev[1], start[0], start[1]); prev = start; continue; }
    const p = [+m[2], +m[3]];
    if (m[1] === "M") { start = p; prev = p; } else { if (prev) addSeg(prev[0], prev[1], p[0], p[1]); prev = p; }
  }
};
for (const l of lines) if (l.stroke === "#000000") parse(l.d);
// fill outlines excluded (they outline label knockouts)

const inLegend = (x, y) => y < 235 && x > 560;
const inTitle = (x, y) => y > 1600;
const numRe = /^\d{1,3}(\s?A)?$/;
const dimRe = /^\d+([,.]\d+)?\s*[xX]\s*\d+([,.]\d+)?$/;
const center = (t) => {
  const rad = (t.angle * Math.PI) / 180;
  return [t.x + Math.cos(rad) * t.w / 2 + Math.sin(rad) * t.size * 0.33, t.y + Math.sin(rad) * t.w / 2 - Math.cos(rad) * t.size * 0.33];
};

function cellAround([cx, cy], minGap = 3) {
  const up = H.filter((h) => h[1] < cy - minGap && h[0] <= cx + 0.5 && h[2] >= cx - 0.5).reduce((a, h) => Math.max(a, h[1]), -Infinity);
  const dn = H.filter((h) => h[1] > cy + minGap && h[0] <= cx + 0.5 && h[2] >= cx - 0.5).reduce((a, h) => Math.min(a, h[1]), Infinity);
  const lf = V.filter((v) => v[0] < cx - minGap && v[1] <= cy + 0.5 && v[2] >= cy - 0.5).reduce((a, v) => Math.max(a, v[0]), -Infinity);
  const rt = V.filter((v) => v[0] > cx + minGap && v[1] <= cy + 0.5 && v[2] >= cy - 0.5).reduce((a, v) => Math.min(a, v[0]), Infinity);
  return [lf, up, rt, dn];
}

const fills = shapes.filter((s) => s.fill && !["#000000", "#ffffff"].includes(s.fill));
const colorIn = (b) => {
  const cnt = {};
  for (const s of fills) {
    const ix = Math.min(b[2], s.bbox[2]) - Math.max(b[0], s.bbox[0]);
    const iy = Math.min(b[3], s.bbox[3]) - Math.max(b[1], s.bbox[1]);
    if (ix > 0 && iy > 0) cnt[s.fill] = (cnt[s.fill] ?? 0) + ix * iy;
  }
  return Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
};

const labels = texts.filter((t) => numRe.test(t.s.trim())).map((t) => ({ s: t.s.trim().replace(/\s/g, ""), c: center(t), t }))
  .filter((l) => !inLegend(...l.c) && !inTitle(...l.c));
const dimsT = texts.filter((t) => dimRe.test(t.s.trim())).map((t) => ({ s: t.s.trim().replace(/\s/g, "").toUpperCase(), c: center(t) }));

const out = [];
for (const l of labels) {
  const b = cellAround(l.c);
  const ok = b.every(Number.isFinite) && b[2] - b[0] < 140 && b[3] - b[1] < 140;
  const inside = (p) => p[0] > b[0] && p[0] < b[2] && p[1] > b[1] && p[1] < b[3];
  const dims = ok ? dimsT.filter((d) => inside(d.c)).map((d) => d.s) : [];
  const others = ok ? labels.filter((o) => o !== l && inside(o.c)).map((o) => o.s) : [];
  out.push({ num: l.s, c: l.c.map((v) => +v.toFixed(1)), bbox: ok ? b.map((v) => +v.toFixed(2)) : null, dims, others, fill: ok ? colorIn(b) : null });
}

// scale check: pt per meter
const ppm = [];
for (const o of out) if (o.bbox && o.dims.length === 1 && !o.others.length) {
  const [a, bb] = o.dims[0].replace(",", ".").split("X").map(Number);
  const w = o.bbox[2] - o.bbox[0], h = o.bbox[3] - o.bbox[1];
  const r1 = Math.max(w, h) / Math.max(a, bb), r2 = Math.min(w, h) / Math.min(a, bb);
  ppm.push(r1, r2);
}
ppm.sort((a, b) => a - b);
const PPM = ppm[ppm.length >> 1];
console.log("labels", labels.length, "cells ok", out.filter((o) => o.bbox).length, "pt/m median", PPM.toFixed(2));
const bad = [];
for (const o of out) {
  if (!o.bbox) { bad.push([o.num, "no-cell", o.c]); continue; }
  if (o.others.length) { bad.push([o.num, "shares-cell-with", o.others.join(","), o.bbox.map(Math.round)]); continue; }
  if (o.dims.length !== 1) { bad.push([o.num, "dims", o.dims.join(","), o.bbox.map(Math.round)]); continue; }
  const [a, bb] = o.dims[0].replace(",", ".").split("X").map(Number);
  const w = (o.bbox[2] - o.bbox[0]) / PPM, h = (o.bbox[3] - o.bbox[1]) / PPM;
  const fit = Math.min(Math.abs(w - a) + Math.abs(h - bb), Math.abs(w - bb) + Math.abs(h - a));
  o.fitErr = +fit.toFixed(2);
  if (fit > 1.2) bad.push([o.num, "size-mismatch", o.dims[0], `${w.toFixed(1)}x${h.toFixed(1)}m`, o.bbox.map(Math.round)]);
}
console.log("problems", bad.length);
for (const b of bad) console.log(JSON.stringify(b));
fs.writeFileSync("out/cells-v2.json", JSON.stringify({ PPM, out }));
