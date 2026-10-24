import "./globals.css";

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
import {
  pageMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

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
  ...pageMetadata({
    description: SITE_DESCRIPTION,
    path: "/",
    title: "Daylily: One page a day. Yours to keep.",
  }),
  applicationName: SITE_NAME,
  metadataBase: new URL(SITE_URL),
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
