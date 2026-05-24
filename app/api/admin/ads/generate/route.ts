import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText, generateImage, gateway } from "ai";
import { put } from "@vercel/blob";

async function requireAdmin() {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "admin";
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

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = (await request.json()) as {
      action: string;
      productInfo?: ProductInfo;
      productPosition?: "left" | "right";
      ctaText?: string;
      productImageUrls?: string[];
    };

    if (body.action === "generate-prompt") {
      return generateGeminiPrompt(
        body.productInfo!,
        body.productPosition ?? "right",
        body.ctaText ?? "Shop Now",
      );
    }
    if (body.action === "generate-image") {
      return generateAdImage(body.productInfo!, body.productImageUrls ?? []);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

async function generateGeminiPrompt(
  product: ProductInfo,
  position: "left" | "right",
  ctaText: string,
) {
  const specsText = Object.entries(product.specs ?? {})
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  const { text } = await generateText({
    model: gateway("anthropic/claude-haiku-4-5-20251001"),
    messages: [{
      role: "user",
      content: `You are an advertising copywriter. Given this product data, return ONLY valid JSON with no markdown or code blocks.

Product: ${product.title}
Brand: ${product.brand}
Price: ${product.price}${product.rrp ? ` (was ${product.rrp})` : ""}${product.discount ? `, ${product.discount} off` : ""}
Rating: ${product.rating}${product.reviewCount ? ` (${product.reviewCount} reviews)` : ""}
Social proof: ${product.socialProof}
Description: ${product.description}
Key features: ${product.features.join(" | ")}
${specsText ? `Specs: ${specsText}` : ""}

Return JSON with these fields:
- adName: internal name (brand + short product type + Mon YYYY, e.g. "Ninja Food Processor May 2026")
- headline: punchy benefit-led headline, max 8 words (e.g. "Master Every Meal in Seconds")
- featureLine: single most compelling feature/benefit, max 15 words, written as a punchy sentence
- productShortName: short product name for the banner (brand + key product type only, e.g. "Ninja Professional Food Processor")
- productAppearance: 1-2 sentence visual description of the product's colour, shape and key physical features (infer from product name and specs)
- backgroundSuggestion: If this product belongs to a specific use environment (kitchen appliance → stylish modern kitchen with bench, splashback and ambient lighting; fitness → gym or outdoor setting; tech → clean minimal desk; beauty → bathroom/vanity), describe that specific aspirational scene in 2 sentences. Otherwise describe a rich premium dark gradient or textured background suited to the product's colour palette. Be specific and evocative.
- altText: accessibility alt text for the finished banner ad`,
    }],
  });

  let parsed: Record<string, string>;
  try {
    const match = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(match?.[0] ?? text);
  } catch {
    return NextResponse.json({ error: "Failed to generate prompt" }, { status: 500 });
  }

  const adName = parsed.adName ?? `${product.brand} Ad`;
  const headline = parsed.headline ?? product.title.slice(0, 50);
  const featureLine = parsed.featureLine ?? product.features[0] ?? "";
  const productShortName = parsed.productShortName ?? `${product.brand} ${product.title.split(",")[0]}`;
  const backgroundSuggestion = parsed.backgroundSuggestion ?? "a rich, deep premium gradient background that complements the product's colour palette";

  const priceLine = [
    product.price && `**${product.price}**`,
    product.rrp && `~~${product.rrp}~~`,
    product.discount && `**${product.discount} off**`,
  ].filter(Boolean).join(" ");

  const copyBlock = position === "right"
    ? `- Left 45%: ad copy in this exact order from top to bottom — headline, product name, price, rating, social proof, feature line, CTA button. Clean readable hierarchy with appropriate spacing between each element.
- Right 55%: the full product, completely visible with no cropping at any edge, floating naturally with a subtle drop shadow beneath it.`
    : `- Left 55%: the full product, completely visible with no cropping at any edge, floating naturally with a subtle drop shadow beneath it.
- Right 45%: ad copy in this exact order from top to bottom — headline, product name, price, rating, social proof, feature line, CTA button. Clean readable hierarchy with appropriate spacing between each element.`;

  const geminiPrompt = `You are a professional advertising designer. Using the product screenshot I've uploaded as your exact visual reference, design a complete, print-ready Amazon-style product advertisement banner — including all text, layout, background and the product image.

**Output:** 1200 × 400 pixels, landscape (3:1 wide banner)

**Product:**
${product.title} by ${product.brand}. Reproduce the exact product from the screenshot — same model, ${parsed.productAppearance ?? "colour, shape and key physical features"}. Do not invent details not in the screenshot.

**Ad copy to include (design these into the banner):**
- Headline: **${headline}**
- Product name: **${productShortName}** (bold, slightly smaller than headline)
- Price: ${priceLine}${product.rating ? `\n- Rating: **${product.rating}★** (${product.reviewCount} reviews)` : ""}${product.socialProof ? `\n- Social proof: **${product.socialProof}**` : ""}
- Key feature line: *${featureLine}*
- CTA button: **${ctaText}** (green button, white text)

**Layout:**
${copyBlock}

**Background:**
${backgroundSuggestion} The background must work cohesively behind both the text area and the product area. If a scene is used, it should feel aspirational and premium, not cluttered — the product and text must remain the clear focus.

**Typography:**
- Headline: large, bold, white
- Product name: bold, white, slightly smaller than headline
- Price: bold white for current price, struck-through grey for RRP, bright green or yellow for the discount percentage
- Rating and social proof: smaller, white or light grey
- Feature line: italic, white/light
- CTA button: solid green (#22c55e), white bold text, rounded corners

**Style:**
- Professional, modern Amazon-style advertisement
- High contrast text — all copy must be clearly legible against the background
- The product should look photorealistic and sharp, as if professionally photographed
- Overall feel: premium, trustworthy, great deal

**Do not:**
- Leave the product cropped at any edge
- Use a plain flat white or grey background — make it rich and product-appropriate
- Add any elements not listed above`;

  return NextResponse.json({ geminiPrompt, adName, altText: parsed.altText ?? "" });
}

async function generateAdImage(product: ProductInfo, productImageUrls: string[]) {
  let visualDescription = "";

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
            text: `Describe the visual appearance of this product in 3-4 sentences for use in an image generation prompt. Focus on exact shape, colour, finish, key visible components and branding.`,
          },
        ],
      }],
    });
    visualDescription = text.trim();
  }

  const { text: fluxPrompt } = await generateText({
    model: gateway("anthropic/claude-sonnet-4-6"),
    messages: [{
      role: "user",
      content: `Write a Flux image generation prompt for a 3:1 wide banner ad for: ${product.title} by ${product.brand}.
${visualDescription ? `Visual appearance: ${visualDescription}` : ""}
Requirements: entire product fully visible, product in right 55% of frame, left 45% clean for text overlay, professional studio photography, white/light grey background, no cropping.
Write ONLY the prompt, no explanation.`,
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
