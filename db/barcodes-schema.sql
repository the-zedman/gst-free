-- Barcode lookup cache
-- Populated by the Open Food Facts API (on-demand) or by scripts/seed-barcodes.ts (bulk)
CREATE TABLE IF NOT EXISTS barcodes (
  barcode        TEXT PRIMARY KEY,
  product_name   TEXT NOT NULL,
  brand          TEXT,
  off_categories TEXT,
  gst_status     TEXT NOT NULL DEFAULT 'unknown',   -- 'GST-free', 'taxable', 'mixed supply', 'unknown'
  gst_confidence TEXT NOT NULL DEFAULT 'low',       -- 'high', 'medium', 'low'
  gst_notes      TEXT,
  image_url      TEXT,
  source         TEXT DEFAULT 'off',               -- 'off' = Open Food Facts
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS barcodes_gst_idx ON barcodes (gst_status);
