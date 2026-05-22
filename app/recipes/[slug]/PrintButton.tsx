'use client';

import type { Recipe } from '@/lib/recipe-types';

function formatTime(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

function buildPrintHtml(recipe: Recipe, origin: string): string {
  const imageSrc = recipe.image_path ? `${origin}${recipe.image_path}` : '';

  const ingredientsHtml = recipe.ingredients
    .map((ing) => {
      const qty = `${ing.quantity}${ing.unit ? ` ${ing.unit}` : ''}`;
      const badge =
        ing.gst_status === 'taxable'
          ? `<span class="taxable">+10%&nbsp;GST</span>`
          : ing.gst_status === 'GST-free'
          ? `<span class="gst-free">&#10003;</span>`
          : '';
      return `<div class="ingredient"><span class="dot"></span><span><b>${qty}</b> ${ing.name}${badge ? ` ${badge}` : ''}</span></div>`;
    })
    .join('');

  const methodHtml = recipe.method
    .map(
      (step, i) =>
        `<div class="step"><div class="num">${i + 1}</div><p>${step}</p></div>`
    )
    .join('');

  const allBadges = [
    recipe.meal_type,
    ...(recipe.cuisine && recipe.cuisine !== 'australian' ? [recipe.cuisine] : []),
    ...recipe.tags,
  ]
    .slice(0, 6)
    .map((t) => `<span class="badge">${t}</span>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${recipe.title} — GST Free</title>
<style>
@page { size: A4 portrait; margin: 1.4cm 1.6cm; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; }
body {
  font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
  color: #111;
  font-size: 9.5pt;
  line-height: 1.45;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Header ───────────────────────────────────────── */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 9px;
  border-bottom: 2.5px solid #16a34a;
  margin-bottom: 13px;
}
.logo { font-size: 16pt; font-weight: 900; color: #16a34a; letter-spacing: -0.02em; line-height: 1; }
.tagline { font-size: 7.5pt; color: #888; margin-top: 3px; }
.site-url { font-size: 8.5pt; font-weight: 700; color: #16a34a; }

/* ── Title + badges ───────────────────────────────── */
h1 { font-size: 17pt; font-weight: 900; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 7px; }
.badges { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 13px; }
.badge {
  font-size: 7pt; font-weight: 700; padding: 2px 8px; border-radius: 12px;
  background: #f0fdf4; color: #16a34a; text-transform: capitalize;
  border: 0.75pt solid #bbf7d0;
}

/* ── Two-column layout ────────────────────────────── */
.layout {
  display: grid;
  grid-template-columns: 38% 1fr;
  gap: 16px;
}

/* ── Left: image + meta + ingredients ────────────── */
.recipe-image {
  width: 100%; height: 178px; object-fit: cover;
  border-radius: 6px; display: block; margin-bottom: 9px;
}
.meta {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  background: #f9fafb; border-radius: 6px;
  padding: 7px 4px; margin-bottom: 11px; text-align: center;
}
.meta-label { font-size: 6pt; text-transform: uppercase; letter-spacing: 0.07em; color: #bbb; display: block; }
.meta-value { font-size: 9pt; font-weight: 800; display: block; margin-top: 1px; }

.section-label {
  font-size: 6.5pt; font-weight: 900; text-transform: uppercase;
  letter-spacing: 0.12em; color: #16a34a; margin-bottom: 7px;
}
.ingredient { display: flex; align-items: flex-start; gap: 5px; margin-bottom: 4px; }
.dot {
  width: 7px; height: 7px; border-radius: 50%;
  border: 1.5px solid #16a34a; flex-shrink: 0; margin-top: 3.5px;
}
.gst-free { color: #16a34a; font-size: 7pt; font-weight: 800; }
.taxable { color: #dc2626; font-size: 7pt; font-weight: 800; }

/* ── Right: description + method ─────────────────── */
.description {
  font-size: 9pt; color: #555; line-height: 1.55;
  font-style: italic; margin-bottom: 12px;
  padding-bottom: 11px; border-bottom: 0.75pt solid #e5e7eb;
}
.step { display: flex; gap: 8px; margin-bottom: 8px; }
.num {
  width: 18px; height: 18px; border-radius: 50%;
  background: #16a34a; color: #fff;
  font-size: 8pt; font-weight: 900; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.step p { font-size: 9pt; line-height: 1.5; padding-top: 1.5px; }

/* ── Footer ───────────────────────────────────────── */
.footer {
  margin-top: 13px; padding-top: 8px; border-top: 0.75pt solid #e5e7eb;
  display: flex; justify-content: space-between; align-items: center;
}
.footer-note { font-size: 7pt; color: #bbb; }
.footer-url { font-size: 7.5pt; font-weight: 800; color: #16a34a; }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="logo">GST Free</div>
    <div class="tagline">Save money on Australian groceries</div>
  </div>
  <div class="site-url">gstfree.com.au</div>
</div>

<h1>${recipe.title}</h1>
<div class="badges">${allBadges}</div>

<div class="layout">
  <div>
    ${imageSrc ? `<img class="recipe-image" src="${imageSrc}" alt="${recipe.title}">` : ''}
    <div class="meta">
      <div>
        <span class="meta-label">Prep</span>
        <span class="meta-value">${formatTime(recipe.prep_time_mins)}</span>
      </div>
      <div>
        <span class="meta-label">Cook</span>
        <span class="meta-value">${formatTime(recipe.cook_time_mins)}</span>
      </div>
      <div>
        <span class="meta-label">Serves</span>
        <span class="meta-value">${recipe.servings}</span>
      </div>
    </div>
    <div class="section-label">Ingredients</div>
    ${ingredientsHtml}
  </div>

  <div>
    <p class="description">${recipe.description}</p>
    <div class="section-label">Method</div>
    ${methodHtml}
  </div>
</div>

<div class="footer">
  <span class="footer-note">Find more GST-free recipes and save on your weekly shop</span>
  <span class="footer-url">gstfree.com.au</span>
</div>

<script>
window.onload = function () {
  setTimeout(function () { window.print(); }, 300);
};
</script>
</body>
</html>`;
}

export default function PrintButton({ recipe }: { recipe: Recipe }) {
  const handlePrint = () => {
    const origin = window.location.origin;
    const html = buildPrintHtml(recipe, origin);
    const win = window.open('', '_blank', 'width=860,height=700');
    if (!win) {
      alert('Please allow popups for this site to print recipes.');
      return;
    }
    win.document.write(html);
    win.document.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors print:hidden"
    >
      🖨️ Print recipe
    </button>
  );
}
