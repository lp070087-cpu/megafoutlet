// Build final stand dataset from cells-v2.json + raw plan, emit TS data module.
import fs from "node:fs";
const raw = JSON.parse(fs.readFileSync("out/plan-raw.json", "utf8"));
const { PPM, out } = JSON.parse(fs.readFileSync("out/cells-v2.json", "utf8"));
const [, , target] = process.argv;

const fills = raw.shapes.filter((s) => s.fill && !["#000000", "#ffffff", "#c7c8ca", "#dcdcdc", "#808080"].includes(s.fill));
const parseDim = (d) => d.replace(/,/g, ".").split(/X/i).map(Number);
const fmtDim = (d) => d.toLowerCase();
const fitErr = (b, dim) => {
  const [a, c] = parseDim(dim); const w = (b[2] - b[0]) / PPM, h = (b[3] - b[1]) / PPM;
  return Math.min(Math.abs(w - a) + Math.abs(h - c), Math.abs(w - c) + Math.abs(h - a));
};
const inter = (a, b) => Math.min(a[2], b[2]) - Math.max(a[0], b[0]) > 0 && Math.min(a[3], b[3]) - Math.max(a[1], b[1]) > 0;
const touch = (a, b, t = 0.3) => a[0] <= b[2] + t && b[0] <= a[2] + t && a[1] <= b[3] + t && b[1] <= a[3] + t;

function colorNear([x, y]) {
  const box = [x - 14, y - 14, x + 14, y + 14]; const cnt = {};
  for (const s of fills) if (inter(s.bbox, box)) cnt[s.fill] = (cnt[s.fill] ?? 0) + 1;
  return Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0];
}
function colorUnion(c, within, color) {
  const pool = fills.filter((s) => s.fill === color && inter(s.bbox, within));
  if (!pool.length) return null;
  const d = (s) => Math.hypot((s.bbox[0] + s.bbox[2]) / 2 - c[0], (s.bbox[1] + s.bbox[3]) / 2 - c[1]);
  const seed = pool.sort((a, b) => d(a) - d(b))[0];
  const grp = [seed]; let grew = true;
  while (grew) { grew = false; for (const s of pool) if (!grp.includes(s) && grp.some((g) => touch(g.bbox, s.bbox, 0.15))) { grp.push(s); grew = true; } }
  return [Math.min(...grp.map((s) => s.bbox[0])), Math.min(...grp.map((s) => s.bbox[1])), Math.max(...grp.map((s) => s.bbox[2])), Math.max(...grp.map((s) => s.bbox[3]))];
}

// gates for sector naming
const gates = { C: [700, 1600], D: [270, 1600], E: [255, 215], F: [680, 215] };
for (const t of raw.texts) if (/^[CDEF]$/.test(t.s.trim()) && t.size > 14) gates[t.s.trim()] = [t.x + t.w / 2, t.y];
const setorDe = ([x, y]) => {
  const g = Object.entries(gates).sort((a, b) => Math.hypot(a[1][0] - x, a[1][1] - y) - Math.hypot(b[1][0] - x, b[1][1] - y))[0][0];
  return `Ala do Portão ${g}`;
};

const stands = []; const issues = [];
const feirinhaStrips = [
  { b: [508.2, 448.5, 623.4, 459.6], n: 7, axis: "x" },
  { b: [621.6, 473.8, 632.5, 572.5], n: 6, axis: "y" },
  { b: [508.2, 586.8, 623.4, 597.8], n: 7, axis: "x" },
];
const inFeirinha = ([x, y]) => x > 505 && x < 645 && y > 440 && y < 605;
const inFood = ([x, y]) => x < 245 && y > 1100 && y < 1400;

for (const o of out) {
  if (/^\d$/.test(o.num)) continue; // anotações de cota ("1", "3", "4")
  if (o.num === "181") continue; // rótulo do Stand Institucional 18×11 (área especial)
  let serie = "principal";
  if (inFeirinha(o.c)) serie = "feirinha"; else if (inFood(o.c)) serie = "alimentacao";
  let bbox = o.bbox, dim = null, obs = [];

  if (serie === "feirinha") {
    const strip = feirinhaStrips.find((s) => o.c[0] >= s.b[0] - 2 && o.c[0] <= s.b[2] + 2 && o.c[1] >= s.b[1] - 4 && o.c[1] <= s.b[3] + 4);
    if (!strip) { issues.push(["feirinha-sem-faixa", o.num, o.c]); continue; }
    const len = strip.axis === "x" ? strip.b[2] - strip.b[0] : strip.b[3] - strip.b[1];
    const step = len / strip.n; const pos = strip.axis === "x" ? o.c[0] - strip.b[0] : o.c[1] - strip.b[1];
    const i = Math.min(strip.n - 1, Math.max(0, Math.floor(pos / step)));
    bbox = strip.axis === "x" ? [strip.b[0] + i * step, strip.b[1], strip.b[0] + (i + 1) * step, strip.b[3]] : [strip.b[0], strip.b[1] + i * step, strip.b[2], strip.b[1] + (i + 1) * step];
    dim = "1,5X1";
  } else {
    const uniq = [...new Set(o.dims)];
    if (uniq.length === 1) dim = uniq[0];
    else if (uniq.length > 1) dim = uniq.sort((a, b) => fitErr(bbox, a) - fitErr(bbox, b))[0];
    if (o.others.length || (dim && fitErr(bbox, dim) > 1.2)) {
      const color = colorNear(o.c);
      const u = color && colorUnion(o.c, bbox, color);
      if (u && (!dim || fitErr(u, dim) <= 1.2) && !out.some((p) => p !== o && p.num !== o.num && p.c[0] > u[0] && p.c[0] < u[2] && p.c[1] > u[1] && p.c[1] < u[3] && !/^\d$/.test(p.num))) bbox = u;
      else { issues.push(["revisar-geometria", o.num, dim, bbox.map(Math.round)]); obs.push("Geometria aproximada — conferir na planta oficial"); }
    }
    if (!dim) {
      const w = Math.round(((bbox[2] - bbox[0]) / PPM) * 2) / 2, h = Math.round(((bbox[3] - bbox[1]) / PPM) * 2) / 2;
      dim = `${String(w).replace(".", ",")}X${String(h).replace(".", ",")}`;
      obs.push("Dimensão estimada pela geometria (sem cota impressa)");
      issues.push(["dim-estimada", o.num, dim]);
    }
  }
  const [a, b] = parseDim(dim);
  const prefix = { principal: "E", alimentacao: "A", feirinha: "F" }[serie];
  stands.push({
    id: `${prefix}-${o.num}`, numero: o.num, serie, dimensao: fmtDim(dim), areaM2: +(a * b).toFixed(2),
    setor: serie === "feirinha" ? "Feirinha · entorno do Lounge 8×7" : serie === "alimentacao" ? "Praça de alimentação" : setorDe(o.c),
    x: +bbox[0].toFixed(2), y: +bbox[1].toFixed(2), w: +(bbox[2] - bbox[0]).toFixed(2), h: +(bbox[3] - bbox[1]).toFixed(2),
    cor: serie === "feirinha" ? "#b4dfce" : colorNear(o.c) ?? "#e5e5e5",
    ...(obs.length ? { observacao: obs.join(". ") } : {}),
  });
}
// duplicates
const seen = {};
for (const s of stands) {
  if (seen[s.id] !== undefined) {
    seen[s.id]++;
    const first = stands.find((x) => x.id === s.id);
    const note = "Número repetido na planta (ALT 17) — confirmar com a organização";
    first.observacao = first.observacao ? `${first.observacao}. ${note}` : note;
    s.id = `${s.id}-${String.fromCharCode(97 + seen[s.id])}`; s.observacao = s.observacao ? `${s.observacao}. ${note}` : note;
    issues.push(["numero-repetido", s.numero]);
  } else seen[s.id] = 0;
}
stands.sort((a, b) => a.serie.localeCompare(b.serie) || parseInt(a.numero) - parseInt(b.numero) || a.id.localeCompare(b.id));

// special areas (from plan text) for map annotations
const areaDefs = [
  ["kids", "Espaço Kids", "ESPAÇO", "#dcdcdc"], ["palco", "Palco", "PALCO", "#dcdcdc"], ["institucional", "Stand institucional", "INSTITUCIONAL", "#808080"],
  ["imprensa", "Imprensa", "IMPRENSA", "#dcdcdc"], ["cafe", "Café", "CAFÉ", "#dfce77"], ["alimentacao", "Praça de alimentação", "PRAÇA DE ALIMENTAÇÃO", null],
];
const counts = {};
for (const s of stands) counts[s.serie] = (counts[s.serie] ?? 0) + 1;
console.log("stands", stands.length, counts, "PPM", PPM.toFixed(3));
console.log("issues", issues.length); for (const i of issues) console.log(JSON.stringify(i));

const header = fs.readFileSync(target, "utf8").split("export const ESTANDES: Estande[] = [];");
if (header.length !== 2) throw new Error("marker not found");
const body = `export const ESTANDES: Estande[] = ${JSON.stringify(stands, null, 1).replace(/\n\s*/g, " ").replace(/\}, \{/g, "},\n  {")};`;
fs.writeFileSync(target, header[0] + `/** Escala aproximada da planta: ${PPM.toFixed(3)} pt por metro. */\nexport const PT_POR_METRO = ${PPM.toFixed(3)};\n\n` + body + header[1]);
