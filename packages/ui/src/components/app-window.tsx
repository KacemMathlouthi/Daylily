import { cn } from "cn";
import type { ComponentProps } from "react";

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
        "flex flex-col overflow-clip rounded-[14px] border border-ink/10 bg-paper-page shadow-[inset_0_1px_0_#ffffffe6,0_2px_4px_#241b150a,0_24px_48px_#241b151a,0_60px_120px_#50321429]",
        className
      )}
      {...props}
    >
      <div className="flex h-10 shrink-0 items-center justify-between border-line border-b bg-paper-sunk px-3.5">
        <div aria-hidden="true" className="flex flex-1 gap-2">
          <span className="size-3 rounded-full border-[0.5px] border-black/12 bg-[#ee6a5f]" />
          <span className="size-3 rounded-full border-[0.5px] border-black/12 bg-[#f5be4f]" />
          <span className="size-3 rounded-full border-[0.5px] border-black/12 bg-[#62c655]" />
        </div>
        <span className="font-medium text-ink-subtle text-xs">{title}</span>
        <div className="flex-1" />
      </div>
      <div className="flex min-h-0 grow">{children}</div>
    </div>
  );
}
