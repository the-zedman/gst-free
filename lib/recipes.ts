import 'server-only';
import { sql } from '@/lib/db';

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string | null;
  item_slug: string | null;
  gst_status?: 'GST-free' | 'taxable' | null;
}

export interface Recipe {
  id: number;
  slug: string;
  title: string;
  description: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  cuisine: string | null;
  prep_time_mins: number;
  cook_time_mins: number;
  servings: number;
  image_path: string | null;
  ingredients: Ingredient[];
  method: string[];
  tags: string[];
}

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
