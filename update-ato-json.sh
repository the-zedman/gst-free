#!/bin/bash
# Update ATO JSON — drop the updated JSON into data/ then run this script.

set -e
cd "$(dirname "$0")"

echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│       GST Free — Update ATO Food List       │"
echo "└─────────────────────────────────────────────┘"
echo ""
echo "This will:"
echo "  • Insert new items from the JSON"
echo "  • Update any items that have changed"
echo "  • Remove items no longer in the ATO list"
echo ""
echo "Expected JSON location:"
echo "  $(pwd)/data/ato-gst-food-list.json"
echo ""

if [ ! -f "data/ato-gst-food-list.json" ]; then
  echo "❌  ERROR: data/ato-gst-food-list.json not found."
  echo "   Drop the updated JSON file into the data/ folder and try again."
  exit 1
fi

ITEM_COUNT=$(node -e "const d=require('./data/ato-gst-food-list.json'); console.log(d.item_count || d.items.length)" 2>/dev/null || echo "unknown")
EXTRACTED=$(node -e "const d=require('./data/ato-gst-food-list.json'); console.log(d.source?.extracted_on || 'unknown')" 2>/dev/null || echo "unknown")

echo "  JSON items  : $ITEM_COUNT"
echo "  Extracted on: $EXTRACTED"
echo ""

read -p "Proceed? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

echo ""
npm run seed

echo ""
echo "────────────────────────────────────────────────"
echo "✅  Done. Review the output above, then deploy:"
echo ""
echo "    vercel --prod"
echo ""
