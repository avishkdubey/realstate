/**
 * Generates the hero frame sequence.
 *
 * The scroll-scrubbed hero (`components/hero/scroll-frame-sequence.tsx`) plays
 * numbered stills. When the client supplies a drone or walkthrough video, the
 * frames should come from that — see `scripts/extract-frames.md`.
 *
 * Until then this synthesises a slow cinematic push-in across the client's own
 * aerial render, which is a real camera move rather than a static image, and
 * gives the sequence something honest to play.
 *
 *   node scripts/generate-frames.mjs
 */
import sharp from "sharp";
import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

const SOURCE = "public/images/projects/bird-view.webp";
const OUT_DIR = "public/frames/hero";

const FRAME_COUNT = 36;
const WIDTH = 1280;
const HEIGHT = 720;

/** Fraction of the source still visible at the end of the move. */
const END_ZOOM = 0.78;
/** How far the framing drifts down over the move, as a fraction of slack. */
const END_DRIFT = 0.65;

/** Ease-in-out, so the move starts and settles gently instead of lurching. */
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

async function main() {
  const meta = await sharp(SOURCE).metadata();
  if (!meta.width || !meta.height) throw new Error(`cannot read ${SOURCE}`);

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const targetAspect = WIDTH / HEIGHT;

  for (let i = 0; i < FRAME_COUNT; i++) {
    const t = ease(FRAME_COUNT === 1 ? 0 : i / (FRAME_COUNT - 1));
    const zoom = 1 - (1 - END_ZOOM) * t;

    // Largest crop of the wanted aspect ratio that fits, then scaled by zoom.
    let cropW = Math.min(meta.width, meta.height * targetAspect);
    let cropH = cropW / targetAspect;
    cropW = Math.round(cropW * zoom);
    cropH = Math.round(cropH * zoom);

    const slackX = meta.width - cropW;
    const slackY = meta.height - cropH;
    const left = Math.round(slackX / 2);
    const top = Math.round(slackY * (0.5 - 0.5 * END_DRIFT + END_DRIFT * t * 0.5));

    await sharp(SOURCE)
      .extract({ left, top, width: cropW, height: cropH })
      .resize(WIDTH, HEIGHT, { fit: "cover" })
      .webp({ quality: 52, effort: 6, smartSubsample: true })
      .toFile(path.join(OUT_DIR, `${String(i + 1).padStart(3, "0")}.webp`));
  }

  const files = await readdir(OUT_DIR);
  console.log(`wrote ${files.length} frames to ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
