"use client";

import dynamic from "next/dynamic";

const HeroBlock = dynamic(() => import("@/components/fx/HeroBlock").then((m) => m.HeroBlock), { ssr: false });

export function HeroFieldClient() {
  return <HeroBlock className="hero2__gl" />;
}
