"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";

/**
 * Curtain transition for internal navigation. A document-level click
 * handler intercepts same-origin links, plays the curtain in, pushes the
 * route, and the pathname effect plays it out once the new page mounts.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const pending = useRef(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // same page (hash links)
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      e.preventDefault();
      if (pending.current) return;
      pending.current = true;
      const c = curtain.current!;
      gsap.timeline()
        .set(c, { display: "block", yPercent: 100 })
        .to(c, { yPercent: 0, duration: 0.55, ease: "expo.inOut", onComplete: () => router.push(url.pathname + url.search + url.hash) });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  useEffect(() => {
    if (!pending.current) return;
    const c = curtain.current!;
    pending.current = false;
    gsap.timeline({ delay: 0.05 })
      .to(c, { yPercent: -100, duration: 0.7, ease: "expo.inOut" })
      .set(c, { display: "none" });
  }, [pathname]);

  return (
    <div ref={curtain} className="curtain" aria-hidden="true">
      <span className="curtain__mark mono">FORCEX</span>
    </div>
  );
}
