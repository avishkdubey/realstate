/**
 * Measure a GLB the way a scene actually sees it.
 *
 * Written after a real bug: the up-axis of two models was diagnosed by reading
 * accessor `min`/`max` straight out of the glTF JSON, a terrain mesh was seen to
 * be flat in Z, and the models were declared Z-up. They were not — accessor
 * bounds are *local to a primitive*, before its node chain is applied, so they
 * say nothing about where that mesh ends up. A −90° X "correction" went in and
 * turned every building upside down.
 *
 * So this walks the node hierarchy, accumulates each node's full 4×4, and
 * transforms all eight corners of every primitive's bounding box. What comes
 * out is the model as `THREE.Box3().setFromObject()` would see it.
 *
 * Usage:
 *   node scripts/measure-glb.mjs public/glb/low_poly_night_city.glb
 */

import fs from "node:fs";

/* ---- 4×4 column-major helpers, matching the glTF layout ---------------- */

const identity = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function multiply(a, b) {
  const out = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + r] * b[c * 4 + k];
      out[c * 4 + r] = sum;
    }
  }
  return out;
}

/** A node's local matrix — either given outright, or composed from TRS. */
function localMatrix(node) {
  if (node.matrix) return node.matrix.slice();
  const [tx, ty, tz] = node.translation ?? [0, 0, 0];
  const [x, y, z, w] = node.rotation ?? [0, 0, 0, 1];
  const [sx, sy, sz] = node.scale ?? [1, 1, 1];

  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, xy = x * y2, xz = x * z2;
  const yy = y * y2, yz = y * z2, zz = z * z2;
  const wx = w * x2, wy = w * y2, wz = w * z2;

  return [
    (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
    (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
    (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
    tx, ty, tz, 1,
  ];
}

const transform = (m, p) => [
  m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
  m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
  m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
];

/* ---- Read the JSON chunk out of the binary container ------------------- */

function readGltfJson(file) {
  const buffer = fs.readFileSync(file);
  const jsonLength = buffer.readUInt32LE(12);
  return JSON.parse(buffer.slice(20, 20 + jsonLength).toString("utf8"));
}

/* ---- Measure ----------------------------------------------------------- */

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/measure-glb.mjs <file.glb>");
  process.exit(1);
}

const gltf = readGltfJson(file);
const accessors = gltf.accessors ?? [];
const parts = [];

function walk(index, parentMatrix) {
  const node = gltf.nodes[index];
  const matrix = multiply(parentMatrix, localMatrix(node));

  if (node.mesh !== undefined) {
    for (const primitive of gltf.meshes[node.mesh].primitives) {
      const accessor = accessors[primitive.attributes.POSITION];
      if (!accessor?.min) continue;

      const lo = [Infinity, Infinity, Infinity];
      const hi = [-Infinity, -Infinity, -Infinity];
      // All eight corners — a rotated box's extent is not its rotated extremes.
      for (let corner = 0; corner < 8; corner++) {
        const point = transform(matrix, [
          corner & 1 ? accessor.max[0] : accessor.min[0],
          corner & 2 ? accessor.max[1] : accessor.min[1],
          corner & 4 ? accessor.max[2] : accessor.min[2],
        ]);
        for (let k = 0; k < 3; k++) {
          lo[k] = Math.min(lo[k], point[k]);
          hi[k] = Math.max(hi[k], point[k]);
        }
      }

      parts.push({
        name: node.name ?? gltf.meshes[node.mesh].name ?? "?",
        lo,
        hi,
        triangles: Math.round((accessors[primitive.indices]?.count ?? 0) / 3),
      });
    }
  }

  for (const child of node.children ?? []) walk(child, matrix);
}

const scene = gltf.scenes[gltf.scene ?? 0];
for (const root of scene.nodes) walk(root, identity());

const min = [0, 1, 2].map((k) => Math.min(...parts.map((p) => p.lo[k])));
const max = [0, 1, 2].map((k) => Math.max(...parts.map((p) => p.hi[k])));
const size = [0, 1, 2].map((k) => max[k] - min[k]);
const round = (v) => +v.toFixed(2);

console.log(`file        ${file}`);
console.log(`generator   ${gltf.asset?.generator ?? "?"}`);
console.log(`meshes      ${parts.length} primitives`);
console.log(`triangles   ${parts.reduce((a, p) => a + p.triangles, 0).toLocaleString()}`);
console.log(`materials   ${(gltf.materials ?? []).length}`);
console.log(`images      ${(gltf.images ?? []).length}`);
console.log("");
console.log(`world min   [${min.map(round)}]`);
console.log(`world max   [${max.map(round)}]`);
console.log(`world size  [${size.map(round)}]`);
console.log("");

/* Y is up if the model rests on or near y = 0 and is taller than it is thin. */
const groundedness = size[1] > 0 ? min[1] / size[1] : 0;
console.log(
  `sits at y=${round(min[1])}, i.e. ${(groundedness * 100).toFixed(1)}% of its own height ` +
    `${min[1] >= 0 ? "above" : "below"} the origin`,
);
console.log(
  `footprint per unit height: x ${round(size[0] / size[1])}  z ${round(size[2] / size[1])}`,
);

/* The flattest, widest large mesh is almost always the ground. Which end of
   which axis it sits at is the reliable tell for the up direction. */
const candidates = parts
  .filter((p) => p.triangles > 20)
  .map((p) => {
    const s = [0, 1, 2].map((k) => p.hi[k] - p.lo[k]);
    const thin = s.indexOf(Math.min(...s));
    const area = s.reduce((a, v, i) => (i === thin ? a : a * v), 1);
    return { ...p, s, thin, area };
  })
  .sort((a, b) => b.area - a.area);

if (candidates.length > 0) {
  const ground = candidates[0];
  const axis = ground.thin;
  const mid = (ground.lo[axis] + ground.hi[axis]) / 2;
  const fraction = (mid - min[axis]) / (max[axis] - min[axis] || 1);
  console.log("");
  console.log(
    `flattest wide mesh: "${ground.name}" size [${ground.s.map(round)}] — thin in ${"XYZ"[axis]}`,
  );
  console.log(
    `  it sits ${(fraction * 100).toFixed(1)}% along ${"XYZ"[axis]} => ` +
      (fraction < 0.35
        ? `${"XYZ"[axis]} points UP` + (axis === 1 ? " (already Y-up, no correction)" : " (NEEDS a correction)")
        : fraction > 0.65
          ? `${"XYZ"[axis]} points DOWN (needs a correction)`
          : "inconclusive — check visually"),
  );
}

/* Emissive materials are what make a night model read; muting them by habit
   throws the asset away. */
const emissive = (gltf.materials ?? []).filter(
  (m) =>
    (m.emissiveTexture !== undefined) ||
    (m.emissiveFactor && m.emissiveFactor.some((v) => v > 0)),
);
console.log("");
console.log(`emissive materials: ${emissive.length} of ${(gltf.materials ?? []).length}`);
for (const m of emissive.slice(0, 8)) {
  console.log(
    `  ${m.name ?? "(unnamed)"} factor=[${(m.emissiveFactor ?? []).map(round)}]` +
      (m.emissiveTexture !== undefined ? " +texture" : ""),
  );
}
