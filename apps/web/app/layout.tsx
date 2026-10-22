import "@daylily/ui/globals.css";

import type { Metadata } from "next";
import {
  Geist_Mono,
  Instrument_Sans,
  Instrument_Serif,
  Newsreader,
} from "next/font/google";
import type { ReactNode } from "react";
import { Header } from "@/components/site/header";
import { MotionProvider } from "@/components/site/motion";

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

const description =
  "A human-first journal. One page a day, written by you, kept by you, grown into a garden.";

export const metadata: Metadata = {
  description,
  openGraph: { description, siteName: "Daylily", type: "website" },
  title: "Daylily: One page a day. Yours to keep.",
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${display.variable} ${sans.variable} ${writing.variable} ${mono.variable}`}
      lang="en"
    >
      {/* Extensions like ColorZilla add attributes to <body> before React hydrates */}
      <head>
        {/* Without JavaScript, scroll reveals never run, so show their content as is */}
        <noscript>
          <style>
            {"[data-reveal]{opacity:1!important;transform:none!important}"}
          </style>
        </noscript>
      </head>
      <body suppressHydrationWarning>
        <MotionProvider>
          <Header />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
