import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact Us — GSTFree",
  description: "Get in touch with the GSTFree team. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact us</h1>
          <p className="text-gray-500">
            Have a question, spotted an error, or want to get in touch? Fill in the form below and we&apos;ll respond as soon as we can.
          </p>
        </div>
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
