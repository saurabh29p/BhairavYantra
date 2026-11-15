/**
 * Loads and validates src/data/yantra.yaml (or BY_YANTRA_FILE) at build time, and holds the
 * geometry of the yantra-form map. The geometry is a navigational design (concept §2.1):
 * petal and direction positions follow list order, not compass directions.
 */
import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { yantraFile } from '../schemas';
import { yantraSchema, type Yantra, type YantraLayer, type YantraLayerId, type YantraSlot } from '../schemas/yantra';

let cached: Yantra | undefined;

export function loadYantra(): Yantra {
  if (cached) return cached;
  const file = yantraFile();
  const result = yantraSchema.safeParse(parseYaml(readFileSync(file, 'utf8')));
  if (!result.success) {
    throw new Error(
      `${file} is invalid:\n${result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')}`,
    );
  }
  cached = result.data;
  return cached;
}

/** Layers from the centre outward, as the map is read (concept §3). */
export const LAYER_ORDER: YantraLayerId[] = ['bindu', 'trikona', 'satkona', 'astadala', 'dasa-disa', 'vrtta', 'bhupura'];

export function layersInOrder(y: Yantra): Array<YantraLayer & { slots: YantraSlot[] }> {
  return LAYER_ORDER.flatMap((id) => {
    const layer = y.layers.find((l) => l.id === id);
    return layer ? [{ ...layer, slots: y.slots.filter((s) => s.layer === id) }] : [];
  });
}

/** Where a slot's link goes: its page when ready, otherwise its entry on /yantra/. */
export function slotHref(s: YantraSlot): string {
  return s.status === 'ready' ? s.href : `/yantra/#slot-${s.slot}`;
}

/**
 * Accessible name: the visible label first, exactly as shown (WCAG 2.5.3, so voice commands
 * work), then any other names, the layer and the status.
 */
export function slotName(s: YantraSlot, layer: YantraLayer, visible?: string): string {
  const shown = visible ?? [s.label_sa ?? s.label_hi, s.label_iast ?? s.label_en].filter(Boolean).join(' ');
  const others = [s.label_en, s.label_iast, s.label_sa, s.label_hi].filter(
    (v, i, a): v is string => !!v && a.indexOf(v) === i && !shown.includes(v),
  );
  const status = s.status === 'ready' ? '' : ', in preparation';
  return `${shown}${others.length ? ` — ${others.join(' · ')}` : ''} (${layer.label_en}${status})`;
}

/** Splits "त्रिपुरसुन्दरी (षोडशी)" into ["त्रिपुरसुन्दरी", "(षोडशी)"] for two-line labels. */
export function labelLines(label: string | null | undefined): string[] {
  if (!label) return [];
  const i = label.indexOf(' (');
  return i > 0 ? [label.slice(0, i), label.slice(i + 1)] : [label];
}

// ---------- Geometry (SVG user units) ----------

export const VIEW = { width: 1400, height: 1130 };
export const C = { x: 700, y: 565 };

export const R = {
  bindu: 11,
  triangle: 165,
  petalBase: 178,
  petalTip: 292,
  petalLabel: 232,
  ringInner: 298,
  ringLabel: 345,
  ringOuter: 392,
  vrttaInner: 404,
  vrttaOuter: 428,
  vrttaLabel: 416,
  squareInner: 440,
  squareOuter: 456,
  gateHalf: 115,
  gateDepth: 34,
};

const round = (n: number) => Math.round(n * 10) / 10;

export function polar(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [round(C.x + r * Math.cos(a)), round(C.y + r * Math.sin(a))];
}

/** Angle of the i-th of n positions, clockwise from the top. */
export const angleOf = (i: number, n: number) => -90 + (360 / n) * i;

/** One petal of the aṣṭadala, pointing at `deg`. */
export function petalPath(deg: number): string {
  const half = 22.5;
  const [bx1, by1] = polar(R.petalBase, deg - half);
  const [c1x, c1y] = polar(248, deg - 24);
  const [c2x, c2y] = polar(R.petalTip - 8, deg - 7);
  const [tx, ty] = polar(R.petalTip, deg);
  const [c3x, c3y] = polar(R.petalTip - 8, deg + 7);
  const [c4x, c4y] = polar(248, deg + 24);
  const [bx2, by2] = polar(R.petalBase, deg + half);
  return [
    `M${bx1},${by1}`,
    `C${c1x},${c1y} ${c2x},${c2y} ${tx},${ty}`,
    `C${c3x},${c3y} ${c4x},${c4y} ${bx2},${by2}`,
    `A${R.petalBase},${R.petalBase} 0 0 0 ${bx1},${by1}Z`,
  ].join(' ');
}

/** The downward-pointing trikoṇa. Orientation is a design choice, not a textual claim. */
export function trianglePoints(): string {
  return [-150, -30, 90].map((d) => polar(R.triangle, d).join(',')).join(' ');
}

/** A bhūpura square with a gate on each side. */
export function bhupuraPath(half: number, gateHalf: number, depth: number): string {
  const l = C.x - half;
  const r = C.x + half;
  const t = C.y - half;
  const b = C.y + half;
  const gl = C.x - gateHalf;
  const gr = C.x + gateHalf;
  const gt = C.y - gateHalf;
  const gb = C.y + gateHalf;
  return [
    `M${l},${t}`,
    `H${gl} V${t - depth} H${gr} V${t} H${r}`,
    `V${gt} H${r + depth} V${gb} H${r} V${b}`,
    `H${gr} V${b + depth} H${gl} V${b} H${l}`,
    `V${gb} H${l - depth} V${gt} H${l} Z`,
  ].join(' ');
}

/** Upper half of a circle, left to right, for a label along the vṛtta. */
export function upperArc(r: number): string {
  const [x1, y1] = polar(r, 180);
  const [x2, y2] = polar(r, 0);
  return `M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`;
}
