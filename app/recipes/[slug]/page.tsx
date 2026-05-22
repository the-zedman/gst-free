import { getRecipe } from '@/lib/recipes';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import PrintButton from './PrintButton';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatTime(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) notFound();

  const totalTime = recipe.prep_time_mins + recipe.cook_time_mins;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 print:py-0">
      {/* Back link — hidden on print */}
      <Link href="/recipes" className="text-sm text-green-600 hover:underline mb-6 inline-block print:hidden">
        ← Back to recipes
      </Link>

      {/* Hero image */}
      {recipe.image_path && (
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 print:rounded-none print:mb-4">
          <Image
            src={recipe.image_path}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 672px) 100vw, 672px"
            priority
          />
        </div>
      )}

      {/* Title + meta */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full capitalize">
            {recipe.meal_type}
          </span>
          {recipe.cuisine && recipe.cuisine !== 'australian' && (
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full capitalize">
              {recipe.cuisine}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
        <p className="text-gray-600 leading-relaxed">{recipe.description}</p>
      </div>

      {/* Time / serves strip */}
      <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4 mb-8 text-center">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Prep</p>
          <p className="font-semibold text-gray-800">{formatTime(recipe.prep_time_mins)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Cook</p>
          <p className="font-semibold text-gray-800">{formatTime(recipe.cook_time_mins)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Serves</p>
          <p className="font-semibold text-gray-800">{recipe.servings}</p>
        </div>
      </div>

      {/* Ingredients */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Ingredients</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 w-4 h-4 rounded-full border-2 border-green-400 shrink-0 print:border-gray-400" />
              <span className="text-gray-700 text-sm leading-relaxed">
                <span className="font-medium">{ing.quantity}{ing.unit ? ` ${ing.unit}` : ''}</span>{' '}
                {ing.item_slug ? (
                  <Link
                    href={`/items/${ing.item_slug}`}
                    className="text-green-700 hover:underline print:text-gray-900 print:no-underline"
                  >
                    {ing.name}
                  </Link>
                ) : (
                  ing.name
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Method */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Method</h2>
        <ol className="space-y-4">
          {recipe.method.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center print:bg-gray-800">
                {i + 1}
              </span>
              <p className="text-gray-700 text-sm leading-relaxed pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 print:hidden">
          {recipe.tags.map(tag => (
            <span key={tag} className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Print button */}
      <PrintButton />
    </div>
  );
}
