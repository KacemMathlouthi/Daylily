import {
  FeaturePage,
  featureMetadata,
} from "@/components/features/feature-page";
import { QuestionsThatListen } from "@/components/features/questions-that-listen";

export const metadata = featureMetadata("ghost-prompts");

export default function GhostPromptsPage() {
  return <FeaturePage extra={<QuestionsThatListen />} slug="ghost-prompts" />;
}
