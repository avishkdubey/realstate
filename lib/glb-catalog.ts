/**
 * What is actually inside `public/glb`, measured rather than assumed.
 *
 * Every one of these is a Sketchfab export (the `asset.generator` string says
 * so). They arrived with no licence file, and that matters more here than it
 * would on a hobby project — see LICENCE STATUS below.
 *
 * The numbers come from reading each file's glTF JSON chunk: accessor min/max
 * for extent, index counts for triangles, bufferView sizes for texture weight.
 * They are recorded because two of them are surprising enough to have already
 * caused a bug:
 *
 *  - `city_pack` has an extent of **1.25 million units**. It was being rendered
 *    inside a `<group scale={5}>` in a camera with a 200-unit far plane, which
 *    put a six-million-unit object in a scene that could not possibly show it.
 *  - `modern_apartment_house` carries **no textures at all** — 2.4 MB for 32k
 *    triangles. For distant silhouettes, where texture detail is invisible
 *    anyway, it is by far the most efficient thing in the folder.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * LICENCE STATUS: UNVERIFIED. Do not ship without resolving.
 *
 * Sketchfab hosts models under everything from CC0 to "editorial use only".
 * "Free to download" is not a licence. Only one filename here even claims a
 * licence (`japanese_building__cc0`), and a filename is not provenance.
 *
 * `free_london_skyscraper` is the sharpest problem: its node names identify it
 * as One Blackfriars, a real and recognisable London building. On a builder's
 * marketing site that is two risks at once — the model's own licence, and
 * RERA §12, which makes the promoter liable for visuals that misrepresent what
 * they build. It is deliberately not used.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type GlbAsset = {
  path: string;
  /** Largest bounding-box dimension, in the file's own units. */
  extent: number;
  /** File size in MB, for judging what a tier can afford. */
  sizeMB: number;
  triangles: number;
  /** Separate draw calls this model will cost. */
  materials: number;
  /** Texture payload in MB — wasted weight on anything seen at distance. */
  textureMB: number;
  notes: string;
};

export const GLB_CATALOG: Record<string, GlbAsset> = {
  nightCity: {
    path: "/glb/low_poly_night_city.glb",
    /* Measured with `scripts/measure-glb.mjs`, which transforms every
       primitive's bounding box through its full node chain — world size
       195.5 × 82.0 × 172.6, sitting at y = 0.86. */
    extent: 195.5,
    sizeMB: 9.5,
    triangles: 6076,
    materials: 1,
    textureMB: 9.4,
    notes:
      "The home hero. Already Y-up and grounded, so it needs no correction. " +
      "Almost all of its 9.5 MB is texture — 6k triangles across a single " +
      "material, which is one draw call for an entire skyline. Its one material " +
      "is fully emissive (factor [1,1,1] plus an emissive map), i.e. the night " +
      "lighting is baked, so this is the one model here that is NOT graded " +
      "toward the page ground and whose emissives are left at full strength. " +
      "Scene lights therefore do very little; the atmosphere comes from the " +
      "background, the fog and the bloom pass. It is also not modelled about " +
      "its own centre (x runs −121 → +74), so the hero recentres it.",
  },
  cityPack: {
    path: "/glb/city_pack.glb",
    extent: 1254882,
    sizeMB: 11.8,
    triangles: 111934,
    materials: 64,
    textureMB: 6.0,
    notes:
      "Absurd unit scale and 64 materials means 64 draw calls. Not used: the " +
      "same silhouette comes cheaper from modern_apartment_house.",
  },
  londonSkyscraper: {
    path: "/glb/free_london_skyscraper.glb",
    extent: 153,
    sizeMB: 44.8,
    triangles: 142742,
    materials: 20,
    textureMB: 32.1,
    notes:
      "Correctly scaled in metres and the best-looking model here, but it is " +
      "One Blackfriars — a real, identifiable London building. Not used; see " +
      "the licence note above.",
  },
  japaneseBuilding: {
    path: "/glb/japanese_building__cc0.glb",
    extent: 34.8,
    sizeMB: 3.3,
    triangles: 22626,
    materials: 8,
    textureMB: 1.9,
    notes:
      "Light and plausibly CC0, but architecturally Japanese — wrong vernacular " +
      "for an Ahmedabad skyline. Not used.",
  },
  apartmentHouse: {
    path: "/glb/modern_apartment_house_home_building.glb",
    extent: 1351.1,
    sizeMB: 2.4,
    triangles: 32320,
    materials: 20,
    textureMB: 0,
    notes:
      "The workhorse. Untextured, so it reads as a clean massing silhouette and " +
      "costs almost nothing. Repeated at varied scale and rotation it makes a " +
      "convincing middle-distance skyline.",
  },
  cityBlock: {
    path: "/glb/modern_city_block.glb",
    extent: 427.7,
    sizeMB: 24.1,
    triangles: 61243,
    materials: 7,
    textureMB: 18.1,
    notes:
      "Only 7 materials, so it is cheap to draw despite its size. Used once, " +
      "nearest the window, where its texture detail is actually visible.",
  },
  sovietResidential: {
    path: "/glb/soviet_residential_building_2.glb",
    extent: 308.1,
    sizeMB: 26.4,
    triangles: 24680,
    materials: 3,
    textureMB: 24.3,
    notes:
      "26 MB for 24k triangles — almost entirely texture, which is invisible at " +
      "the distance this would sit. Not used.",
  },
};

/**
 * Scale factor that brings a model to a target height in metres.
 *
 * These files disagree about units by four orders of magnitude, so nothing here
 * hardcodes a scale. Measuring at runtime means a swapped asset cannot silently
 * break the composition.
 */
export function normaliseToHeight(asset: GlbAsset, targetMetres: number): number {
  return targetMetres / asset.extent;
}
