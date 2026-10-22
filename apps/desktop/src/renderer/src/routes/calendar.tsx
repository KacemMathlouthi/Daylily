import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "../components/placeholder";

export const Route = createFileRoute("/calendar")({
  component: () => <Placeholder title="Calendar" />,
});
