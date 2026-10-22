import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { NAV_LINKS } from "./links";
import { PillButton } from "./pill-button";

export function Nav() {
  return (
    <header className="relative z-10 flex w-full max-w-360 items-center justify-between px-5 py-5 md:px-10 md:py-7">
      <a className="flex items-center gap-2.25 md:w-55" href="/">
        <DaylilyMark className="text-ink" size={22} />
        <span className="font-display text-3xl text-ink leading-7.5 tracking-[-0.01em]">
          Daylily
        </span>
      </a>
      <nav className="hidden items-center gap-1 rounded-full border border-white/70 bg-white/55 p-1.25 backdrop-blur-lg md:flex">
        {NAV_LINKS.map((link) => (
          <a
            className="rounded-full px-4 py-2 font-medium text-ink text-sm transition-colors duration-300 hover:bg-white/70"
            href={link.href}
            key={link.label}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="flex justify-end md:w-55">
        <PillButton size="md">Download</PillButton>
      </div>
    </header>
  );
}
