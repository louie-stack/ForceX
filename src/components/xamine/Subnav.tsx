"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Chevron } from "@/components/Icons";
import { CHARTS, GROUPS, GROUP_ORDER, TOOLS } from "@/lib/xamine/catalog";

/**
 * Xamine's own navigation, sitting under the site nav: Xamine, a Charts
 * menu grouped by activity, a Tools menu, and the link into the live app.
 */
export function Subnav({ appHref }: { appHref: string }) {
  const path = usePathname();
  const [open, setOpen] = useState<"charts" | "tools" | null>(null);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const activeChart = CHARTS.find((c) => path === `/xamine/charts/${c.slug}`);
  return (
    <nav className="xs" ref={root} aria-label="Xamine">
      <div className="container xs__inner">
        <Link href="/xamine" className={`xs__link ${path === "/xamine" ? "is-active" : ""}`}>
          Xamine
        </Link>
        <div className="xs__menu">
          <button type="button" className={`xs__link xs__btn ${activeChart ? "is-active" : ""}`} aria-expanded={open === "charts"} onClick={() => setOpen(open === "charts" ? null : "charts")}>
            Charts <Chevron size={12} />
          </button>
          {open === "charts" && (
            <div className="xs__panel xs__panel--charts" onClick={() => setOpen(null)}>
              {GROUP_ORDER.map((g) => (
                <div key={g} className="xs__group">
                  <span className="xs__group-label mono">{GROUPS[g]}</span>
                  {CHARTS.filter((c) => c.group === g).map((c) => (
                    <Link key={c.slug} href={`/xamine/charts/${c.slug}`} className={`xs__item ${activeChart?.slug === c.slug ? "is-active" : ""}`}>
                      {c.title}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="xs__menu">
          <button type="button" className={`xs__link xs__btn ${path.startsWith("/xamine/tools") ? "is-active" : ""}`} aria-expanded={open === "tools"} onClick={() => setOpen(open === "tools" ? null : "tools")}>
            Tools <Chevron size={12} />
          </button>
          {open === "tools" && (
            <div className="xs__panel" onClick={() => setOpen(null)}>
              <div className="xs__group">
                <span className="xs__group-label mono">Address activity</span>
                {TOOLS.map((t) => (
                  <Link key={t.slug} href={t.href} className="xs__item">
                    {t.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        {activeChart && <span className="xs__crumb mono">{activeChart.title}</span>}
        <a href={appHref} className="xs__app mono">
          Open in app <ArrowUpRight size={13} />
        </a>
      </div>
    </nav>
  );
}
