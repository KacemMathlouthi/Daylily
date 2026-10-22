import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "../components/placeholder";

export const Route = createFileRoute("/")({
  component: () => (
    <Placeholder title="How was your day?">
      Home will greet you here, with today’s page, your garden and the week.
    </Placeholder>
  ),
});
