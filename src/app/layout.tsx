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

// ✅ Updated metadata
export const metadata: Metadata = {
  title: "ChargeAds ⚡",
  description: "ChargeAds Portal — manage your ad screens easily.",
  icons: {
    icon: [
      { url: "/chargeads-dark.png", media: "(prefers-color-scheme: light)" },
      { url: "/chargeads-light.png", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Fallback favicons for browsers that don’t support color-scheme */}
        <link
          rel="icon"
          href="/chargeads-dark.png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/chargeads-light.png"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
