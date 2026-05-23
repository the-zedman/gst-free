import {
  getSummaryStats,
  getHourlyToday,
  getDailyLast30,
  getTopPages,
  getTopReferrers,
  getDeviceBreakdown,
} from "@/lib/analytics";

// ── Small presentational components ────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold text-gray-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function BarChart({
  data,
  labelKey,
  max,
  color = "bg-green-500",
}: {
  data: { label: string; visits: number }[];
  labelKey?: string;
  max: number;
  color?: string;
}) {
  return (
    <div className="flex items-end gap-px h-28 w-full">
      {data.map(({ label, visits }) => (
        <div
          key={label}
          className="flex-1 flex flex-col items-center justify-end group relative"
          title={`${label}: ${visits}`}
        >
          <div
            className={`w-full ${color} rounded-t-sm min-h-[2px] transition-all`}
            style={{ height: max > 0 ? `${(visits / max) * 100}%` : "2px" }}
          />
          {/* tooltip on hover */}
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {visits}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const [stats, hourlyRaw, dailyRaw, topPages, referrers, devices] =
    await Promise.all([
      getSummaryStats(),
      getHourlyToday(),
      getDailyLast30(),
      getTopPages(10),
      getTopReferrers(8),
      getDeviceBreakdown(),
    ]);

  // Build full 24-hour array (fill gaps with 0)
  const hourly = Array.from({ length: 24 }, (_, i) => ({
    label: `${i}:00`,
    visits: hourlyRaw.find((r) => r.hour === i)?.visits ?? 0,
  }));
  const hourlyMax = Math.max(...hourly.map((r) => r.visits), 1);

  // Build last-30-days array (fill gaps) — dates must match Sydney tz used in SQL
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const date = d.toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" }); // YYYY-MM-DD
    return {
      label: date.slice(5), // MM-DD
      visits: dailyRaw.find((r) => r.date === date)?.visits ?? 0,
    };
  });
  const dailyMax = Math.max(...daily.map((r) => r.visits), 1);

  // Device totals
  const totalDevices = devices.reduce((s, d) => s + d.visits, 0) || 1;

  const now = new Date().toLocaleString("en-AU", {
    timeZone: "Australia/Sydney",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Site Traffic</h1>
        <p className="text-xs text-gray-400">
          Updated {now} AEST
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Today" value={stats.today} />
        <StatCard label="Unique today" value={stats.todayUnique} />
        <StatCard label="This week" value={stats.thisWeek} />
        <StatCard label="This month" value={stats.thisMonth} />
        <StatCard label="This year" value={stats.thisYear} />
        <StatCard label="All time" value={stats.allTime} />
      </div>

      {/* Hourly + Top pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Visits today by hour (AEST)
          </h2>
          <BarChart data={hourly} max={hourlyMax} />
          <div className="flex justify-between text-[10px] text-gray-300 mt-1">
            <span>12am</span>
            <span>6am</span>
            <span>12pm</span>
            <span>6pm</span>
            <span>11pm</span>
          </div>
        </div>

        {/* Top pages */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Top pages (last 7 days)
          </h2>
          {topPages.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-2">
              {topPages.map(({ path, visits }) => {
                const pct = Math.round((visits / topPages[0].visits) * 100);
                return (
                  <div key={path} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 font-mono w-36 truncate shrink-0">
                      {path}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-8 text-right shrink-0">
                      {visits}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Daily chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Daily visits (last 30 days)
        </h2>
        <BarChart data={daily} max={dailyMax} color="bg-blue-400" />
        <div className="flex justify-between text-[10px] text-gray-300 mt-1">
          <span>30d ago</span>
          <span>15d ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Devices + Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Devices (last 30 days)
          </h2>
          <div className="space-y-3">
            {devices.map(({ device, visits }) => {
              const pct = Math.round((visits / totalDevices) * 100);
              const color =
                device === "mobile"
                  ? "bg-green-500"
                  : device === "desktop"
                  ? "bg-blue-500"
                  : "bg-gray-300";
              return (
                <div key={device} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16 capitalize shrink-0">
                    {device}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-16 text-right shrink-0">
                    {visits.toLocaleString()} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top referrers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Top referrers (last 30 days)
          </h2>
          {referrers.length === 0 ? (
            <p className="text-sm text-gray-400">No referral data yet</p>
          ) : (
            <div className="space-y-2">
              {referrers.map(({ referrer, visits }) => {
                let host = referrer;
                try {
                  host = new URL(referrer).hostname.replace(/^www\./, "");
                } catch {}
                return (
                  <div
                    key={referrer}
                    className="flex items-center justify-between text-sm"
                  >
                    <span
                      className="text-gray-600 truncate max-w-[240px]"
                      title={referrer}
                    >
                      {host}
                    </span>
                    <span className="text-gray-900 font-medium shrink-0 ml-4">
                      {visits}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
