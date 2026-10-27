"use client";

import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { cn } from "@daylily/ui/lib/cn";
import { Button } from "@daylily/ui/primitives/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@daylily/ui/primitives/sheet";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { ButtonLink } from "@/components/site/button-link";
import { FeatureIcon } from "./feature-icon";
import { GithubMark } from "./github-mark";
import { type FeatureLink, GITHUB_URL, NAV_LINKS } from "./links";

function MenuIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path
        d="M2.5 5.5h11M2.5 10.5h11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ActiveMark({ active }: { active: boolean }) {
  return (
    <DaylilyMark
      className={cn(
        "shrink-0 text-daylily",
        active ? "opacity-100" : "opacity-0"
      )}
      size={14}
    />
  );
}

const rowLabelClass =
  "font-display text-display-xs text-ink leading-11 tracking-heading-sm";

/**
 * The header's links on screens too narrow for them: a button that opens a
 * full-screen sheet of paper with the feature pages under Features, the other
 * links, Download and GitHub (Paper: "Menu · open · mobile · 2026").
 */
export function MobileMenu({
  active,
  features,
}: {
  active: string | null;
  features: FeatureLink[];
}) {
  const [open, setOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(true);
  const toggleFeatures = useCallback(() => setFeaturesOpen((was) => !was), []);
  // Following a link closes the sheet, even one to a section of this page
  const close = useCallback(() => setOpen(false), []);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger
        aria-label="Open the menu"
        render={
          <Button className="lg:hidden" size="pill-icon" variant="paper" />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent
        className="inset-0 h-dvh gap-0 overflow-y-auto border-0 bg-paper-raised text-ink data-[side=top]:h-dvh motion-reduce:transition-none lg:hidden"
        showCloseButton={false}
        side="top"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div
          aria-hidden="true"
          className="mask-[linear-gradient(transparent_0%,black_55%)] pointer-events-none absolute inset-x-0 bottom-0 h-62.5"
        >
          <Image
            alt=""
            className="object-cover object-[30%_85%]"
            fill
            sizes="100vw"
            src="/images/art/dusk.jpg"
          />
        </div>

        <div className="relative flex items-center justify-between px-5 py-5">
          <Link className="flex items-center gap-2.25" href="/" onClick={close}>
            <DaylilyMark className="text-ink" size={22} />
            <span className="font-display text-3xl text-ink leading-7.5 tracking-snug">
              Daylily
            </span>
          </Link>
          <SheetClose
            aria-label="Close the menu"
            render={<Button size="pill-icon" variant="paper" />}
          >
            <CloseIcon />
          </SheetClose>
        </div>

        <nav className="relative flex flex-col px-5 pt-4">
          <button
            aria-controls="mobile-menu-features"
            aria-expanded={featuresOpen}
            className="flex items-center gap-3 pt-3 pb-1.5 text-left"
            onClick={toggleFeatures}
            type="button"
          >
            <ActiveMark active={active === "features"} />
            <span className={rowLabelClass}>Features</span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "ml-auto shrink-0 text-ink/60 transition-transform duration-300 ease-soft motion-reduce:transition-none",
                featuresOpen && "rotate-180"
              )}
              size={20}
              strokeWidth={1.8}
            />
          </button>
          <ul
            className={cn(
              "flex flex-col gap-0.5 border-line border-b pb-3.5 pl-6.5",
              !featuresOpen && "hidden"
            )}
            id="mobile-menu-features"
          >
            {features.map((feature) => {
              const href = `/features/${feature.slug}`;
              return (
                <li key={feature.slug}>
                  <Link
                    className="flex items-center gap-3 py-1.75"
                    href={href}
                    onClick={close}
                  >
                    <FeatureIcon
                      className="size-8.5 bg-paper-page [&_svg]:size-4"
                      slug={feature.slug}
                    />
                    <span className="flex flex-col gap-px">
                      <span className="font-medium text-base text-ink leading-5">
                        {feature.name}
                      </span>
                      <span className="text-ink-muted text-ui leading-4.25">
                        {feature.oneLine}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {NAV_LINKS.map((link) => (
            <Link
              aria-current={active === link.id ? "page" : undefined}
              className="flex items-center gap-3 border-line border-b py-3 last:border-b-0"
              href={link.href}
              key={link.id}
              onClick={close}
            >
              <ActiveMark active={active === link.id} />
              <span className={rowLabelClass}>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="relative flex flex-col gap-4 px-5 pt-9 pb-7">
          <div className="flex gap-2.5">
            <ButtonLink
              className="flex-1"
              href="/download"
              onClick={close}
              size="pill-lg"
              variant="ink"
            >
              Download Daylily
            </ButtonLink>
            <ButtonLink
              aria-label="Daylily on GitHub"
              className="size-13 [&_svg]:size-5"
              href={GITHUB_URL}
              size="pill-icon"
              variant="paper"
            >
              <GithubMark />
            </ButtonLink>
          </div>
          <p className="text-center text-ink-muted text-ui">
            Free &amp; open source · Your files stay on your machine
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
