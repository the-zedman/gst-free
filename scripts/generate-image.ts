import { generateImage } from 'ai';
import { gateway } from 'ai';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

async function main() {
  const [prompt, outFile] = process.argv.slice(2);

  if (!prompt || !outFile) {
    console.error('Usage: npx tsx scripts/generate-image.ts "<prompt>" <output-file>');
    console.error('Example: npx tsx scripts/generate-image.ts "fresh sourdough bread" public/images/bread.jpg');
    process.exit(1);
  }

  console.log(`Generating: "${prompt}" → ${outFile}`);

  const { image } = await generateImage({
    model: gateway.image('bfl/flux-2-pro'),
    prompt,
    aspectRatio: '1:1',
  });

  const outputPath = resolve(outFile);
  writeFileSync(outputPath, image.uint8Array);

  console.log(`Saved to ${outputPath}`);
}

main();
