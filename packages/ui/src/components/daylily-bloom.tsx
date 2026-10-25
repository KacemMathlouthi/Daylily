import type { ComponentProps, CSSProperties } from "react";
import { PETAL } from "./daylily-mark";

/** How long each petal takes to open; matches --animate-petal-open. */
const PETAL_MS = 400;

/**
 * When each petal starts to open, in ms: the top petal first, then its neighbours,
 * then the bottom one, as in Paper's "Launch bloom" storyboard.
 */
export const PETAL_OPENING = [
  { angle: 0, delay: 0 },
  { angle: 60, delay: 120 },
  { angle: 300, delay: 120 },
  { angle: 120, delay: 240 },
  { angle: 240, delay: 240 },
  { angle: 180, delay: 360 },
];

/** Full bloom, when the last petal settles; anything that follows starts here. */
export const BLOOM_MS =
  Math.max(...PETAL_OPENING.map(({ delay }) => delay)) + PETAL_MS;

type DaylilyBloomProps = ComponentProps<"svg"> & {
  size?: number;
};

/**
 * The daylily mark opening from a bud, petal by petal. Takes its colour from
 * `currentColor`; with reduced motion it renders already open.
 */
export function DaylilyBloom({ size = 88, ...props }: DaylilyBloomProps) {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      height={size}
      viewBox="-50 -50 100 100"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {PETAL_OPENING.map(({ angle, delay }) => (
        // The rotation sits on a group so the petal's own transform is free to scale
        <g key={angle} transform={`rotate(${angle})`}>
          <path
            className="animate-petal-open motion-reduce:animate-none"
            d={PETAL}
            style={
              {
                // The top petal is already showing as the bud
                "--petal-from": angle === 0 ? 0.55 : 0,
                animationDelay: `${delay}ms`,
              } as CSSProperties
            }
          />
        </g>
      ))}
      <circle className="animate-bud-close motion-reduce:hidden" r={4} />
    </svg>
  );
}
