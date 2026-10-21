import type { ComponentProps } from "react";

const PETAL = "M0,-10 C16,-22 15,-40 0,-50 C-15,-40 -16,-22 0,-10 Z";
const ANGLES = [0, 60, 120, 180, 240, 300];

type DaylilyMarkProps = ComponentProps<"svg"> & {
  size?: number;
};

/** The six-petal daylily. Takes its colour from `currentColor`. */
export function DaylilyMark({ size = 22, ...props }: DaylilyMarkProps) {
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
      {ANGLES.map((angle) => (
        <path d={PETAL} key={angle} transform={`rotate(${angle})`} />
      ))}
    </svg>
  );
}
