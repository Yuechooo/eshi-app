// ─── Centralized food image registry ──────────────────────────────────────────
// Unsplash lifestyle photos for prepared meals (warm, natural, soft-toned).
// Wikimedia kept only for specific ingredients with no Unsplash equivalent.
//
// Fallback chain for prepared meals: MEAL_IMAGE_MAP → keyword rules → FALLBACK_IMG → gradient div
// Fallback chain for ingredients:    INGREDIENT_IMAGE_MAP → FALLBACK_IMG

const uns = id =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=85`

// Reliable neutral fallback: plain rice congee bowl
export const FALLBACK_IMG =
  'https://upload.wikimedia.org/wikipedia/commons/5/58/Chinese_rice_congee.jpg'

// ── Diet ingredient images ─────────────────────────────────────────────────────
// Keyed by the English nameEn value from dietFoods.js
export const INGREDIENT_IMAGE_MAP = {
  'Millet porridge':     uns('photo-1766761562530-c8dd12c96d9a'),
  'Chinese yam':         'https://commons.wikimedia.org/wiki/Special:FilePath/Chinesische_Yamswurzel_1.jpg',
  'Red dates':           'https://commons.wikimedia.org/wiki/Special:FilePath/Ziziphus_jujuba_MS_2461.JPG',
  'Spinach':             uns('photo-1616169775818-9f7115b8821e'),
  'Black beans':         uns('photo-1627906327792-4ede6149189f'),
  'Pumpkin':             uns('photo-1476718406336-bb5a9690ee2a'),
  'Winter melon':        'https://commons.wikimedia.org/wiki/Special:FilePath/Raw_winter_melon.jpg',
  'Shiitake mushroom':   uns('photo-1772198537624-5501e3667457'),
  'Egg':                 'https://commons.wikimedia.org/wiki/Special:FilePath/Soft-boiled-egg.jpg',
  'Tofu':                uns('photo-1765295218809-784d6c2fe39c'),
  'Crucian carp':        uns('photo-1519708227418-c8fd9a32b7a2'),
  'Chicken breast':      'https://commons.wikimedia.org/wiki/Special:FilePath/CHICKEN_BREAST.jpg',
  'Purple sweet potato': uns('photo-1730815048561-45df6f7f331d'),
  'Walnuts':             uns('photo-1524593000379-d4729b2c4f99'),
  'Snow fungus':         'https://commons.wikimedia.org/wiki/Special:FilePath/Fujian_Gutian_snowflake_tremella.jpg',
  'Lotus root':          'https://commons.wikimedia.org/wiki/Special:FilePath/Lotus_root.jpg',
  'Chicken soup':        uns('photo-1672667509988-baade9ade083'),
  'Corn':                uns('photo-1629570585008-27e194a5d0f8'),
  'Napa cabbage':        uns('photo-1611105637889-3afd7295bdbf'),
}

// ── Prepared meal images ───────────────────────────────────────────────────────
// Keyed by exact meal name (English). Used by Meal Plan page and community feed.
export const MEAL_IMAGE_MAP = {
  // ── Chinese breakfast ────────────────────────────────────────────────────────
  'Steamed Egg':
    uns('photo-1770966666356-3f022a79b8ea'),
  'Congee with Egg':
    uns('photo-1766761562530-c8dd12c96d9a'),
  'Rice Porridge + Spinach':
    uns('photo-1766761562530-c8dd12c96d9a'),
  'Rice porridge + Banana':
    uns('photo-1766761562530-c8dd12c96d9a'),
  'Millet Porridge':
    uns('photo-1766761562530-c8dd12c96d9a'),
  'Pumpkin Porridge':
    uns('photo-1476718406336-bb5a9690ee2a'),

  // ── Western breakfast ────────────────────────────────────────────────────────
  'Toast + Eggs':
    uns('photo-1687630433865-f86f07be989a'),
  'Scrambled Eggs + Spinach':
    uns('photo-1687630433865-f86f07be989a'),
  'Yogurt + Fruit':
    uns('photo-1633104060731-32143505bacc'),

  // ── Chinese lunch / dinner ───────────────────────────────────────────────────
  'Braised Chicken + Vegetables':
    uns('photo-1564834724105-918b73d1b9e0'),
  'Steamed Fish + Greens':
    uns('photo-1519708227418-c8fd9a32b7a2'),
  'Rice + Bone Broth Soup':
    uns('photo-1672667509988-baade9ade083'),
  'Yam Rib Soup':
    uns('photo-1672667509988-baade9ade083'),
  'Braised Beef with Root Vegetables':
    uns('photo-1445979323117-80453f573b71'),
  'Congee with Vegetables':
    uns('photo-1766761562530-c8dd12c96d9a'),

  // ── Western lunch / dinner ───────────────────────────────────────────────────
  'Quick Stir-fry Chicken':
    uns('photo-1564834724105-918b73d1b9e0'),
  'Pasta with Butter':
    uns('photo-1597131628347-c769fc631754'),
  'Rice + Egg':
    uns('photo-1770966666356-3f022a79b8ea'),
  'Sandwich + Salad':
    uns('photo-1709689155464-90d6ca1e9f62'),
  'Grilled Chicken Salad':
    uns('photo-1550304943-4f24f54ddde9'),
  'Rice + Stir-fry Veggies':
    uns('photo-1564834724105-918b73d1b9e0'),
  'Omelette with Veggies':
    uns('photo-1687630433865-f86f07be989a'),

  // ── Common AI-generated meal names ──────────────────────────────────────────
  'Ginger Chicken Soup':
    uns('photo-1672667509988-baade9ade083'),
  'Spinach Egg Soup':
    uns('photo-1680137248903-7af5d51a3350'),
  'Tofu Bowl':
    uns('photo-1765295218809-784d6c2fe39c'),
  'Millet Congee':
    uns('photo-1766761562530-c8dd12c96d9a'),
  'Bone Broth Soup':
    uns('photo-1672667509988-baade9ade083'),
  'Braised Pork Belly':
    uns('photo-1445979323117-80453f573b71'),
  'Red Braised Pork':
    uns('photo-1445979323117-80453f573b71'),
  'Mapo Tofu':
    uns('photo-1765295218809-784d6c2fe39c'),
  'Wonton Soup':
    uns('photo-1763994685090-c0927ff195d1'),
  'Pork Rib Soup':
    uns('photo-1672667509988-baade9ade083'),
}

// Returns a lifestyle image URL for a named prepared meal.
// Falls through: exact name → keyword rules → FALLBACK_IMG
export function getMealImage(name) {
  if (MEAL_IMAGE_MAP[name]) return MEAL_IMAGE_MAP[name]

  const n = (name || '').toLowerCase()

  if (n.includes('steamed egg') || n.includes('egg custard'))
    return uns('photo-1770966666356-3f022a79b8ea')
  if (n.includes('millet') && (n.includes('congee') || n.includes('porridge')))
    return uns('photo-1766761562530-c8dd12c96d9a')
  if (n.includes('congee') || n.includes('porridge') || n.includes('gruel'))
    return uns('photo-1766761562530-c8dd12c96d9a')
  if (n.includes('pumpkin'))
    return uns('photo-1476718406336-bb5a9690ee2a')
  if (n.includes('steamed fish'))
    return uns('photo-1519708227418-c8fd9a32b7a2')
  if (n.includes('braised chicken') || n.includes('soy chicken'))
    return uns('photo-1564834724105-918b73d1b9e0')
  if (n.includes('braised beef') || n.includes('beef stew') || n.includes('beef brisket'))
    return uns('photo-1445979323117-80453f573b71')
  if (n.includes('pork rib') || n.includes('spareribs') || n.includes('rib soup'))
    return uns('photo-1672667509988-baade9ade083')
  if (n.includes('braised pork') || n.includes('red braised') || n.includes('red-braised'))
    return uns('photo-1445979323117-80453f573b71')
  if (n.includes('mapo tofu'))
    return uns('photo-1765295218809-784d6c2fe39c')
  if (n.includes('tofu'))
    return uns('photo-1765295218809-784d6c2fe39c')
  if (n.includes('egg drop') || (n.includes('spinach') && n.includes('soup')))
    return uns('photo-1680137248903-7af5d51a3350')
  if (n.includes('wonton') || n.includes('noodle') || n.includes('ramen'))
    return uns('photo-1763994685090-c0927ff195d1')
  if (n.includes('soup') || n.includes('broth') || n.includes('stew'))
    return uns('photo-1672667509988-baade9ade083')
  if (n.includes('stir') || n.includes('wok'))
    return uns('photo-1564834724105-918b73d1b9e0')
  if (n.includes('fish') || n.includes('seafood') || n.includes('salmon') || n.includes('shrimp'))
    return uns('photo-1519708227418-c8fd9a32b7a2')
  if (n.includes('chicken'))
    return uns('photo-1564834724105-918b73d1b9e0')
  if (n.includes('beef'))
    return uns('photo-1445979323117-80453f573b71')
  if (n.includes('pork'))
    return uns('photo-1445979323117-80453f573b71')
  if (n.includes('egg'))
    return uns('photo-1770966666356-3f022a79b8ea')
  if (n.includes('salad') || n.includes('lettuce'))
    return uns('photo-1550304943-4f24f54ddde9')
  if (n.includes('pasta') || n.includes('spaghetti'))
    return uns('photo-1597131628347-c769fc631754')
  if (n.includes('sandwich') || n.includes('toast') || n.includes('bread'))
    return uns('photo-1709689155464-90d6ca1e9f62')
  if (n.includes('rice'))
    return uns('photo-1766761562530-c8dd12c96d9a')

  return FALLBACK_IMG
}
