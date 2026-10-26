import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/thoughts")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/thoughts"!</div>;
}
