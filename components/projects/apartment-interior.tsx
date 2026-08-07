"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { Skeleton } from "@/components/lazy-mount";

const Scene = dynamic(
  () => import("./apartment-interior-scene").then((mod) => mod.ApartmentInteriorScene),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> }
);

type Props = {
  bhk: string;
  carpetAreaSqFt: number;
};

export function ApartmentInterior({ bhk, carpetAreaSqFt }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  
  return (
    <section ref={sectionRef} className="relative h-[400svh]">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-surface-0">
         <Scene sectionRef={sectionRef} bhk={bhk} carpetAreaSqFt={carpetAreaSqFt} />
         
         {/* Text Overlay */}
         <div className="absolute top-0 left-0 w-full p-8 md:p-16 pointer-events-none z-10 bg-gradient-to-b from-surface-0/80 to-transparent">
           <div className="container-page">
             <p className="eyebrow text-accent drop-shadow-md">360° view</p>
             <h2 className="measure mt-6 text-h4 drop-shadow-md text-ivory">
               Look around before you fly in.
             </h2>
           </div>
         </div>

         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none text-ivory/80 drop-shadow-md z-10">
           <span className="eyebrow block animate-[nudge_2.4s_ease-in-out_infinite]">
             Scroll to explore
           </span>
         </div>
      </div>
    </section>
  );
}
