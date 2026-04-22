/**
 * Multi-mineral blend products (deliver more than one mineral per gram of product).
 *
 * User sets an inclusion rate (g/head/day) for each blend they want to include.
 * Calculator subtracts the blend's mineral contribution from each mineral's NRC
 * target before filling remaining gaps from per-mineral products (see PRODUCTS).
 *
 * `minerals` = fraction (0–1) of each element per gram of product. Example: Availa-4
 * is 5.15% Zn + 2.86% Mn + 1.8% Cu + 0.18% Co, so { Zn: 0.0515, Mn: 0.0286, Cu: 0.018, Co: 0.0018 }.
 *
 * Bioavailability is for informational display only — contribution is calculated
 * from purity, not scaled by bioavail. (Bioavail informs the user's choice; the
 * element mass delivered is the same either way.)
 */

export const BLENDS = [
  {
    id: 'availa_4', brand: 'Zinpro', name: 'Availa-4',
    type: 'Zn/Mn/Cu/Co AA complex blend',
    minerals: { Zn: 0.0515, Mn: 0.0286, Cu: 0.018, Co: 0.0018 },
    bioavail: 1.60, price: 26.00,
    note: 'Flagship Zinpro blend. Metal-AA complexes for Zn, Mn, Cu plus cobalt glucoheptonate. Typical feedlot dose 7–14 g/hd/d.',
  },
  {
    id: 'availa_6', brand: 'Zinpro', name: 'Availa-6',
    type: '6-mineral AA complex + SeMet + KI',
    minerals: { Zn: 0.050, Mn: 0.028, Cu: 0.018, Co: 0.0018, Se: 0.00006, I: 0.002 },
    bioavail: 1.55, price: 30.00,
    note: 'Extends Availa-4 with selenium yeast + iodine. Typical dairy dose 10–15 g/hd/d.',
  },
  {
    id: 'quadra', brand: 'Alltech', name: 'Bioplex Quadra',
    type: 'Zn/Cu/Mn/Fe proteinate blend',
    minerals: { Zn: 0.055, Cu: 0.045, Mn: 0.055, Fe: 0.040 },
    bioavail: 1.30, price: 25.00,
    note: '4-mineral proteinate blend. Broadly used in beef and dairy.',
  },
  {
    id: '4plex_c', brand: 'Zinpro', name: '4-Plex C',
    type: 'Chelated Zn/Mn/Cu/Co (older formulation)',
    minerals: { Zn: 0.034, Mn: 0.034, Cu: 0.034, Co: 0.0035 },
    bioavail: 1.40, price: 22.00,
    note: 'Older Zinpro product line; similar pattern to Availa-4 at lower Zn loading.',
  },
  {
    id: 'kem_cr', brand: 'Kemin', name: 'KemTRACE Chromium',
    type: 'Chromium propionate 0.04%',
    minerals: { Cr: 0.0004 },
    bioavail: 1.00, price: 95.00,
    note: 'Organic Cr propionate. Insulin sensitizer. 0.5 mg Cr/kg DM improves IMF and reduces heat stress. ~3 g/hd/d finishing cattle.',
  },
  {
    id: 'mintrex_dairy', brand: 'Novus', name: 'Mintrex Dairy Blend',
    type: 'Zn/Cu/Mn HMTBa bis-chelate blend',
    minerals: { Zn: 0.08, Cu: 0.05, Mn: 0.06 },
    bioavail: 1.45, price: 28.00,
    note: 'Bis-chelated Zn/Cu/Mn with methionine analog. 4–8 g/hd/d dairy.',
  },
  {
    id: 'intellibond_vitals', brand: 'Selko/Trouw', name: 'IntelliBond Vitals (Zn/Cu/Mn)',
    type: 'Hydroxychloride blend',
    minerals: { Zn: 0.25, Cu: 0.20, Mn: 0.18 },
    bioavail: 1.18, price: 8.50,
    note: 'Hydroxychloride blend of Zn, Cu, Mn. Concentrated; low rumen solubility. 2–4 g/hd/d.',
  },
];
