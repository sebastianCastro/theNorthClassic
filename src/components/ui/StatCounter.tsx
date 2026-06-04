"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

type StatCounterProps = {
  value: number;
  label: string;
  suffix?: string;
  /** When value is 0, show this instead of animating (e.g. "?") */
  placeholder?: string;
};

export function StatCounter({
  value,
  label,
  suffix = "",
  placeholder,
}: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const showPlaceholder = placeholder != null && value === 0;

  useEffect(() => {
    if (showPlaceholder) return;
    if (!isInView) return;
    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    let current = 0;
    const duration = 1500;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.floor(eased * value);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [isInView, value, reducedMotion, showPlaceholder]);

  return (
    <div ref={ref} className="text-center">
      <p className="stat-number text-5xl font-bold text-white md:text-6xl lg:text-7xl">
        {showPlaceholder ? placeholder : display.toLocaleString("es-MX")}
        {!showPlaceholder && suffix}
      </p>
      <p className="mt-2 text-xs uppercase tracking-widest text-muted">{label}</p>
    </div>
  );
}
