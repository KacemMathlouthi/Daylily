import {
  FeaturePage,
  featureMetadata,
} from "@/components/features/feature-page";

export const metadata = featureMetadata("notes");

export default function NotesPage() {
  return <FeaturePage slug="notes" />;
}
