"use client";

import dynamic from "next/dynamic";
import type { HeroBlockProps } from "./HeroBlock";

const HeroBlock = dynamic(() => import("./HeroBlock").then((m) => m.HeroBlock), { ssr: false });

/** Server-component-safe wrapper: keeps three.js on the client only. */
export function BlockClient(props: HeroBlockProps) {
  return <HeroBlock {...props} />;
}
