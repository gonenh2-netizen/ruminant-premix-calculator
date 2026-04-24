/**
 * Per-kg-DMI nutrient requirements by species + stage.
 *
 * Sources:
 *  - Dairy: NASEM 2021 / Weiss & Erdman 2021 "NASEM 2021: Minerals and Vitamins"
 *    (Ohio State / U. Maryland, NASEM Dairy 8 committee summary). Values shown
 *    are per-kg-DMI targets for a 650 kg lactating cow, 700 kg dry cow, 24 kg
 *    DMI lactating, 12 kg DMI dry cow. Cross-checked against the slide-deck
 *    summary at G:\…\Weiss-2021-NRC-Vitamins-and-Minerals.pdf.
 *    Note: Weiss calls most vitamin/mineral values "Adequate Intake (AI)" not
 *    requirements — the committee judged the data too thin to set strict Rqt.
 *  - Goats & Sheep: NRC 2007 Small Ruminants
 *  - Beef: NRC 2016 Beef Cattle
 *
 * Units:
 *  - Minerals (Zn, Cu, Mn, Co, Se, I, Fe, Cr): mg per kg DM
 *  - Vitamins A, D3, E: IU per kg DM
 *  - Biotin: mg per kg DM
 *
 * Daily need = requirement × DMI.
 * Sheep cuCeiling is mg/kg DM total-diet cap (toxicity threshold).
 */

export const MINERAL_KEYS = ['Zn', 'Cu', 'Mn', 'Co', 'Se', 'I', 'Fe'];
export const VITAMIN_KEYS = ['VitA', 'VitD', 'VitE', 'Biotin'];

/**
 * Maximum Tolerable Level (MTL) per species, expressed as total-diet
 * concentration. Units mirror the requirements table:
 *   - Minerals + Cr + Biotin : mg / kg DM
 *   - Vitamins A, D3, E      : IU / kg DM
 *
 * Sources: NRC "Mineral Tolerance of Animals" 2005 + NASEM 2021 Dairy +
 * NRC 2016 Beef + NRC 2007 Small Ruminants. Values are the practical
 * upper limits; short-term spikes above these are not necessarily acute
 * but chronic exposure risks toxicity. The calculator emits a hard
 * warning whenever total delivered mg/kg DM (ration + premix-organic +
 * premix-inorganic) exceeds MTL.
 *
 * Caveat from Weiss & Erdman 2021 ("Needed Research" slide): human data
 * suggest a LOWER MTL for Vit A, and limited animal data suggest a LOWER
 * MTL for Vit E. The 22,000 IU/kg DM (Vit A) and 2,000 IU/kg DM (Vit E)
 * values here are conservative industry ceilings; chronic Vit A feeding
 * anywhere above ~10,000 IU/kg DM merits caution.
 *
 * Sheep Cu 15 mg/kg DM is the classic hypersensitive ceiling — the
 * existing `cuCeiling` field mirrors it for back-compat.
 */
export const MTL = {
  Dairy: { Zn: 500, Cu: 40, Mn: 1000, Co: 25, Se: 5, I: 50, Fe: 500, VitA: 22000, VitD: 2200, VitE: 2000, Biotin: 30, Cr: 10 },
  Beef:  { Zn: 500, Cu: 40, Mn: 1000, Co: 25, Se: 5, I: 50, Fe: 500, VitA: 22000, VitD: 2200, VitE: 2000, Biotin: 30, Cr: 10 },
  Goat:  { Zn: 500, Cu: 40, Mn: 1000, Co: 25, Se: 5, I: 50, Fe: 500, VitA: 22000, VitD: 2200, VitE: 2000, Biotin: 30, Cr: 10 },
  // Sheep are hypersensitive to Cu (chronic toxicity at ~15 mg/kg DM total diet).
  Sheep: { Zn: 500, Cu: 15, Mn: 1000, Co: 25, Se: 5, I: 50, Fe: 500, VitA: 22000, VitD: 2200, VitE: 2000, Biotin: 30, Cr: 10 },
};

export const NUTRIENT_LABELS = {
  Zn: 'Zinc',
  Cu: 'Copper',
  Mn: 'Manganese',
  Co: 'Cobalt',
  Se: 'Selenium',
  I: 'Iodine',
  Fe: 'Iron',
  VitA: 'Vitamin A',
  VitD: 'Vitamin D3',
  VitE: 'Vitamin E',
  Biotin: 'Biotin',
  Cr: 'Chromium',
};

export const REQS = {
  Dairy: {
    // NASEM 2021 (Weiss & Erdman 2021) aligned.
    //   Dry-cow Zn 28 mg/kg DMI (was 45-55 per NRC 2001; NASEM 2021 revised ~10% up
    //     from 25 → 28 for maintenance-on-DMI basis; bigger drop vs. old NRC high).
    //   Dry-cow Cu 17 mg/kg DMI (+40% vs NRC 2001 via higher maintenance + AC).
    //   Dry-cow Mn 40 mg/kg DMI (2× NRC 2001; AC dropped 0.75 → 0.4).
    //   Lactating Mn ~30 mg/kg DMI (2.3× NRC 2001).
    //   Lactating Cu ~11 mg/kg DMI at 35 kg milk; high producer drops to ~9.
    //   Lactating Vit D 40 IU/kg BW → ~1300 IU/kg DM for a 650 kg cow at 20 kg DMI
    //     (bumped from 30 IU/kg BW heifer/dry baseline; NRC 2001 was 30 across).
    //   Prefresh Vit E 3 IU/kg BW → ~175 IU/kg DM for 700 kg cow at 12 kg DMI.
    //   I: NASEM AI ~0.5 mg/kg DMI (was ~0.4 in 2001; my prior 0.69 was high).
    //   Se: 0.30 mg/kg DM held (FDA-capped).
    stages: {
      'Calf (Preweaning)':       { Zn: 45, Cu: 10, Mn: 35, Co: 0.20, Se: 0.30, I: 0.42, Fe: 50, VitA: 9000, VitD: 660,  VitE: 50,  Biotin: 0 },
      'Heifer (Growing)':         { Zn: 40, Cu: 10, Mn: 30, Co: 0.20, Se: 0.30, I: 0.50, Fe: 30, VitA: 2500, VitD: 300,  VitE: 30,  Biotin: 0 },
      'Far-off Dry':              { Zn: 28, Cu: 17, Mn: 40, Co: 0.20, Se: 0.30, I: 0.50, Fe: 20, VitA: 5000, VitD: 1100, VitE: 100, Biotin: 0 },
      'Close-up Dry':             { Zn: 28, Cu: 17, Mn: 40, Co: 0.20, Se: 0.30, I: 0.50, Fe: 20, VitA: 5000, VitD: 1100, VitE: 175, Biotin: 0 },
      'Fresh / Early Lactation':  { Zn: 60, Cu: 11, Mn: 30, Co: 0.20, Se: 0.30, I: 0.55, Fe: 20, VitA: 4400, VitD: 1300, VitE: 30,  Biotin: 0.85 },
      'Mid Lactation':            { Zn: 55, Cu: 10, Mn: 30, Co: 0.20, Se: 0.30, I: 0.50, Fe: 18, VitA: 4400, VitD: 1300, VitE: 30,  Biotin: 0.70 },
      'Late Lactation':           { Zn: 50, Cu: 10, Mn: 28, Co: 0.20, Se: 0.30, I: 0.50, Fe: 18, VitA: 4400, VitD: 1300, VitE: 30,  Biotin: 0.60 },
    },
    breeds: ['Holstein', 'Jersey', 'Brown Swiss', 'Guernsey', 'Crossbred', 'Other'],
    hasMilkYield: true,
    hasMeatQuality: false,
  },

  Beef: {
    stages: {
      'Calf (Preweaning)':    { Zn: 30, Cu: 10, Mn: 20, Co: 0.15, Se: 0.10, I: 0.50, Fe: 50, VitA: 2200, VitD: 275, VitE: 30, Biotin: 0 },
      'Growing / Stocker':    { Zn: 30, Cu: 10, Mn: 20, Co: 0.15, Se: 0.10, I: 0.50, Fe: 50, VitA: 2200, VitD: 275, VitE: 30, Biotin: 0 },
      'Stressed / Receiving': { Zn: 30, Cu: 10, Mn: 20, Co: 0.15, Se: 0.10, I: 0.50, Fe: 50, VitA: 5000, VitD: 275, VitE: 90, Biotin: 0 },
      'Backgrounding':        { Zn: 30, Cu: 10, Mn: 20, Co: 0.15, Se: 0.10, I: 0.50, Fe: 50, VitA: 2200, VitD: 275, VitE: 40, Biotin: 0 },
      'Finishing':            { Zn: 30, Cu: 10, Mn: 20, Co: 0.15, Se: 0.10, I: 0.50, Fe: 50, VitA: 2200, VitD: 275, VitE: 50, Biotin: 0 },
      'Gestating Cow':        { Zn: 30, Cu: 10, Mn: 40, Co: 0.15, Se: 0.10, I: 0.50, Fe: 50, VitA: 2800, VitD: 275, VitE: 30, Biotin: 0 },
      'Lactating Cow':        { Zn: 30, Cu: 10, Mn: 40, Co: 0.15, Se: 0.10, I: 0.50, Fe: 50, VitA: 3900, VitD: 275, VitE: 30, Biotin: 0 },
    },
    // SEA / Bos indicus breeds first per user's beef NotebookLM focus, then temperate.
    breeds: [
      'Brahman', 'Thai Native (Kha-Korat)', 'Brahman × Charolais', 'Brahman × Angus',
      'Droughtmaster', 'Bali Cattle', 'Kedah-Kelantan',
      'Angus', 'Hereford', 'Wagyu', 'Charolais', 'Limousin', 'Simmental',
      'Crossbred', 'Other',
    ],
    hasMilkYield: false,
    hasMeatQuality: true,
  },

  Goat: {
    stages: {
      'Growing Kid':      { Zn: 12, Cu: 20, Mn: 25, Co: 0.10, Se: 0.25, I: 0.50, Fe: 95, VitA: 1700, VitD: 600, VitE: 30, Biotin: 0 },
      'Maintenance':      { Zn: 12, Cu: 20, Mn: 25, Co: 0.10, Se: 0.25, I: 0.50, Fe: 35, VitA: 1455, VitD: 500, VitE: 25, Biotin: 0 },
      'Late Gestation':   { Zn: 20, Cu: 20, Mn: 25, Co: 0.10, Se: 0.25, I: 0.50, Fe: 40, VitA: 2500, VitD: 600, VitE: 35, Biotin: 0 },
      'Early Lactation':  { Zn: 45, Cu: 20, Mn: 25, Co: 0.10, Se: 0.25, I: 0.50, Fe: 35, VitA: 3800, VitD: 650, VitE: 40, Biotin: 0 },
      'Mid Lactation':    { Zn: 45, Cu: 20, Mn: 25, Co: 0.10, Se: 0.25, I: 0.50, Fe: 35, VitA: 3500, VitD: 600, VitE: 30, Biotin: 0 },
      'Late Lactation':   { Zn: 45, Cu: 20, Mn: 25, Co: 0.10, Se: 0.25, I: 0.50, Fe: 35, VitA: 3000, VitD: 600, VitE: 30, Biotin: 0 },
      'Finishing':        { Zn: 12, Cu: 20, Mn: 25, Co: 0.10, Se: 0.25, I: 0.50, Fe: 35, VitA: 1500, VitD: 500, VitE: 25, Biotin: 0 },
    },
    breeds: ['Saanen', 'Alpine', 'Toggenburg', 'Nubian', 'Boer', 'LaMancha', 'Kiko', 'Crossbred', 'Other'],
    hasMilkYield: true,
    hasMeatQuality: true,
  },

  Sheep: {
    stages: {
      'Growing Lamb':       { Zn: 33, Cu: 7, Mn: 25, Co: 0.11, Se: 0.20, I: 0.50, Fe: 50, VitA: 1235, VitD: 555, VitE: 20, Biotin: 0 },
      'Maintenance':        { Zn: 33, Cu: 7, Mn: 25, Co: 0.11, Se: 0.20, I: 0.50, Fe: 40, VitA: 2677, VitD: 555, VitE: 15, Biotin: 0 },
      'Late Gestation':     { Zn: 33, Cu: 7, Mn: 25, Co: 0.11, Se: 0.20, I: 0.50, Fe: 45, VitA: 3048, VitD: 555, VitE: 15, Biotin: 0 },
      'Early Lactation':    { Zn: 38, Cu: 7, Mn: 30, Co: 0.11, Se: 0.25, I: 0.50, Fe: 40, VitA: 2384, VitD: 555, VitE: 15, Biotin: 0 },
      'Mid/Late Lactation': { Zn: 33, Cu: 7, Mn: 25, Co: 0.11, Se: 0.20, I: 0.50, Fe: 40, VitA: 2400, VitD: 555, VitE: 15, Biotin: 0 },
      'Finishing':          { Zn: 33, Cu: 7, Mn: 25, Co: 0.11, Se: 0.20, I: 0.50, Fe: 40, VitA: 1274, VitD: 555, VitE: 15, Biotin: 0 },
    },
    breeds: ['Merino', 'Dorper', 'Suffolk', 'Hampshire', 'Rambouillet', 'East Friesian', 'Awassi', 'Lacaune', 'Crossbred', 'Other'],
    hasMilkYield: true,
    hasMeatQuality: true,
    cuCeiling: 15, // sheep total-diet Cu ceiling in mg/kg DM
  },
};
