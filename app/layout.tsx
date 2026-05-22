import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gstfree.com.au"),
  title: "GST Free — Save money on Australian groceries",
  description:
    "Find GST-free foods, compare prices, discover budget-friendly recipes, and save thousands on your grocery bills.",
  openGraph: {
    siteName: "GST Free",
    url: "https://gstfree.com.au",
    locale: "en_AU",
    type: "website",
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
      </html>
    </ClerkProvider>
  );
}
