import 'server-only';
import { sql } from '@/lib/db';
import type { Recipe } from '@/lib/recipe-types';
export type { Ingredient, Recipe } from '@/lib/recipe-types';

export async function getRecipes(mealType?: string): Promise<Recipe[]> {
  const rows = mealType && mealType !== 'all'
    ? await sql`SELECT * FROM recipes WHERE published = true AND meal_type = ${mealType} ORDER BY id`
    : await sql`SELECT * FROM recipes WHERE published = true ORDER BY meal_type, id`;
  return rows as unknown as Recipe[];
}

export async function getRecipe(slug: string): Promise<Recipe | null> {
  const rows = await sql`SELECT * FROM recipes WHERE slug = ${slug} AND published = true LIMIT 1`;
  return rows.length ? rows[0] as unknown as Recipe : null;
}
