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
