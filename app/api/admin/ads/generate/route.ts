import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText, generateImage, gateway } from "ai";
import { put } from "@vercel/blob";

async function requireAdmin() {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "admin";
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = (await request.json()) as {
      action: string;
      productInfo?: ProductInfo;
      productImageUrls?: string[];
    };

    if (body.action === "generate-copy") return generateCopy(body.productInfo!);
    if (body.action === "generate-image") return generateAdImage(body.productInfo!, body.productImageUrls ?? []);

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export interface ProductInfo {
  title: string;
  brand: string;
  price: string;
  rrp: string;
  discount: string;
  rating: string;
  reviewCount: string;
  socialProof: string;
  description: string;
  features: string[];
  specs: Record<string, string>;
  imagePrompt?: string;
}

async function generateCopy(product: ProductInfo) {
  const specsText = Object.entries(product.specs ?? {}).map(([k, v]) => `${k}: ${v}`).join(", ");
  const socialLine = [
    product.rating && `${product.rating}★ (${product.reviewCount} reviews)`,
    product.socialProof,
  ].filter(Boolean).join(" · ");
  const priceLine = [
    product.price && `Now ${product.price}`,
    product.rrp && `was ${product.rrp}`,
    product.discount && `(${product.discount} off)`,
  ].filter(Boolean).join(" · ");

  const { text } = await generateText({
    model: gateway("anthropic/claude-haiku-4-5-20251001"),
    messages: [{
      role: "user",
      content: `Create compelling ad copy for this product. Return ONLY valid JSON, no markdown, no code blocks.

Product: ${product.title}
Brand: ${product.brand}
${priceLine}
${socialLine}
Description: ${product.description}
Key features: ${product.features.join(" | ")}
${specsText ? `Specs: ${specsText}` : ""}

Return JSON with these fields:
- adName: concise internal name (brand + product type + month/year, e.g. "Ninja Food Processor May 2026")
- title: punchy headline (max 8 words, very compelling, benefit-led — e.g. "Master Every Meal in Seconds")
- subtitle: supporting line (max 18 words). MUST include the price/discount if available (e.g. "52% off"), the star rating if available (e.g. "4.7★"), and any social proof (e.g. "Amazon's Choice"). Weave these together naturally, e.g. "52% off · 4.7★ Amazon's Choice — chops, blends and slices in one"
- ctaText: call to action (2-4 words, action-oriented, e.g. "Shop Now", "Grab the Deal", "Buy on Amazon")
- altText: descriptive image alt text for accessibility
- imagePrompt: a detailed Flux/DALL-E prompt for a wide 3:1 banner ad. Style: professional Amazon-style product photography, clean white or very light grey background. The ENTIRE product must be fully visible with clear padding around all edges — do not crop any part of the product. Product centred in the right 60% of the frame, photorealistic, commercial studio lighting, high resolution. The left 40% of the image should be a clean, uncluttered area for text overlay.`,
    }],
  });

  let copy;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    copy = JSON.parse(jsonMatch?.[0] ?? text);
  } catch {
    return NextResponse.json({ error: "Failed to generate ad copy" }, { status: 500 });
  }

  return NextResponse.json({ copy });
}

async function generateAdImage(product: ProductInfo, productImageUrls: string[]) {
  let visualDescription = "";

  // If product photos were uploaded, ask Claude to describe the product visually from them
  if (productImageUrls.length > 0) {
    const imageContent = productImageUrls.slice(0, 6).map((url) => ({
      type: "image" as const,
      image: new URL(url),
    }));

    const { text } = await generateText({
      model: gateway("anthropic/claude-sonnet-4-6"),
      messages: [{
        role: "user",
        content: [
          ...imageContent,
          {
            type: "text",
            text: `These are product photos of: ${product.title}

Describe the product's visual appearance in detail for use in an AI image generation prompt. Focus on:
- Exact shape and form factor
- Colour(s) and finish (matte/gloss/metallic etc.)
- Key visible components and features
- Any text or branding visible on the product
- Scale and proportions

Write 3-4 sentences, be very specific about visual details. Do not describe the background or staging — only the product itself.`,
          },
        ],
      }],
    });
    visualDescription = text.trim();
  }

  const basePrompt = product.imagePrompt ??
    `Professional product advertisement banner for ${product.title} by ${product.brand}. Clean white background, product prominently displayed, photorealistic commercial photography, studio lighting.`;

  const fullPrompt = visualDescription
    ? `${basePrompt} Product appearance: ${visualDescription} The ENTIRE product must be fully visible with clear padding on all sides — do not crop any part of the product. Position the complete product in the right 60% of the frame. The left 40% should be a clean, uncluttered background for text overlay. Ultra-high quality commercial product photography, 3:1 wide banner format.`
    : `${basePrompt} The ENTIRE product must be fully visible with clear padding on all sides — do not crop any part of the product. Product positioned in the right 60% of frame, left 40% clean for text overlay. Ultra-high quality commercial product photography, 3:1 wide banner format.`;

  const { image } = await generateImage({
    model: gateway.image("bfl/flux-2-pro"),
    prompt: fullPrompt,
    aspectRatio: "3:1",
  });

  const filename = `ads/ai-${Date.now()}.jpg`;
  const blob = await put(filename, Buffer.from(image.uint8Array), { access: "public", contentType: "image/jpeg" });

  return NextResponse.json({ imageUrl: blob.url });
}
