import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "../components/placeholder";

export const Route = createFileRoute("/settings")({
  component: SettingsScreen,
});

function SettingsScreen() {
  // The first real round trip through the bridge: renderer → preload → main
  const { data } = useQuery({
    queryFn: () => window.daylily.app.info(),
    queryKey: ["app", "info"],
  });

  return (
    <Placeholder title="Settings">
      {data ? `Daylily ${data.version} on ${data.platform}` : "Loading…"}
    </Placeholder>
  );
}
