"use client";

import dynamic from "next/dynamic";

const HeroField = dynamic(() => import("@/components/fx/HeroField").then((m) => m.HeroField), { ssr: false });

export function HeroFieldClient() {
  return <HeroField className="hero2__gl" />;
}
