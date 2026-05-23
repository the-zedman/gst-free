import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use — GSTFree",
  description: "Terms and conditions for using GSTFree.com.au.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Use</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: May 2026</p>

        <div className="flex flex-col gap-8 text-gray-600 leading-relaxed text-sm">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Acceptance of terms</h2>
            <p>
              By accessing or using GSTFree.com.au (&ldquo;the site&rdquo;), you agree to be bound by these Terms of Use. If you do not agree, please do not use the site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Not financial or legal advice</h2>
            <p>
              The information on this site, including all GST classifications, is provided for general informational purposes only. It is <strong>not financial, tax, or legal advice</strong> and must not be relied upon as such.
            </p>
            <p className="mt-2">
              GST classifications can change and may depend on specific circumstances. For business tax obligations or any decision with financial consequences, you must consult a registered tax agent or the{" "}
              <a href="https://www.ato.gov.au/business/gst/in-detail/your-industry/food/" target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">Australian Taxation Office</a> directly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Accuracy of information</h2>
            <p>
              We source our food data from the ATO&apos;s Detailed Food List and make reasonable efforts to keep it accurate and up to date. However, we make no warranty, express or implied, as to the accuracy, completeness, or currency of any information on this site.
            </p>
            <p className="mt-2">
              If you believe any information is incorrect, please{" "}
              <a href="/contact" className="text-green-700 hover:underline">contact us</a> and we will investigate promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Limitation of liability</h2>
            <p>
              To the maximum extent permitted by Australian law, GSTFree.com.au and its operators are not liable for any loss or damage (including financial loss) arising from your use of, or reliance on, information provided on this site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Intellectual property</h2>
            <p>
              The GST classification data is derived from ATO public information. Original content on this site (text, design, code) is copyright &copy; GSTFree.com.au. You may not reproduce or redistribute our original content without permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
              <li>Use the site for any unlawful purpose</li>
              <li>Scrape or bulk-download data in a way that disrupts the site</li>
              <li>Attempt to gain unauthorised access to any part of the site</li>
              <li>Submit false or misleading information through the contact form</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Third-party links</h2>
            <p>
              This site may link to third-party websites (including the ATO). We are not responsible for the content, accuracy, or privacy practices of those sites.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Changes to these terms</h2>
            <p>
              We may update these terms at any time. Changes will be posted on this page with an updated date. Continued use of the site constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Governing law</h2>
            <p>
              These terms are governed by the laws of New South Wales, Australia. Any disputes will be subject to the exclusive jurisdiction of the courts of New South Wales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact</h2>
            <p>
              Questions about these terms? Please use our{" "}
              <a href="/contact" className="text-green-700 hover:underline">contact form</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
