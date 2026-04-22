/**
 * Vitamin sources, carriers, currencies, and bioavailability-tier reference data.
 */

export const VITAMIN_SOURCES = {
  VitA:   { name: 'Vitamin A 500,000 IU/g',  potency: 500000, unit: 'IU/g', price: 25.00 },
  VitD:   { name: 'Vitamin D3 500,000 IU/g', potency: 500000, unit: 'IU/g', price: 28.00 },
  VitE:   { name: 'Vitamin E 50% (500 IU/g)', potency: 500,   unit: 'IU/g', price: 18.00 },
  Biotin: { name: 'Biotin 2% feed grade',     potency: 20,    unit: 'mg/g', price: 60.00 },
};

export const CARRIERS = [
  { id: 'limestone',   name: 'Limestone',       price: 0.15 },
  { id: 'wheat_midds', name: 'Wheat Middlings', price: 0.28 },
  { id: 'rice_hulls',  name: 'Rice Hulls',      price: 0.18 },
];

export const CURRENCIES = {
  USD: { symbol: '$',  rate: 1.00,    label: 'US Dollar' },
  EUR: { symbol: '€',  rate: 0.92,    label: 'Euro' },
  ILS: { symbol: '₪',  rate: 3.70,    label: 'Israeli Shekel' },
  GBP: { symbol: '£',  rate: 0.79,    label: 'British Pound' },
  VND: { symbol: '₫',  rate: 25400,   label: 'Vietnamese Dong' },
  AZN: { symbol: '₼',  rate: 1.70,    label: 'Azerbaijani Manat' },
  IDR: { symbol: 'Rp', rate: 16400,   label: 'Indonesian Rupiah' },
};

export const BIOAVAIL_TIERS = [
  { tier: 'AA Complex / Bis-Chelate',        range: '140–170%', desc: 'Metal bound to amino acids or methionine analog; highest absorption, rumen-stable.', examples: 'Zinpro Availa, Novus Mintrex' },
  { tier: 'Proteinate',                       range: '120–140%', desc: 'Metal bound to soy/yeast peptides. Good rumen stability, widely used.',            examples: 'Alltech Bioplex' },
  { tier: 'Glycinate / Simple Chelate',       range: '115–140%', desc: 'Glycine or small AA chelate. Cost-effective organic option.',                       examples: 'Biochem E.C.O.Trace, generic glycinates' },
  { tier: 'Hydroxychloride',                  range: '110–125%', desc: 'Low solubility in rumen avoids binding with antagonists (S, Mo, fiber, phytate).',  examples: 'Selko IntelliBond Z/C/M' },
  { tier: 'Selenium Yeast / Hydroxy-SeMet',   range: '150–180%', desc: 'Organic SeMet incorporated into muscle protein; superior tissue retention.',        examples: 'Alltech Sel-Plex, Adisseo Selisseo' },
  { tier: 'Sulfate',                          range: '100% (ref)', desc: 'Industry reference baseline. Cheap, soluble, but reacts with antagonists.',      examples: 'ZnSO₄, CuSO₄, MnSO₄, FeSO₄' },
  { tier: 'Oxide',                            range: '30–80%',   desc: 'Cheapest. Low absorption; often used for bulk where cost dominates.',              examples: 'ZnO, MnO' },
];
