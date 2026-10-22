import { Calendar } from "@/components/landing/calendar";
import { Features } from "@/components/landing/features";
import { Garden } from "@/components/landing/garden";
import { Hero } from "@/components/landing/hero";
import { Statement } from "@/components/landing/statement";
import { Footer } from "@/components/site/footer";

export default function Page() {
  return (
    <>
      <main className="bg-paper-raised">
        <Hero />
        <Statement />
        <Features />
        <Garden />
        <Calendar />
      </main>
      <Footer />
    </>
  );
}
