import {
  FeaturePage,
  featureMetadata,
} from "@/components/features/feature-page";

export const metadata = featureMetadata("thoughts");

export default function ThoughtsPage() {
  return <FeaturePage slug="thoughts" />;
}
