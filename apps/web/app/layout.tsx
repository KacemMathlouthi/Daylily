import "@daylily/ui/globals.css";

import type { Metadata } from "next";
import {
  Geist_Mono,
  Instrument_Sans,
  Instrument_Serif,
  Newsreader,
} from "next/font/google";
import type { ReactNode } from "react";

const display = Instrument_Serif({
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-face-display",
  weight: "400",
});
const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-face-sans",
});
const writing = Newsreader({
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-face-writing",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-face-mono",
});

export const metadata: Metadata = {
  description:
    "A human-first journal. One page a day, written by you, kept by you, grown into a garden.",
  title: "Daylily — one page a day",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${display.variable} ${sans.variable} ${writing.variable} ${mono.variable}`}
      lang="en"
    >
      <body>{children}</body>
    </html>
  );
}
