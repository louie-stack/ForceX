import type { CSSProperties } from "react";

/**
 * The ForceX wordmark, rendered from the brand SVG through a CSS mask so it
 * takes the current text color in both themes.
 */
export function Wordmark({ height = 20, className = "", style }: { height?: number; className?: string; style?: CSSProperties }) {
  const width = Math.round(height * (1301 / 232));
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-block",
        width,
        height,
        background: "currentColor",
        WebkitMaskImage: "url(/brand/fx-logo.svg)",
        maskImage: "url(/brand/fx-logo.svg)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        ...style,
      }}
    />
  );
}

export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="8" stroke="currentColor" strokeOpacity="0.25" />
      <path d="M9 9h14M9 16h9M9 23h5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M17 19l6 6M23 19l-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
