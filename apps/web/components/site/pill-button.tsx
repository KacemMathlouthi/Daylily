import { cn } from "cn";
import type { ComponentProps } from "react";

interface PillStyle {
  size?: "md" | "lg";
  tone?: "ink" | "glass";
}

function pillClasses(
  tone: PillStyle["tone"] = "ink",
  size: PillStyle["size"] = "lg"
) {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full font-medium transition-[transform,box-shadow,background-color] duration-300 ease-soft hover:-translate-y-0.5 active:translate-y-0",
    size === "lg" ? "px-6.5 py-3.75 text-base" : "px-5 py-2.75 text-sm",
    tone === "ink"
      ? "bg-ink text-paper-raised shadow-[inset_0_1px_0_#ffffff2e,0_10px_24px_#241b1538] hover:shadow-[inset_0_1px_0_#ffffff2e,0_14px_30px_#241b1545]"
      : "border border-white/90 bg-white/75 text-ink shadow-[0_8px_20px_#241b1514] backdrop-blur-md hover:bg-white/90"
  );
}

/** The rounded call-to-action used across the landing page. */
export function PillButton({
  tone,
  size,
  className,
  ...props
}: ComponentProps<"button"> & PillStyle) {
  return (
    <button
      className={cn(pillClasses(tone, size), className)}
      type="button"
      {...props}
    />
  );
}

/** A link styled as a pill, for calls to action that go somewhere. */
export function PillLink({
  tone,
  size,
  className,
  ...props
}: ComponentProps<"a"> & PillStyle) {
  return <a className={cn(pillClasses(tone, size), className)} {...props} />;
}
