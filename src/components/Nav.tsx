"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "./Wordmark";
import { ThemeToggle } from "./ThemeToggle";
import { ArrowUpRight, Chart, Chevron, Code, Menu, Search, X } from "./Icons";

const PRODUCTS = [
  { href: "/xplorer/litecoin", eyebrow: "Explorer", title: "Xplorer", blurb: "Verified blocks, transactions, and addresses.", tint: "var(--xplorer)", Icon: Search },
  { href: "/xamine", eyebrow: "Analytics", title: "Xamine", blurb: "Trends, supply, and relationships.", tint: "var(--xamine)", Icon: Chart },
  { href: "/xtract", eyebrow: "Data", title: "Xtract", blurb: "API and MCP access for builders and institutions.", tint: "var(--xtract)", Icon: Code },
];

const ABOUT = [
  { href: "/about", title: "Who We Are", blurb: "Why ForceX exists." },
  { href: "/data-quality", title: "Data Quality", blurb: "How every block is verified." },
  { href: "/contact", title: "Contact", blurb: "Reach the ForceX team." },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState<null | "products" | "about">(null);
  const [mobile, setMobile] = useState(false);
  const closeTimer = useRef<number | null>(null);
  // The bar keeps one glass state at every scroll position: no shrink, no hide.

  // Close menus when the route changes (state adjustment during render, per React guidance).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(null);
    setMobile(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobile]);

  const enter = (k: "products" | "about") => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(k);
  };
  const leave = () => {
    closeTimer.current = window.setTimeout(() => setOpen(null), 140);
  };

  return (
    <>
      <header className="nav">
        <div className="container">
          <div className="nav__bar">
            <Link href="/" className="nav__brand" aria-label="ForceX home">
              <Wordmark height={17} />
            </Link>

            <nav className="nav__links" aria-label="Primary">
              <div className={`nav__item ${open === "products" ? "is-open" : ""}`} onMouseEnter={() => enter("products")} onMouseLeave={leave}>
                <button type="button" className="nav__link" aria-haspopup="true" aria-expanded={open === "products"} onClick={() => setOpen(open === "products" ? null : "products")}>
                  Products <Chevron />
                </button>
                <div className="nav__menu" role="menu">
                  <div className="nav__mega">
                    {PRODUCTS.map(({ href, eyebrow, title, blurb, tint, Icon }) => (
                      <Link key={href} href={href} className="nav__card" style={{ ["--tint" as string]: tint }} role="menuitem">
                        <span className="nav__card-ico">
                          <Icon size={20} />
                        </span>
                        <small>{eyebrow}</small>
                        <strong>{title}</strong>
                        <span>{blurb}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="/data-quality" className={`nav__link ${pathname === "/data-quality" ? "is-active" : ""}`}>
                Data Quality
              </Link>

              <Link href="/xtract/docs/mcp" className={`nav__link ${pathname.startsWith("/xtract/docs") ? "is-active" : ""}`}>
                MCP
              </Link>

              <div className={`nav__item ${open === "about" ? "is-open" : ""}`} onMouseEnter={() => enter("about")} onMouseLeave={leave}>
                <button type="button" className="nav__link" aria-haspopup="true" aria-expanded={open === "about"} onClick={() => setOpen(open === "about" ? null : "about")}>
                  About <Chevron />
                </button>
                <div className="nav__menu" role="menu">
                  <div className="nav__list">
                    {ABOUT.map((a) => (
                      <Link key={a.href} href={a.href} className="nav__row" role="menuitem">
                        <strong>{a.title}</strong>
                        <span>{a.blurb}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>

            <div className="nav__actions">
              <ThemeToggle />
              <Link href="/signin" className="nav__link desktop-only">
                Sign in
              </Link>
              <Link href="/signup" className="btn btn--sm btn--accent desktop-only">
                Create account
              </Link>
              <button type="button" className="nav__icon nav__burger" aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile} onClick={() => setMobile((m) => !m)}>
                {mobile ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${mobile ? "is-open" : ""}`} aria-hidden={!mobile}>
        <nav aria-label="Mobile">
          {PRODUCTS.map((p) => (
            <Link key={p.href} href={p.href} className="big">
              {p.title}
              <small>{p.eyebrow}</small>
            </Link>
          ))}
          <Link href="/xtract/docs/mcp" className="big">
            MCP Server<small>AI tools</small>
          </Link>
          <Link href="/data-quality" className="big">
            Data Quality<small>Methodology</small>
          </Link>
          <Link href="/about" className="big">
            Who We Are<small>About</small>
          </Link>
          <Link href="/contact" className="big">
            Contact<small>Say hello</small>
          </Link>
        </nav>
        <div style={{ display: "grid", gap: 10, marginTop: 28 }}>
          <Link href="/signup" className="btn btn--accent btn--lg btn--block">
            Create free account
            <span className="btn__ico">
              <ArrowUpRight />
            </span>
          </Link>
          <Link href="/signin" className="btn btn--ghost btn--lg btn--block">
            Sign in
          </Link>
        </div>
      </div>
    </>
  );
}
