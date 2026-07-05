import type { Metadata, Viewport } from "next";
import { manrope, greatVibes } from "./fonts";
import "./globals.css";
import { site } from "@/data/site";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppToaster } from "@/components/ui/Toaster";
import { HiringBanner } from "@/components/layout/HiringBanner";
import { Header } from "@/components/layout/Header";
import { PixelTransition } from "@/components/layout/PixelTransition";
import { Footer } from "@/components/layout/Footer";

const title = `${site.name} | ${site.instituteShort}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s | ${site.shortName}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Research",
    "ubiquitous computing",
    "AIoT",
    "edge computing",
    "human-computer interaction",
    "sensing",
    site.instituteShort,
  ],
  authors: [{ name: site.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title,
    description: site.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  // Browser chrome color; a meta tag cannot read a CSS var, so this mirrors --bg.
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${greatVibes.variable}`}>
      <body>
        <MotionProvider>
          <AuthProvider>
            <a
              href="#main-content"
              className="focus:bg-primary focus:text-on-primary sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2"
            >
              Skip to content
            </a>
            <HiringBanner />
            <Header />
            <main id="main-content">{children}</main>
            <PixelTransition />
            <Footer />
            <AppToaster />
          </AuthProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
