import { NextResponse } from "next/server";
import { getActiveAds } from "@/lib/ads";

export const revalidate = 60;

export async function GET() {
  try {
    const ads = await getActiveAds();
    return NextResponse.json({ ads });
  } catch {
    return NextResponse.json({ ads: [] });
  }
}
