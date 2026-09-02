import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/sections.css";
import "@/styles/fx.css";
import "@/styles/home.css";
import "@/styles/polish.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { RevealObserver } from "@/components/RevealObserver";
import { Preloader } from "@/components/fx/Preloader";
import { Cursor } from "@/components/fx/Cursor";
import { PageTransition } from "@/components/fx/PageTransition";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { Spotlight } from "@/components/fx/Spotlight";
import { fetchPublic, type QualityStatus } from "@/lib/api";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const SITE = "https://forcex.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "ForceX: Verified Litecoin Data. Explorer, Analytics, API and AI Tools",
    template: "%s | ForceX",
  },
  description:
    "ForceX is a data-quality-first blockchain intelligence platform starting with Litecoin. Every block is reconciled, validated, and cross-checked against the node before it is displayed.",
  openGraph: {
    type: "website",
    siteName: "ForceX",
    url: SITE,
    title: "ForceX: Verified Litecoin Data",
    description: "Blockchain data should be verified before it is displayed.",
    images: ["/brand/icon-256.png"],
  },
  twitter: { card: "summary", site: "@ForceXHQ" },
  icons: { icon: "/brand/icon-256.png", apple: "/brand/icon-256.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#04060b" },
    { media: "(prefers-color-scheme: light)", color: "#f5f6f9" },
  ],
  width: "device-width",
  initialScale: 1,
};

const THEME_BOOT = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('fx-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.setAttribute('data-theme',t)}catch(e){d.setAttribute('data-theme','dark')}try{var r=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r&&sessionStorage.getItem('fx-loaded')!=='1'){d.setAttribute('data-pre','1')}else{d.setAttribute('data-loaded','1')}}catch(e){d.setAttribute('data-loaded','1')}})();`;

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "ForceX",
      url: `${SITE}/`,
      logo: { "@type": "ImageObject", url: `${SITE}/brand/icon-256.png` },
      description: "ForceX provides verified Litecoin on-chain intelligence: block exploration, analytics, and a developer API.",
      sameAs: ["https://x.com/ForceXHQ"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      name: "ForceX",
      url: `${SITE}/`,
      publisher: { "@id": `${SITE}/#organization` },
      inLanguage: "en",
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const quality = await fetchPublic<QualityStatus>("quality/status", 60);
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </head>
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Preloader height={quality?.tip_height ?? null} />
        <ScrollProgress />
        <Spotlight />
        <SmoothScroll />
        <RevealObserver />
        <PageTransition />
        <Cursor />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
