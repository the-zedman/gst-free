import "server-only";
import { sql } from "./db";

const BOT_RE =
  /bot|crawler|spider|slurp|bytespider|facebookexternalhit|googlebot|bingbot|baiduspider|yandexbot|semrushbot|ahrefsbot|wget|curl|python|scrapy|headless/i;

export function getDevice(ua: string): "mobile" | "desktop" | "bot" {
  if (BOT_RE.test(ua)) return "bot";
  if (/mobile|iphone|android/i.test(ua)) return "mobile";
  return "desktop";
}

async function ensureTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS page_views (
      id         BIGSERIAL PRIMARY KEY,
      path       TEXT NOT NULL,
      referrer   TEXT,
      device     TEXT NOT NULL DEFAULT 'desktop',
      ip_hash    TEXT,
      country    TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS pv_created_at ON page_views (created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS pv_path ON page_views (path)`;
}

export async function trackPageView(params: {
  path: string;
  referrer?: string | null;
  device: "mobile" | "desktop" | "bot";
  ipHash: string;
  country?: string | null;
}): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO page_views (path, referrer, device, ip_hash, country)
    VALUES (${params.path}, ${params.referrer ?? null}, ${params.device}, ${params.ipHash}, ${params.country ?? null})
  `;
}

// ── Dashboard query types ──────────────────────────────────────────────────

export interface SummaryStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
  allTime: number;
  todayUnique: number;
}

export interface HourlyRow {
  hour: number;
  visits: number;
}

export interface DailyRow {
  date: string;
  visits: number;
}

export interface TopPage {
  path: string;
  visits: number;
}

export interface TopReferrer {
  referrer: string;
  visits: number;
}

export interface DeviceRow {
  device: string;
  visits: number;
}

// ── Dashboard queries ──────────────────────────────────────────────────────

// All time-based queries use AEST/AEDT (Australia/Sydney)

export async function getSummaryStats(): Promise<SummaryStats> {
  await ensureTable();
  const rows = (await sql`
    SELECT
      COUNT(*) FILTER (WHERE created_at AT TIME ZONE 'Australia/Sydney' >= date_trunc('day', NOW() AT TIME ZONE 'Australia/Sydney'))   AS today,
      COUNT(*) FILTER (WHERE created_at AT TIME ZONE 'Australia/Sydney' >= date_trunc('week', NOW() AT TIME ZONE 'Australia/Sydney'))   AS this_week,
      COUNT(*) FILTER (WHERE created_at AT TIME ZONE 'Australia/Sydney' >= date_trunc('month', NOW() AT TIME ZONE 'Australia/Sydney'))  AS this_month,
      COUNT(*) FILTER (WHERE created_at AT TIME ZONE 'Australia/Sydney' >= date_trunc('year', NOW() AT TIME ZONE 'Australia/Sydney'))   AS this_year,
      COUNT(*)                                                                                                                          AS all_time,
      COUNT(DISTINCT ip_hash) FILTER (WHERE created_at AT TIME ZONE 'Australia/Sydney' >= date_trunc('day', NOW() AT TIME ZONE 'Australia/Sydney')) AS today_unique
    FROM page_views
    WHERE device != 'bot'
  `) as Array<Record<string, string>>;
  const r = rows[0];
  return {
    today: Number(r.today),
    thisWeek: Number(r.this_week),
    thisMonth: Number(r.this_month),
    thisYear: Number(r.this_year),
    allTime: Number(r.all_time),
    todayUnique: Number(r.today_unique),
  };
}

export async function getHourlyToday(): Promise<HourlyRow[]> {
  await ensureTable();
  return (await sql`
    SELECT
      EXTRACT(HOUR FROM created_at AT TIME ZONE 'Australia/Sydney')::int AS hour,
      COUNT(*)::int AS visits
    FROM page_views
    WHERE created_at AT TIME ZONE 'Australia/Sydney' >= date_trunc('day', NOW() AT TIME ZONE 'Australia/Sydney')
      AND device != 'bot'
    GROUP BY 1
    ORDER BY 1
  `) as HourlyRow[];
}

export async function getDailyLast30(): Promise<DailyRow[]> {
  await ensureTable();
  return (await sql`
    SELECT
      to_char(created_at AT TIME ZONE 'Australia/Sydney', 'YYYY-MM-DD') AS date,
      COUNT(*)::int AS visits
    FROM page_views
    WHERE created_at >= NOW() - INTERVAL '30 days'
      AND device != 'bot'
    GROUP BY 1
    ORDER BY 1
  `) as DailyRow[];
}

export async function getTopPages(limit = 10): Promise<TopPage[]> {
  await ensureTable();
  return (await sql`
    SELECT path, COUNT(*)::int AS visits
    FROM page_views
    WHERE created_at >= NOW() - INTERVAL '7 days'
      AND device != 'bot'
    GROUP BY path
    ORDER BY visits DESC
    LIMIT ${limit}
  `) as TopPage[];
}

export async function getTopReferrers(limit = 8): Promise<TopReferrer[]> {
  await ensureTable();
  return (await sql`
    SELECT referrer, COUNT(*)::int AS visits
    FROM page_views
    WHERE created_at >= NOW() - INTERVAL '30 days'
      AND device != 'bot'
      AND referrer IS NOT NULL
      AND referrer != ''
    GROUP BY referrer
    ORDER BY visits DESC
    LIMIT ${limit}
  `) as TopReferrer[];
}

export async function getDeviceBreakdown(): Promise<DeviceRow[]> {
  await ensureTable();
  return (await sql`
    SELECT device, COUNT(*)::int AS visits
    FROM page_views
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY device
    ORDER BY visits DESC
  `) as DeviceRow[];
}
