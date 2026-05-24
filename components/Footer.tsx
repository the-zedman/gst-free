import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 px-4 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
          <Link href="/the-docket" className="hover:text-green-700 transition-colors">The Docket</Link>
          <Link href="/hidden-grocery-tax" className="hover:text-green-700 transition-colors">The Hidden Grocery Tax</Link>
          <Link href="/privacy" className="hover:text-green-700 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-green-700 transition-colors">Terms</Link>
          <Link href="/support" className="hover:text-green-700 transition-colors">Support</Link>
          <Link href="/contact" className="hover:text-green-700 transition-colors">Contact</Link>
        </nav>
        <p className="text-xs text-gray-400 text-center">
          GST status sourced from the{" "}
          <span className="font-medium">ATO Detailed Food List</span>. Always
          verify with your supermarket receipt. Not financial or legal advice.
        </p>
        <p className="text-xs text-gray-300">&copy; {new Date().getFullYear()} GSTFree.com.au</p>
      </div>
    </footer>
  );
}
