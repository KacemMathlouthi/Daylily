import { cn } from "@daylily/ui/lib/cn";
import type { ReactNode } from "react";

/**
 * A screen: a centered content column (up to 1200px, or 880px for Home) with empty
 * margins that grow on wide windows (Paper: "05c Calendar · wide window"). The top
 * 48px stays clear for the window's title area. `backdrop` paints behind the column
 * across the whole width, such as Home's meadow; `corner` sits in that top-right space.
 */
export function Page({
  children,
  narrow = false,
  backdrop,
  corner,
  className,
}: {
  children: ReactNode;
  narrow?: boolean;
  backdrop?: ReactNode;
  corner?: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative flex grow flex-col px-8 pt-12 pb-8">
      {backdrop}
      {corner ? (
        <div className="absolute top-0 right-0 flex h-12 items-center px-5">
          {corner}
        </div>
      ) : null}
      <div
        className={cn(
          "relative mx-auto flex w-full flex-col gap-4.5",
          narrow ? "max-w-220" : "max-w-300",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
