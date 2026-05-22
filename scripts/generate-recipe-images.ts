import { config } from 'dotenv';
config({ path: '.env.local' });
import { generateImage } from 'ai';
import { gateway } from 'ai';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const recipes: Array<{ slug: string; prompt: string }> = [
  { slug: 'scrambled-eggs-on-toast', prompt: 'Creamy scrambled eggs piled on thick sourdough toast, sprinkled with fresh chives. Professional food photography, warm natural lighting, Australian home kitchen aesthetic, 45-degree angle, shallow depth of field, styled on a rustic wooden surface' },
  { slug: 'bircher-muesli-with-berries', prompt: 'Bircher muesli in a ceramic bowl topped with vibrant fresh strawberries and blueberries, drizzled with honey. Professional food photography, warm natural lighting, Australian home kitchen aesthetic, 45-degree angle, shallow depth of field, styled on marble' },
  { slug: 'veggie-frittata', prompt: 'Golden baked frittata in a cast iron pan, studded with zucchini, capsicum, mushroom and feta. Professional food photography, warm natural lighting, Australian home kitchen aesthetic, 45-degree angle, shallow depth of field' },
  { slug: 'banana-smoothie', prompt: 'Thick creamy banana smoothie in a tall glass with a fresh banana beside it and a paper straw. Professional food photography, warm natural lighting, Australian home kitchen aesthetic, styled on a wooden surface' },
  { slug: 'honey-porridge-with-banana', prompt: 'Creamy oat porridge in a wide ceramic bowl with sliced banana arranged on top and a golden honey drizzle. Professional food photography, warm natural lighting, Australian home kitchen aesthetic, 45-degree angle' },
  { slug: 'smoked-salmon-and-poached-eggs', prompt: 'Perfectly poached eggs on sourdough toast with smoked salmon, capers and fresh dill. Professional food photography, warm natural lighting, Australian brunch aesthetic, 45-degree angle, shallow depth of field' },
  { slug: 'zucchini-and-corn-fritters', prompt: 'Stack of golden crispy zucchini and corn fritters on a white plate with a dollop of yoghurt and fresh herb garnish. Professional food photography, warm natural lighting, Australian home kitchen aesthetic' },
  { slug: 'overnight-oats-with-mixed-berries', prompt: 'Overnight oats in a glass jar topped with colourful mixed raspberries, blueberries and strawberries with a honey drizzle. Professional food photography, warm natural lighting, styled on marble' },
  { slug: 'avocado-on-sourdough', prompt: 'Thick slices of sourdough topped with beautifully smashed avocado, a poached egg, red chilli flakes and microherbs. Professional food photography, warm natural lighting, Australian café aesthetic, 45-degree angle' },
  { slug: 'french-toast-with-fresh-fruit', prompt: 'Golden French toast with a light dusting of icing sugar, served with sliced mango and fresh strawberries and a small jug of honey. Professional food photography, warm natural lighting, Australian home kitchen aesthetic' },
  { slug: 'pumpkin-soup', prompt: 'Silky smooth roasted pumpkin soup in a wide white bowl with a swirl of yoghurt, toasted pumpkin seeds and a drizzle of olive oil. Professional food photography, warm natural lighting, 45-degree angle, styled on a rustic wooden surface' },
  { slug: 'lentil-and-vegetable-soup', prompt: 'Hearty red lentil and vegetable soup in a rustic ceramic bowl with a slice of crusty bread on the side. Professional food photography, warm natural lighting, Australian home kitchen aesthetic, 45-degree angle' },
  { slug: 'tuna-rice-salad', prompt: 'Colourful tuna and rice salad in a large bowl with diced cucumber, halved cherry tomatoes, red onion and fresh parsley. Professional food photography, warm natural lighting, top-down angle, styled on marble' },
  { slug: 'prawn-and-mango-salad', prompt: 'Australian summer prawn and mango salad on a white platter with fresh mint, coriander and lime wedges. Professional food photography, bright natural lighting, overhead angle, vibrant colours' },
  { slug: 'lamb-pita-with-tzatziki', prompt: 'Halved lamb-filled pita bread with tzatziki, fresh tomato and lettuce on a wooden board with a side of tzatziki. Professional food photography, warm natural lighting, 45-degree angle, Mediterranean aesthetic' },
  { slug: 'smashed-chickpea-and-avocado-toast', prompt: 'Rustic smashed chickpea and avocado on thick sourdough toast with red chilli flakes, lemon and fresh parsley. Professional food photography, warm natural lighting, Australian café aesthetic, 45-degree angle' },
  { slug: 'chicken-and-salad-wrap', prompt: 'Two halved wholegrain wraps revealing shredded chicken, green avocado and fresh salad inside. Professional food photography, warm natural lighting, Australian home kitchen aesthetic, 45-degree angle' },
  { slug: 'mushroom-and-egg-fried-rice', prompt: 'Steaming wok fried rice with sautéed mushrooms, scrambled egg and spring onion in a bowl with chopsticks. Professional food photography, warm natural lighting, 45-degree angle' },
  { slug: 'minestrone-soup', prompt: 'Vibrant hearty Italian minestrone soup in a deep bowl with colourful vegetables, beans and pasta, with rustic crusty bread alongside. Professional food photography, warm natural lighting, 45-degree angle' },
  { slug: 'thai-beef-salad', prompt: 'Thai beef salad with thinly sliced medium-rare rump steak over a bed of fresh green herbs, sliced chilli and lime wedges. Professional food photography, vibrant natural lighting, 45-degree angle' },
  { slug: 'sunday-roast-lamb', prompt: 'Beautifully carved leg of lamb surrounded by golden roasted vegetables, rosemary and gravy on a large rustic serving platter. Professional food photography, warm natural lighting, Australian Sunday roast aesthetic' },
  { slug: 'grilled-barramundi-with-broccolini', prompt: 'Golden crispy-skinned grilled barramundi fillet on a plate with steamed broccolini and a lemon butter sauce. Professional food photography, warm natural lighting, Australian seafood aesthetic, 45-degree angle' },
  { slug: 'beef-and-vegetable-stir-fry', prompt: 'Sizzling beef and vegetable stir fry with broccoli, carrot and capsicum in a wok, served over fluffy steamed jasmine rice. Professional food photography, warm natural lighting, 45-degree angle' },
  { slug: 'slow-cooked-lamb-shanks', prompt: 'Fall-off-the-bone braised lamb shank on a mound of creamy mashed potato in a deep bowl with rich red wine sauce and rosemary. Professional food photography, warm moody lighting, Australian winter comfort food aesthetic' },
  { slug: 'chicken-and-vegetable-curry', prompt: 'Creamy golden chicken and vegetable curry in a wide bowl served over fluffy basmati rice with fresh coriander and naan bread. Professional food photography, warm natural lighting, 45-degree angle' },
  { slug: 'beef-bolognese', prompt: 'Spaghetti bolognese with a rich meaty sauce, fresh basil leaves and finely grated parmesan cheese in a pasta plate. Professional food photography, warm natural lighting, Italian-Australian aesthetic, 45-degree angle' },
  { slug: 'baked-salmon-with-sweet-potato', prompt: 'Honey-glazed baked salmon fillet resting on vibrant orange sweet potato mash with steamed greens and a lemon wedge. Professional food photography, warm natural lighting, 45-degree angle, styled on marble' },
  { slug: 'beef-and-vegetable-stew', prompt: 'Rich hearty beef and vegetable stew in a cast iron Dutch oven with tender chunks of beef, carrots and potatoes in a thick dark gravy. Professional food photography, warm moody lighting, Australian winter comfort food aesthetic' },
  { slug: 'garlic-prawn-linguine', prompt: 'Garlic butter prawns tossed with linguine pasta and fresh parsley in a wide pasta bowl with lemon wedges. Professional food photography, warm natural lighting, Italian-Australian aesthetic, 45-degree angle' },
  { slug: 'vegetable-and-lentil-dhal', prompt: 'Golden turmeric lentil dhal with wilted spinach in a deep bowl over basmati rice, with a piece of naan bread and fresh coriander. Professional food photography, warm natural lighting, 45-degree angle' },
];

async function main() {
  const outDir = resolve('public/images/recipes');
  mkdirSync(outDir, { recursive: true });

  const skip = recipes.filter(r => existsSync(`${outDir}/${r.slug}.jpg`)).map(r => r.slug);
  if (skip.length) console.log(`Skipping ${skip.length} already-generated images.`);

  const todo = recipes.filter(r => !existsSync(`${outDir}/${r.slug}.jpg`));
  console.log(`Generating ${todo.length} images...\n`);

  for (let i = 0; i < todo.length; i++) {
    const { slug, prompt } = todo[i];
    process.stdout.write(`[${i + 1}/${todo.length}] ${slug}...`);
    try {
      const { image } = await generateImage({
        model: gateway.image('bfl/flux-2-pro'),
        prompt,
        aspectRatio: '4:3',
      });
      writeFileSync(`${outDir}/${slug}.jpg`, image.uint8Array);
      console.log(' ✓');
    } catch (err) {
      console.log(` ✗ ${err}`);
    }
  }
  console.log('\nAll done!');
}

main().catch(console.error);
