import { ImageResponse } from 'next/og';

export const alt = 'GST Free — Save money on Australian groceries';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#ffffff' }}>

        {/* ── Left panel ──────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
            padding: '48px 52px',
          }}
        >
          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 40 }}>🥦</span>
            <span style={{ fontSize: 30, fontWeight: 900, color: '#15803d', letterSpacing: '-0.5px' }}>
              GST Free
            </span>
            <span style={{ fontSize: 18, color: '#9ca3af', marginLeft: 8 }}>gstfree.com.au</span>
          </div>

          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <span style={{ fontSize: 66, fontWeight: 900, color: '#111827', letterSpacing: '-2.5px', lineHeight: 1.05 }}>
              Save money
            </span>
            <span style={{ fontSize: 66, fontWeight: 900, color: '#111827', letterSpacing: '-2.5px', lineHeight: 1.05 }}>
              on groceries
            </span>
            <div style={{ display: 'flex', marginTop: 20 }}>
              <span style={{ fontSize: 22, color: '#6b7280', lineHeight: 1.5 }}>
                Know which foods attract 10% GST — and which don&apos;t.
              </span>
            </div>
          </div>

          {/* Pills */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ display: 'flex', padding: '10px 20px', background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 100, fontSize: 18, fontWeight: 700, color: '#15803d' }}>
              1,400+ ATO Items
            </div>
            <div style={{ display: 'flex', padding: '10px 20px', background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 100, fontSize: 18, fontWeight: 700, color: '#15803d' }}>
              Barcode Lookup
            </div>
            <div style={{ display: 'flex', padding: '10px 20px', background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 100, fontSize: 18, fontWeight: 700, color: '#15803d' }}>
              Budget Recipes
            </div>
          </div>
        </div>

        {/* ── Right panel — food emoji grid ───────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: 420,
            background: '#14532d',
            borderTopLeftRadius: 48,
            borderBottomLeftRadius: 48,
            padding: '32px 28px',
            gap: 8,
          }}
        >
          {/* Row 1 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', width: 108, height: 108, background: '#166534', borderRadius: 20, alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🥦</div>
            <div style={{ display: 'flex', width: 108, height: 108, background: '#166534', borderRadius: 20, alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🥕</div>
            <div style={{ display: 'flex', width: 108, height: 108, background: '#166534', borderRadius: 20, alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🍎</div>
          </div>
          {/* Row 2 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', width: 108, height: 108, background: '#15803d', borderRadius: 20, alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🥩</div>
            <div style={{ display: 'flex', width: 108, height: 108, background: '#15803d', borderRadius: 20, alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🥚</div>
            <div style={{ display: 'flex', width: 108, height: 108, background: '#15803d', borderRadius: 20, alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🍋</div>
          </div>
          {/* Row 3 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', width: 108, height: 108, background: '#166534', borderRadius: 20, alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🐟</div>
            <div style={{ display: 'flex', width: 108, height: 108, background: '#166534', borderRadius: 20, alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🍞</div>
            <div style={{ display: 'flex', width: 108, height: 108, background: '#166534', borderRadius: 20, alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🥑</div>
          </div>
          {/* Row 4 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', width: 108, height: 108, background: '#15803d', borderRadius: 20, alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🧀</div>
            <div style={{ display: 'flex', width: 108, height: 108, background: '#15803d', borderRadius: 20, alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🫐</div>
            <div style={{ display: 'flex', width: 108, height: 108, background: '#15803d', borderRadius: 20, alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🥛</div>
          </div>
        </div>

      </div>
    ),
    { ...size }
  );
}
