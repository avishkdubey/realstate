"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";

/**
 * A wide landscape band of the city, moving.
 *
 * ── DROPPING IN THE FOOTAGE ────────────────────────────────────────────────
 * Put a file at `public/videos/city-timelapse.mp4` (and optionally `.webm`)
 * and this band starts playing it. Nothing else needs to change: the component
 * probes for the file at runtime and keeps the still if it is not there, so the
 * repository stays shippable with no video committed and the section never
 * renders as a black rectangle.
 *
 * Recommended encode — 1920×1080, ~8–12s, no audio track, under ~3 MB:
 *
 *   ffmpeg -i source.mov -t 10 -an -vf "scale=1920:-2,fps=25" \
 *     -c:v libx264 -crf 26 -preset slow -movflags +faststart \
 *     public/videos/city-timelapse.mp4
 *
 * **Licensing is not optional here.** This is a commercial marketing site for a
 * real builder, so a clip pulled off a search result is a copyright exposure
 * and — if it shows a skyline that is not Ahmedabad — a RERA §12 exposure as
 * well, because the promoter is liable for what an advertisement implies. Use
 * the client's own drone footage, or a clip whose licence explicitly covers
 * commercial use. That is why no video is committed here: it is the one part of
 * this section that cannot be filled in with a placeholder.
 * ───────────────────────────────────────────────────────────────────────────
 *
 * Until then the still does the work, with a very slow scale so the band is not
 * dead. Reduced motion stops both the video and the drift.
 */
const VIDEO_SRC = "/videos/city-timelapse.mp4";

export function CityTimelapse() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    if (reducedMotion) return;

    /* A HEAD request rather than mounting a <video> and waiting for it to
       error: an unresolvable <video> in the DOM logs a console error on every
       load and, in some browsers, paints a broken-media frame before it gives
       up. Asking first costs one cheap request and keeps the fallback clean. */
    let cancelled = false;
    fetch(VIDEO_SRC, { method: "HEAD" })
      .then((response) => {
        if (!cancelled && response.ok) setHasVideo(true);
      })
      .catch(() => {
        /* No file, or offline. The still is already correct. */
      });

    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  return (
    <section aria-labelledby="timelapse-heading" className="relative">
      <div className="relative h-[60svh] min-h-[420px] overflow-hidden md:h-[72svh]">
        {/* Always mounted and always underneath — it is the video's poster as
            much as it is the fallback, so there is never an empty frame. */}
        <Image
          src="/images/projects/ahmedabad-skyline.webp"
          alt="Ahmedabad, looking west across the city"
          fill
          sizes="100vw"
          className={`object-cover ${
            reducedMotion ? "" : "animate-[drift_28s_ease-in-out_infinite_alternate]"
          }`}
        />

        {hasVideo && (
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            poster="/images/projects/ahmedabad-skyline.webp"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div
          aria-hidden
          className="from-surface-0 via-surface-0/20 to-surface-0 absolute inset-0 bg-gradient-to-b"
        />

        <div className="relative flex h-full items-end">
          <div className="container-page pb-16">
            <p className="eyebrow text-gold-soft">Ahmedabad</p>
            <h2
              id="timelapse-heading"
              className="text-ivory measure mt-6 text-h3 leading-[1.08]"
            >
              A city that has grown west for thirty years, and is still going.
            </h2>
            <p className="measure text-ivory/70 mt-6">
              SG Highway, Shilaj, Shela, Bopal, Chandkheda — we have built
              through every one of those corridors as they turned from fields
              into addresses.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
