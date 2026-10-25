import type { ComponentType } from "react";
import type { FolderInfo, JournalConfig } from "../../../../shared/journal";

/**
 * Where the journal will live (Paper 10e): the folder suggested, the one in use
 * now or ~/Daylily, and maybe one opened instead.
 */
export interface FolderChoice {
  opened: FolderInfo | null;
  suggested: FolderInfo;
  use: "suggested" | "opened";
}

/**
 * Everything onboarding asks, gathered as people go and saved together at the
 * end, so leaving halfway changes nothing. A new step adds its own fields here.
 */
export interface OnboardingChoices {
  folder: FolderChoice;
  ghostPrompts: boolean;
  /** What Daylily calls them, as typed; empty goes back to the computer's name. */
  name: string;
  reminder: JournalConfig["reminder"];
}

export type ChangeChoices = (changes: Partial<OnboardingChoices>) => void;

/** What a step's form is given: the choices so far, and a way to change them. */
export interface StepProps {
  change: ChangeChoices;
  choices: OnboardingChoices;
}

/**
 * One page of onboarding. Steps are listed in `steps.ts`; the frame draws the
 * painting, the progress and the buttons around each step's form.
 */
export interface OnboardingStep {
  /** The painting on the left; `position` frames it in the tall panel, as CSS `object-position`. */
  art: { alt: string; position: string; src: string };
  /** The card over the painting: a line in italics, and a note under it. */
  caption: { line: string; note: string };
  Form: ComponentType<StepProps>;
  id: string;
  /** The main button's words. */
  next: string;
  /** Whether the step can go on with these choices; it always can when left out. */
  ready?: (choices: OnboardingChoices) => boolean;
  /** Saves what this step chose, once onboarding finishes, in the order of the steps. */
  save?: (choices: OnboardingChoices) => Promise<void>;
  /** A quieter way on beside the main button, such as "I already have a Daylily folder". */
  shortcut?: {
    label: string;
    run: (step: StepProps & { goTo: (id: string) => void }) => Promise<void>;
  };
}

/** The folder a choice of folder settles on. */
export function chosenFolder(folder: FolderChoice): FolderInfo {
  return folder.use === "opened" && folder.opened
    ? folder.opened
    : folder.suggested;
}

/**
 * Choices for another folder: the help that follows starts from that journal's
 * own preferences, since they live in its folder, and so does a name it keeps.
 * The same folder chosen again keeps everything already chosen.
 */
export function withFolder(
  folder: FolderChoice,
  current: FolderChoice
): Partial<OnboardingChoices> {
  if (chosenFolder(folder).path === chosenFolder(current).path) {
    return { folder };
  }
  const { config } = chosenFolder(folder);
  return {
    folder,
    ghostPrompts: config.ghostPrompts,
    reminder: config.reminder,
    ...(config.name ? { name: config.name } : {}),
  };
}
