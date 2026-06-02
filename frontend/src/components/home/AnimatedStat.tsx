"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedStatProps {
  value: number;
  suffix?: string;
  label: string;
  durationMs?: number;
}

export function AnimatedStat({
  value,
  suffix = "",
  label,
  durationMs = 1500,
}: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, value, durationMs]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-serif text-3xl font-bold text-white md:text-4xl">
        {display}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-white/80">{label}</p>
    </div>
  );
}
