import { cn } from "@daylily/ui/lib/cn";
import type { ReactNode } from "react";

/**
 * A screen: a centered content column (up to 1200px, or 880px for Home) with empty
 * margins that grow on wide windows (Paper: "05c Calendar · wide window"). The top
 * 48px stays clear for the window's title area; `corner` sits in its top-right space.
 */
export function Page({
  children,
  narrow = false,
  corner,
  className,
}: {
  children: ReactNode;
  narrow?: boolean;
  corner?: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative flex grow flex-col px-8 pt-12 pb-8">
      {corner ? (
        // Above macOS's drag strip, and clickable through it
        <div className="absolute top-0 right-0 z-20 flex h-12 items-center px-5 [-webkit-app-region:no-drag]">
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
