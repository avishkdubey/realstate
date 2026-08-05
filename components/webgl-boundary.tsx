"use client";

import { Component, type ReactNode } from "react";

/**
 * Catches anything a WebGL subtree throws.
 *
 * A lost context, a driver fault or an out-of-memory kill inside a Three.js
 * scene would otherwise unmount the whole route. Every scene on this site sits
 * over content that already works, so the correct response to a failure is to
 * render nothing and let that content stand.
 */
export class WebGLBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Worth knowing about, never worth interrupting the visitor for.
    console.warn("[webgl] scene failed, falling back", error);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
