import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText, gateway } from "ai";

export async function POST(request: NextRequest) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("screenshot") as File | null;
    if (!file) return NextResponse.json({ error: "No screenshot provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/png";

    const { text } = await generateText({
      model: gateway("anthropic/claude-sonnet-4-6"),
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            image: base64,
            mediaType: mimeType as "image/png" | "image/jpeg" | "image/webp",
          },
          {
            type: "text",
            text: `You are extracting product information from an Amazon product page screenshot to use for creating an advertisement.

Return ONLY valid JSON with no markdown, no explanation, no code blocks.

Extract these fields:
- title: full product name
- brand: brand/manufacturer name
- price: current selling price including currency symbol (e.g. "$119.00")
- rrp: original/RRP/was price including currency symbol (e.g. "$249.99"), empty string if not shown
- discount: discount percentage (e.g. "52%"), empty string if not shown
- rating: star rating (e.g. "4.7"), empty string if not shown
- reviewCount: number of reviews (e.g. "418"), empty string if not shown
- socialProof: any social proof text visible (e.g. "Amazon's Choice", "700+ bought in past month"), empty string if none
- description: 2-3 sentence description of what this product is and does, written for an ad audience
- features: array of 4-6 key selling points from the bullet points (concise, benefit-focused)
- specs: object of key technical specs visible (e.g. {"Wattage": "850W", "Capacity": "2.1L", "Colour": "Grey"})

Do NOT include: delivery dates, stock status, shipping address, order timing, seller info, payment methods, or any other logistics/fulfilment details — those are customer-specific and not relevant to an advertisement.`,
          },
        ],
      }],
    });

    let productInfo;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      productInfo = JSON.parse(jsonMatch?.[0] ?? text);
    } catch {
      return NextResponse.json({ error: "Could not parse product information from screenshot." }, { status: 422 });
    }

    return NextResponse.json({ productInfo });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
