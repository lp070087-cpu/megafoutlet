// Extract filled shapes + text from the floor plan PDF, and render a PNG.
import fs from "node:fs";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "@napi-rs/canvas";

const [, , pdfPath, outDir] = process.argv;
const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
const page = await doc.getPage(1);
const vp = page.getViewport({ scale: 1 });
const { OPS } = pdfjs;

const mul = (m, n) => [
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
];
const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

const ops = await page.getOperatorList();
let ctm = vp.transform.slice(); // to viewport (top-left origin) space
const stack = [];
let fill = "#000000", stroke = "#000000", lineWidth = 1;
let pending = null; // current path bbox
const shapes = [];
const lines = [];
const opName = Object.fromEntries(Object.entries(OPS).map(([k, v]) => [v, k]));

const toHex = (a) => {
  if (typeof a[0] === "string") return a[0];
  return "#" + Array.from(a).slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
};

for (let i = 0; i < ops.fnArray.length; i++) {
  const fn = ops.fnArray[i];
  const args = ops.argsArray[i];
  switch (fn) {
    case OPS.save: stack.push({ ctm, fill, stroke, lineWidth }); break;
    case OPS.restore: ({ ctm, fill, stroke, lineWidth } = stack.pop() ?? { ctm, fill, stroke, lineWidth }); break;
    case OPS.transform: ctm = mul(ctm, args); break;
    case OPS.setFillRGBColor: fill = toHex(args); break;
    case OPS.setStrokeRGBColor: stroke = toHex(args); break;
    case OPS.setLineWidth: lineWidth = args[0]; break;
    case OPS.constructPath: {
      // v4: args = [opsArr, coords, minMax]
      const [subOps, coords] = args;
      const pts = [];
      let k = 0;
      const segs = [];
      for (const so of subOps) {
        if (so === OPS.rectangle) {
          const [x, y, w, h] = coords.slice(k, k + 4); k += 4;
          const c = [apply(ctm, x, y), apply(ctm, x + w, y), apply(ctm, x + w, y + h), apply(ctm, x, y + h)];
          pts.push(...c); segs.push({ t: "rect", c });
        } else if (so === OPS.moveTo || so === OPS.lineTo) {
          const p = apply(ctm, coords[k], coords[k + 1]); k += 2;
          pts.push(p); segs.push({ t: so === OPS.moveTo ? "M" : "L", c: [p] });
        } else if (so === OPS.curveTo) {
          const p = apply(ctm, coords[k + 4], coords[k + 5]); k += 6; pts.push(p); segs.push({ t: "L", c: [p] });
        } else if (so === OPS.curveTo2 || so === OPS.curveTo3) {
          const p = apply(ctm, coords[k + 2], coords[k + 3]); k += 4; pts.push(p); segs.push({ t: "L", c: [p] });
        } else if (so === OPS.closePath) { segs.push({ t: "Z" }); }
      }
      pending = { pts, segs };
      break;
    }
    case OPS.fill: case OPS.eoFill: case OPS.fillStroke: case OPS.eoFillStroke:
    case OPS.closeFillStroke: case OPS.closeEOFillStroke:
    case OPS.stroke: case OPS.closeStroke: {
      if (!pending || !pending.pts.length) break;
      const xs = pending.pts.map((p) => p[0]), ys = pending.pts.map((p) => p[1]);
      const bbox = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
      const isFill = ![OPS.stroke, OPS.closeStroke].includes(fn);
      const rec = { op: opName[fn], fill: isFill ? fill : null, stroke: fn === OPS.fill || fn === OPS.eoFill ? null : stroke, lw: lineWidth, bbox: bbox.map((v) => +v.toFixed(2)), n: pending.pts.length,
        d: pending.segs.map((s) => s.t === "Z" ? "Z" : s.t === "rect" ? `M${s.c.map((p) => p.map((v) => v.toFixed(2)).join(",")).join("L")}Z` : s.t + s.c[0].map((v) => v.toFixed(2)).join(",")).join("") };
      (isFill ? shapes : lines).push(rec);
      pending = null;
      break;
    }
    case OPS.endPath: pending = null; break;
    default: break;
  }
}

const tc = await page.getTextContent();
const texts = tc.items.filter((t) => t.str.trim()).map((t) => {
  const m = pdfjs.Util.transform(vp.transform, t.transform);
  const size = Math.hypot(m[2], m[3]);
  const angle = Math.round((Math.atan2(m[1], m[0]) * 180) / Math.PI);
  return { s: t.str, x: +m[4].toFixed(2), y: +m[5].toFixed(2), w: +t.width.toFixed(2), size: +size.toFixed(2), angle };
});

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(`${outDir}/plan-raw.json`, JSON.stringify({ width: vp.width, height: vp.height, shapes, lines, texts }));

const colorCount = {};
for (const s of shapes) colorCount[s.fill] = (colorCount[s.fill] ?? 0) + 1;
console.log("viewport", vp.width, vp.height, "shapes", shapes.length, "lines", lines.length, "texts", texts.length);
console.log("fill colors", JSON.stringify(Object.entries(colorCount).sort((a, b) => b[1] - a[1]).slice(0, 40)));

// Render a high-res PNG for visual reference
const scale = 4;
const rvp = page.getViewport({ scale });
const canvas = createCanvas(Math.ceil(rvp.width), Math.ceil(rvp.height));
await page.render({ canvasContext: canvas.getContext("2d"), viewport: rvp }).promise;
fs.writeFileSync(`${outDir}/plan@4x.png`, canvas.toBuffer("image/png"));

// Embedded images (logo)
const imgs = [];
for (let i = 0; i < ops.fnArray.length; i++) if (ops.fnArray[i] === OPS.paintImageXObject) imgs.push(ops.argsArray[i][0]);
console.log("images", imgs);
