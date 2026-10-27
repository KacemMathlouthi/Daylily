import {
  FeaturePage,
  featureMetadata,
} from "@/components/features/feature-page";

export const metadata = featureMetadata("journaling");

export default function JournalingPage() {
  return <FeaturePage slug="journaling" />;
}
