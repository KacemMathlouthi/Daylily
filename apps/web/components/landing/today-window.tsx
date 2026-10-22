import { AppWindow } from "@daylily/ui/components/app-window";
import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { cn } from "cn";
import {
  Calendar,
  Ellipsis,
  Folder,
  Lock,
  MessageCircle,
  PenLine,
  Search,
  Sprout,
} from "lucide-react";
import Image from "next/image";
import { GhostLine } from "./ghost-line";

const NAV = [
  { active: true, icon: PenLine, label: "Today" },
  { icon: Sprout, label: "Garden" },
  { icon: Calendar, label: "Calendar" },
  { badge: "AI", icon: MessageCircle, label: "Ask your journal" },
] as const;

const THIS_WEEK = [
  { day: "Mon", dot: "bg-saffron", title: "On my way" },
  { day: "Sun", dot: "bg-petal", title: "Slow Sunday" },
  { day: "Sat", dot: "bg-daylily", title: "Out of town" },
  { day: "Fri", dot: null, title: "Resting" },
  { day: "Thu", dot: "bg-moss", title: "Fresh flowers" },
] as const;

/** Hover feedback for the mock's controls; they look alive without being focusable dead ends. */
const HOVERABLE =
  "cursor-pointer transition-colors duration-200 ease-soft hover:bg-ink/[0.05]";

function Sidebar() {
  return (
    <aside className="hidden w-58 shrink-0 flex-col justify-between border-line border-r bg-paper-sunk px-2.5 py-3.5 lg:flex">
      <div className="flex flex-col gap-4.5">
        <div
          className={cn(
            "flex items-center gap-2 rounded-[7px] px-2 py-1",
            HOVERABLE
          )}
        >
          <DaylilyMark className="text-daylily" size={16} />
          <span className="font-semibold text-[13px] text-ink">
            Kacem’s journal
          </span>
        </div>
        <div className="flex h-7.5 cursor-text items-center gap-2 rounded-[7px] border border-line bg-paper-page px-2.5 transition-colors duration-200 hover:border-ink-ghost">
          <Search className="text-ink-subtle" size={13} strokeWidth={2.2} />
          <span className="grow text-[12.5px] text-ink-subtle">
            Search days
          </span>
          <span className="text-[11px] text-ink-faint">⌘K</span>
        </div>
        <nav className="flex flex-col gap-px">
          {NAV.map(({ label, icon: Icon, ...item }) => {
            const active = "active" in item;
            return (
              <div
                className={cn(
                  "flex h-7.5 items-center gap-2.25 rounded-[7px] px-2.5",
                  active ? "bg-paper-press" : HOVERABLE
                )}
                key={label}
              >
                <Icon
                  className={active ? "text-ink" : "text-ink-muted"}
                  size={15}
                  strokeWidth={1.9}
                />
                <span
                  className={cn(
                    "grow font-medium text-[13px]",
                    active ? "text-ink" : "text-ink-soft"
                  )}
                >
                  {label}
                </span>
                {active ? (
                  <span className="size-1.5 rounded-full bg-daylily" />
                ) : null}
                {"badge" in item ? (
                  <span className="rounded-sm bg-[#f1e9dd] px-1.5 py-px font-semibold text-[10px] text-ink-subtle">
                    {item.badge}
                  </span>
                ) : null}
              </div>
            );
          })}
        </nav>
        <div className="flex flex-col gap-px">
          <span className="px-2.5 pb-1.5 font-semibold text-[11px] text-ink-faint tracking-[0.04em]">
            This week
          </span>
          {THIS_WEEK.map((day) => (
            <div
              className={cn(
                "flex h-7 items-center gap-2.25 rounded-[7px] px-2.5",
                HOVERABLE
              )}
              key={day.title}
            >
              <span className="flex w-4 shrink-0 justify-center">
                <span
                  className={cn(
                    "rounded-full",
                    day.dot ? `size-1.75 ${day.dot}` : "size-1.25 bg-ink-ghost"
                  )}
                />
              </span>
              <span
                className={cn(
                  "grow text-[13px]",
                  day.dot ? "text-ink-soft" : "text-ink-faint"
                )}
              >
                {day.title}
              </span>
              <span className="text-[11.5px] text-ink-faint">{day.day}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex cursor-pointer items-center gap-2.25 rounded-[9px] border border-line bg-paper-page p-2.5 transition-colors duration-200 hover:border-ink-ghost">
        <Folder className="text-moss" size={15} strokeWidth={1.9} />
        <div className="flex flex-col gap-px">
          <span className="font-medium text-ink text-xs">~/Journal</span>
          <span className="text-[11px] text-ink-subtle">
            Synced with git · 2m ago
          </span>
        </div>
      </div>
    </aside>
  );
}

const CRUMB =
  "-mx-1 cursor-pointer rounded-md px-1 py-0.5 transition-colors duration-200 hover:bg-ink/[0.05] hover:text-ink";

function TodayPage() {
  return (
    <div className="flex min-w-0 grow flex-col bg-paper-page">
      <div className="flex h-11 shrink-0 items-center justify-between px-4.5 text-[12.5px]">
        <div className="flex items-center gap-1.5 text-ink-subtle">
          <span className={CRUMB}>2026</span>
          <span className="text-ink-ghost">/</span>
          <span className={CRUMB}>October</span>
          <span className="text-ink-ghost">/</span>
          <span className="font-medium text-ink">20</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-6.5 cursor-default items-center gap-1.5 rounded-full border border-[#f3dcc4] bg-[#fbf1e6] px-2.5 font-medium text-[#a8481a] text-[11.5px]">
            <Lock className="text-daylily-deep" size={11} strokeWidth={2.4} />
            Seals in 6h 12m
          </span>
          <span
            className={cn(
              "flex h-6.5 w-7 items-center justify-center rounded-md text-ink-subtle hover:text-ink",
              HOVERABLE
            )}
          >
            <Ellipsis size={14} strokeWidth={2} />
          </span>
        </div>
      </div>
      <div className="flex grow flex-col items-center px-5 pt-4.5 pb-10 md:px-10">
        <article className="flex w-full max-w-155 flex-col">
          <Image
            alt="Orange daylilies along a wooden fence at dusk"
            className="h-28 w-full rounded-[10px] object-cover object-[center_60%] md:h-37.5"
            height={405}
            priority
            src="/images/covers/long-way-home.jpg"
            width={1672}
          />
          <div className="flex flex-col gap-3.5 pt-7">
            <p className="font-medium text-ink-subtle text-xs tracking-[0.02em]">
              Tuesday, October 20 · 61 words
            </p>
            <h3 className="font-display text-[32px] text-ink leading-11 tracking-[-0.015em] md:text-[40px]">
              The long way home
            </h3>
            <div className="flex flex-col gap-3.5 pt-1 font-writing text-[17px] text-ink-2 leading-7.25">
              <p>
                I took the long way home today. Nothing dramatic, just the turn
                by the park instead of the station. The daylilies along the
                fence were still open even though the light was going.
              </p>
              <p>
                Called Sam on the walk. We talked about almost nothing, her
                noisy neighbour, a book neither of us has finished.
              </p>
              <GhostLine
                prompt="…and how did that feel?"
                text="I think I needed that more than advice."
              />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export function TodayWindow({ className }: { className?: string }) {
  return (
    <AppWindow
      className={cn("w-full max-w-285 lg:h-180", className)}
      title="Daylily · Today"
    >
      <Sidebar />
      <TodayPage />
    </AppWindow>
  );
}
