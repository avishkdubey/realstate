"use client";

import dynamic from "next/dynamic";
import type { AgentSceneProps } from "./agent-scene";

const Scene = dynamic(() => import("./agent-scene").then((mod) => mod.AgentScene), {
  ssr: false,
});

export function DeferredAgentScene(props: AgentSceneProps) {
  return <Scene {...props} />;
}
