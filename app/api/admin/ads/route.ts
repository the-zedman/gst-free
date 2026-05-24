import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAd } from "@/lib/ads";
import type { Ad } from "@/lib/ads";

export async function POST(request: NextRequest) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Partial<Omit<Ad, "id" | "created_at" | "updated_at">>;

    if (!body.name || !body.image_url || !body.click_url || !body.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ad = await createAd({
      name: body.name,
      type: body.type,
      image_url: body.image_url,
      click_url: body.click_url,
      title: body.title ?? null,
      subtitle: body.subtitle ?? null,
      price_text: body.price_text ?? null,
      rating_text: body.rating_text ?? null,
      social_proof: body.social_proof ?? null,
      cta_text: body.cta_text ?? "Shop Now",
      alt_text: body.alt_text ?? null,
      slot_target: body.slot_target ?? "any",
      weight: body.weight ?? 1,
      active: body.active ?? true,
      sponsored_label: body.sponsored_label ?? "Sponsored",
      starts_at: body.starts_at ?? null,
      ends_at: body.ends_at ?? null,
    });

    return NextResponse.json({ ad });
  } catch {
    return NextResponse.json({ error: "Failed to create ad" }, { status: 500 });
  }
}
