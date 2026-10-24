"use client";

import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { cn } from "@daylily/ui/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/site/button-link";
import { GithubMark } from "./github-mark";
import { GITHUB_URL, NAV_LINKS } from "./links";

const SCROLLED_AFTER_PX = 24;
const LANDING_SECTIONS = ["features", "garden", "calendar"];
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

/** The landing section in the middle of the viewport, or the current page. */
function useActiveLink(pathname: string) {
  const [section, setSection] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== "/") {
      setSection(null);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    for (const id of LANDING_SECTIONS) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }
    return () => observer.disconnect();
  }, [pathname]);

  return PAGE_LINKS[pathname] ?? section;
}

export function Header() {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const active = useActiveLink(pathname);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-soft",
        scrolled
          ? "border-ink/8 bg-paper-raised/78 shadow-header backdrop-blur-[18px]"
          : "border-transparent"
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-360 items-center justify-between px-5 transition-[padding] duration-300 ease-soft md:px-10",
          scrolled ? "py-3" : "py-5 md:py-7"
        )}
      >
        <Link className="flex items-center gap-2.25 xl:w-55" href="/">
          <DaylilyMark className="text-ink" size={22} />
          <span
            className={cn(
              "font-display text-ink tracking-snug transition-[font-size] duration-300 ease-soft",
              scrolled ? "text-title-xs leading-7" : "text-3xl leading-7.5"
            )}
          >
            Daylily
          </span>
        </Link>

        <nav
          className={cn(
            "hidden items-center gap-1 rounded-full border p-1.25 transition-[background-color,border-color] duration-300 ease-soft lg:flex",
            scrolled
              ? "border-transparent bg-transparent"
              : "border-white/70 bg-white/55 backdrop-blur-lg"
          )}
        >
          {NAV_LINKS.map((link) => (
            <Link
              aria-current={active === link.id ? "true" : undefined}
              className={cn(
                "rounded-full px-4 py-2 font-medium text-ink text-sm transition-colors duration-200",
                active === link.id ? "bg-ink/[0.06]" : "hover:bg-ink/[0.04]"
              )}
              href={link.href}
              key={link.id}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 xl:w-55">
          <ButtonLink
            aria-label="Daylily on GitHub"
            href={GITHUB_URL}
            size="pill-icon"
            variant="paper"
          >
            <GithubMark />
          </ButtonLink>
          <ButtonLink href="/download" size="pill-md" variant="ink">
            Download
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
