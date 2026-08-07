"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useVisitor, rememberName, rememberSkip } from "@/lib/visitor-storage";
import { useLenis } from "@/components/providers/lenis-provider";
import { DeferredAgentScene } from "./deferred-agent-scene";
import { useLipSync } from "./use-lip-sync";
import { AGENT_SCRIPT, THANKS_LINE } from "@/lib/agent-script";
import * as THREE from "three";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function OnboardingGate() {
  const visitor = useVisitor();
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  if (!mounted || visitor !== null) return null;
  if (typeof window !== "undefined" && window.location.search.includes("nogate=1")) return null;

  return <GateOverlay />;
}

function GateOverlay() {
  const lenis = useLenis();
  const audioRef = useRef<HTMLAudioElement>(null);
  const mouth = useLipSync(audioRef);
  const attention = useRef<THREE.Vector2 | null>(null);
  const [step, setStep] = useState<"greeting" | "ask-name" | "thanks" | "closing">("greeting");
  const [needsGesture, setNeedsGesture] = useState(false);
  const [name, setName] = useState("");
  
  // Make siblings inert and lock scroll
  useEffect(() => {
    const content = document.getElementById("app-content");
    if (content) content.setAttribute("inert", "");
    document.body.style.overflow = "hidden";
    lenis?.stop();
    
    return () => {
      if (content) content.removeAttribute("inert");
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [lenis]);

  // Failsafe timer (8s without advancing)
  useEffect(() => {
    let timeoutId: number;
    if (step !== "ask-name" && step !== "closing") {
       timeoutId = window.setTimeout(() => {
         rememberSkip();
       }, 8000);
    }
    return () => clearTimeout(timeoutId);
  }, [step]);

  const currentLine = 
    step === "greeting" ? AGENT_SCRIPT[0] : 
    step === "ask-name" ? AGENT_SCRIPT[1] : 
    THANKS_LINE;

  const closeGate = () => {
    setStep("closing");
    setTimeout(() => {
      rememberSkip();
    }, 500);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.src = currentLine.src;
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setNeedsGesture(true);
      });
    }
    
    const onEnded = () => {
      if (step === "greeting") setStep("ask-name");
      else if (step === "thanks") closeGate();
    };
    
    audio.addEventListener("ended", onEnded);
    
    // Fallback if silent / audio assets missing
    const fallbackTimer = setTimeout(() => {
       if (audio.paused || audio.muted) {
         onEnded();
       }
    }, currentLine.durationHint);
    
    return () => {
      audio.removeEventListener("ended", onEnded);
      clearTimeout(fallbackTimer);
    };
  }, [step, currentLine]);

  const handleUnlockAudio = () => {
    setNeedsGesture(false);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep("thanks");
      setTimeout(() => {
         rememberName(name);
      }, THANKS_LINE.durationHint + 500);
    } else {
      rememberSkip();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[90] bg-surface-0 text-ivory flex flex-col items-center justify-center transition-opacity duration-700 ${step === 'closing' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <audio ref={audioRef} playsInline />
      
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <DeferredAgentScene mouth={mouth} attention={attention} />
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-end w-full h-full pb-24 px-6">
        
        {needsGesture ? (
          <button 
            onClick={handleUnlockAudio}
            className="px-8 py-3 bg-surface-1 rounded-full text-gold border border-hairline-strong mb-6 hover:bg-surface-2 transition-colors tracking-wide shadow-lg"
          >
            Meet Aanya
          </button>
        ) : (
          <p className="text-xl md:text-2xl font-light text-center mb-8 drop-shadow-md max-w-lg">
            {currentLine.text}
          </p>
        )}

        {step === "ask-name" && !needsGesture && (
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-sm">
             <input 
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="Your name"
               className="w-full bg-surface-1/80 backdrop-blur border border-hairline px-4 py-3 rounded text-center focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-lg shadow-lg"
               onFocus={() => {
                 attention.current = new THREE.Vector2(0, -0.4);
               }}
               onBlur={() => {
                 attention.current = null;
               }}
               autoFocus
             />
             <p className="text-xs text-charcoal-light tracking-wide">Your name never leaves your browser.</p>
          </form>
        )}

        <button 
          onClick={() => closeGate()}
          className="absolute top-8 right-8 text-sm tracking-wide text-ivory/60 hover:text-ivory transition-colors z-[110]"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
