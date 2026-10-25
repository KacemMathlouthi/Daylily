import { cn } from "@daylily/ui/lib/cn";
import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "@/components/site/motion";
import { AiToggles } from "./ai-toggles";
import { FileTree } from "./file-tree";
import { GhostLine } from "./ghost-line";
import { SealedStack } from "./sealed-stack";

function Card({
  title,
  body,
  dark = false,
  className,
  children,
}: {
  title: string;
  body: string;
  dark?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between gap-10 overflow-clip rounded-3xl p-6 md:p-9 lg:min-h-120",
        dark ? "bg-ink" : "border border-line bg-paper-tint",
        className
      )}
    >
      <div className="flex max-w-105 flex-col gap-2">
        <h3
          className={cn(
            "font-display text-title-sm leading-9.5 tracking-title md:text-title",
            dark ? "text-on-ink" : "text-ink"
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "text-body-sm leading-5.75",
            dark ? "text-on-ink-muted" : "text-ink-muted"
          )}
        >
          {body}
        </p>
      </div>
      {children}
    </div>
  );
}

function GhostCard() {
  return (
    <Card
      body="Pause, and a quiet question fades in where your cursor rests. You can’t accept it or tab it in. It vanishes the moment you type."
      className="bg-ghost-glow"
      title="Ghost prompts"
    >
      <div className="absolute top-9 right-9 hidden items-center gap-1.5 rounded-lg border border-white/90 bg-white/70 px-2.5 py-1.5 text-ink-subtle text-xs backdrop-blur-md md:flex">
        <kbd className="rounded-sm border border-line-strong px-1.5 py-px font-sans font-semibold text-tag">
          Tab
        </kbd>
        does nothing, on purpose
      </div>
      <Reveal className="flex max-w-150 flex-col gap-2.5 rounded-2xl border border-ink/6 bg-paper-page px-6 py-6.5 font-writing text-body text-ink-2 leading-7.75 shadow-card-lift md:px-7.5 md:text-lead">
        <p>
          Work was loud again. I kept my head down and finished the report, but
          by four I could feel it in my shoulders.
        </p>
        <GhostLine
          prompt="…what did you do with the evening?"
          text="I left early."
        />
      </Reveal>
    </Card>
  );
}

function SealedCard() {
  return (
    <Card
      body="Today is the only page you can write. Yesterday stays honest, like ink."
      dark
      title="Sealed at 4am"
    >
      <SealedStack />
    </Card>
  );
}

function AiCard() {
  return (
    <Card
      body="Turn features on one at a time, with your own key or a local model. It can ask and answer. It never writes."
      className="bg-mist-glow lg:min-h-125"
      title="AI is off until you say so"
    >
      <Reveal>
        <AiToggles />
      </Reveal>
    </Card>
  );
}

function FilesCard() {
  return (
    <Card
      body="Every day is a markdown file in a folder you own. Sync with git, iCloud, Drive or S3. Open it in Obsidian, grep it, keep it forever."
      className="lg:min-h-125"
      title="Plain files. Readable in 20 years."
    >
      <Reveal className="relative z-10 w-full max-w-90">
        <FileTree />
      </Reveal>
      <Image
        alt="A stack of paper pages held by a paperclip, with a brass key"
        className="pointer-events-none absolute right-4.5 bottom-1.5 hidden h-68 w-auto mix-blend-multiply lg:block"
        height={504}
        src="/images/art/pages.png"
        width={611}
      />
    </Card>
  );
}

export function Features() {
  return (
    <section
      className="flex flex-col items-center gap-14 bg-paper-raised px-4 pt-10 pb-28 md:px-16 md:pb-40"
      id="features"
    >
      <Reveal className="flex flex-col items-center gap-3.5 text-center">
        <p className="font-medium text-daylily text-ui">How it works</p>
        <h2 className="font-display text-display-sm text-ink leading-heading tracking-heading md:text-display-lg">
          Made like a paper journal.
        </h2>
      </Reveal>
      <div className="flex w-full max-w-328 flex-col gap-5">
        <div className="grid gap-5 xl:grid-cols-[776fr_516fr]">
          <GhostCard />
          <SealedCard />
        </div>
        <div className="grid gap-5 lg:grid-cols-[516fr_776fr]">
          <AiCard />
          <FilesCard />
        </div>
      </div>
    </section>
  );
}
