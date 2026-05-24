import { experimental_generateImage as generateImage } from "ai";
import { createGateway } from "@ai-sdk/gateway";
import fs from "fs";
import path from "path";

const gateway = createGateway({ apiKey: process.env.AI_GATEWAY_API_KEY });

const images = [
  {
    file: "gst-family-shopping.jpg",
    prompt:
      "A warm, authentic photo of an Australian family of four — mother, father, and two school-age children — doing their weekly grocery shopping at a bright supermarket. The parents are looking at products on a shelf, comparing labels. Natural lighting, realistic style, no text or logos. Photorealistic.",
  },
  {
    file: "gst-pensioner-checkout.jpg",
    prompt:
      "A realistic photo of an elderly Australian woman, mid-70s, carefully reviewing her supermarket receipt at a checkout counter. She looks concerned about the total. Warm but honest lighting. Photorealistic, no text or logos, natural supermarket background.",
  },
  {
    file: "gst-single-parent.jpg",
    prompt:
      "A realistic photo of a young Australian single mother with one small child in the trolley seat, shopping in a supermarket aisle. She is looking at price tags on food products, appearing thoughtful and budget-conscious. Warm natural lighting, photorealistic, no text or logos.",
  },
];

const outDir = path.resolve("public/images");

for (const { file, prompt } of images) {
  console.log(`Generating ${file}…`);
  try {
    const { image } = await generateImage({
      model: gateway.imageModel("bfl/flux-pro-1.1"),
      prompt,
      size: "1344x768",
    });
    const buf = image.uint8Array
      ? Buffer.from(image.uint8Array)
      : image.base64
        ? Buffer.from(image.base64, "base64")
        : Buffer.from(await image.arrayBuffer());
    fs.writeFileSync(path.join(outDir, file), buf);
    console.log(`  ✓ saved ${file}`);
  } catch (e) {
    console.error(`  ✗ failed ${file}:`, e.message);
  }
}
