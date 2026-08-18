/**
 * The tower, as numbers.
 *
 * Deliberately free of Three.js and React so the layout can be checked by
 * reading it. Everything is derived from `TOWER` below — change the bay count
 * and the columns, slabs, facade and glazing all follow.
 *
 * Nothing here is a real Kautilya building. It is an abstract massing study,
 * captioned as such wherever it appears: under RERA §12 a visual that implies a
 * specific building is a representation the promoter is liable for, and a
 * disclaimer does not waive that. Keeping it obviously schematic is the point,
 * not a limitation.
 */

export const TOWER = {
  floors: 18,
  /** Storey height in world units. */
  storey: 1.15,
  /** Structural bays across each axis. */
  baysX: 5,
  baysZ: 3,
  /** Bay spacing. */
  spanX: 1.5,
  spanZ: 1.6,
  columnSize: 0.17,
  slabThickness: 0.12,
  /** The lift and stair core, offset from centre so the massing is not symmetrical. */
  core: { w: 1.5, d: 1.4, x: -1.4, z: 0 },
} as const;

/**
 * How one storey of facade divides vertically, as fractions of `TOWER.storey`.
 *
 * This exists because the first version had none of it: the spandrel and the
 * glazing were both `TOWER.storey * 0.34` and `* 0.58` tall and both centred on
 * the same point, so a solid concrete band sat *inside* every window, z-fighting
 * with it. That single overlap is most of why the facade did not read as a
 * facade — real cladding is a stack of bands that meet edge to edge, and the eye
 * reads the horizontal lines between them as floors.
 *
 * Bottom to top: spandrel (the solid band you lean on), glazing, then a shadow
 * gap left for the slab edge to occupy.
 */
export const BAND = {
  spandrel: 0.3,
  glass: 0.62,
  /** Remainder, 0.08, is the slab edge. Not modelled — the slab fills it. */
} as const;

/** Vertical centre of the spandrel band, relative to the storey's centre. */
export const SPANDREL_OFFSET = (BAND.spandrel - 1) / 2;
/** Vertical centre of the glazing band, relative to the storey's centre. */
export const GLASS_OFFSET = BAND.spandrel + BAND.glass / 2 - 0.5;

/** The plinth the tower stands on. Two storeys of lobby, parking and shops. */
export const PODIUM = {
  storeys: 2,
  /** How far the podium oversails the tower footprint on each side. */
  overhang: 1.5,
} as const;

export const PODIUM_HEIGHT = PODIUM.storeys * TOWER.storey;

export const FOOTPRINT = {
  width: (TOWER.baysX - 1) * TOWER.spanX,
  depth: (TOWER.baysZ - 1) * TOWER.spanZ,
};

export const TOWER_HEIGHT = TOWER.floors * TOWER.storey;

export type Placement = {
  position: [number, number, number];
  /** Y-rotation, for facade panels that face out along different edges. */
  rotationY: number;
  /** Which floor this belongs to — drives the staggered rise. */
  floor: number;
};

/** Column grid, repeated per floor. One instance per column per storey. */
export function columnPlacements(): Placement[] {
  const out: Placement[] = [];
  for (let floor = 0; floor < TOWER.floors; floor++) {
    for (let ix = 0; ix < TOWER.baysX; ix++) {
      for (let iz = 0; iz < TOWER.baysZ; iz++) {
        out.push({
          position: [
            (ix - (TOWER.baysX - 1) / 2) * TOWER.spanX,
            floor * TOWER.storey + TOWER.storey / 2,
            (iz - (TOWER.baysZ - 1) / 2) * TOWER.spanZ,
          ],
          rotationY: 0,
          floor,
        });
      }
    }
  }
  return out;
}

/** One slab per floor, sitting on top of that floor's columns. */
export function slabPlacements(): Placement[] {
  return Array.from({ length: TOWER.floors }, (_, floor) => ({
    position: [0, (floor + 1) * TOWER.storey, 0] as [number, number, number],
    rotationY: 0,
    floor,
  }));
}

/**
 * Facade panels around the perimeter, one per bay per floor.
 *
 * Walking the perimeter rather than filling a grid means corners get exactly
 * one panel instead of two fighting for the same space.
 */
export function facadePlacements(): Placement[] {
  const out: Placement[] = [];
  const halfW = FOOTPRINT.width / 2;
  const halfD = FOOTPRINT.depth / 2;

  // Starts above the podium: floors 0–1 are inside it, and glazing them would
  // put windows behind a solid mass.
  for (let floor = PODIUM.storeys; floor < TOWER.floors; floor++) {
    const y = floor * TOWER.storey + TOWER.storey / 2;

    // Long faces, front and back.
    for (let ix = 0; ix < TOWER.baysX - 1; ix++) {
      const x = (ix - (TOWER.baysX - 2) / 2) * TOWER.spanX;
      out.push({ position: [x, y, halfD], rotationY: 0, floor });
      out.push({ position: [x, y, -halfD], rotationY: Math.PI, floor });
    }
    // Short faces, left and right.
    for (let iz = 0; iz < TOWER.baysZ - 1; iz++) {
      const z = (iz - (TOWER.baysZ - 2) / 2) * TOWER.spanZ;
      out.push({ position: [halfW, y, z], rotationY: Math.PI / 2, floor });
      out.push({ position: [-halfW, y, z], rotationY: -Math.PI / 2, floor });
    }
  }
  return out;
}

/**
 * The floor at which the tower's own cladding starts.
 *
 * Floors 0 and 1 are inside the podium, so glazing them would put windows
 * behind a solid mass. The frame still builds through them — that is a real
 * part of watching a building go up — but the skin starts where the tower
 * actually becomes visible.
 */
export const FIRST_CLAD_FLOOR = PODIUM.storeys;

/**
 * Balconies on the main elevation.
 *
 * The single largest change in whether this reads as *housing* rather than as
 * an office block or an abstract massing study. A curtain wall says commercial;
 * a stacked ribbon of projecting trays with railings says people live here, and
 * that is the entire proposition of the page it sits on.
 *
 * The front face carries a full ribbon and the rear only its outer bays, so the
 * two elevations are not the same building mirrored.
 */
export function balconyPlacements(): Placement[] {
  const out: Placement[] = [];
  const halfD = FOOTPRINT.depth / 2;

  for (let floor = FIRST_CLAD_FLOOR; floor < TOWER.floors; floor++) {
    const y = floor * TOWER.storey + TOWER.storey / 2;
    for (let ix = 0; ix < TOWER.baysX - 1; ix++) {
      const x = (ix - (TOWER.baysX - 2) / 2) * TOWER.spanX;
      out.push({ position: [x, y, halfD], rotationY: 0, floor });
      // Rear: outer bays only.
      if (ix === 0 || ix === TOWER.baysX - 2) {
        out.push({ position: [x, y, -halfD], rotationY: Math.PI, floor });
      }
    }
  }
  return out;
}

/**
 * One vertical mullion per bay, centred on the panel.
 *
 * Placed at the *centre* of each bay rather than at its edges on purpose: edge
 * mullions are shared between neighbouring bays, so instancing them produces
 * two coincident fins at every joint and a z-fighting seam down the whole
 * elevation. A single central fin splits each bay into a pair of windows, which
 * is both what a real facade does at this span and the version that cannot
 * double up.
 */
export function mullionPlacements(): Placement[] {
  return facadePlacements();
}

/** Pile caps under the column grid, the first thing to appear. */
export function pileCapPlacements(): Placement[] {
  const out: Placement[] = [];
  for (let ix = 0; ix < TOWER.baysX; ix++) {
    for (let iz = 0; iz < TOWER.baysZ; iz++) {
      out.push({
        position: [
          (ix - (TOWER.baysX - 1) / 2) * TOWER.spanX,
          0.12,
          (iz - (TOWER.baysZ - 1) / 2) * TOWER.spanZ,
        ],
        rotationY: 0,
        floor: 0,
      });
    }
  }
  return out;
}

/**
 * A deterministic pseudo-random number in [0, 1).
 *
 * mulberry32. Seeded so the tower is byte-identical on every load — jitter that
 * changes between refreshes makes it impossible to tell whether a tweak
 * improved the composition or the dice did.
 */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Which windows are lit at handover, as a stable per-panel 0/1.
 *
 * Roughly a third, scattered — a fully lit tower reads as a render, a sparsely
 * lit one reads as an evening.
 */
export function litWindows(count: number, fraction = 0.34): Float32Array {
  const random = seededRandom(0x9e3779b9);
  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) out[i] = random() < fraction ? 1 : 0;
  return out;
}
