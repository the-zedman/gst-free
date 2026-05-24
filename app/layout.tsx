import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import { Suspense } from "react";
import Header from "@/components/Header";
import PageViewTracker from "@/components/PageViewTracker";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const title = "GST Free — Save money on Australian groceries";
const description =
  "Find GST-free foods, compare prices, discover budget-friendly recipes, and save thousands on your grocery bills. Search 1,400+ ATO-confirmed items.";

export const metadata: Metadata = {
  metadataBase: new URL("https://gstfree.com.au"),
  title,
  description,
  keywords: [
    "GST free food Australia",
    "GST free groceries",
    "ATO food list",
    "GST free shopping",
    "save money groceries Australia",
    "Australian GST food",
  ],
  openGraph: {
    siteName: "GST Free",
    title,
    description,
    url: "https://gstfree.com.au",
    locale: "en_AU",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://gstfree.com.au",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable} h-full antialiased`}>
        <head>
          <link rel="icon" type="image/png" href="/favicon-96x96.png?v=2" sizes="96x96" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
          <link rel="shortcut icon" href="/favicon.ico?v=2" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
          <meta name="apple-mobile-web-app-title" content="GST Free" />
          <link rel="manifest" href="/site.webmanifest?v=2" />
          <script src="https://analytics.ahrefs.com/analytics.js" data-key="Wk1qMjwieDmyGrhGu67FjQ" async></script>
        </head>
        <body className="min-h-full flex flex-col">
          <Suspense>
            <PageViewTracker />
          </Suspense>
          <Header />
          {children}
        </body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-48SJ7FG1B8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-48SJ7FG1B8');
          `}
        </Script>
      </html>
    </ClerkProvider>
  );
}
