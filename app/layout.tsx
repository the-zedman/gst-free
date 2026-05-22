import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import Header from "@/components/Header";
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
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
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
        <body className="min-h-full flex flex-col">
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
