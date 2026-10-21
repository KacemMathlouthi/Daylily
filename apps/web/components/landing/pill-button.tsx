import { cn } from "cn";
import type { ComponentProps } from "react";

type PillButtonProps = ComponentProps<"button"> & {
  tone?: "ink" | "glass";
  size?: "md" | "lg";
};

/** The rounded call-to-action used across the landing page. */
export function PillButton({
  tone = "ink",
  size = "lg",
  className,
  ...props
}: PillButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full font-medium transition-[transform,box-shadow,background-color] duration-300 ease-soft hover:-translate-y-0.5 active:translate-y-0",
        size === "lg" ? "px-6.5 py-3.75 text-base" : "px-5 py-2.75 text-sm",
        tone === "ink"
          ? "bg-ink text-paper-raised shadow-[inset_0_1px_0_#ffffff2e,0_10px_24px_#241b1538] hover:shadow-[inset_0_1px_0_#ffffff2e,0_14px_30px_#241b1545]"
          : "border border-white/90 bg-white/75 text-ink shadow-[0_8px_20px_#241b1514] backdrop-blur-md hover:bg-white/90",
        className
      )}
      type="button"
      {...props}
    />
  );
}
