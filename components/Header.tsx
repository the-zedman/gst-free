import Link from "next/link";
import MobileMenu from "./MobileMenu";
// import HeaderAuth from "./HeaderAuth"; // TODO: restore when Clerk production instance is configured

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🥦</span>
          <span className="font-bold text-green-700 text-lg leading-none">
            GST<span className="text-green-500">Free</span>
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-green-700 transition-colors">
            Search
          </Link>
          <Link href="/recipes" className="hover:text-green-700 transition-colors">
            Recipes
          </Link>
          {/* TODO: restore when Food Support directory is built */}
          {/* <Link href="/support" className="hover:text-green-700 transition-colors">
            Food Support
          </Link> */}
        </nav>

        <MobileMenu />

        {/* TODO: restore when Clerk production instance is configured */}
        {/* <HeaderAuth /> */}
      </div>
    </header>
  );
}
