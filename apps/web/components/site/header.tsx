"use client";

import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { cn } from "@daylily/ui/lib/cn";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@daylily/ui/primitives/navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/site/button-link";
import { FeatureIcon } from "./feature-icon";
import { GithubMark } from "./github-mark";
import { type FeatureLink, GITHUB_URL, NAV_LINKS } from "./links";
import { MobileMenu } from "./mobile-menu";

const SCROLLED_AFTER_PX = 24;
/** Pages that are a link of their own in the header. */
const PAGE_LINKS: Record<string, string> = {
  "/changelog": "changelog",
  "/manifesto": "manifesto",
  "/roadmap": "roadmap",
};

/** True once the page has scrolled away from the very top. */
function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > SCROLLED_AFTER_PX);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return scrolled;
}

/** The current page's link, or Features while the landing shows its features. */
function useActiveLink(pathname: string) {
  const [onFeatures, setOnFeatures] = useState(false);

  useEffect(() => {
    const element = pathname === "/" && document.getElementById("features");
    if (!element) {
      setOnFeatures(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setOnFeatures(entry?.isIntersecting ?? false),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [pathname]);

  if (pathname.startsWith("/features/") || onFeatures) {
    return "features";
  }
  return PAGE_LINKS[pathname] ?? null;
}

const linkClass =
  "h-auto rounded-full px-4 py-2 font-medium text-ink text-sm transition-colors duration-200 hover:bg-ink/[0.04] focus:bg-ink/[0.04]";

/**
 * Features opens a menu of the six feature pages, two by three, each with its
 * icon and one line (Paper "Header · features open").
 */
function FeaturesMenu({
  active,
  features,
  pathname,
}: {
  active: boolean;
  features: FeatureLink[];
  pathname: string;
}) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className={cn(
          linkClass,
          "gap-0.5 pr-3 data-popup-open:bg-ink/[0.06] data-popup-open:hover:bg-ink/[0.06] [&>svg]:size-3.5 [&>svg]:opacity-70",
          active && "bg-ink/[0.06]"
        )}
      >
        Features
      </NavigationMenuTrigger>
      <NavigationMenuContent className="p-2.5">
        <ul className="grid w-150 grid-cols-2 gap-1">
          {features.map((feature) => {
            const href = `/features/${feature.slug}`;
            return (
              <li key={feature.slug}>
                <NavigationMenuLink
                  active={pathname === href}
                  className="group/item items-start gap-3.5 rounded-xl p-3 hover:bg-paper-tint focus:bg-paper-tint data-active:bg-paper-tint"
                  render={<Link href={href} />}
                >
                  <FeatureIcon
                    className="bg-paper-page group-hover/item:text-daylily group-focus/item:text-daylily"
                    slug={feature.slug}
                  />
                  <span className="flex flex-col gap-0.75 pt-px">
                    <span className="font-medium text-body-sm text-ink leading-4.75">
                      {feature.name}
                    </span>
                    <span className="text-ink-muted text-ui-lg leading-4.75">
                      {feature.oneLine}
                    </span>
                  </span>
                </NavigationMenuLink>
              </li>
            );
          })}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

/**
 * At the top of a page the header spans it; once the page scrolls it gathers
 * into a floating bar of paper (Paper "Header · scrolled · 2026").
 */
export function Header({ features }: { features: FeatureLink[] }) {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const active = useActiveLink(pathname);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[padding] duration-300 ease-soft",
        scrolled ? "px-2.5 pt-2.5 md:px-5 md:pt-3" : "px-0 pt-0"
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full items-center justify-between border transition-[max-width,padding,background-color,border-color,box-shadow,border-radius] duration-300 ease-soft",
          scrolled
            ? "max-w-280 rounded-2xl border-ink/8 bg-paper-raised/78 py-1.75 pr-1.75 pl-3.5 shadow-header backdrop-blur-[18px] md:py-2 md:pr-2 md:pl-5"
            : "max-w-360 rounded-none border-transparent px-5 py-5 md:px-10 md:py-7"
        )}
      >
        <Link
          className={cn(
            "flex items-center gap-2.25 transition-[width] duration-300 ease-soft",
            scrolled ? "xl:w-45" : "xl:w-55"
          )}
          href="/"
        >
          <DaylilyMark className="text-ink" size={scrolled ? 19 : 22} />
          <span
            className={cn(
              "font-display text-ink tracking-snug transition-[font-size] duration-300 ease-soft",
              scrolled ? "text-title-2xs leading-7" : "text-3xl leading-7.5"
            )}
          >
            Daylily
          </span>
        </Link>

        <NavigationMenu
          className={cn(
            "hidden rounded-full border p-1.25 transition-[background-color,border-color] duration-300 ease-soft lg:flex",
            scrolled
              ? "border-transparent bg-transparent"
              : "border-white/70 bg-white/55 backdrop-blur-lg"
          )}
        >
          <NavigationMenuList className="gap-1">
            <FeaturesMenu
              active={active === "features"}
              features={features}
              pathname={pathname}
            />
            {NAV_LINKS.map((link) => (
              <NavigationMenuItem key={link.id}>
                <NavigationMenuLink
                  aria-current={active === link.id ? "page" : undefined}
                  className={cn(
                    linkClass,
                    active === link.id && "bg-ink/[0.06]"
                  )}
                  render={<Link href={link.href} />}
                >
                  {link.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div
          className={cn(
            "flex items-center justify-end gap-2 transition-[width] duration-300 ease-soft",
            scrolled ? "xl:w-45" : "xl:w-55"
          )}
        >
          <ButtonLink
            aria-label="Daylily on GitHub"
            className="hidden lg:inline-flex"
            href={GITHUB_URL}
            size="pill-icon"
            variant="paper"
          >
            <GithubMark />
          </ButtonLink>
          <ButtonLink href="/download" size="pill-md" variant="ink">
            Download
          </ButtonLink>
          <MobileMenu active={active} features={features} />
        </div>
      </div>
    </header>
  );
}
