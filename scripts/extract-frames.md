# Hero frame sequence

The home hero is a scroll-scrubbed image sequence
(`components/hero/scroll-frame-sequence.tsx`). Scroll position selects which
still is painted to a canvas, which scrubs far more smoothly than seeking a
`<video>` — seeking forces a decode and stutters badly on mobile.

## Current source

`scripts/generate-frames.mjs` synthesises a slow push-in across the client's
aerial render (`public/images/projects/bird-view.webp`). Run it with:

```bash
node scripts/generate-frames.mjs
```

It writes 36 frames at 1280×720 into `public/frames/hero/`, about 4.7MB total.

## Replacing it with real footage

When the client supplies a drone flight or walkthrough, use that instead — a
real camera move through the building is the whole point of this technique.

```bash
# 1. Trim to the segment you want (here, 6 seconds from 00:12)
ffmpeg -ss 00:00:12 -t 6 -i drone.mp4 -c copy trimmed.mp4

# 2. Decode to numbered stills at 6fps → 36 frames from 6 seconds
ffmpeg -i trimmed.mp4 -vf "fps=6,scale=1280:-2" -q:v 3 frames/%03d.png

# 3. Encode to WebP and drop into place
npx sharp-cli -i "frames/*.png" -o public/frames/hero/ \
  --format webp --quality 52
```

Then update `FRAME_COUNT` where `<ScrollFrameSequence>` is used in
`app/page.tsx` to match the number of files written.

## Rules worth keeping

- **36–60 frames.** Fewer looks steppy; more costs weight for motion nobody
  perceives. 36 over a 250vh scroll is roughly one frame per 7vh.
- **Keep the total under ~5MB.** The sequence is decoration and loads on idle
  after first paint, but it is still someone's data.
- **Frame 1 is the poster.** It renders immediately as a plain `<img>`, so the
  hero is never empty while frames decode. Keep it representative.
- **Do not add motion the visitor cannot control.** The sequence is scrubbed by
  scroll and does nothing on its own.
- The component already skips the whole sequence for `prefers-reduced-motion`,
  Data Saver and 2G connections, holding the poster instead.
