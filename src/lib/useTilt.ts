"use client";

import { useEffect, type RefObject } from "react";

/**
 * Tilts `target` toward the pointer while it moves over `area`.
 * Writes --rx / --ry (degrees) on the target; CSS composes them into its transform.
 * Off for touch pointers and under prefers-reduced-motion.
 */
export function useTilt(
  area: RefObject<HTMLElement | null>,
  target: RefObject<HTMLElement | null>,
  max = 8,
) {
  useEffect(() => {
    const zone = area.current;
    const el = target.current;
    if (!zone || !el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      el.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
    };

    const onMove = (e: PointerEvent) => {
      const r = zone.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onLeave = () => {
      x = 0;
      y = 0;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    zone.addEventListener("pointermove", onMove, { passive: true });
    zone.addEventListener("pointerleave", onLeave);
    return () => {
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [area, target, max]);
}
