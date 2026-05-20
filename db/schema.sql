CREATE TABLE IF NOT EXISTS items (
  id             SERIAL PRIMARY KEY,
  ato_id         TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  ato_notes      TEXT,
  category       TEXT NOT NULL DEFAULT 'other',
  slug           TEXT NOT NULL UNIQUE,
  search_vector  TSVECTOR GENERATED ALWAYS AS (
                   to_tsvector('english', name || ' ' || COALESCE(ato_notes, ''))
                 ) STORED,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS items_search_idx    ON items USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS items_category_idx  ON items (category);
CREATE INDEX IF NOT EXISTS items_slug_idx      ON items (slug);
