import { Hero } from "@/components/landing/hero";
import { MotionProvider } from "@/components/landing/motion";

export default function Page() {
  return (
    <MotionProvider>
      <main className="bg-paper-raised">
        <Hero />
      </main>
    </MotionProvider>
  );
}
