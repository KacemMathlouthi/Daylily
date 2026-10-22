import type { ReactNode } from "react";

/**
 * A screen's content column: up to 1200px, centered, with the empty margins on
 * either side growing on wide windows (Paper: "05c Calendar · wide window").
 */
export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="px-8 pb-8">
      <div className="mx-auto flex w-full max-w-300 flex-col gap-4.5">
        {children}
      </div>
    </div>
  );
}
