import { X } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  type FeatureSlug,
  featureAndNeighbours,
} from "@/app/features/features";
import { Footer } from "@/components/site/footer";
import { HeaderSpacer } from "@/components/site/header-spacer";
import { Reveal } from "@/components/site/motion";
import { pageMetadata } from "@/lib/site";

/** A feature page's title, description and canonical address; its sharing card sits beside its route. */
export function featureMetadata(slug: FeatureSlug): Metadata {
  const { feature } = featureAndNeighbours(slug);
  return pageMetadata({
    description: feature.description,
    path: `/features/${slug}`,
    title: `${feature.name} · Daylily`,
  });
}

function Hero({ slug }: { slug: FeatureSlug }) {
  const { feature } = featureAndNeighbours(slug);
  return (
    <>
      <Reveal className="flex flex-col items-center gap-7 px-5 pt-16 pb-12 text-center md:px-30 md:pt-26 md:pb-18">
        <p className="flex items-center gap-2.5 font-medium text-ui">
          <span className="text-ink-subtle">Features</span>
          <span className="font-normal text-ink-ghost">/</span>
          <span className="text-daylily">{feature.moment}</span>
        </p>
        <h1 className="font-display text-fluid-page text-ink leading-display tracking-display-tight">
          {feature.headline[0]}
          <br />
          <em>{feature.headline[1]}</em>
        </h1>
        <p className="max-w-165 font-writing text-ink-soft text-xl leading-8 md:text-[22px] md:leading-9">
          {feature.lede}
        </p>
      </Reveal>
      <Reveal className="mx-auto max-w-360">
        <Image
          alt={feature.heroImage}
          className="h-auto w-full"
          height={feature.heroHeight * 2}
          priority
          src={`/images/features/${slug}-hero.webp`}
          // Exported at 2x from Paper; compressing again blurs the app's small type.
          unoptimized
          width={2880}
        />
      </Reveal>
    </>
  );
}

function HowItWorks({ slug }: { slug: FeatureSlug }) {
  const { feature } = featureAndNeighbours(slug);
  return (
    <section className="px-5 pt-20 pb-20 md:px-30 md:pt-30 md:pb-24">
      <div className="mx-auto flex max-w-300 flex-col gap-12 md:gap-14">
        <Reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-3.5">
            <p className="font-medium text-daylily text-ui">How it works</p>
            <h2 className="font-display text-5xl text-ink leading-heading tracking-heading md:text-display-lg">
              {feature.how.heading}
            </h2>
          </div>
          <p className="max-w-105 text-body text-ink-muted leading-7">
            {feature.how.note}
          </p>
        </Reveal>
        <ol className="grid gap-x-8 gap-y-14 md:grid-cols-2 md:gap-y-16">
          {feature.beats.map((beat, index) => (
            <li key={beat.title}>
              <Reveal
                className="flex flex-col gap-7"
                delay={(index % 2) * 0.08}
              >
                <Image
                  alt={beat.image}
                  className="h-auto w-full"
                  height={680}
                  src={`/images/features/${slug}-${index + 1}.webp`}
                  unoptimized
                  width={1168}
                />
                <div className="flex gap-6 px-1">
                  <span className="w-11 shrink-0 font-display text-daylily text-title-md leading-9.5">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-2.5">
                    <h3 className="font-display text-ink text-title-md leading-9.5 tracking-title">
                      {beat.title}
                    </h3>
                    <p className="text-base text-ink-muted leading-6.5">
                      {beat.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function WhatItIsnt({ slug }: { slug: FeatureSlug }) {
  const { isnt } = featureAndNeighbours(slug).feature;
  return (
    <section className="px-4 pt-6 pb-24 md:px-16 md:pb-30">
      <Reveal className="mx-auto flex max-w-328 flex-col gap-10 rounded-card-lg bg-ink px-6 py-12 md:px-20 md:py-18 lg:flex-row lg:gap-20">
        <div className="flex flex-col gap-3.5 lg:w-90 lg:shrink-0">
          <p className="font-medium text-saffron text-ui">What it isn’t</p>
          <h2 className="font-display text-display-sm text-on-ink leading-heading-loose tracking-heading md:text-[56px] md:leading-14.5">
            {isnt.heading}
          </h2>
          <p className="pt-2.5 text-base text-on-ink-2/80 leading-6.5">
            {isnt.note}
          </p>
        </div>
        <ul className="flex grow flex-col">
          {isnt.lines.map((line) => (
            <li
              className="flex items-center gap-5 border-paper-raised/12 border-b py-5 last:border-b-0"
              key={line}
            >
              <X className="shrink-0 text-daylily" size={18} strokeWidth={2} />
              <span className="font-writing text-lead text-on-ink-2 leading-7.5 md:text-[21px]">
                {line}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

/** The pages around this one, the ends joined, so there's always somewhere to go next. */
function Neighbours({ slug }: { slug: FeatureSlug }) {
  const { next, previous } = featureAndNeighbours(slug);
  return (
    <nav aria-label="More features" className="px-5 pb-6 md:px-30">
      <div className="mx-auto flex max-w-300 flex-col justify-between gap-10 border-line-strong border-t pt-10 sm:flex-row">
        <Link
          className="group flex flex-col gap-3"
          href={`/features/${previous.slug}`}
        >
          <span className="font-medium text-ink-subtle text-ui">Back to</span>
          <span className="font-display text-display-xs text-ink leading-11 tracking-heading-sm transition-colors duration-200 group-hover:text-daylily-deep">
            ← {previous.name}
          </span>
        </Link>
        <Link
          className="group flex flex-col gap-3 sm:items-end sm:text-right"
          href={`/features/${next.slug}`}
        >
          <span className="font-medium text-daylily text-ui">
            Next · {next.moment}
          </span>
          <span className="font-display text-5xl text-ink leading-heading tracking-heading transition-colors duration-200 group-hover:text-daylily-deep md:text-display-lg">
            {next.name} →
          </span>
          <span className="text-base text-ink-muted leading-6.5">
            {next.oneLine}
          </span>
        </Link>
      </div>
    </nav>
  );
}

/**
 * A feature's own page (Paper "Feature · …"): what it is and what you'd use it
 * for, how it works in four beats, what it deliberately isn't, then the
 * features either side. `extra` sits after how it works, for a page with more
 * to say.
 */
export function FeaturePage({
  slug,
  extra,
}: {
  slug: FeatureSlug;
  extra?: ReactNode;
}) {
  return (
    <>
      <main className="bg-paper-raised">
        <HeaderSpacer />
        <Hero slug={slug} />
        <HowItWorks slug={slug} />
        {extra}
        <WhatItIsnt slug={slug} />
        <Neighbours slug={slug} />
      </main>
      <Footer />
    </>
  );
}
