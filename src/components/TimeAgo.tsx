"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/format";

/**
 * Relative time that is allowed to differ between server and client
 * (the server value is frozen at cache time) and keeps ticking after mount.
 */
export function TimeAgo({ iso, className }: { iso?: string | null; className?: string }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className={className} suppressHydrationWarning>
      {timeAgo(iso)}
    </span>
  );
}
