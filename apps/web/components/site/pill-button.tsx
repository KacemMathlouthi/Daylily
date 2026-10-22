import { cn } from "cn";
import Link from "next/link";
import type { ComponentProps } from "react";

interface PillStyle {
  size?: "sm" | "md" | "lg" | "icon";
  tone?: "ink" | "paper";
}

/*
 * Buttons have weight instead of lift: a soft gradient, a light top edge and a darker
 * bottom lip. Hover only lightens them; pressing sinks them into the page.
 */
const TONES = {
  ink: "border border-[#120c08] bg-[linear-gradient(180deg,#3a2d24_0%,#241b15_100%)] text-paper-raised shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-2px_0_rgba(0,0,0,0.28),0_1px_1px_rgba(36,27,21,0.25),0_6px_14px_rgba(36,27,21,0.22)] hover:bg-[linear-gradient(180deg,#4a3a2f_0%,#2c211a_100%)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-2px_0_rgba(0,0,0,0.28),0_1px_1px_rgba(36,27,21,0.25),0_8px_18px_rgba(36,27,21,0.26)] active:bg-[linear-gradient(180deg,#1e1611_0%,#2a201a_100%)] active:text-ink-2 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_1px_rgba(36,27,21,0.2)]",
  paper:
    "border border-ink/12 bg-[linear-gradient(180deg,#ffffff_0%,#f6f0e6_100%)] text-ink shadow-[inset_0_1px_0_#ffffff,inset_0_-2px_0_rgba(120,90,60,0.08),0_1px_1px_rgba(36,27,21,0.08),0_6px_14px_rgba(36,27,21,0.08)] hover:border-ink/16 hover:bg-[linear-gradient(180deg,#ffffff_0%,#fbf7f0_100%)] hover:shadow-[inset_0_1px_0_#ffffff,inset_0_-2px_0_rgba(120,90,60,0.08),0_1px_1px_rgba(36,27,21,0.1),0_8px_18px_rgba(36,27,21,0.11)] active:border-ink/14 active:bg-[linear-gradient(180deg,#efe7db_0%,#f7f2ea_100%)] active:shadow-[inset_0_2px_4px_rgba(120,90,60,0.16)]",
} as const;

const SIZES = {
  icon: "size-10",
  lg: "gap-2.5 px-6.5 py-3.75 text-base",
  md: "gap-2 px-5 py-2.75 text-sm",
  sm: "gap-2 px-4 py-2.25 text-[13.5px]",
} as const;

function pillClasses(
  tone: PillStyle["tone"] = "ink",
  size: PillStyle["size"] = "lg"
) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full font-medium transition-[background,box-shadow,border-color,color] duration-200 ease-soft focus-visible:outline-2 focus-visible:outline-daylily focus-visible:outline-offset-2",
    TONES[tone],
    SIZES[size]
  );
}

/** The rounded call to action used across the site. */
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
}: ComponentProps<typeof Link> & PillStyle) {
  return <Link className={cn(pillClasses(tone, size), className)} {...props} />;
}
