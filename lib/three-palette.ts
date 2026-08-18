import * as THREE from "three";

/**
 * The scene palette, in one place.
 *
 * Three.js cannot read CSS custom properties, so every scene used to carry its
 * own literal hexes — `master-plan-3d.tsx` and the old hero scene had drifted
 * to slightly different greys for the same job. These are the same values the
 * DOM tokens in `app/globals.css` resolve to; when one moves, move the other.
 *
 * `THREE.Color` instances are constructed once at module scope and frozen into
 * the export. Never mutate one in a frame loop — clone it, or lerp a material's
 * own colour toward it, as `master-plan-3d.tsx` does.
 */

/** Raw hex numbers, for anywhere a Color instance is the wrong shape. */
export const HEX = {
  /** --surface-0, the page ground. Scene backgrounds and fog match it. */
  ground: 0x0d0d0d,
  /** --surface-1 */
  surface: 0x141414,
  /* Concrete reads *much* lighter than instinct suggests once it is sitting on
     a near-black ground. The first pass used the old hero's #2a2622 and the
     tower vanished into the page — on a dark set the subject has to carry the
     luminance, because there is no bounce coming back off anything. */
  concrete: 0x59544c,
  /** A step lighter, for the column grid that catches the key light. */
  concreteLit: 0x736c62,
  /** Cool near-black with a blue cast — glass reads as glass only if it is
      bluer than the concrete around it. */
  glass: 0x10161c,
  /** --ivory. The key light, and any near-white surface. */
  ivory: 0xf5f1e8,
  /** --gold */
  gold: 0xb99c6b,
  /** --gold-soft */
  goldSoft: 0xc9ae7c,
  /** --bronze, the secondary metallic. */
  bronze: 0xa8834d,
  /** --navy. Unused in the DOM; here it tints the sky and the fill light. */
  navy: 0x0a192f,
  /** Warm interior light, for windows that have been switched on. */
  lamp: 0xffb877,
} as const;

/**
 * The night set, for the hero skyline.
 *
 * Separate from `HEX` because these are lighting values rather than surface
 * colours, and because a night scene deliberately does *not* fade to the page
 * ground: distant geometry dissolving into #0d0d0d reads as the model being cut
 * off, where dissolving into a deep navy reads as a sky. `sky` is therefore the
 * scene background and the fog tint as well as the ambient tint — all three
 * must be the same value or the horizon shows as a band.
 */
export const NIGHT = {
  /** Background, fog and ambient. A blue deep enough to still read as dark. */
  sky: 0x0b1220,
  /** Moonlight — cool, and only strong enough to separate silhouettes. */
  moon: 0x9fb6de,
  /** Warm sodium glow thrown up off the streets. */
  glow: 0xffa457,
  /** The hemisphere light's lower half: street bounce, not sky. */
  streetBounce: 0x1a1410,
  /** Ground plane. Near-black, with enough sheen to catch the glow. */
  ground: 0x0a0d14,
} as const;

export const COLORS = {
  ground: new THREE.Color(HEX.ground),
  surface: new THREE.Color(HEX.surface),
  concrete: new THREE.Color(HEX.concrete),
  concreteLit: new THREE.Color(HEX.concreteLit),
  glass: new THREE.Color(HEX.glass),
  ivory: new THREE.Color(HEX.ivory),
  gold: new THREE.Color(HEX.gold),
  goldSoft: new THREE.Color(HEX.goldSoft),
  bronze: new THREE.Color(HEX.bronze),
  navy: new THREE.Color(HEX.navy),
  lamp: new THREE.Color(HEX.lamp),
} as const;
