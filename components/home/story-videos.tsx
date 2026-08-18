"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

import {
  CHANNEL_URL,
  channelVideos,
  embedUrl,
  thumbnailUrl,
} from "@/lib/channel-videos";

/**
 * The client's own YouTube Shorts, as a swipeable rail.
 *
 * **Every tile is a facade, not an iframe.** A YouTube embed pulls well over a
 * megabyte of script and sets up its own timers and observers; six of them
 * mounted eagerly on a page that already carries a WebGL tour would be by far
 * the heaviest thing on it, and five of the six would never be watched. So a
 * tile is a thumbnail and a play button until it is clicked, and only then does
 * the real player mount — and only for the tile that was clicked.
 *
 * That also makes playback the consent event: nothing is requested from Google
 * until the visitor deliberately asks for it, and the embed is on
 * `youtube-nocookie.com` when it does mount.
 *
 * Portrait tiles, because these are Shorts. Cropping 9:16 footage into a 16:9
 * card would cut the subject's head off.
 */
export function StoryVideos() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  /** Only one player at a time — the id of the tile that has been opened. */
  const [playing, setPlaying] = useState<string | null>(null);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    sync();
    emblaApi.on("select", sync).on("reInit", sync);
    return () => {
      emblaApi.off("select", sync).off("reInit", sync);
    };
  }, [emblaApi]);

  if (channelVideos.length === 0) return null;

  return (
    <div className="mt-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-accent">From our channel</p>
          <h3 className="measure mt-4 text-h4">Watch their stories.</h3>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow text-foreground mr-3 border-b border-current pb-1"
          >
            All videos
          </a>
          <button
            type="button"
            onClick={prev}
            disabled={!canPrev}
            aria-label="Previous videos"
            className="border-border hover:border-hairline-strong rounded-full border p-3 transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!canNext}
            aria-label="Next videos"
            className="border-border hover:border-hairline-strong rounded-full border p-3 transition-colors disabled:opacity-30"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-10 overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {channelVideos.map((video) => (
            <figure
              key={video.id}
              className="min-w-0 flex-[0_0_62%] sm:flex-[0_0_38%] lg:flex-[0_0_22%]"
            >
              <div className="border-hairline bg-surface-1 relative aspect-9/16 overflow-hidden rounded-lg border">
                {playing === video.id ? (
                  <iframe
                    src={embedUrl(video.id)}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlaying(video.id)}
                    className="group absolute inset-0 block"
                  >
                    <span className="sr-only">Play: {video.title}</span>
                    <Image
                      src={thumbnailUrl(video.id)}
                      alt=""
                      aria-hidden
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 38vw, 62vw"
                      /* `hqdefault` is a 4:3 frame with the Short letterboxed
                         inside it, so it has to be cropped to fill a portrait
                         tile rather than fitted. */
                      className="object-cover transition-transform duration-700 ease-[var(--ease-entrance)] group-hover:scale-105"
                    />
                    <span
                      aria-hidden
                      className="from-charcoal absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
                    />
                    <span
                      aria-hidden
                      className="bg-gold text-charcoal absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110"
                    >
                      <Play className="size-5 fill-current" />
                    </span>
                  </button>
                )}
              </div>

              <figcaption className="text-small text-muted-foreground mt-4">
                {video.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
