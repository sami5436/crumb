import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
});

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const description =
  "A feeding log for your sourdough starter. Record each feed, watch how fast it peaks, and know when it's ready to bake with.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Crumb — a sourdough starter log",
    template: "%s · Crumb",
  },
  description,
  applicationName: "Crumb",
  keywords: [
    "sourdough",
    "sourdough starter",
    "starter feeding log",
    "levain",
    "baking",
    "fermentation",
    "peak time",
  ],
  authors: [{ name: "Crumb" }],
  creator: "Crumb",
  category: "food",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Crumb",
    title: "Crumb — a sourdough starter log",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Crumb — a sourdough starter log",
    description,
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6ef" },
    { media: "(prefers-color-scheme: dark)", color: "#16120e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col">
        <header className="border-b border-line/70">
          <div className="mx-auto w-full max-w-3xl px-5 py-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <JarMark />
              <span className="font-display text-lg font-semibold tracking-tight group-hover:text-crust transition-colors">
                Crumb
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-line/70 mt-16">
          <div className="mx-auto w-full max-w-3xl px-5 py-6 text-sm text-muted">
            Keep your starter&rsquo;s link somewhere safe — it&rsquo;s the only way back in.
          </div>
        </footer>
      </body>
    </html>
  );
}

function JarMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M9 11h14v13a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3z"
        fill="currentColor"
        className="text-crust"
      />
      <rect x="8" y="7" width="16" height="4" rx="1.6" className="fill-ink" />
      <circle cx="13" cy="21.5" r="1.8" className="fill-surface" />
      <circle cx="18.5" cy="23" r="1.2" className="fill-surface" />
    </svg>
  );
}
