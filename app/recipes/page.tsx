import { getRecipes } from '@/lib/recipes';
import Link from 'next/link';
import Image from 'next/image';
import AdSlot from '@/components/AdSlot';

const TABS = [
  { value: 'all',       label: 'All Recipes' },
  { value: 'breakfast', label: '🍳 Breakfast' },
  { value: 'lunch',     label: '🥗 Lunch' },
  { value: 'dinner',    label: '🍽️ Dinner' },
] as const;

interface PageProps {
  searchParams: Promise<{ meal?: string }>;
}

function formatTime(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default async function RecipesPage({ searchParams }: PageProps) {
  const { meal } = await searchParams;
  const active = TABS.find(t => t.value === meal)?.value ?? 'all';
  const recipes = await getRecipes(active === 'all' ? undefined : active);

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-10 overflow-x-hidden">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recipes</h1>
        <p className="text-gray-500 text-sm">
          {recipes.length} recipes made mostly from GST-free ingredients — save money without sacrificing flavour.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <Link
            key={tab.value}
            href={tab.value === 'all' ? '/recipes' : `/recipes?meal=${tab.value}`}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              active === tab.value
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <AdSlot id="recipe-top" className="mb-8" />

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <Link
            key={recipe.slug}
            href={`/recipes/${recipe.slug}`}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow min-w-0"
          >
            <div className="relative aspect-[4/3] bg-gray-100">
              {recipe.image_path ? (
                <Image
                  src={recipe.image_path}
                  alt={recipe.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-4xl text-gray-300">🍽️</div>
              )}
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 px-2 py-1 rounded-full capitalize">
                {recipe.meal_type}
              </span>
            </div>

            <div className="p-4">
              <h2 className="font-semibold text-gray-900 leading-snug mb-1 group-hover:text-green-700 transition-colors">
                {recipe.title}
              </h2>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{recipe.description}</p>

              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>⏱ {formatTime(recipe.prep_time_mins + recipe.cook_time_mins)}</span>
                <span>👤 {recipe.servings} serves</span>
                {recipe.cuisine && recipe.cuisine !== 'australian' && (
                  <span className="capitalize">{recipe.cuisine}</span>
                )}
              </div>

              {recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {recipe.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <AdSlot id="recipe-bottom" className="mt-8" />
    </div>
  );
}
