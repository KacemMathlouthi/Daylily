import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import eye from "../../assets/eye.jpg";
import { type OnboardingStep, withFolder } from "./step";

const RULES = [
  {
    note: "At 4am it seals, honest and unedited, like ink.",
    numeral: "i.",
    title: "Today is the only page you can write.",
  },
  {
    note: "Missed days stay bare soil. Nothing wilts, there are no streaks.",
    numeral: "ii.",
    title: "Every day you write grows a flower.",
  },
  {
    note: "Plain markdown in a folder you choose. No account, and nothing you write is sent anywhere.",
    numeral: "iii.",
    title: "The words are yours, and so are the files.",
  },
];

/** Paper 10d: the three rules, before anything else. */
function Welcome() {
  return (
    <>
      <div className="flex flex-col gap-3.5">
        <DaylilyMark className="text-daylily" size={40} />
        <h1 className="font-display text-display text-ink leading-14.5 tracking-heading">
          A little space
          <br />
          for today.
        </h1>
        <p className="text-body-sm text-ink-muted leading-6">
          Daylily is a journal with three quiet rules. They’re the whole idea,
          so here they are before anything else.
        </p>
      </div>
      <ol className="flex flex-col border-line border-t">
        {RULES.map((rule) => (
          <li
            className="flex gap-4 border-line border-b py-3.5"
            key={rule.numeral}
          >
            <span className="w-6 shrink-0 font-display text-daylily text-lede italic leading-6.5">
              {rule.numeral}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="font-display text-ink text-lede leading-6.5">
                {rule.title}
              </span>
              <span className="text-ink-subtle text-ui leading-5">
                {rule.note}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

export const welcomeStep: OnboardingStep = {
  art: {
    alt: "An eye half in shadow, a daylily where the iris would be",
    position: "62% 50%",
    src: eye,
  },
  caption: {
    line: "Written by you, kept by you, grown into a garden.",
    note: "Free and open source. No account needed.",
  },
  Form: Welcome,
  id: "welcome",
  next: "Begin",
  shortcut: {
    label: "I already have a Daylily folder",
    // Straight to the folder step, with the folder already asked for
    run: async ({ choices, change, goTo }) => {
      const opened = await window.daylily.journal.pickFolder();
      if (opened) {
        change(withFolder({ ...choices.folder, opened, use: "opened" }));
      }
      goTo("folder");
    },
  },
};
