"use client";

import { Component, type ReactNode } from "react";

/**
 * Catches anything a WebGL subtree throws, and notices when the GPU drops it.
 *
 * A lost context, a driver fault or an out-of-memory kill inside a Three.js
 * scene would otherwise unmount the whole route. Every scene on this site sits
 * over content that already works, so the correct response to a failure is to
 * render the fallback and let that content stand.
 *
 * The `webglcontextlost` listener matters more than it looks. That event does
 * not throw, so an error boundary alone never sees it — the canvas simply stops
 * updating and the visitor is left staring at a frozen last frame or a black
 * rectangle. It is also not a rare event now that three heavy scenes can exist
 * on one journey: browsers cap how many live contexts a page may hold, and a
 * warm phone will drop one to save itself.
 *
 * Context loss is recoverable, so it is tracked separately from a thrown error:
 * if the browser restores the context we clear the fallback and let the scene
 * remount. A thrown error is treated as terminal, because whatever produced it
 * will almost certainly produce it again.
 */
export class WebGLBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { failed: boolean; contextLost: boolean }
> {
  state = { failed: false, contextLost: false };
  private root: HTMLDivElement | null = null;

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Worth knowing about, never worth interrupting the visitor for.
    console.warn("[webgl] scene failed, falling back", error);
  }

  componentDidMount() {
    // Capture phase: the event fires on the <canvas>, which is a descendant,
    // and it does not bubble.
    this.root?.addEventListener("webglcontextlost", this.onLost, true);
    this.root?.addEventListener("webglcontextrestored", this.onRestored, true);
  }

  componentWillUnmount() {
    this.root?.removeEventListener("webglcontextlost", this.onLost, true);
    this.root?.removeEventListener(
      "webglcontextrestored",
      this.onRestored,
      true,
    );
  }

  private onLost = (event: Event) => {
    // Preventing the default is what makes restoration possible at all.
    event.preventDefault();
    console.warn("[webgl] context lost, showing fallback");
    this.setState({ contextLost: true });
  };

  private onRestored = () => {
    console.info("[webgl] context restored");
    this.setState({ contextLost: false });
  };

  render() {
    const down = this.state.failed || this.state.contextLost;
    return (
      /* `display: contents` is load-bearing. This wrapper exists only to catch
         the context events, which do not bubble — but as a normal box it is a
         zero-height static div between the scene and whatever sizes it, and R3F
         measured 300×150 through it and never recovered. Taking it out of
         layout keeps the listeners and gives the canvas its real parent back. */
      <div ref={(node) => void (this.root = node)} style={{ display: "contents" }}>
        {down ? (this.props.fallback ?? null) : this.props.children}
      </div>
    );
  }
}
