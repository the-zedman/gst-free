import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText, generateImage, gateway } from "ai";
import { put } from "@vercel/blob";

async function requireAdmin() {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "admin";
}

export interface GeneratedCopy {
  adName: string;
  title: string;
  subtitle: string;
  price: string;
  rating: string;
  socialProof: string;
  ctaText: string;
  altText: string;
  imagePrompt: string;
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = (await request.json()) as {
      action: string;
      productInfo?: ProductInfo;
      productImageUrls?: string[];
      copy?: GeneratedCopy;
    };

    if (body.action === "generate-copy") return generateCopy(body.productInfo!);
    if (body.action === "generate-image") return generateAdImage(body.productInfo!, body.productImageUrls ?? [], body.copy);

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
  const priceLine = [
    product.price && `Now ${product.price}`,
    product.rrp && `was ${product.rrp}`,
    product.discount && `(${product.discount} off)`,
  ].filter(Boolean).join(" · ");
  const socialLine = [
    product.rating && `${product.rating}★ (${product.reviewCount} reviews)`,
    product.socialProof,
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
- subtitle: feature-focused supporting line (max 12 words, highlight the top benefit or feature — do NOT include price, rating or social proof here, those are shown separately)
- price: formatted price display string combining all price info (e.g. "$119.00 · was $249.99 · 52% off"), or empty string if no price data available
- rating: formatted rating display (e.g. "4.7★ (418 reviews)"), or empty string if no rating data available
- socialProof: social proof text exactly as it appears (e.g. "Amazon's Choice · 700+ bought in past month"), or empty string if none
- ctaText: call to action (2-4 words, action-oriented, e.g. "Shop Now", "Grab the Deal", "Buy on Amazon")
- altText: descriptive image alt text for accessibility
- imagePrompt: a concise description of what this product looks like physically (shape, colour, key components) for use in image generation — 2-3 sentences`,
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

async function generateAdImage(product: ProductInfo, productImageUrls: string[], copy?: GeneratedCopy) {
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

  // Use Claude as creative director to write the optimal Flux prompt
  const priceLine = [
    product.price && `${product.price}`,
    product.rrp && `was ${product.rrp}`,
    product.discount && `${product.discount} off`,
  ].filter(Boolean).join(", ");

  const { text: fluxPrompt } = await generateText({
    model: gateway("anthropic/claude-sonnet-4-6"),
    messages: [{
      role: "user",
      content: `You are a professional advertising creative director. Write the single best Flux image generation prompt for a 3:1 wide banner ad for this product.

Product: ${product.title} by ${product.brand}
${priceLine ? `Price: ${priceLine}` : ""}
${visualDescription ? `Visual appearance: ${visualDescription}` : copy?.imagePrompt ? `Product description: ${copy.imagePrompt}` : ""}
${copy ? `Ad headline: "${copy.title}"` : ""}
${copy?.subtitle ? `Ad subtitle: "${copy.subtitle}"` : ""}

Critical composition requirements:
1. The product must appear SMALL relative to the overall image — occupying no more than 35% of the total image area — so that it fits entirely within the frame with large amounts of white space surrounding it on all sides
2. The product is positioned in the RIGHT THIRD of the image, vertically centred, fully visible, with clear empty space above, below, and to the right of it
3. The LEFT TWO-THIRDS of the image is clean, minimal white or very light grey — suitable for text overlay
4. Professional commercial photography: clean white or very light grey background, photorealistic, studio lighting, high resolution
5. Think about the product's form factor: tall products (blenders, bottles, stand mixers) must have significant empty space above and below; wide products (laptops, monitors) must have space left and right — scale it down accordingly

Write ONLY the Flux prompt text, nothing else. No explanation, no preamble, no quotes.`,
    }],
  });

  const { image } = await generateImage({
    model: gateway.image("bfl/flux-2-pro"),
    prompt: fluxPrompt.trim(),
    aspectRatio: "3:1",
  });

  const filename = `ads/ai-${Date.now()}.jpg`;
  const blob = await put(filename, Buffer.from(image.uint8Array), { access: "public", contentType: "image/jpeg" });

  return NextResponse.json({ imageUrl: blob.url });
}
