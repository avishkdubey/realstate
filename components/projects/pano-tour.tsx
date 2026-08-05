"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 360° tour, rendered with Three.js rather than Pannellum.
 *
 * The stack already carries Three for the hero and the master plan, and an
 * equirectangular sphere is about forty lines of it — pulling in a second
 * renderer to do the same job would cost another bundle for no gain.
 *
 * This matters most for NRI buyers, who make decisions without ever standing
 * in the building (CLAUDE.md §2). Loads only when scrolled into view.
 */
export function PanoTour({
  src,
  label,
}: {
  /** Equirectangular (2:1) panorama image. */
  src: string;
  label: string;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  // Only start downloading the renderer and the panorama once it is near view.
  useEffect(() => {
    const node = mount.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !mount.current) return;

    const node = mount.current;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const THREE = await import("three");
        if (disposed) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          72,
          node.clientWidth / node.clientHeight,
          0.1,
          100,
        );
        camera.position.set(0, 0, 0.01);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(node.clientWidth, node.clientHeight);
        node.appendChild(renderer.domElement);

        // A sphere turned inside out is the whole trick.
        const geometry = new THREE.SphereGeometry(50, 60, 40);
        geometry.scale(-1, 1, 1);

        const texture = await new THREE.TextureLoader().loadAsync(src);
        if (disposed) {
          texture.dispose();
          geometry.dispose();
          renderer.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Drag to look around. Reused scalars — nothing allocated per frame.
        let lon = 0;
        let lat = 0;
        let dragging = false;
        let lastX = 0;
        let lastY = 0;

        const onDown = (event: PointerEvent) => {
          dragging = true;
          lastX = event.clientX;
          lastY = event.clientY;
        };
        const onMove = (event: PointerEvent) => {
          if (!dragging) return;
          lon -= (event.clientX - lastX) * 0.15;
          lat += (event.clientY - lastY) * 0.15;
          lat = Math.max(-85, Math.min(85, lat));
          lastX = event.clientX;
          lastY = event.clientY;
        };
        const onUp = () => {
          dragging = false;
        };

        node.addEventListener("pointerdown", onDown);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);

        const onResize = () => {
          camera.aspect = node.clientWidth / node.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(node.clientWidth, node.clientHeight);
        };
        window.addEventListener("resize", onResize);

        let frame = 0;
        let running = true;

        const render = () => {
          if (!running) return;
          // Idle drift when nobody is dragging, so the view reads as live.
          if (!dragging) lon += 0.02;

          const phi = THREE.MathUtils.degToRad(90 - lat);
          const theta = THREE.MathUtils.degToRad(lon);
          camera.lookAt(
             500 * Math.sin(phi) * Math.cos(theta),
             500 * Math.cos(phi),
             500 * Math.sin(phi) * Math.sin(theta),
          );
          renderer.render(scene, camera);
          frame = requestAnimationFrame(render);
        };
        frame = requestAnimationFrame(render);

        // Park the loop when the tab is hidden — no point burning a GPU on a
        // panorama nobody is looking at.
        const onVisibility = () => {
          if (document.hidden) {
            running = false;
            cancelAnimationFrame(frame);
          } else if (!running) {
            running = true;
            frame = requestAnimationFrame(render);
          }
        };
        document.addEventListener("visibilitychange", onVisibility);

        cleanup = () => {
          running = false;
          cancelAnimationFrame(frame);
          node.removeEventListener("pointerdown", onDown);
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          window.removeEventListener("resize", onResize);
          document.removeEventListener("visibilitychange", onVisibility);
          texture.dispose();
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [visible, src]);

  return (
    <figure className="m-0">
      <div
        ref={mount}
        className="bg-charcoal aspect-[2/1] w-full cursor-grab touch-none overflow-hidden border border-border active:cursor-grabbing"
        role="img"
        aria-label={`360-degree view: ${label}`}
      />
      <figcaption className="text-caption text-muted-foreground mt-3">
        {failed
          ? "The 360° view could not load on this device."
          : "Drag to look around. Artist's impression — representational only."}
      </figcaption>
    </figure>
  );
}
