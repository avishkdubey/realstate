"use client";

import { useEffect, useRef } from "react";

/**
 * Derives mouth openness (0→1) from an HTMLAudioElement.
 *
 * Uses a Web Audio AnalyserNode to calculate the RMS amplitude of the audio stream.
 * 
 * TODO: Prefer a pre-baked viseme JSON if one exists beside the MP3 (fetching src.replace('.mp3', '.json')), 
 * and fall back to amplitude otherwise. This currently only implements the amplitude fallback.
 */
export function useLipSync(audioRef: React.RefObject<HTMLAudioElement | null>) {
  const mouth = useRef(0);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let ctx: AudioContext | null = null;
    let animationFrameId: number;

    const update = () => {
      if (analyserRef.current && dataArrayRef.current && !audio.paused) {
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current as unknown as Uint8Array<ArrayBuffer>);
        let sumSquares = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          const normalized = dataArrayRef.current[i] / 128 - 1;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / dataArrayRef.current.length);
        
        // Scale RMS. Typical speech RMS might max out around 0.2 - 0.4.
        // We multiply by 3 to bring normal speech into the 0..1 range.
        mouth.current = Math.min(1, rms * 3);
      } else {
        mouth.current = 0;
      }
      animationFrameId = requestAnimationFrame(update);
    };

    const onPlay = () => {
      // AudioContext must be created/resumed after a user gesture.
      if (!ctx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctx = new AudioContextClass();
      }

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (!sourceRef.current) {
        try {
          sourceRef.current = ctx.createMediaElementSource(audio);
          analyserRef.current = ctx.createAnalyser();
          analyserRef.current.fftSize = 256;
          
          const bufferLength = analyserRef.current.frequencyBinCount;
          dataArrayRef.current = new Uint8Array(bufferLength);

          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(ctx.destination);
        } catch (err) {
          // createMediaElementSource can throw if called twice on the same element
          console.warn("LipSync: Could not connect audio node.", err);
        }
      }

      update();
    };

    const onPause = () => {
      mouth.current = 0;
      cancelAnimationFrame(animationFrameId);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onPause);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onPause);
      cancelAnimationFrame(animationFrameId);
    };
  }, [audioRef]);

  return mouth;
}
