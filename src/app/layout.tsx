import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nextwatchrec.vercel.app"),
  title: {
    default: "NextWatch — Dual-Realm Entertainment Discovery Engine",
    template: "%s | NextWatch",
  },
  description: "Personalized, keyless recommendations across Anime and TV Series. Find your next binge instantly with our dynamic discovery engine powered by AniList & TVMaze.",
  keywords: [
    "Anime recommendations",
    "TV show finder",
    "Movie recommendations",
    "Binge watch guide",
    "AniList",
    "TVMaze",
    "NextWatch",
    "What to watch"
  ],
  authors: [{ name: "LaughingHermit" }],
  creator: "LaughingHermit",
  publisher: "LaughingHermit",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nextwatchrec.vercel.app",
    title: "NextWatch — Dual-Realm Entertainment Discovery Engine",
    description: "Personalized, keyless recommendations across Anime and TV Series. Find your next binge instantly.",
    siteName: "NextWatch",
    images: [
      {
        url: "/og-image.jpg", // You can add a custom open graph image here later
        width: 1200,
        height: 630,
        alt: "NextWatch Preview Image",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NextWatch — Dual-Realm Entertainment Discovery Engine",
    description: "Personalized, keyless recommendations across Anime and TV Series. Find your next binge instantly.",
    creator: "@LaughingHermit", // If you have a twitter handle
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" }
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  verification: {
    google: "8fLzguORaFGXvrCUa4ltCWqO326RBEna7NankxCE5Eg",
  },
  // Geo tags for local SEO if targeting globally/locally (Optional but requested)
  other: {
    "geo.region": "US", // You can change this to your specific country code if targeting a specific region, or leave it broad.
    "geo.placename": "Global",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
