import { siteConfig } from "@/lib/site-config";

/**
 * What the agent says, in one place.
 *
 * Audio path, caption text and fallback duration live on the same object so
 * they cannot drift apart — the commonest failure in a scripted sequence is a
 * caption that no longer matches the recording.
 *
 * Two constraints shaped the writing:
 *
 * **No project claims, deliberately.** An AI presenter asserting anything about
 * a specific project — price, possession, approval status — is an advertisement
 * made on behalf of an unregistered promoter, and RERA §12 makes the promoter
 * liable for it whether or not a disclaimer is attached. She greets and she asks
 * a name. She does not sell.
 *
 * **She never says the visitor's name aloud.** Pre-recorded audio cannot, and
 * splicing would mean recording hundreds of Indian first names badly. Getting
 * someone's name wrong out loud is worse than not saying it, so line 3 is
 * written name-free and the personalisation is carried visually by the caption
 * instead. That is a design decision, not a limitation to be fixed later.
 */

export type ScriptLine = {
  id: string;
  /** Under /public/audio/agent. Absent until the real recordings land. */
  src: string;
  /** Shown in the caption region, and read by screen readers. */
  text: string;
  /**
   * Roughly how long the recording runs, in ms.
   *
   * Used to advance the sequence when there is no audio at all — muted, an
   * autoplay refusal the visitor declined, or the placeholder build where the
   * MP3s do not exist yet. Without it the silent path would stall on an
   * `ended` event that never fires.
   */
  durationHint: number;
};

export const AGENT_NAME = "Aanya";

export const AGENT_SCRIPT: ScriptLine[] = [
  {
    id: "greeting",
    src: "/audio/agent/01-greeting.mp3",
    text: `Hello, and welcome to ${siteConfig.name}. I'm ${AGENT_NAME} — I look after guests here.`,
    durationHint: 4500,
  },
  {
    id: "ask-name",
    src: "/audio/agent/02-ask-name.mp3",
    text: "Before we begin — what should I call you?",
    durationHint: 3200,
  },
];

/** Played after the visitor submits. Name-free, for the reason above. */
export const THANKS_LINE: ScriptLine = {
  id: "thanks",
  src: "/audio/agent/03-thanks.mp3",
  text: "Wonderful. Let me show you what we've been building.",
  durationHint: 3500,
};

/** The caption that does carry the name. Visual, never spoken. */
export function thanksCaption(name: string | null): string {
  return name ? `Lovely to meet you, ${name}.` : THANKS_LINE.text;
}
