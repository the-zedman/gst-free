import { config } from 'dotenv';
config({ path: '.env.local' });
import { generateImage } from 'ai';
import { gateway } from 'ai';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const images = [
  {
    file: 'public/images/hero-groceries.jpg',
    aspectRatio: '4:3' as const,
    prompt: 'Vibrant overhead flat-lay of fresh Australian groceries beautifully arranged: colourful seasonal vegetables including broccoli, carrots, capsicum and leafy greens, fresh citrus fruits, whole grain bread, eggs in a bowl, arranged artistically on a clean white marble surface. High-end professional food photography, bright natural light, crisp shadows, inviting and appetising, no text, no people, no logos',
  },
  {
    file: 'public/images/coming-soon-budget-guide.jpg',
    aspectRatio: '16:9' as const,
    prompt: 'A neatly styled overhead flat-lay of a budget grocery shop: a handwritten shopping list, a small purse with coins, colourful fresh vegetables, a reusable shopping bag, all on a warm wooden kitchen bench. Professional lifestyle photography, clean and bright, warm natural light, Australian home aesthetic, no text overlays',
  },
  {
    file: 'public/images/coming-soon-food-support.jpg',
    aspectRatio: '16:9' as const,
    prompt: 'Warm community scene showing a generous basket filled with fresh vegetables, bread, and fruit being offered by caring hands. Soft warm natural light, welcoming and inclusive feel, Australian community garden or food bank setting, shallow depth of field, hopeful and uplifting mood, no text',
  },
  {
    file: 'public/images/coming-soon-specials.jpg',
    aspectRatio: '16:9' as const,
    prompt: 'Colourful display of fresh produce on special at an Australian supermarket or farmers market — bright tomatoes, zucchini, leafy greens, bananas, all beautifully arranged. Professional retail photography, bright clean lighting, appetising and vibrant colours, no visible price tags or text, no people',
  },
];

async function main() {
  mkdirSync(resolve('public/images'), { recursive: true });

  for (let i = 0; i < images.length; i++) {
    const { file, prompt, aspectRatio } = images[i];
    process.stdout.write(`[${i + 1}/${images.length}] ${file}...`);
    try {
      const { image } = await generateImage({
        model: gateway.image('bfl/flux-2-pro'),
        prompt,
        aspectRatio,
      });
      writeFileSync(resolve(file), image.uint8Array);
      console.log(' ✓');
    } catch (err) {
      console.log(` ✗ ${err}`);
    }
  }
  console.log('\nAll done!');
}

main().catch(console.error);
