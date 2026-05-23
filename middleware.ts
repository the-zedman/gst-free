import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isAdminRoute(request)) {
    const { userId, sessionClaims, redirectToSignIn } = await auth();
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: request.url });
    }
    if (sessionClaims?.metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|js|css|woff|woff2)$).*)",
  ],
};
