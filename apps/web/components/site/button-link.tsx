import { Button } from "@daylily/ui/primitives/button";
import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonLinkProps = Omit<
  ComponentProps<typeof Button>,
  "nativeButton" | "render"
> & {
  href: string;
};

/** A shadcn Button that navigates: renders a Next.js link with button styling. */
export function ButtonLink({ href, ...props }: ButtonLinkProps) {
  return (
    <Button nativeButton={false} render={<Link href={href} />} {...props} />
  );
}
