import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { trackPageView, getDevice } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      path?: string;
      referrer?: string | null;
      ua?: string;
    };

    const { path, referrer, ua = "" } = body;

    if (!path || typeof path !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const device = getDevice(ua);

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const ipHash = createHash("sha256")
      .update(ip + "gstfree_pv_salt")
      .digest("hex")
      .slice(0, 16);

    const country = request.headers.get("x-vercel-ip-country") ?? null;

    // Strip self-referrals
    const cleanReferrer =
      referrer && !referrer.includes("gstfree.com.au") ? referrer : null;

    await trackPageView({
      path: path.slice(0, 512),
      referrer: cleanReferrer?.slice(0, 512) ?? null,
      device,
      ipHash,
      country,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
