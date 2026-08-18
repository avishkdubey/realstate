/**
 * The client's own YouTube Shorts, for the video rail on the home page.
 *
 * Unlike `lib/placeholders/stories.ts`, **this is real content**: every entry
 * below is a video published on the client's own channel,
 * https://www.youtube.com/@KautilyaDevelopers/shorts, read from that page
 * rather than composed. They are the developer's videos on the developer's
 * site, so there is no licensing question here at all.
 *
 * ── A CAVEAT WORTH KEEPING ─────────────────────────────────────────────────
 * These are the builder's own films, not filmed customer testimonials. The
 * titles are about projects, parking, land and the firm's own story. The rail
 * that renders them therefore says "From our channel" and does not present them
 * as buyers speaking — presenting a developer's marketing film as a customer
 * testimonial is the kind of implication RERA §12 makes the promoter liable
 * for, and it is also just untrue.
 *
 * If some of these do feature real buyers, move those into a separate list with
 * the speaker named, and label that one as testimony.
 * ───────────────────────────────────────────────────────────────────────────
 */

export type ChannelVideo = {
  /** 11-character YouTube id. */
  id: string;
  /** Title as published on the channel. */
  title: string;
};

/** Channel URL, shown as the "watch more" destination. */
export const CHANNEL_URL = "https://www.youtube.com/@KautilyaDevelopers";

export const channelVideos: ChannelVideo[] = [
  { id: "9j_UlBzhzeg", title: "Every Home Has a Story | The Kautilya Journey" },
  { id: "DtvGeLcRfDA", title: "Lessons, Homes & Legacy | Kautilya Developers Story" },
  { id: "PnGfYwHQ_BY", title: "Why Location Matters | Kautilya One54, Chandkheda" },
  { id: "tYKzVaDsLw4", title: "Forget Trends — This Sample House Is the Real Deal" },
  { id: "2YBFYknwKPI", title: "2 Allotted Parking Spaces for Every Home | One54 Advantage" },
  { id: "IZ2jBrek5d4", title: "Not Just Land. It's Potential." },
];

/**
 * Poster frame for a video.
 *
 * `hqdefault` rather than `maxresdefault`: Shorts are portrait, and the maxres
 * frame does not exist for every upload — a missing one 404s and leaves a hole
 * where the poster should be. `hq` is generated for everything.
 */
export function thumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/**
 * Embed URL, on the no-cookie host and with related videos held to this
 * channel.
 *
 * `youtube-nocookie.com` sets no tracking cookie until the visitor actually
 * plays something, which matters on a page that already promises in the
 * onboarding gate that nothing is collected without consent (DPDP §6). The
 * facade in `story-videos.tsx` means this URL is only ever requested after a
 * deliberate click, so playback is itself the consent.
 */
export function embedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}
