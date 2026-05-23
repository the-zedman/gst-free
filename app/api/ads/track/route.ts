import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { recordAdEvent } from "@/lib/ads";
import { getDevice } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      adId?: number;
      eventType?: string;
      slot?: string;
      ua?: string;
    };

    const { adId, eventType, slot, ua = "" } = body;

    if (!adId || (eventType !== "impression" && eventType !== "click")) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const ipHash = createHash("sha256")
      .update(ip + "gstfree_ad_salt")
      .digest("hex")
      .slice(0, 16);

    const device = getDevice(ua);
    if (device === "bot") return NextResponse.json({ ok: true });

    const country = request.headers.get("x-vercel-ip-country") ?? null;

    await recordAdEvent({ ad_id: adId, event_type: eventType, slot: slot ?? null, device, ip_hash: ipHash, country });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
