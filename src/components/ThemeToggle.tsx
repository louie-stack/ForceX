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

export function ThemeToggle({ className = "nav__icon" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("fx-theme", next);
      document.cookie = `__fx_theme=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
  }, [theme]);

  return (
    <button type="button" className={className} onClick={toggle} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}
