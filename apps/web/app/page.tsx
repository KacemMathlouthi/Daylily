import { Button } from "@daylily/ui/primitives/button";

export default function Page() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="font-display text-6xl">How was your day?</h1>
      <p className="max-w-md font-writing text-lg text-muted-foreground">
        One page a day. Written by you, kept by you, grown into a garden.
      </p>
      <Button>Coming soon</Button>
    </main>
  );
}
