/* Marker strokes drawn by hand: each path uses pathLength="1" so CSS can draw it in
   with stroke-dashoffset. All of them are decoration and hidden from assistive tech. */

type Kind = "underline" | "circle" | "arrow" | "arrow-up" | "spark";

const PATHS: Record<Kind, { viewBox: string; d: string[] }> = {
  underline: {
    viewBox: "0 0 240 16",
    d: ["M3 11 C 42 5, 86 13, 128 8 S 204 4, 237 9"],
  },
  circle: {
    viewBox: "0 0 220 90",
    d: ["M168 12 C 116 -2, 30 4, 10 38 C -6 68, 72 88, 138 82 C 198 76, 222 46, 196 24 C 178 10, 136 6, 104 10"],
  },
  arrow: {
    viewBox: "0 0 130 84",
    d: ["M6 8 C 22 52, 64 74, 118 62", "M100 50 L 120 62 L 102 76"],
  },
  "arrow-up": {
    viewBox: "0 0 90 110",
    d: ["M14 104 C 8 70, 30 34, 70 12", "M50 8 L 72 11 L 66 32"],
  },
  spark: {
    viewBox: "0 0 48 48",
    d: ["M24 4 L 24 16", "M24 32 L 24 44", "M4 24 L 16 24", "M32 24 L 44 24", "M10 10 L 17 17", "M31 31 L 38 38"],
  },
};

export function Scribble({ kind, className = "" }: { kind: Kind; className?: string }) {
  const p = PATHS[kind];
  return (
    <svg
      className={`scribble scribble--${kind} ${className}`}
      viewBox={p.viewBox}
      fill="none"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
    >
      {p.d.map((d, i) => (
        <path key={i} d={d} pathLength={1} style={{ ["--s" as string]: i }} />
      ))}
    </svg>
  );
}
