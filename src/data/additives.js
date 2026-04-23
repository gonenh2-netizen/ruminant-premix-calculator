/**
 * Feed additives catalog — yeasts, ionophores, buffers, rumen-protected amino
 * acids, mycotoxin binders, methane inhibitors, phytobiotics, tannins.
 *
 * Bypass fat is intentionally EXCLUDED (per user's preference — they add it
 * separately in the TMR, not the premix).
 *
 * Each additive:
 *   id:           unique identifier (used as key in user's daily-dose state and prices)
 *   name:         display name
 *   brand:        manufacturer (or "Generic")
 *   category:     'Yeast/DFM' | 'Ionophore' | 'Buffer' | 'RP-AA' | 'RP-Vitamin'
 *                 | 'Methane inhibitor' | 'Phytobiotic' | 'Mycotoxin binder' | 'Tannin'
 *   typicalDose:  default g/head/day (user-editable in UI)
 *   doseRange:    recommended range, human-readable
 *   price:        USD per kg (user-editable)
 *   note:         mode of action + practical guidance
 *   species:      array of species this works for — 'Dairy', 'Beef', 'Goat', 'Sheep'
 *   stages:       optional — specific stages where this is typically used; 'all' = any
 *   regulatoryNote: optional flag (e.g. monensin banned for dairy in EU)
 *
 * All additives contribute to:
 *   - Daily premix dose (grams per head per day)
 *   - Cost per head per day and cost per ton
 *   - Future: they will also show up on the exports (Rationall / AMTS XML)
 */

export const ADDITIVES = [

  // ===== Yeasts / DFM =====
  {
    id: 'yeast_live_yeasacc',
    name: 'Yea-Sacc 1026 (Live yeast)',
    brand: 'Alltech',
    category: 'Yeast/DFM',
    typicalDose: 4,
    doseRange: '2–10 g/hd/d',
    price: 18.00,
    note: 'Saccharomyces cerevisiae 1026. 10¹⁰ CFU/g. Stabilizes rumen pH, improves fiber digestion and milk yield. Proven across dairy trials.',
    species: ['Dairy', 'Beef', 'Goat', 'Sheep'],
    stages: 'all',
  },
  {
    id: 'yeast_live_levucell',
    name: 'Levucell SC (Live yeast)',
    brand: 'Lallemand',
    category: 'Yeast/DFM',
    typicalDose: 5,
    doseRange: '3–10 g/hd/d',
    price: 19.50,
    note: 'S. cerevisiae CNCM I-1077. Selected strain for rumen function; improves acidosis resistance and NDF digestion.',
    species: ['Dairy', 'Beef', 'Goat', 'Sheep'],
    stages: 'all',
  },
  {
    id: 'yeast_live_safcattle',
    name: 'SafCattle / ActiSaf (Live yeast)',
    brand: 'Phileo/Lesaffre',
    category: 'Yeast/DFM',
    typicalDose: 4,
    doseRange: '2–8 g/hd/d',
    price: 16.00,
    note: 'S. cerevisiae Sc47. Improves feed efficiency and reduces SARA risk.',
    species: ['Dairy', 'Beef', 'Goat', 'Sheep'],
    stages: 'all',
  },
  {
    id: 'yeast_dead_diamondv_xp',
    name: 'Diamond V XP / XPC (Yeast culture)',
    brand: 'Diamond V',
    category: 'Yeast/DFM',
    typicalDose: 15,
    doseRange: '14–56 g/hd/d',
    price: 8.50,
    note: 'Fermentation-based yeast culture (inactivated cells + metabolites). Different mode from live yeast — prebiotic / immunomodulator. XPC is the concentrated version.',
    species: ['Dairy', 'Beef', 'Goat', 'Sheep'],
    stages: 'all',
  },
  {
    id: 'yeast_cellwall_imagro',
    name: 'IMAGRO / Yeast cell wall (MOS + β-glucan)',
    brand: 'Biomin/DSM',
    category: 'Yeast/DFM',
    typicalDose: 3,
    doseRange: '2–5 g/hd/d',
    price: 20.00,
    note: 'Inactivated yeast cell wall providing MOS (mannan-oligosaccharides) + β-glucans. Gut pathogen binding + immune support.',
    species: ['Dairy', 'Beef', 'Goat', 'Sheep'],
    stages: 'all',
  },
  {
    id: 'dfm_bovamine',
    name: 'Bovamine Dairy Plus (DFM)',
    brand: 'Nutrition Physiology Co.',
    category: 'Yeast/DFM',
    typicalDose: 2,
    doseRange: '1–3 g/hd/d',
    price: 24.00,
    note: 'Lactobacillus acidophilus + Propionibacterium freudenreichii. Improves milk yield + rumen propionate production.',
    species: ['Dairy', 'Beef'],
    stages: 'all',
  },

  // ===== Ionophores =====
  {
    id: 'monensin_rumensin',
    name: 'Monensin (Rumensin)',
    brand: 'Elanco',
    category: 'Ionophore',
    typicalDose: 1.5,      // Rumensin 200 g/ton → ~300-450 mg monensin/hd/d, product ~1-2 g
    doseRange: '0.8–2.5 g/hd/d (300–450 mg monensin)',
    price: 22.00,
    note: 'Improves feed efficiency 2–6%. Shifts rumen VFA toward propionate, reduces methane. Target 300–450 mg monensin/head/day in finishing beef and 300 mg in dairy. Gradual introduction to avoid intake drop.',
    species: ['Dairy', 'Beef'],
    stages: 'all',
    regulatoryNote: 'Banned for dairy in EU. Check local regulations before inclusion.',
  },
  {
    id: 'lasalocid_bovatec',
    name: 'Lasalocid (Bovatec)',
    brand: 'Zoetis',
    category: 'Ionophore',
    typicalDose: 1.2,
    doseRange: '0.6–2.0 g/hd/d',
    price: 20.00,
    note: 'Alternative to monensin. Broader antimicrobial spectrum; similar feed-efficiency gains. Less coccidiostat activity than monensin.',
    species: ['Beef'],
    stages: ['Growing / Stocker', 'Backgrounding', 'Finishing'],
  },

  // ===== Buffers =====
  {
    id: 'buffer_sodabicarb',
    name: 'Sodium Bicarbonate (NaHCO₃)',
    brand: 'Generic',
    category: 'Buffer',
    typicalDose: 150,
    doseRange: '100–250 g/hd/d',
    price: 0.60,
    note: 'Standard rumen buffer for high-concentrate diets. Counteracts SARA. Typical 0.7–1.0% of TMR DM for lactating dairy. Note: this is usually added to TMR directly, not through a premix.',
    species: ['Dairy', 'Beef'],
    stages: 'all',
  },
  {
    id: 'buffer_acidbuf',
    name: 'Acid Buf (calcified marine algae)',
    brand: 'Celtic Sea Minerals',
    category: 'Buffer',
    typicalDose: 50,
    doseRange: '30–80 g/hd/d',
    price: 2.80,
    note: 'Calcified Lithothamnium. Slow-release buffer with extended action; outperforms NaHCO₃ on rumen pH stability at lower dose.',
    species: ['Dairy', 'Beef'],
    stages: 'all',
  },
  {
    id: 'buffer_mgo',
    name: 'Magnesium Oxide (MgO)',
    brand: 'Generic',
    category: 'Buffer',
    typicalDose: 50,
    doseRange: '20–80 g/hd/d',
    price: 0.90,
    note: 'Secondary buffer + Mg source. Use in combination with NaHCO₃.',
    species: ['Dairy', 'Beef', 'Goat', 'Sheep'],
    stages: 'all',
  },

  // ===== Rumen-Protected Amino Acids =====
  {
    id: 'rp_met_smartamine',
    name: 'Smartamine M (RP Methionine)',
    brand: 'Adisseo',
    category: 'RP-AA',
    typicalDose: 18,
    doseRange: '12–25 g/hd/d',
    price: 14.00,
    note: '75% DL-methionine protected with pH-sensitive coating. Target 7–10 g metabolizable Met/hd/day. Improves milk protein %, fertility.',
    species: ['Dairy'],
    stages: ['Close-up Dry', 'Fresh / Early Lactation', 'Mid Lactation'],
  },
  {
    id: 'rp_met_mepron',
    name: 'Mepron (RP Methionine)',
    brand: 'Evonik',
    category: 'RP-AA',
    typicalDose: 20,
    doseRange: '15–30 g/hd/d',
    price: 12.50,
    note: '85% DL-Met protected by ethyl cellulose matrix. Alternative to Smartamine.',
    species: ['Dairy'],
    stages: ['Close-up Dry', 'Fresh / Early Lactation', 'Mid Lactation'],
  },
  {
    id: 'rp_met_metasmart',
    name: 'MetaSmart (HMTBa Met)',
    brand: 'Adisseo',
    category: 'RP-AA',
    typicalDose: 25,
    doseRange: '15–40 g/hd/d',
    price: 8.50,
    note: 'HMTBa form — partially rumen-degraded and used by rumen bugs too. Cheaper per kg but lower Met-yield than Smartamine.',
    species: ['Dairy'],
    stages: 'all',
  },
  {
    id: 'rp_lys_ajipro',
    name: 'AjiPro-L (RP Lysine)',
    brand: 'Ajinomoto',
    category: 'RP-AA',
    typicalDose: 40,
    doseRange: '30–60 g/hd/d',
    price: 9.50,
    note: 'Target 18–25 g metabolizable Lys/hd/day. Paired with RP-Met to hit the Lys:Met 3:1 ratio for optimal milk protein.',
    species: ['Dairy'],
    stages: ['Close-up Dry', 'Fresh / Early Lactation', 'Mid Lactation'],
  },
  {
    id: 'rp_lys_lysigem',
    name: 'LysiGEM (RP Lysine)',
    brand: 'Kemin',
    category: 'RP-AA',
    typicalDose: 50,
    doseRange: '35–80 g/hd/d',
    price: 8.00,
    note: 'Encapsulated L-Lysine HCl. Lower metabolizable yield than AjiPro but widely stocked.',
    species: ['Dairy'],
    stages: ['Close-up Dry', 'Fresh / Early Lactation', 'Mid Lactation'],
  },

  // ===== Rumen-Protected B-vitamins =====
  {
    id: 'rp_choline_reashure',
    name: 'ReaShure (RP Choline)',
    brand: 'Balchem',
    category: 'RP-Vitamin',
    typicalDose: 60,
    doseRange: '30–60 g/hd/d close-up, 15–30 g/hd/d lactation',
    price: 11.00,
    note: 'Rumen-protected choline chloride. 15 g choline/hd/d during close-up reduces fatty liver, improves milk yield.',
    species: ['Dairy'],
    stages: ['Close-up Dry', 'Fresh / Early Lactation'],
  },
  {
    id: 'rp_niacin_niashure',
    name: 'Niashure (RP Niacin)',
    brand: 'Balchem',
    category: 'RP-Vitamin',
    typicalDose: 18,
    doseRange: '12–24 g/hd/d',
    price: 15.00,
    note: 'Rumen-protected niacin. Used in heat stress and fresh cows; 6–12 g niacin/hd/d improves energy metabolism.',
    species: ['Dairy'],
    stages: ['Close-up Dry', 'Fresh / Early Lactation', 'Mid Lactation'],
  },

  // ===== Methane inhibitors =====
  {
    id: 'bovaer_3nop',
    name: 'Bovaer (3-NOP)',
    brand: 'DSM-Firmenich',
    category: 'Methane inhibitor',
    typicalDose: 1.5,
    doseRange: '60–80 mg 3-NOP/kg DM diet',
    price: 55.00,
    note: '3-nitrooxypropanol. Inhibits methane production 25–40% by blocking the last step of methanogenesis. Approved in EU, UK, Australia, Brazil.',
    species: ['Dairy', 'Beef'],
    stages: 'all',
  },
  {
    id: 'mootral',
    name: 'Mootral (garlic + citrus)',
    brand: 'Mootral',
    category: 'Methane inhibitor',
    typicalDose: 15,
    doseRange: '10–20 g/hd/d',
    price: 6.00,
    note: 'Garlic + bitter citrus extract blend. Reduces methane 20–30% via phytogenic action. Natural alternative.',
    species: ['Dairy', 'Beef', 'Goat', 'Sheep'],
    stages: 'all',
  },
  {
    id: 'agolin_ruminant',
    name: 'Agolin Ruminant (essential oil blend)',
    brand: 'Agolin',
    category: 'Phytobiotic',
    typicalDose: 1,
    doseRange: '0.8–1.2 g/hd/d',
    price: 45.00,
    note: 'Essential-oil blend (coriander, clove, geranyl acetate). Improves feed efficiency, reduces methane ~10%. Very low inclusion rate.',
    species: ['Dairy', 'Beef', 'Goat', 'Sheep'],
    stages: 'all',
  },

  // ===== Mycotoxin binders =====
  {
    id: 'mycotoxin_mycofix',
    name: 'Mycofix (multi-component binder)',
    brand: 'Biomin/DSM',
    category: 'Mycotoxin binder',
    typicalDose: 50,
    doseRange: '20–100 g/hd/d',
    price: 6.50,
    note: 'Bentonite + biotransformation enzymes + plant/algae extracts. Broad-spectrum against aflatoxin, DON, zearalenone, fumonisins.',
    species: ['Dairy', 'Beef', 'Goat', 'Sheep'],
    stages: 'all',
  },
  {
    id: 'mycotoxin_mycosorb',
    name: 'Mycosorb A+ (yeast cell wall)',
    brand: 'Alltech',
    category: 'Mycotoxin binder',
    typicalDose: 30,
    doseRange: '15–60 g/hd/d',
    price: 8.00,
    note: 'Modified yeast cell wall. Broad-spectrum binder. Typical 2 g/cow in dairy as baseline.',
    species: ['Dairy', 'Beef', 'Goat', 'Sheep'],
    stages: 'all',
  },
  {
    id: 'mycotoxin_bentonite',
    name: 'Sodium/Calcium Bentonite',
    brand: 'Generic',
    category: 'Mycotoxin binder',
    typicalDose: 100,
    doseRange: '50–200 g/hd/d',
    price: 0.40,
    note: 'Basic clay binder. Effective against aflatoxin; less so against DON/ZEN/T-2. Cheapest option.',
    species: ['Dairy', 'Beef', 'Goat', 'Sheep'],
    stages: 'all',
  },

  // ===== Tannins =====
  {
    id: 'tannin_bypro',
    name: 'ByPro (chestnut + quebracho)',
    brand: 'Silvateam',
    category: 'Tannin',
    typicalDose: 50,
    doseRange: '30–80 g/hd/d',
    price: 4.50,
    note: 'Condensed + hydrolyzable tannins. Reduces rumen protein degradation (protects dietary protein), lowers methane, reduces parasite load in small ruminants.',
    species: ['Dairy', 'Beef', 'Goat', 'Sheep'],
    stages: 'all',
  },

  // ===== Phytobiotics =====
  {
    id: 'phyto_crina',
    name: 'Crina Ruminants',
    brand: 'DSM-Firmenich',
    category: 'Phytobiotic',
    typicalDose: 1.2,
    doseRange: '0.8–1.5 g/hd/d',
    price: 48.00,
    note: 'Essential-oil premix. Improves feed efficiency + milk yield via modulation of rumen fermentation.',
    species: ['Dairy', 'Beef'],
    stages: 'all',
  },
];

// Grouping helper for the UI — one selector per category
export const ADDITIVE_CATEGORIES = [
  'Yeast/DFM',
  'Ionophore',
  'Buffer',
  'RP-AA',
  'RP-Vitamin',
  'Methane inhibitor',
  'Phytobiotic',
  'Mycotoxin binder',
  'Tannin',
];
