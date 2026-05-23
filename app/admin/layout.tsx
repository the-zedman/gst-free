import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-green-400 font-bold text-sm">
            🥦 GSTFree
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-white font-medium text-sm">Admin</span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/admin"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/searches"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Searches
          </Link>
          <Link
            href="/admin/advertising"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Advertising
          </Link>
          <SignOutButton>
            <button className="text-gray-400 hover:text-white transition-colors">
              Sign out
            </button>
          </SignOutButton>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
