import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — GSTFree",
  description: "How GSTFree.com.au collects and uses your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: May 2026</p>

        <div className="prose prose-sm prose-gray max-w-none flex flex-col gap-8 text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Overview</h2>
            <p>
              GSTFree.com.au (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your privacy.
              This policy explains what information we collect when you use this website and how we use it.
              We do not sell your personal information to anyone.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Information we collect automatically</h2>
            <p>When you visit GSTFree, we record basic analytics for each page view, including:</p>
            <ul className="list-disc list-inside mt-2 flex flex-col gap-1 text-sm">
              <li>The page you visited (URL path)</li>
              <li>Your device type (mobile, desktop, or tablet)</li>
              <li>Your country (derived from your IP address)</li>
              <li>A one-way hashed version of your IP address — we cannot reverse this to identify you</li>
              <li>The page you came from (referrer), if any, excluding internal navigation</li>
            </ul>
            <p className="mt-3">
              We also use <strong>Google Analytics</strong> to understand broad usage patterns. Google Analytics may set cookies and collect information in accordance with{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">Google&apos;s Privacy Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Information you provide</h2>
            <p>
              If you use the Contact form, we collect your name, email address, and message. This information is used solely to respond to your enquiry and is not stored beyond what is needed for that purpose.
            </p>
            <p className="mt-2">
              If you create an account (for admin access only — registration is not open to the public), your account information is managed securely by our authentication provider and is not shared with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Cookies</h2>
            <p>
              We use cookies for analytics (Google Analytics) and authentication (where applicable). By using this site you consent to the use of these cookies. You can disable cookies in your browser settings, which may affect some functionality.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Advertising</h2>
            <p>
              GSTFree displays advertisements. Our advertising partners may use cookies and tracking technologies to serve relevant ads. We do not share personally identifiable information with advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Data storage</h2>
            <p>
              Your data is stored securely on servers hosted in the United States. Analytics data is retained for a rolling 90-day period.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Your rights</h2>
            <p>
              You have the right to request access to, correction of, or deletion of any personal information we hold about you. To make a request, please{" "}
              <a href="/contact" className="text-green-700 hover:underline">contact us</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Changes to this policy</h2>
            <p>
              We may update this policy from time to time. Changes will be posted on this page with an updated date. Continued use of the site constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact</h2>
            <p>
              For privacy-related enquiries, please use our{" "}
              <a href="/contact" className="text-green-700 hover:underline">contact form</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
