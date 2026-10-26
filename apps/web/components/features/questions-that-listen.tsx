import { Reveal } from "@/components/site/motion";

/**
 * Ghost prompts as they're growing (Paper "Feature · Ghost prompts"): with AI
 * on, the question reacts to what was just written. Shown as coming soon.
 */
export function QuestionsThatListen() {
  return (
    <section className="px-4 pt-6 pb-24 md:px-16 md:pb-28">
      <Reveal className="mx-auto flex max-w-328 flex-col gap-10 rounded-card-lg bg-paper px-6 py-12 md:px-18 md:py-16 lg:flex-row lg:items-center lg:gap-18">
        <div className="flex flex-col gap-4 lg:w-117.5 lg:shrink-0">
          <p className="flex flex-wrap items-center gap-2.5">
            <span className="font-medium text-daylily text-ui">
              Questions that listen
            </span>
            <span className="rounded-full border border-line-strong px-2.5 py-1 font-medium text-ink-subtle text-xs leading-4">
              Coming soon
            </span>
          </p>
          <h2 className="font-display text-5xl text-ink leading-heading tracking-heading md:text-[52px] md:leading-13.5">
            A question about what you just wrote.
          </h2>
          <p className="text-body text-ink-soft leading-7">
            Turn on AI, with the provider you choose or a model on your own
            computer, and the question reacts to your words. It notices what you
            skipped past, asks what it meant to you, and gives you something to
            ponder before you go on. It sees only today’s page, and it still
            never writes a word.
          </p>
        </div>
        <div className="flex grow flex-col gap-3.5">
          <div className="flex flex-col gap-3.5 rounded-2xl bg-paper-page px-8 py-7 shadow-card">
            <p className="font-writing text-ink-2 text-writing">
              Sam laughed at the umbrella thing until he had to sit down on the
              curb. I haven’t heard him laugh like that since the move.
            </p>
            <p className="font-writing text-ghost text-writing italic">
              …what do you think has been weighing on him since then?
            </p>
          </div>
          <p className="flex flex-wrap gap-x-5 gap-y-1 px-1 text-caption">
            <span className="text-ink-subtle">
              Today: …and how did that feel?
            </span>
            <span className="font-medium text-daylily-deep">
              Soon: a question about Sam
            </span>
          </p>
        </div>
      </Reveal>
    </section>
  );
}
