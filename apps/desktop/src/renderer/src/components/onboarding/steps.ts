import { folderStep } from "./folder-step";
import { helpStep } from "./help-step";
import { notebookStep } from "./notebook-step";
import type { OnboardingStep } from "./step";
import { welcomeStep } from "./welcome-step";

/**
 * Onboarding's pages, in order. A new one (AI, when it comes) is a step of its
 * own: its fields in `OnboardingChoices`, its form, and how it saves, added
 * here. The frame, the progress and "Step N of M" follow the list.
 */
export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  welcomeStep,
  notebookStep,
  folderStep,
  helpStep,
];
