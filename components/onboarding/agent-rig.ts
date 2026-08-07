"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The behaviour an agent avatar has to provide, whatever it is made of.
 *
 * The primitives placeholder and the real Ready Player Me GLB both drive this
 * same shape, which is what lets the gate, the audio pipeline and the pointer
 * tracking all be built and tested before any asset exists.
 */
export type AgentRig = {
  /** Damped, clamped look direction in −1..1. Eyes lead, head follows. */
  look: THREE.Vector2;
  /** 0→1 mouth openness, driven by audio amplitude. */
  mouth: number;
  /** 0→1 eyelid closure. */
  blink: number;
};

/* Module scope. Nothing in the per-frame path allocates — CLAUDE.md §7. */
const _euler = new THREE.Euler();
const _quat = new THREE.Quaternion();

/**
 * Blink timing.
 *
 * A real blink is ~210ms and irregular. Both matter: a metronomic blink is one
 * of the strongest "this is a puppet" signals there is, which is why the next
 * one is scheduled from a random interval rather than a fixed one.
 */
const BLINK_CLOSE = 60;
const BLINK_HOLD = 40;
const BLINK_OPEN = 110;
const BLINK_TOTAL = BLINK_CLOSE + BLINK_HOLD + BLINK_OPEN;

export function useBlinkTimer() {
  const state = useRef({ next: 1200, elapsed: 0, phase: 0 });

  /** Advances the blink clock and returns 0→1 eyelid closure. */
  return (deltaMs: number): number => {
    const s = state.current;
    s.elapsed += deltaMs;

    if (s.phase === 0) {
      if (s.elapsed < s.next) return 0;
      s.phase = 1;
      s.elapsed = 0;
    }

    const t = s.elapsed;
    if (t >= BLINK_TOTAL) {
      s.phase = 0;
      s.elapsed = 0;
      // 2.4–6s, with a 15% chance of a quick double-blink.
      s.next = Math.random() < 0.15 ? 180 : 2400 + Math.random() * 3600;
      return 0;
    }

    if (t < BLINK_CLOSE) return t / BLINK_CLOSE;
    if (t < BLINK_CLOSE + BLINK_HOLD) return 1;
    return 1 - (t - BLINK_CLOSE - BLINK_HOLD) / BLINK_OPEN;
  };
}

/**
 * Micro-saccades — the highest value-per-line detail in the whole avatar.
 *
 * Human eyes never track smoothly across a static scene; they jump. An eye that
 * follows a cursor perfectly smoothly is the single clearest uncanny tell, and
 * about fifteen lines of jitter removes it.
 */
export function useSaccade() {
  const state = useRef({ next: 1800, elapsed: 0, offsetX: 0, offsetY: 0, holding: 0 });

  return (deltaMs: number, out: THREE.Vector2) => {
    const s = state.current;
    s.elapsed += deltaMs;

    if (s.holding > 0) {
      s.holding -= deltaMs;
      if (s.holding <= 0) {
        s.offsetX = 0;
        s.offsetY = 0;
      }
    } else if (s.elapsed >= s.next) {
      s.elapsed = 0;
      s.next = 1400 + Math.random() * 1800;
      s.offsetX = (Math.random() - 0.5) * 0.24;
      s.offsetY = (Math.random() - 0.5) * 0.16;
      s.holding = 80 + Math.random() * 60;
    }

    out.x += s.offsetX;
    out.y += s.offsetY;
  };
}

/**
 * Applies a clamped look rotation to a bone, on top of whatever pose it already
 * has.
 *
 * Multiplied onto the existing quaternion rather than replacing it. `lookAt`
 * would overwrite the bone's rest orientation, which on a skinned rig means a
 * snapped neck — this is the single most common way web avatars end up staring
 * through their own shoulder.
 */
export function applyLook(
  bone: THREE.Object3D,
  rest: THREE.Quaternion,
  look: THREE.Vector2,
  yawLimit: number,
  pitchLimit: number,
) {
  _euler.set(-look.y * pitchLimit, look.x * yawLimit, 0, "XYZ");
  _quat.setFromEuler(_euler);
  bone.quaternion.copy(rest).multiply(_quat);
}

/** Degrees to radians, for readable limit constants. */
export const deg = (value: number) => (value * Math.PI) / 180;

/**
 * How the turn is split across the body.
 *
 * Rotating only the head gives an owl. Spreading it down the spine reads as a
 * person turning to look at you. Totals ~29° of yaw, comfortably inside the
 * human range (head ≤45°, eyes ≤35°).
 */
export const LOOK_LIMITS = {
  spine: { yaw: deg(4), pitch: deg(2) },
  neck: { yaw: deg(9), pitch: deg(6) },
  head: { yaw: deg(16), pitch: deg(11) },
  /** Eye morph influence is 0..1, not radians. Never drive these to 1. */
  eye: 0.7,
};

/** Captures a bone's rest orientation once, so look deltas compose onto it. */
export function useRestPose() {
  const rest = useRef(new Map<THREE.Object3D, THREE.Quaternion>());

  useEffect(() => {
    const captured = rest.current;
    return () => captured.clear();
  }, []);

  return (bone: THREE.Object3D): THREE.Quaternion => {
    let stored = rest.current.get(bone);
    if (!stored) {
      stored = bone.quaternion.clone();
      rest.current.set(bone, stored);
    }
    return stored;
  };
}
