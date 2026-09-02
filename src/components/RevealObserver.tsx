"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * One observer for the whole app. Any element with [data-reveal] or
 * [data-reveal-lines] receives .is-in the first time it enters the viewport.
 * A MutationObserver picks up nodes that mount later (route changes, async data).
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    const watch = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[data-reveal],[data-reveal-lines]").forEach((el) => {
        if (!el.classList.contains("is-in")) io.observe(el);
      });
    };
    watch(document);

    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement) {
            if (n.matches("[data-reveal],[data-reveal-lines]")) io.observe(n);
            watch(n);
          }
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
