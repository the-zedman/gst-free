import "server-only";
import { sql } from "./db";

// ── Table bootstrap ────────────────────────────────────────────────────────

async function ensureTables(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS ads (
      id            BIGSERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      type          TEXT NOT NULL CHECK (type IN ('ai', 'upload')),
      image_url     TEXT NOT NULL,
      click_url     TEXT NOT NULL,
      title         TEXT,
      subtitle      TEXT,
      price_text    TEXT,
      rating_text   TEXT,
      social_proof  TEXT,
      cta_text      TEXT NOT NULL DEFAULT 'Shop Now',
      alt_text      TEXT,
      slot_target   TEXT NOT NULL DEFAULT 'any',
      weight        INTEGER NOT NULL DEFAULT 1,
      active        BOOLEAN NOT NULL DEFAULT true,
      sponsored_label TEXT NOT NULL DEFAULT 'Sponsored',
      starts_at     TIMESTAMPTZ,
      ends_at       TIMESTAMPTZ,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  // Add columns if table already existed without them
  await sql`ALTER TABLE ads ADD COLUMN IF NOT EXISTS price_text TEXT`;
  await sql`ALTER TABLE ads ADD COLUMN IF NOT EXISTS rating_text TEXT`;
  await sql`ALTER TABLE ads ADD COLUMN IF NOT EXISTS social_proof TEXT`;
  await sql`
    CREATE TABLE IF NOT EXISTS ad_events (
      id          BIGSERIAL PRIMARY KEY,
      ad_id       BIGINT NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
      event_type  TEXT NOT NULL CHECK (event_type IN ('impression', 'click')),
      slot        TEXT,
      device      TEXT,
      ip_hash     TEXT,
      country     TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS ae_ad_event ON ad_events (ad_id, event_type, created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS ae_created ON ad_events (created_at)`;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Ad {
  id: number;
  name: string;
  type: "ai" | "upload";
  image_url: string;
  click_url: string;
  title: string | null;
  subtitle: string | null;
  price_text: string | null;
  rating_text: string | null;
  social_proof: string | null;
  cta_text: string;
  alt_text: string | null;
  slot_target: string;
  weight: number;
  active: boolean;
  sponsored_label: string;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdWithStats extends Ad {
  impressions: number;
  clicks: number;
  unique_impressions: number;
}

export interface AdEvent {
  ad_id: number;
  event_type: "impression" | "click";
  slot: string | null;
  device: string | null;
  ip_hash: string | null;
  country: string | null;
}

// ── Queries ────────────────────────────────────────────────────────────────

export async function getAllAds(): Promise<AdWithStats[]> {
  await ensureTables();
  const rows = await sql`
    SELECT
      a.*,
      COALESCE(SUM(CASE WHEN e.event_type = 'impression' THEN 1 ELSE 0 END), 0)::int AS impressions,
      COALESCE(SUM(CASE WHEN e.event_type = 'click' THEN 1 ELSE 0 END), 0)::int AS clicks,
      COALESCE(COUNT(DISTINCT CASE WHEN e.event_type = 'impression' THEN e.ip_hash END), 0)::int AS unique_impressions
    FROM ads a
    LEFT JOIN ad_events e ON e.ad_id = a.id
    GROUP BY a.id
    ORDER BY a.created_at DESC
  ` as Array<Record<string, unknown>>;
  return rows.map(coerceAd);
}

export async function getAdById(id: number): Promise<AdWithStats | null> {
  await ensureTables();
  const rows = await sql`
    SELECT
      a.*,
      COALESCE(SUM(CASE WHEN e.event_type = 'impression' THEN 1 ELSE 0 END), 0)::int AS impressions,
      COALESCE(SUM(CASE WHEN e.event_type = 'click' THEN 1 ELSE 0 END), 0)::int AS clicks,
      COALESCE(COUNT(DISTINCT CASE WHEN e.event_type = 'impression' THEN e.ip_hash END), 0)::int AS unique_impressions
    FROM ads a
    LEFT JOIN ad_events e ON e.ad_id = a.id
    WHERE a.id = ${id}
    GROUP BY a.id
  ` as Array<Record<string, unknown>>;
  return rows.length > 0 ? coerceAd(rows[0]) : null;
}

export async function getActiveAds(): Promise<Ad[]> {
  await ensureTables();
  const now = new Date().toISOString();
  const rows = await sql`
    SELECT * FROM ads
    WHERE active = true
      AND (starts_at IS NULL OR starts_at <= ${now})
      AND (ends_at IS NULL OR ends_at >= ${now})
    ORDER BY weight DESC, created_at DESC
  ` as Array<Record<string, unknown>>;
  return rows.map(coerceAd);
}

export async function createAd(data: Omit<Ad, "id" | "created_at" | "updated_at">): Promise<Ad> {
  await ensureTables();
  const rows = await sql`
    INSERT INTO ads (name, type, image_url, click_url, title, subtitle, price_text, rating_text, social_proof, cta_text, alt_text, slot_target, weight, active, sponsored_label, starts_at, ends_at)
    VALUES (${data.name}, ${data.type}, ${data.image_url}, ${data.click_url}, ${data.title ?? null}, ${data.subtitle ?? null}, ${data.price_text ?? null}, ${data.rating_text ?? null}, ${data.social_proof ?? null}, ${data.cta_text}, ${data.alt_text ?? null}, ${data.slot_target}, ${data.weight}, ${data.active}, ${data.sponsored_label}, ${data.starts_at ?? null}, ${data.ends_at ?? null})
    RETURNING *
  ` as Array<Record<string, unknown>>;
  return coerceAd(rows[0]);
}

export async function updateAd(id: number, data: Partial<Pick<Ad, "name" | "click_url" | "title" | "subtitle" | "price_text" | "rating_text" | "social_proof" | "cta_text" | "alt_text" | "slot_target" | "weight" | "active" | "sponsored_label" | "starts_at" | "ends_at">>): Promise<void> {
  await ensureTables();
  await sql`
    UPDATE ads SET
      name            = COALESCE(${data.name ?? null}, name),
      click_url       = COALESCE(${data.click_url ?? null}, click_url),
      title           = CASE WHEN ${data.title !== undefined} THEN ${data.title ?? null} ELSE title END,
      subtitle        = CASE WHEN ${data.subtitle !== undefined} THEN ${data.subtitle ?? null} ELSE subtitle END,
      price_text      = CASE WHEN ${data.price_text !== undefined} THEN ${data.price_text ?? null} ELSE price_text END,
      rating_text     = CASE WHEN ${data.rating_text !== undefined} THEN ${data.rating_text ?? null} ELSE rating_text END,
      social_proof    = CASE WHEN ${data.social_proof !== undefined} THEN ${data.social_proof ?? null} ELSE social_proof END,
      cta_text        = COALESCE(${data.cta_text ?? null}, cta_text),
      alt_text        = CASE WHEN ${data.alt_text !== undefined} THEN ${data.alt_text ?? null} ELSE alt_text END,
      slot_target     = COALESCE(${data.slot_target ?? null}, slot_target),
      weight          = COALESCE(${data.weight ?? null}, weight),
      active          = COALESCE(${data.active ?? null}, active),
      sponsored_label = COALESCE(${data.sponsored_label ?? null}, sponsored_label),
      starts_at       = CASE WHEN ${data.starts_at !== undefined} THEN ${data.starts_at ?? null} ELSE starts_at END,
      ends_at         = CASE WHEN ${data.ends_at !== undefined} THEN ${data.ends_at ?? null} ELSE ends_at END,
      updated_at      = NOW()
    WHERE id = ${id}
  `;
}

export async function deleteAd(id: number): Promise<void> {
  await ensureTables();
  await sql`DELETE FROM ads WHERE id = ${id}`;
}

export async function recordAdEvent(event: AdEvent): Promise<void> {
  await ensureTables();
  await sql`
    INSERT INTO ad_events (ad_id, event_type, slot, device, ip_hash, country)
    VALUES (${event.ad_id}, ${event.event_type}, ${event.slot ?? null}, ${event.device ?? null}, ${event.ip_hash ?? null}, ${event.country ?? null})
  `;
}

// ── Per-ad analytics ───────────────────────────────────────────────────────

export interface AdDailyRow { date: string; impressions: number; clicks: number }
export interface AdSlotRow { slot: string; impressions: number; clicks: number }
export interface AdDeviceRow { device: string; impressions: number; clicks: number }

export async function getAdDailyStats(id: number, days = 30): Promise<AdDailyRow[]> {
  await ensureTables();
  const rows = await sql`
    SELECT
      to_char(created_at AT TIME ZONE 'Australia/Sydney', 'YYYY-MM-DD') AS date,
      SUM(CASE WHEN event_type = 'impression' THEN 1 ELSE 0 END)::int AS impressions,
      SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END)::int AS clicks
    FROM ad_events
    WHERE ad_id = ${id}
      AND created_at >= NOW() - (${days} || ' days')::interval
    GROUP BY 1
    ORDER BY 1
  ` as Array<Record<string, string>>;
  return rows.map((r) => ({ date: r.date, impressions: Number(r.impressions), clicks: Number(r.clicks) }));
}

export async function getAdSlotStats(id: number): Promise<AdSlotRow[]> {
  await ensureTables();
  const rows = await sql`
    SELECT
      COALESCE(slot, 'unknown') AS slot,
      SUM(CASE WHEN event_type = 'impression' THEN 1 ELSE 0 END)::int AS impressions,
      SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END)::int AS clicks
    FROM ad_events
    WHERE ad_id = ${id}
    GROUP BY slot
    ORDER BY impressions DESC
  ` as Array<Record<string, string>>;
  return rows.map((r) => ({ slot: r.slot, impressions: Number(r.impressions), clicks: Number(r.clicks) }));
}

export async function getAdDeviceStats(id: number): Promise<AdDeviceRow[]> {
  await ensureTables();
  const rows = await sql`
    SELECT
      COALESCE(device, 'unknown') AS device,
      SUM(CASE WHEN event_type = 'impression' THEN 1 ELSE 0 END)::int AS impressions,
      SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END)::int AS clicks
    FROM ad_events
    WHERE ad_id = ${id}
    GROUP BY device
    ORDER BY impressions DESC
  ` as Array<Record<string, string>>;
  return rows.map((r) => ({ device: r.device, impressions: Number(r.impressions), clicks: Number(r.clicks) }));
}

// ── Helpers ────────────────────────────────────────────────────────────────

function coerceAd(r: Record<string, unknown>): AdWithStats {
  return {
    id: Number(r.id),
    name: String(r.name),
    type: r.type as "ai" | "upload",
    image_url: String(r.image_url),
    click_url: String(r.click_url),
    title: r.title != null ? String(r.title) : null,
    subtitle: r.subtitle != null ? String(r.subtitle) : null,
    price_text: r.price_text != null ? String(r.price_text) : null,
    rating_text: r.rating_text != null ? String(r.rating_text) : null,
    social_proof: r.social_proof != null ? String(r.social_proof) : null,
    cta_text: String(r.cta_text),
    alt_text: r.alt_text != null ? String(r.alt_text) : null,
    slot_target: String(r.slot_target),
    weight: Number(r.weight),
    active: Boolean(r.active),
    sponsored_label: String(r.sponsored_label),
    starts_at: r.starts_at != null ? String(r.starts_at) : null,
    ends_at: r.ends_at != null ? String(r.ends_at) : null,
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
    impressions: Number(r.impressions ?? 0),
    clicks: Number(r.clicks ?? 0),
    unique_impressions: Number(r.unique_impressions ?? 0),
  };
}

// Weighted random cycling: pick `n` ads from pool respecting slot targeting and weights
export function pickAdsForSlots(ads: Ad[], slots: string[]): Record<string, Ad | null> {
  const result: Record<string, Ad | null> = {};
  const used = new Set<number>();

  for (const slot of slots) {
    const eligible = ads.filter(
      (a) => !used.has(a.id) && (a.slot_target === "any" || a.slot_target === slot)
    );
    if (eligible.length === 0) { result[slot] = null; continue; }

    const totalWeight = eligible.reduce((s, a) => s + a.weight, 0);
    let rand = Math.random() * totalWeight;
    let picked = eligible[eligible.length - 1];
    for (const ad of eligible) {
      rand -= ad.weight;
      if (rand <= 0) { picked = ad; break; }
    }
    result[slot] = picked;
    used.add(picked.id);
  }
  return result;
}
