"use client";

import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";

export default function HeaderAuth() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) return <UserButton />;

  return (
    <SignInButton>
      <button className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-full font-medium transition-colors">
        Sign in
      </button>
    </SignInButton>
  );
}
