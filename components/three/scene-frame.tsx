"use client";

import {
  Suspense,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

import { HEX } from "@/lib/three-palette";
import { dprRange, qualityTier, type QualityTier } from "@/lib/webgl";

/**
 * The house canvas.
 *
 * Every showcase scene mounts through this so they share one look: the same
 * tone mapping, the same studio environment, the same grade. Scenes that each
 * invent their own lighting are the main reason a site full of 3D ends up
 * looking like a site full of demos.
 *
 * Two decisions worth stating, because both look like omissions:
 *
 * **No `<Environment preset="...">`.** drei's presets fetch an HDRI from its
 * CDN at runtime — an external dependency on the critical path of the thing the
 * page exists for, and a warm outdoor bounce that fights the gallery look. The
 * environment here is built from `<Lightformer>` rectangles instead: fully
 * procedural, zero bytes, baked once (`frames={1}`), and controllable in a way
 * a photograph is not. On glazing and polished metal — which is most of what
 * these scenes are made of — the shape of the reflected light *is* the render.
 *
 * **No shadows by default.** They are opt-in per scene, because a shadow camera
 * fitted to the wrong bounds costs a lot and produces mush.
 */

/** Hardware capability does not change mid-session, so there is nothing to
    subscribe to. Declared at module scope so the reference stays stable. */
const noopSubscribe = () => () => {};

/** Lightformer takes CSS colour strings, the palette stores hex numbers. */
const hex = (value: number) => `#${value.toString(16).padStart(6, "0")}`;

export type SceneFrameProps = {
  /** A function form receives the resolved quality tier, which scenes need for
      instance counts and shadow decisions. */
  children: ReactNode | ((tier: QualityTier) => ReactNode);
  /** Initial camera. Scenes that animate the camera take over from here. */
  camera?: { position: [number, number, number]; fov?: number };
  /** Transparent canvas, for compositing over a CSS background. */
  transparent?: boolean;
  /** Distance fog, matched to the page ground so the scene fades into it. */
  fog?: { near: number; far: number } | false;
  /**
   * Overrides the clear colour and the fog tint, which are otherwise both the
   * page ground.
   *
   * Matching the page is right for a scene that has to sit invisibly inside the
   * document. A night scene is the exception: distant geometry fading to pure
   * #0d0d0d reads as the model being cut off, where fading to a deep navy reads
   * as a sky. Fog and background must move together or the horizon shows as a
   * band.
   */
  background?: number;
  className?: string;
  /** Extra effects beyond the house grade. */
  effects?: (tier: QualityTier) => ReactNode;
};

export function SceneFrame({
  children,
  camera = { position: [0, 2, 8], fov: 38 },
  transparent = false,
  fog = { near: 18, far: 60 },
  background = HEX.ground,
  className,
  effects,
}: SceneFrameProps) {
  /* Resolved on the client only — reading `navigator` during render would give
     the server a different answer than the browser. The subscribe function is a
     no-op because hardware does not change mid-session; `getSnapshot` returns a
     string, so React's identity check compares by value and cannot loop. */
  const tier = useSyncExternalStore(
    noopSubscribe,
    qualityTier,
    () => null as QualityTier | null,
  );

  /* R3F measures its container with a ResizeObserver and will not build its
     root until that measurement is non-zero. When the first measurement comes
     back zero — a `dynamic(ssr:false)` scene inside a `sticky h-[100svh]`, or a
     canvas mounted the instant a full-screen overlay opens — and no resize ever
     follows, R3F waits forever. The symptom is brutal to diagnose: the <canvas>
     exists, is correctly sized in CSS, throws nothing, and not one child of the
     Canvas ever mounts. A bright red sphere at the origin renders as nothing.

     A single nudge is not enough. On a canvas that mounts during page load the
     one rAF can land *before* R3F has attached its observer, so the event goes
     nowhere. Firing across the first second covers both the early case and the
     late-layout case; they are four events, and they stop as soon as the
     component unmounts. */
  useEffect(() => {
    const nudge = () => window.dispatchEvent(new Event("resize"));
    const frame = requestAnimationFrame(nudge);
    const timers = [120, 400, 900].map((ms) => window.setTimeout(nudge, ms));
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (tier === null) return null;

  return (
    <Canvas
      className={className}
      dpr={dprRange(tier)}
      camera={{ position: camera.position, fov: camera.fov ?? 38, near: 0.1, far: 200 }}
      gl={{
        antialias: tier !== "low",
        alpha: transparent,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        // ACES is what stops bright metal and lit windows clipping to flat
        // white; the slight exposure lift keeps the near-black ground from
        // crushing everything into it.
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        // ACES rolls highlights off hard, so the exposure has to be pushed
        // past 1 for a dark set to read as lit rather than merely underexposed.
        gl.toneMappingExposure = 1.45;
      }}
    >
      {!transparent && <color attach="background" args={[background]} />}
      {fog && (
        /* Aerial perspective. Without it a tower has no sense of scale —
           everything reads as a tabletop model. Tinted to match the background
           exactly, so distance dissolves into the sky with no visible seam. */
        <fog attach="fog" args={[background, fog.near, fog.far]} />
      )}

      {/* Two boundaries, not one. Sharing a boundary means anything the
          environment does while it settles holds the entire scene unmounted —
          which showed up as a canvas that cleared to the background colour and
          never drew geometry, with no error to point at. The environment is
          atmosphere; the scene must never wait on it. */}
      <Suspense fallback={null}>
        <StudioEnvironment />
      </Suspense>
      <Suspense fallback={null}>
        {typeof children === "function" ? children(tier) : children}
      </Suspense>

      {effects?.(tier)}
    </Canvas>
  );
}

/**
 * A procedural studio, built from emissive rectangles.
 *
 * Three lights doing three jobs: a broad cool sky panel overhead for ambient
 * shape, a narrow bright strip camera-right that becomes the highlight running
 * down glass and metal edges, and a warm low panel standing in for city glow
 * off the ground. `--navy` finally earns its keep as the sky tint — it is
 * defined in the design tokens and used nowhere in the DOM.
 */
function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      {/* Sky. Broad, cool and dim — it does the ambient shaping. */}
      <Lightformer
        intensity={2.4}
        color={hex(HEX.navy)}
        form="rect"
        position={[0, 14, -6]}
        scale={[30, 18, 1]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      {/* The money light: a narrow bright strip camera-right. This is what
          becomes the highlight running down glass and metal edges, and it is
          the single largest contributor to whether the scene looks expensive. */}
      <Lightformer
        intensity={9}
        color="#ffffff"
        form="rect"
        position={[9, 8, 6]}
        scale={[2, 24, 1]}
        rotation={[0, -Math.PI / 3.2, 0]}
      />
      {/* City glow off the ground, warm and low. */}
      <Lightformer
        intensity={3}
        color={hex(HEX.bronze)}
        form="rect"
        position={[-9, 1, 4]}
        scale={[22, 4, 1]}
        rotation={[0, Math.PI / 3, 0]}
      />
    </Environment>
  );
}

/**
 * The house grade.
 *
 * Bloom on lit windows and gold trim, a vignette to pull the eye in, and a
 * little grain so flat dark areas do not band on cheap panels. Deliberately
 * excludes two things `CLAUDE.md` §7 suggests: SSR, which is expensive and
 * artefacts badly on instanced geometry, and chromatic aberration, which reads
 * as a glitch effect rather than as photography on architecture.
 *
 * Mounted only on the high tier — postprocessing is a full-screen pass per
 * effect, and on a warm phone it is the first thing that should go.
 */
export function HouseGrade({ tier }: { tier: QualityTier }) {
  const [effects, setEffects] = useState<ReactNode>(null);

  useEffect(() => {
    if (tier !== "high") return;
    let cancelled = false;

    void import("@react-three/postprocessing").then(
      ({ EffectComposer, Bloom, Vignette, Noise }) => {
        if (cancelled) return;
        setEffects(
          <EffectComposer>
            <Bloom luminanceThreshold={0.9} intensity={0.35} mipmapBlur />
            <Vignette offset={0.3} darkness={0.6} />
            <Noise opacity={0.025} premultiply />
          </EffectComposer>,
        );
      },
    );

    return () => {
      cancelled = true;
    };
  }, [tier]);

  return <>{effects}</>;
}
