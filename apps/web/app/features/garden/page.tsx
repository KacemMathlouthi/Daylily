import {
  FeaturePage,
  featureMetadata,
} from "@/components/features/feature-page";

export const metadata = featureMetadata("garden");

export default function GardenPage() {
  return <FeaturePage slug="garden" />;
}
