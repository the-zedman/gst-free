import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText, generateImage, gateway } from "ai";
import { put } from "@vercel/blob";

async function requireAdmin() {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "admin";
}

// Step 1: Scrape Amazon URL and extract product info
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = (await request.json()) as { action: string; amazonUrl?: string; productInfo?: ProductInfo; clickUrl?: string };

    if (body.action === "scrape") {
      return scrapeAmazon(body.amazonUrl ?? "");
    }
    if (body.action === "generate-copy") {
      return generateCopy(body.productInfo!);
    }
    if (body.action === "generate-image") {
      return generateAdImage(body.productInfo!);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

interface ProductInfo {
  title: string;
  price: string;
  description: string;
  features: string[];
  imageUrl: string | null;
  rating: string;
  reviewCount: string;
}

async function scrapeAmazon(url: string) {
  if (!url.includes("amazon")) {
    return NextResponse.json({ error: "Please provide an Amazon product URL" }, { status: 400 });
  }

  let html = "";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-AU,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000),
    });
    html = await res.text();
  } catch {
    return NextResponse.json({ error: "Could not fetch Amazon page. Try again or enter product details manually." }, { status: 422 });
  }

  // Use Claude to extract structured product info from HTML
  const { text } = await generateText({
    model: gateway("anthropic/claude-haiku-4-5-20251001"),
    messages: [{
      role: "user",
      content: `Extract product information from this Amazon page HTML. Return ONLY valid JSON, no markdown, no explanation.

Extract: title, price (with currency), description (2-3 sentences), features (array of 3-5 key bullet points), imageUrl (main product image src), rating (e.g. "4.5"), reviewCount (e.g. "1,234").

If any field cannot be found, use an empty string or empty array. The imageUrl should be a full https:// URL.

HTML (truncated to 15000 chars):
${html.slice(0, 15000)}`,
    }],
  });

  let productInfo: ProductInfo;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    productInfo = JSON.parse(jsonMatch?.[0] ?? text);
  } catch {
    return NextResponse.json({ error: "Could not parse product information. The Amazon page may have been blocked." }, { status: 422 });
  }

  return NextResponse.json({ productInfo });
}

async function generateCopy(product: ProductInfo) {
  const { text } = await generateText({
    model: gateway("anthropic/claude-haiku-4-5-20251001"),
    messages: [{
      role: "user",
      content: `Create compelling ad copy for this product. Return ONLY valid JSON, no markdown.

Product: ${product.title}
Price: ${product.price}
Description: ${product.description}
Features: ${product.features.join(", ")}
Rating: ${product.rating} (${product.reviewCount} reviews)

Return JSON with:
- adName: internal name for the ad (product name + month/year)
- title: punchy headline (max 8 words, all caps or title case, very compelling)
- subtitle: supporting line (max 15 words, benefit-focused)
- ctaText: call to action button text (2-4 words, e.g. "Shop Now", "Get the Deal", "Buy on Amazon")
- altText: image alt text for accessibility
- imagePrompt: a detailed DALL-E/Flux prompt to generate a 1200x400 wide banner ad for this product. Style: professional Amazon-style product photography, clean white or very light background, product prominently displayed, photorealistic, high quality commercial photography. Include the product name and key visual elements.`,
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

async function generateAdImage(product: ProductInfo & { imagePrompt?: string }) {
  const prompt = product.imagePrompt ??
    `Professional product advertisement banner for: ${product.title}. Amazon-style product photography, clean white background, product prominently centered, photorealistic commercial photography, high quality, 1200x400 wide banner format, professional studio lighting`;

  const { image } = await generateImage({
    model: gateway.image("bfl/flux-2-pro"),
    prompt,
    aspectRatio: "3:1",
  });

  const filename = `ads/ai-${Date.now()}.jpg`;
  const blob = await put(filename, Buffer.from(image.uint8Array), { access: "public", contentType: "image/jpeg" });

  return NextResponse.json({ imageUrl: blob.url });
}
