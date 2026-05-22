import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const terms = ['eggs', 'fresh milk', 'plain flour', 'rolled oat', 'banana', 'apple', 'spinach', 'tomatoes', 'broccoli', 'carrot', 'avocado', 'zucchini', 'rice', 'brown rice', 'pasta', 'potato', 'sweet potato', 'prawn', 'tinned tuna'];
  for (const term of terms) {
    const rows = await sql`SELECT slug, name FROM items WHERE name ILIKE ${'%' + term + '%'} LIMIT 2`;
    if (rows.length > 0) console.log(`${term}:\n  ${rows.map(r => '  ' + r.slug + '\n    ' + r.name).join('\n  ')}`);
    else console.log(`${term}: NOT FOUND`);
  }
}
main();
