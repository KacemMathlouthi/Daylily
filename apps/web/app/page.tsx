import { Hero } from "@/components/landing/hero";
import { MotionProvider } from "@/components/landing/motion";
import { Statement } from "@/components/landing/statement";

export default function Page() {
  return (
    <MotionProvider>
      <main className="bg-paper-raised">
        <Hero />
        <Statement />
      </main>
    </MotionProvider>
  );
}
