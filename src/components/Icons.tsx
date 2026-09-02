import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number, rest: SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...rest,
});

export const ArrowRight = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const ArrowUpRight = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);
export const ArrowDown = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);
export const Chevron = ({ size = 14, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const Check = ({ size = 16, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
);
export const Search = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
);
export const Chart = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M4 19V5M4 19h16M7 15l3.5-4.5 3.5 2 5-6" />
  </svg>
);
export const Code = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-10-2 12" />
  </svg>
);
export const Sparkle = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
);
export const Shield = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />
    <path d="m9 12 2 2 4-4.5" />
  </svg>
);
export const Layers = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5M3 17.5 12 22l9-4.5" />
  </svg>
);
export const Nodes = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M8.5 6h7M6 8.5v7M18 8.5v7M8.5 18h7M8 8l8 8" />
  </svg>
);
export const Sun = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
);
export const Moon = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </svg>
);
export const Menu = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const X = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const Copy = ({ size = 16, ...r }: P) => (
  <svg {...base(size, r)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </svg>
);
export const Bolt = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>
);
export const Database = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}>
    <ellipse cx="12" cy="5.5" rx="8" ry="3" />
    <path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
  </svg>
);
export const Wallet = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5" />
    <circle cx="16.5" cy="13.5" r="1" fill="currentColor" />
  </svg>
);
export const Building = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M4 21V5l8-3 8 3v16M4 21h16M9 9h2M13 9h2M9 13h2M13 13h2M10 21v-4h4v4" />
  </svg>
);
export const Users = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4.5-6.2" />
  </svg>
);
export const Terminal = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="m7 9 3 3-3 3M12 15h5" />
  </svg>
);
export const XLogo = ({ size = 16, ...r }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...r}>
    <path d="M13.85 10.47 21.05 2h-1.71l-6.25 7.35L8.1 2H2.34l7.55 11.1L2.34 22h1.71l6.6-7.77L15.93 22h5.76l-7.84-11.53Zm-2.34 2.75-.77-1.11-6.08-8.83h2.62l4.91 7.13.76 1.11 6.39 9.28h-2.62l-5.21-7.58Z" />
  </svg>
);
export const Google = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.8-2.1 5.1-4.4 6.7v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.2z" />
    <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.2H4.2v5.7C7.9 40.9 15.4 46 24 46z" />
    <path fill="#FBBC05" d="M11.6 28c-.5-1.3-.7-2.7-.7-4s.3-2.7.7-4v-5.7H4.2A21.9 21.9 0 0 0 2 24c0 3.6.9 6.9 2.2 9.7L11.6 28z" />
    <path fill="#EA4335" d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C35 4.3 30 2 24 2 15.4 2 7.9 7.1 4.2 14.3l7.4 5.7c1.7-5.3 6.6-9.2 12.4-9.2z" />
  </svg>
);
export const LtcMark = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="currentColor" fillOpacity="0.12" />
    <path d="M9.6 5.5h2.6l-1.55 7.05 1.65-.55-.35 1.45-1.65.55L9.85 16h6.4l-.45 2.2H7.3l.9-4.3-1.55.55.35-1.5 1.55-.5L9.6 5.5Z" fill="currentColor" />
  </svg>
);
