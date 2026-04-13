import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const siteUrl = "https://www.sunfm.fitness";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Personal Trainer San Jose | Sun Functional Movement",
  description:
    "Personal trainer in San Jose & South Bay. Jeffrey Sun helps busy professionals eliminate pain, build functional strength, and train for longevity.",
  keywords: [
    "personal trainer San Jose",
    "personal trainer South Bay",
    "personal trainer Sunnyvale",
    "personal trainer Cupertino",
    "personal trainer Santa Clara",
    "personal trainer Mountain View",
    "functional movement training",
    "mobility training Bay Area",
    "strength training San Jose",
    "fitness trainer South Bay",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Personal Trainer San Jose | Sun Functional Movement",
    description:
      "Personal trainer in San Jose & South Bay Area. 12,000+ sessions delivered. Free consultation available.",
    type: "website",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/images/jeffrey-headshot-final.jpg`,
        width: 1200,
        height: 900,
        alt: "Jeffrey Sun - Personal Trainer in San Jose",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Personal Trainer San Jose | Sun Functional Movement",
    description:
      "Personal trainer in San Jose & South Bay Area. 12,000+ sessions delivered. Free consultation available.",
    images: [`${siteUrl}/images/jeffrey-headshot-final.jpg`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased overflow-x-hidden">{children}</body>
      <GoogleAnalytics gaId="G-FVFDW7GH4Y" />
    </html>
  );
}
