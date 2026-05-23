import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Support — GSTFree",
  description: "Answers to common questions about GST-free food and using GSTFree.com.au.",
};

const FAQS = [
  {
    q: "What does GST-free mean?",
    a: "In Australia, most basic food items are exempt from the 10% Goods and Services Tax (GST). This includes fresh fruit and vegetables, meat, fish, bread, milk, and most unprocessed foods. Prepared meals, snack foods, confectionery, and beverages (other than water and milk) are generally taxable.",
  },
  {
    q: "Where does the food data come from?",
    a: "Our food list is sourced from the ATO Detailed Food List, which is the authoritative guide used by Australian businesses to determine GST obligations. We regularly review and update the data, but we always recommend verifying with the ATO or your accountant for business decisions.",
  },
  {
    q: "A food item has the wrong GST status — how do I report it?",
    a: "Thanks for helping us improve the database! Please use the Contact page to report any errors. Include the food name and, if possible, a link to the ATO's classification. We review all reports and update the database promptly.",
  },
  {
    q: "How does the barcode scanner work?",
    a: "Tap the barcode icon in the search bar and point your camera at a product's barcode. GSTFree will look up the product in our database and show you its GST status. The scanner works best in good lighting.",
  },
  {
    q: "Is GSTFree free to use?",
    a: "Yes, completely free. We're supported by non-intrusive advertising and are committed to keeping the core tools free for all Australians.",
  },
  {
    q: "Can I use GSTFree for my business?",
    a: "The information on GSTFree is provided for general reference purposes only and is not financial or legal advice. For business tax obligations, always consult a registered tax agent or the ATO directly.",
  },
  {
    q: "How do I suggest a new food item?",
    a: "Use the Contact page and select \"Suggest a food item\". Let us know the food name, brand (if applicable), and any ATO classification you've found.",
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support</h1>
          <p className="text-gray-500">
            Answers to common questions about GST-free food and using GSTFree.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-2">{q}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-green-50 border border-green-100 p-6 text-center">
          <p className="text-gray-700 font-medium mb-2">Still need help?</p>
          <p className="text-sm text-gray-500 mb-4">
            Can&apos;t find what you&apos;re looking for? Get in touch and we&apos;ll help.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors"
          >
            Contact us
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
