import { cn } from "@daylily/ui/lib/cn";
import { Button } from "@daylily/ui/primitives/button";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { closeWelcome, useWelcome } from "../../lib/welcome";
import { MacDragStrip } from "../mac-drag-strip";
import { HELLO_MS, Hello } from "./hello";
import type { ChangeChoices, OnboardingChoices, OnboardingStep } from "./step";
import { chosenFolder } from "./step";
import { ONBOARDING_STEPS } from "./steps";

/** How long onboarding takes to fade away over today's page. */
const LEAVE_MS = 500;

/**
 * Where onboarding is: going through the steps, saying hello once they're
 * saved, then fading away over today's page.
 */
type Phase = "steps" | "hello" | "leaving";

/** The journal this computer uses now, as the choices onboarding starts from. */
function useStartingChoices() {
  const [choices, setChoices] = useState<OnboardingChoices | null>(null);
  useEffect(() => {
    let current = true;
    Promise.all([
      window.daylily.journal.folder(),
      window.daylily.app.info(),
    ]).then(([folder, app]) => {
      if (current) {
        setChoices({
          folder: { opened: null, suggested: folder, use: "suggested" },
          ghostPrompts: folder.config.ghostPrompts,
          name: folder.config.name ?? app.userName ?? "",
          reminder: folder.config.reminder,
        });
      }
    });
    return () => {
      current = false;
    };
  }, []);
  return [choices, setChoices] as const;
}

/**
 * The paintings beside the steps, all laid one over another so each step's
 * fades in over the last; its card rises in with it.
 */
function Art({ step }: { step: OnboardingStep }) {
  return (
    <div className="relative hidden basis-5/12 overflow-clip bg-ink md:block">
      {ONBOARDING_STEPS.map(({ art, id }) => (
        <img
          alt={id === step.id ? art.alt : ""}
          className={cn(
            "absolute inset-0 size-full object-cover transition-[opacity,scale] duration-700 ease-soft motion-reduce:transition-none",
            id === step.id ? "scale-100 opacity-100" : "scale-105 opacity-0"
          )}
          height={900}
          key={id}
          src={art.src}
          style={{ objectPosition: art.position }}
          width={620}
        />
      ))}
      <div
        className="absolute right-6 bottom-10 left-11 flex max-w-75 flex-col gap-1.5 rounded-xl bg-paper-page/82 px-4.5 py-4 backdrop-blur-md motion-safe:animate-rise-in"
        key={step.id}
        style={{ animationDelay: "200ms" }}
      >
        <p className="font-display text-ink text-xl italic leading-6.5">
          {step.caption.line}
        </p>
        <p className="text-ink-muted text-meta leading-4">
          {step.caption.note}
        </p>
      </div>
    </div>
  );
}

/** Dashes for the steps, the ones reached in daylily, and where this one is. */
function Progress({ at, of }: { at: number; of: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: of }, (_, index) => (
        <span
          className={cn(
            "h-1 w-5.5 rounded-full transition-colors duration-500 ease-soft",
            index <= at ? "bg-daylily" : "bg-line-strong"
          )}
          // biome-ignore lint/suspicious/noArrayIndexKey: the dashes are positions, nothing more
          key={index}
        />
      ))}
      <span className="pl-1.5 font-medium text-caption text-ink-subtle">
        Step {at + 1} of {of}
      </span>
    </div>
  );
}

interface QuietActionProps {
  action: { label: string; run: () => void } | null;
}

/** The quieter way on, left of the main button: Back, or a step's shortcut. */
function QuietAction({ action }: QuietActionProps) {
  if (!action) {
    return <span />;
  }
  return (
    <button
      className="font-medium text-ink-subtle text-ui-lg outline-none transition-colors duration-150 hover:text-ink focus-visible:underline"
      onClick={action.run}
      type="button"
    >
      {action.label}
    </button>
  );
}

/** Opened again from Help, onboarding can be left as it was with Escape. */
function useEscapeWhenDone() {
  const { done } = useWelcome();
  useEffect(() => {
    if (!done) {
      return;
    }
    const leave = (event: KeyboardEvent) => {
      // An open list, as the reminder's time, closes first
      if (event.key === "Escape" && !event.defaultPrevented) {
        closeWelcome(false);
      }
    };
    window.addEventListener("keydown", leave);
    return () => window.removeEventListener("keydown", leave);
  }, [done]);
}

/**
 * After hello, today's page opens beneath and onboarding fades away over it;
 * once faded, it's gone.
 */
function useGoodbye(phase: Phase, setPhase: (phase: Phase) => void) {
  const navigate = useNavigate();
  useEffect(() => {
    if (phase === "hello") {
      const timer = setTimeout(() => {
        navigate({ to: "/today" });
        setPhase("leaving");
      }, HELLO_MS);
      return () => clearTimeout(timer);
    }
    if (phase === "leaving") {
      const timer = setTimeout(() => closeWelcome(true), LEAVE_MS);
      return () => clearTimeout(timer);
    }
  }, [navigate, phase, setPhase]);
}

/**
 * Onboarding (Paper 10d to 10h): the steps in `steps.ts`, one at a time, each
 * changing the choices. Nothing is saved until the last; then a hello, and
 * today's page.
 */
export function Onboarding() {
  const [choices, setChoices] = useStartingChoices();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("steps");
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const client = useQueryClient();
  useEscapeWhenDone();
  useGoodbye(phase, setPhase);

  const step = ONBOARDING_STEPS[index] ?? ONBOARDING_STEPS[0];
  const last = index === ONBOARDING_STEPS.length - 1;

  const change = useCallback<ChangeChoices>(
    (changes) => setChoices((current) => current && { ...current, ...changes }),
    [setChoices]
  );
  const goTo = useCallback((id: string) => {
    const found = ONBOARDING_STEPS.findIndex((each) => each.id === id);
    if (found >= 0) {
      setIndex(found);
    }
  }, []);
  const back = useCallback(() => setIndex((at) => Math.max(0, at - 1)), []);

  const finish = useCallback(
    async (chosen: OnboardingChoices) => {
      setSaving(true);
      setProblem(null);
      try {
        for (const each of ONBOARDING_STEPS) {
          // In order: the folder is moved to before its preferences are saved there
          // biome-ignore lint/performance/noAwaitInLoops: each step's save builds on the one before
          await each.save?.(chosen);
        }
        await window.daylily.device.set({ onboarded: true });
        await client.invalidateQueries({ queryKey: ["journal"] });
        setPhase("hello");
      } catch (error) {
        console.error("Could not finish onboarding", error);
        setProblem("Couldn’t save your choices. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [client]
  );

  const next = useCallback(() => {
    if (!choices) {
      return;
    }
    if (last) {
      finish(choices);
    } else {
      setIndex((at) => at + 1);
    }
  }, [choices, finish, last]);

  const shortcut = useCallback(() => {
    if (choices && step?.shortcut) {
      step.shortcut.run({ change, choices, goTo });
    }
  }, [change, choices, goTo, step]);

  if (!(step && choices)) {
    return (
      <div className="fixed inset-x-0 top-(--title-strip) bottom-0 z-40 bg-paper-page" />
    );
  }
  const { Form } = step;
  // Back, after the first step; before it, the first step's own shortcut
  let quiet: QuietActionProps["action"] = null;
  if (index > 0) {
    quiet = { label: "Back", run: back };
  } else if (step.shortcut) {
    quiet = { label: step.shortcut.label, run: shortcut };
  }
  const ready = step.ready?.(choices) ?? true;

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-(--title-strip) bottom-0 z-40 flex bg-paper-page transition-opacity ease-soft motion-reduce:transition-none",
        phase === "leaving" && "pointer-events-none opacity-0"
      )}
      style={{ transitionDuration: `${LEAVE_MS}ms` }}
    >
      {window.daylily.platform === "darwin" ? <MacDragStrip /> : null}
      {phase === "steps" ? (
        <>
          <Art step={step} />
          <main className="flex grow flex-col overflow-y-auto px-10 py-12 lg:px-22.5">
            <div
              // Centred with auto margins, so a step taller than the window scrolls from its top
              className="rise-in-in-turn my-auto flex w-full max-w-140 flex-col gap-7.5"
              key={step.id}
            >
              <Progress at={index} of={ONBOARDING_STEPS.length} />
              <Form change={change} choices={choices} />
              <div className="flex items-center justify-between gap-4">
                <QuietAction action={quiet} />
                <Button
                  disabled={!ready || saving}
                  onClick={next}
                  size="pill-md"
                  variant="ink"
                >
                  {step.next}
                </Button>
              </div>
              {problem ? (
                <p className="text-caption text-ink-muted" role="alert">
                  {problem}
                </p>
              ) : null}
            </div>
          </main>
        </>
      ) : (
        <Hello
          first={chosenFolder(choices.folder).days === 0}
          name={choices.name.trim()}
        />
      )}
    </div>
  );
}
