import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

type AppWindowProps = ComponentProps<"div"> & {
  title: string;
};

/** A desktop window frame with traffic lights, for showing the product in context. */
export function AppWindow({
  title,
  className,
  children,
  ...props
}: AppWindowProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-clip rounded-xl border border-ink/10 bg-paper-page shadow-window",
        className
      )}
      {...props}
    >
      <div className="flex h-10 shrink-0 items-center justify-between border-line border-b bg-paper-sunk px-3.5">
        <div aria-hidden="true" className="flex flex-1 gap-2">
          <span className="size-3 rounded-full border-[0.5px] border-black/12 bg-traffic-close" />
          <span className="size-3 rounded-full border-[0.5px] border-black/12 bg-traffic-minimize" />
          <span className="size-3 rounded-full border-[0.5px] border-black/12 bg-traffic-zoom" />
        </div>
        <span className="font-medium text-ink-subtle text-xs">{title}</span>
        <div className="flex-1" />
      </div>
      <div className="flex min-h-0 grow">{children}</div>
    </div>
  );
}
