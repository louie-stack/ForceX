"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Moon, Sun } from "./Icons";

type Theme = "dark" | "light";

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}
const getSnapshot = (): Theme => (document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
const getServerSnapshot = (): Theme => "dark";

type DocWithVT = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };

export function ThemeToggle({ className = "nav__icon" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    const apply = () => {
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("fx-theme", next);
        document.cookie = `__fx_theme=${next}; path=/; max-age=31536000; samesite=lax`;
      } catch {}
    };
    const doc = document as DocWithVT;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (doc.startViewTransition && !reduce) {
      const r = e.currentTarget.getBoundingClientRect();
      document.documentElement.style.setProperty("--tx", `${r.left + r.width / 2}px`);
      document.documentElement.style.setProperty("--ty", `${r.top + r.height / 2}px`);
      doc.startViewTransition(apply);
    } else apply();
  }, []);

  return (
    <button type="button" className={className} onClick={toggle} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}
