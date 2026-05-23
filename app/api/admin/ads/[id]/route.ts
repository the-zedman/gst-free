import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateAd, deleteAd } from "@/lib/ads";
import { del } from "@vercel/blob";
import { getAdById } from "@/lib/ads";

async function requireAdmin() {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "admin";
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const adId = Number(id);
  if (isNaN(adId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const body = await request.json();
    await updateAd(adId, body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to update ad" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const adId = Number(id);
  if (isNaN(adId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const ad = await getAdById(adId);
    if (ad?.image_url?.includes("blob.vercel-storage.com")) {
      await del(ad.image_url).catch(() => {});
    }
    await deleteAd(adId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete ad" }, { status: 500 });
  }
}
