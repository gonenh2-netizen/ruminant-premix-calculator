/**
 * Per-kg-DMI nutrient requirements by species + stage.
 *
 * Sources:
 *  - Dairy: NASEM 2021 (via user's Dairy NotebookLM, 89 sources)
 *  - Goats & Sheep: NRC 2007 Small Ruminants (via user's Goat NotebookLM, 52 sources)
 *  - Beef: NRC 2016 Beef Cattle (via user's SEA Beef NotebookLM, 102 sources)
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
    stages: {
      'Calf (Preweaning)':       { Zn: 45, Cu: 10, Mn: 35, Co: 0.15, Se: 0.30, I: 0.42, Fe: 50, VitA: 9000, VitD: 660,  VitE: 50,  Biotin: 0 },
      'Heifer (Growing)':         { Zn: 45, Cu: 10, Mn: 35, Co: 0.15, Se: 0.30, I: 0.42, Fe: 30, VitA: 2500, VitD: 300,  VitE: 30,  Biotin: 0 },
      'Far-off Dry':              { Zn: 45, Cu: 18, Mn: 40, Co: 0.20, Se: 0.30, I: 0.55, Fe: 20, VitA: 4400, VitD: 1100, VitE: 100, Biotin: 0 },
      'Close-up Dry':             { Zn: 55, Cu: 18, Mn: 45, Co: 0.20, Se: 0.30, I: 0.55, Fe: 20, VitA: 4400, VitD: 1100, VitE: 210, Biotin: 0 },
      'Fresh / Early Lactation':  { Zn: 66, Cu: 11, Mn: 49, Co: 0.20, Se: 0.30, I: 0.69, Fe: 20, VitA: 4400, VitD: 1100, VitE: 30,  Biotin: 0.85 },
      'Mid Lactation':            { Zn: 60, Cu: 10, Mn: 45, Co: 0.20, Se: 0.30, I: 0.55, Fe: 18, VitA: 4400, VitD: 1100, VitE: 30,  Biotin: 0.70 },
      'Late Lactation':           { Zn: 55, Cu: 10, Mn: 40, Co: 0.20, Se: 0.30, I: 0.50, Fe: 18, VitA: 4400, VitD: 1100, VitE: 30,  Biotin: 0.60 },
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
