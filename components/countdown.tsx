"use client";

import { useEffect, useState } from "react";

function parts(endAt: string) {
  const remaining = Math.max(0, new Date(endAt).getTime() - Date.now());
  return {
    d: Math.floor(remaining / 86_400_000),
    h: Math.floor((remaining % 86_400_000) / 3_600_000),
    m: Math.floor((remaining % 3_600_000) / 60_000),
    s: Math.floor((remaining % 60_000) / 1000),
  };
}

export function Countdown({ endAt, compact = false }: { endAt: string; compact?: boolean }) {
  const [time, setTime] = useState<ReturnType<typeof parts> | null>(null);
  useEffect(() => {
    const firstUpdate = window.setTimeout(() => setTime(parts(endAt)), 0);
    const timer = window.setInterval(() => setTime(parts(endAt)), 1000);
    return () => {
      window.clearTimeout(firstUpdate);
      window.clearInterval(timer);
    };
  }, [endAt]);
  if (!time) {
    if (compact) return <span className="countdown-compact" aria-label="Loading time remaining">--h --m</span>;
    return <div className="countdown" aria-label="Loading time remaining"><b>--</b><span>:</span><b>--</b><span>:</span><b>--</b></div>;
  }
  if (compact) return <span className="countdown-compact">{time.d ? `${time.d}d ` : ""}{String(time.h).padStart(2, "0")}h {String(time.m).padStart(2, "0")}m</span>;
  return (
    <div className="countdown" aria-label={`${time.d} days ${time.h} hours ${time.m} minutes remaining`}>
      {time.d > 0 && <><b>{String(time.d).padStart(2, "0")}</b><span>:</span></>}
      <b>{String(time.h).padStart(2, "0")}</b><span>:</span><b>{String(time.m).padStart(2, "0")}</b><span>:</span><b>{String(time.s).padStart(2, "0")}</b>
    </div>
  );
}
