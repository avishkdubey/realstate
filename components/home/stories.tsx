"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

import { SAMPLE, stories, type Story } from "@/lib/placeholders/stories";

/**
 * "Hear from people like you" — a rail of buyer stories, video where there is
 * one.
 *
 * Attribution is the whole mechanism. An anonymous quote carries no weight with
 * this audience and reads as invented (`CLAUDE.md` §2), which is why a card
 * shows a name and a project or it does not ship at all.
 *
 * The sample marker at the top is not decoration. Everything in
 * `lib/placeholders/stories.ts` is written placeholder content, and a review
 * page that looks like real reviews is a §12 exposure whatever the intent — so
 * the page says so, out loud, until `SAMPLE` is turned off.
 */
export function Stories() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false });
  const [selected, setSelected] = useState(0);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => setSelected(emblaApi.selectedScrollSnap());
    sync();
    emblaApi.on("select", sync).on("reInit", sync);
    return () => {
      emblaApi.off("select", sync).off("reInit", sync);
    };
  }, [emblaApi]);

  if (stories.length === 0) return null;

  return (
    <section className="section bg-surface-2" aria-labelledby="stories-heading">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-accent">Real stories, real trust</p>
            <h2 id="stories-heading" className="measure mt-6 text-h3">
              Hear from people like you.
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="eyebrow text-foreground mr-3 border-b border-current pb-1"
            >
              View all
            </Link>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous story"
              className="border-border hover:border-hairline-strong rounded-full border p-3 transition-colors"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next story"
              className="border-border hover:border-hairline-strong rounded-full border p-3 transition-colors"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        {SAMPLE && (
          <p className="border-border text-caption text-muted-foreground mt-8 border-l-2 py-2 pl-4">
            <span className="text-gold-soft">Sample content.</span> These are
            written placeholders showing the layout. No quote here is from a real
            customer, and none will be published until the client supplies
            attributed, permissioned testimonials.
          </p>
        )}

        <div className="mt-12 overflow-hidden" ref={emblaRef}>
          <div className="flex gap-8">
            {stories.map((story, index) => (
              <div
                key={story.id}
                className="min-w-0 flex-[0_0_88%] sm:flex-[0_0_62%] lg:flex-[0_0_42%]"
              >
                <StoryCard story={story} active={selected === index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StoryCard({ story, active }: { story: Story; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  /* A card scrolled out of view must not keep playing audio behind the one the
     visitor is now looking at.

     Only the element is touched here, never the state: pausing fires the
     video's own `pause` event, and the `onPause` handler below is what clears
     `playing`. Setting it from the effect as well would be a second source of
     truth for the same fact, and a cascading render on every carousel move. */
  useEffect(() => {
    if (active) return;
    const video = videoRef.current;
    if (video && !video.paused) video.pause();
  }, [active]);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setPlaying(true);
    void video.play();
  }, []);

  return (
    <figure className="border-border bg-surface-1 flex h-full flex-col border">
      <div className="relative aspect-video overflow-hidden">
        {story.videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={story.videoUrl}
              poster={story.image}
              playsInline
              controls={playing}
              onPause={() => setPlaying(false)}
              className="h-full w-full object-cover"
            />
            {!playing && (
              <button
                type="button"
                onClick={play}
                className="group absolute inset-0 grid place-items-center"
              >
                <span className="sr-only">
                  Watch {story.name}&rsquo;s story
                </span>
                <span
                  aria-hidden
                  className="bg-gold text-charcoal rounded-full p-5 transition-transform duration-300 group-hover:scale-110"
                >
                  <Play className="size-5 fill-current" />
                </span>
              </button>
            )}
          </>
        ) : (
          <>
            <Image
              src={story.image}
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1024px) 42vw, (min-width: 640px) 62vw, 88vw"
              className="object-cover"
            />
            {/* Honest empty state rather than a dead play button. The slot is
                built; the footage is the client's to supply. */}
            <span className="text-ivory/60 bg-charcoal/60 eyebrow absolute bottom-4 left-4 rounded-sm px-3 py-2 backdrop-blur-sm">
              Video to follow
            </span>
          </>
        )}
      </div>

      <blockquote className="flex-1 p-8">
        <p className="text-muted-foreground">&ldquo;{story.quote}&rdquo;</p>
      </blockquote>

      <figcaption className="border-border border-t px-8 py-6">
        <p className="text-small">{story.name}</p>
        <p className="eyebrow text-muted-foreground mt-2">{story.project}</p>
      </figcaption>
    </figure>
  );
}
