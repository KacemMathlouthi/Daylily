import { PETAL_OPENING } from "@daylily/ui/components/daylily-bloom";
import { cn } from "@daylily/ui/lib/cn";
import type { CSSProperties } from "react";
import mark from "../assets/mark-textured.png";

/**
 * The 60° wedge from the centre holding the petal at `angle` (0 points up,
 * clockwise), as a clip-path reaching well past the image's edge.
 */
function wedge(angle: number) {
  const points = [angle - 30, angle + 30].map((edge) => {
    const radians = ((edge - 90) * Math.PI) / 180;
    const x = 50 + 150 * Math.cos(radians);
    const y = 50 + 150 * Math.sin(radians);
    return `${x.toFixed(2)}% ${y.toFixed(2)}%`;
  });
  return `polygon(50% 50%, ${points.join(", ")})`;
}

/**
 * The hand-printed mark opening petal by petal, as the splash's bloom does: one
 * copy of the print per petal, each cut to its wedge and grown from the centre.
 * With reduced motion it's simply open.
 */
export function TexturedBloom({
  className,
  delay = 0,
  size,
}: {
  className?: string;
  /** When to begin, in ms. */
  delay?: number;
  size: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative shrink-0", className)}
      style={{ height: size, width: size }}
    >
      {PETAL_OPENING.map(({ angle, delay: petalDelay }) => (
        <img
          alt=""
          className="absolute inset-0 size-full animate-petal-open motion-reduce:animate-none"
          height={size}
          key={angle}
          src={mark}
          style={
            {
              // The top petal is already showing as the bud, as on the splash
              "--petal-from": angle === 0 ? 0.55 : 0,
              animationDelay: `${delay + petalDelay}ms`,
              clipPath: wedge(angle),
            } as CSSProperties
          }
          width={size}
        />
      ))}
    </div>
  );
}
