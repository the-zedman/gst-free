// Maps common consumer food terms to broader ATO category terms.
// When a user searches e.g. "banana", the search also matches ATO entries
// containing "fruit" (e.g. "fruit (fresh, dried, canned, packaged)...").
// Only add entries where the ATO database uses a generic category name rather
// than the specific item — this avoids noise for terms that already match directly.

const SYNONYM_MAP: Record<string, string[]> = {
  // --- Fresh fruit → "fruit" ---
  apple: ["fruit"],
  apricot: ["fruit"],
  avocado: ["fruit"],
  banana: ["fruit"],
  blackberry: ["fruit"],
  blackcurrant: ["fruit"],
  blueberry: ["fruit"],
  cantaloupe: ["fruit", "rockmelon"],
  cherry: ["fruit"],
  clementine: ["fruit", "mandarin"],
  coconut: ["fruit"],
  cumquat: ["fruit"],
  currant: ["fruit"],
  date: ["fruit"],
  dragonfruit: ["fruit"],
  durian: ["fruit"],
  feijoa: ["fruit"],
  fig: ["fruit"],
  gooseberry: ["fruit"],
  grapefruit: ["fruit"],
  grape: ["fruit"],
  guava: ["fruit"],
  honeydew: ["fruit"],
  jackfruit: ["fruit"],
  kiwi: ["fruit"],
  kumquat: ["fruit"],
  lemon: ["fruit"],
  lime: ["fruit"],
  longan: ["fruit"],
  lychee: ["fruit"],
  mandarin: ["fruit"],
  mango: ["fruit"],
  mangosteen: ["fruit"],
  mulberry: ["fruit"],
  nectarine: ["fruit"],
  orange: ["fruit"],
  papaya: ["fruit"],
  passionfruit: ["fruit"],
  pawpaw: ["fruit"],
  peach: ["fruit"],
  pear: ["fruit"],
  persimmon: ["fruit"],
  pineapple: ["fruit"],
  plum: ["fruit"],
  pomegranate: ["fruit"],
  pomelo: ["fruit"],
  quince: ["fruit"],
  rambutans: ["fruit"],
  raspberry: ["fruit"],
  redcurrant: ["fruit"],
  rockmelon: ["fruit"],
  starfruit: ["fruit"],
  strawberry: ["fruit"],
  tamarillo: ["fruit"],
  tangelo: ["fruit"],
  tangerine: ["fruit"],
  watermelon: ["fruit"],

  // --- Fresh vegetables → "vegetable" ---
  artichoke: ["vegetable"],
  asparagus: ["vegetable"],
  bean: ["vegetable", "beans"],
  beetroot: ["vegetable"],
  bokchoy: ["vegetable"],
  broccoli: ["vegetable"],
  broccolini: ["vegetable"],
  brussel: ["vegetable"],
  cabbage: ["vegetable"],
  capsicum: ["vegetable"],
  carrot: ["vegetable"],
  cauliflower: ["vegetable"],
  celery: ["vegetable"],
  chilli: ["vegetable"],
  chive: ["vegetable"],
  corn: ["vegetable"],
  courgette: ["vegetable"],
  cucumber: ["vegetable"],
  daikon: ["vegetable"],
  eggplant: ["vegetable"],
  endive: ["vegetable"],
  fennel: ["vegetable"],
  garlic: ["vegetable"],
  ginger: ["vegetable"],
  kale: ["vegetable"],
  kohlrabi: ["vegetable"],
  leek: ["vegetable"],
  lettuce: ["vegetable"],
  mushroom: ["vegetable", "mushrooms"],
  onion: ["vegetable"],
  parsnip: ["vegetable"],
  pea: ["vegetable"],
  potato: ["vegetable"],
  pumpkin: ["vegetable"],
  radish: ["vegetable"],
  rhubarb: ["vegetable"],
  shallot: ["vegetable"],
  silverbeet: ["vegetable"],
  spinach: ["vegetable"],
  squash: ["vegetable"],
  swede: ["vegetable"],
  "sweet potato": ["vegetable"],
  tomato: ["vegetable"],
  turnip: ["vegetable"],
  watercress: ["vegetable"],
  witlof: ["vegetable"],
  zucchini: ["vegetable"],

  // --- Meat ---
  beef: ["meat"],
  lamb: ["meat"],
  pork: ["meat"],
  veal: ["meat"],
  steak: ["meat"],
  mince: ["meat", "minced"],
  venison: ["meat", "game"],
  rabbit: ["meat"],
  goat: ["meat"],
  offal: ["meat"],

  // --- Poultry ---
  chicken: ["poultry", "meat"],
  turkey: ["poultry", "meat"],
  duck: ["poultry", "meat"],
  quail: ["poultry", "meat"],
  goose: ["poultry", "meat"],

  // --- Fish ---
  barramundi: ["fish"],
  bream: ["fish"],
  cod: ["fish"],
  dory: ["fish"],
  flathead: ["fish"],
  flounder: ["fish"],
  herring: ["fish"],
  jewfish: ["fish"],
  kingfish: ["fish"],
  mackerel: ["fish"],
  mullet: ["fish"],
  perch: ["fish"],
  salmon: ["fish"],
  sardine: ["fish"],
  snapper: ["fish"],
  sole: ["fish"],
  swordfish: ["fish"],
  trout: ["fish"],
  tuna: ["fish"],
  whiting: ["fish"],

  // --- Seafood ---
  abalone: ["seafood"],
  clam: ["seafood"],
  crab: ["seafood"],
  crayfish: ["seafood", "lobster"],
  lobster: ["seafood"],
  mussel: ["seafood"],
  octopus: ["seafood"],
  oyster: ["seafood"],
  prawn: ["seafood"],
  scallop: ["seafood"],
  shrimp: ["seafood", "prawn"],
  squid: ["seafood"],
  yabby: ["seafood", "crustacean"],

  // --- Dairy ---
  butter: ["dairy"],
  kefir: ["dairy"],
  quark: ["dairy"],

  // --- Nuts → "nut" ---
  almond: ["nut"],
  brazil: ["nut"],
  cashew: ["nut"],
  hazelnut: ["nut"],
  macadamia: ["nut"],
  peanut: ["nut"],
  pecan: ["nut"],
  pistachio: ["nut"],
  walnut: ["nut"],

  // --- Grains/seeds ---
  chia: ["seed"],
  flaxseed: ["seed", "linseed"],
  linseed: ["seed"],
  pumpkinseed: ["seed"],
  sesame: ["seed"],
  sunflower: ["seed"],
  hemp: ["seed"],
};

/**
 * Returns all ILIKE patterns to use for a query: the direct pattern plus
 * any synonym-expanded patterns. The direct pattern always comes first.
 */
export function expandPatterns(q: string): string[] {
  const trimmed = q.trim().toLowerCase();
  const extras = SYNONYM_MAP[trimmed] ?? [];
  return [`%${q.trim()}%`, ...extras.map((s) => `%${s}%`)];
}

/**
 * Returns synonym terms for display (e.g. to show "Also includes: fruit entries").
 */
export function synonymsFor(q: string): string[] {
  return SYNONYM_MAP[q.trim().toLowerCase()] ?? [];
}
