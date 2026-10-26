import {
  FeaturePage,
  featureMetadata,
} from "@/components/features/feature-page";

export const metadata = featureMetadata("search");

export default function SearchPage() {
  return <FeaturePage slug="search" />;
}
