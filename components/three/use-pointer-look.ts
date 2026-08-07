"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";

/**
 * A damped, normalised pointer position that scenes can lean on.
 *
 * Two reasons this exists rather than reading R3F's `state.pointer` directly:
 *
 * 1. `state.pointer` only updates while the cursor is over the canvas. Both the
 *    construction hero and the onboarding gate put real DOM — an H1, CTAs, a
 *    name input — on top of their canvas, so the cursor spends much of its time
 *    over a child element and the scene would freeze mid-turn.
 * 2. Phones have no pointer at all. Reading device orientation gives them the
 *    same parallax, which matters now that the showcase scenes run on mobile.
 *
 * The store is module-scope and window-level, so any number of scenes share one
 * set of listeners.
 */

const raw = { x: 0, y: 0 };
let listeners = 0;
let detach: (() => void) | undefined;

function attach() {
  if (listeners++ > 0) return;

  const onMove = (event: PointerEvent) => {
    raw.x = (event.clientX / window.innerWidth) * 2 - 1;
    raw.y = -((event.clientY / window.innerHeight) * 2 - 1);
  };
  // Cursor gone means "nothing to look at" — recentre rather than staying
  // frozen mid-glance, which reads as a model that has stopped working.
  const onLeave = () => {
    raw.x = 0;
    raw.y = 0;
  };
  const onTilt = (event: DeviceOrientationEvent) => {
    if (event.gamma === null || event.beta === null) return;
    // Heavily attenuated: a phone is never held still, and 1:1 tilt is nausea.
    raw.x = THREE.MathUtils.clamp(event.gamma / 45, -1, 1);
    raw.y = THREE.MathUtils.clamp((event.beta - 45) / 45, -1, 1);
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerleave", onLeave, { passive: true });
  window.addEventListener("deviceorientation", onTilt, { passive: true });

  detach = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("deviceorientation", onTilt);
  };
}

function release() {
  if (--listeners > 0) return;
  detach?.();
  detach = undefined;
}

export type PointerLookOptions = {
  /** Damping rate. Higher follows the cursor more eagerly. */
  lambda?: number;
  /** Scales the output. 0.3 is a hint of movement, 1 is the full sweep. */
  strength?: number;
};

/**
 * A ref holding the damped pointer position, updated in place every frame.
 *
 * Read it as `look.current.x` inside your own `useFrame`. A ref rather than a
 * bare Vector2 because a ref is the one place React sanctions holding something
 * mutable — and mutation is the whole point here. `CLAUDE.md` §7 is explicit
 * that allocating inside `useFrame` is what turns a smooth scene into a
 * stuttering one, so this vector is created once and recycled forever, the same
 * way `master-plan-3d.tsx` pre-allocates its colour palette.
 */
export function usePointerLook({
  lambda = 3.5,
  strength = 1,
}: PointerLookOptions = {}): RefObject<THREE.Vector2> {
  const reducedMotion = useReducedMotionPreference();
  const look = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    attach();
    return release;
  }, []);

  // Priority -1 so the damped value is settled before any scene logic reads it.
  useFrame((_, delta) => {
    const value = look.current;
    if (reducedMotion) {
      value.set(0, 0);
      return;
    }
    // `damp` is framerate-independent, unlike a raw lerp with a fixed alpha —
    // which would make the follow feel different on a 120Hz display.
    value.x = THREE.MathUtils.damp(value.x, raw.x * strength, lambda, delta);
    value.y = THREE.MathUtils.damp(value.y, raw.y * strength, lambda, delta);
  }, -1);

  return look;
}
