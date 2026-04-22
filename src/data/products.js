/**
 * Per-mineral single-source product catalog.
 *
 * Each product:
 *  - id: stable unique identifier (used as price key, org/inorg selector value)
 *  - brand: supplier name; 'Generic' for commodity salts/oxides
 *  - name: human-readable product name
 *  - type: chemistry label (e.g. 'Zn amino-acid complex')
 *  - kind: 'inorganic' | 'organic' | 'hydroxychloride' — hydroxychloride can be assigned as either in UI
 *  - purity: 0–1 fraction of elemental mineral per gram of product
 *  - bioavail: relative bioavailability vs sulfate reference (1.0 = sulfate baseline)
 *  - price: USD per kg — editable by user in UI
 *  - note: short chemistry/usage note shown as tooltip and in Bioavail guide
 *
 * Custom products created via UI are stored in localStorage under
 * `premix_calculator_custom_products_v1` and merged into this catalog at runtime
 * (see useCustomProducts hook).
 */

export const PRODUCTS = {
  Zn: [
    { id: 'zn_oxide',      brand: 'Generic',     name: 'Zinc Oxide (72%)',          type: 'Oxide',                 kind: 'inorganic',       purity: 0.72,  bioavail: 0.60, price: 3.50,  note: 'Cheapest Zn source but lowest absorption. High antagonist interaction.' },
    { id: 'zn_sulfate',    brand: 'Generic',     name: 'Zinc Sulfate monohydrate',  type: 'Sulfate',               kind: 'inorganic',       purity: 0.35,  bioavail: 1.00, price: 3.00,  note: 'Industry standard (100% reference). Soluble; can bind with phytate/fiber.' },
    { id: 'availa_zn',     brand: 'Zinpro',      name: 'Availa-Zn',                 type: 'Zn amino-acid complex', kind: 'organic',         purity: 0.06,  bioavail: 1.60, price: 24.00, note: 'Metal-AA complex. Highest bioavailability class. Rumen-stable.' },
    { id: 'bioplex_zn',    brand: 'Alltech',     name: 'Bioplex Zinc',              type: 'Zn proteinate',         kind: 'organic',         purity: 0.15,  bioavail: 1.30, price: 18.00, note: 'Peptide-bound; good ruminal stability.' },
    { id: 'mintrex_zn',    brand: 'Novus',       name: 'Mintrex Zn',                type: 'Zn-HMTBa bis-chelate',  kind: 'organic',         purity: 0.15,  bioavail: 1.50, price: 20.00, note: '2 HMTBa (methionine analog) ligands per Zn. ~54% rumen bypass.' },
    { id: 'intellibond_z', brand: 'Selko/Trouw', name: 'IntelliBond Z',             type: 'Zinc hydroxychloride',  kind: 'hydroxychloride', purity: 0.55,  bioavail: 1.15, price: 6.50,  note: 'High concentration; low solubility at rumen pH avoids antagonists.' },
    { id: 'eco_zn',        brand: 'Biochem',     name: 'E.C.O.Trace Zn',            type: 'Zn glycinate',          kind: 'organic',         purity: 0.18,  bioavail: 1.40, price: 15.00, note: 'Simple glycine chelate. Cost-effective organic option.' },
  ],
  Cu: [
    { id: 'cu_sulfate',    brand: 'Generic',     name: 'Copper Sulfate pentahydrate', type: 'Sulfate',               kind: 'inorganic',       purity: 0.25, bioavail: 1.00, price: 7.50,  note: 'Standard reference; interacts with S, Mo, Fe antagonists.' },
    { id: 'availa_cu',     brand: 'Zinpro',      name: 'Availa-Cu',                    type: 'Cu amino-acid complex', kind: 'organic',         purity: 0.10, bioavail: 1.50, price: 28.00, note: 'Metal-AA complex; protected from S/Mo interaction.' },
    { id: 'bioplex_cu',    brand: 'Alltech',     name: 'Bioplex Copper',               type: 'Cu proteinate',         kind: 'organic',         purity: 0.10, bioavail: 1.25, price: 22.00, note: 'Peptide-bound Cu proteinate.' },
    { id: 'mintrex_cu',    brand: 'Novus',       name: 'Mintrex Cu',                   type: 'Cu-HMTBa bis-chelate',  kind: 'organic',         purity: 0.15, bioavail: 1.45, price: 24.00, note: 'Relative bioavailability ~111% of sulfate + methionine contribution.' },
    { id: 'intellibond_c', brand: 'Selko/Trouw', name: 'IntelliBond C',                type: 'Basic copper chloride', kind: 'hydroxychloride', purity: 0.58, bioavail: 1.20, price: 12.00, note: '58% Cu. Low rumen solubility → avoids reaction with molybdenum.' },
    { id: 'eco_cu',        brand: 'Biochem',     name: 'E.C.O.Trace Cu',               type: 'Cu glycinate',          kind: 'organic',         purity: 0.18, bioavail: 1.35, price: 20.00, note: 'Glycine-chelated Cu.' },
  ],
  Mn: [
    { id: 'mn_sulfate',    brand: 'Generic',     name: 'Manganese Sulfate monohydrate', type: 'Sulfate',                   kind: 'inorganic',       purity: 0.32, bioavail: 1.00, price: 2.80,  note: 'Standard reference.' },
    { id: 'mn_oxide',      brand: 'Generic',     name: 'Manganese Oxide',               type: 'Oxide',                     kind: 'inorganic',       purity: 0.60, bioavail: 0.70, price: 2.50,  note: 'Highest Mn concentration, lowest bioavailability.' },
    { id: 'availa_mn',     brand: 'Zinpro',      name: 'Availa-Mn',                     type: 'Mn amino-acid complex',     kind: 'organic',         purity: 0.06, bioavail: 1.55, price: 26.00, note: 'Metal-AA complex; top-tier bioavailability.' },
    { id: 'bioplex_mn',    brand: 'Alltech',     name: 'Bioplex Manganese',             type: 'Mn proteinate',             kind: 'organic',         purity: 0.15, bioavail: 1.25, price: 20.00, note: 'Peptide-bound Mn.' },
    { id: 'mintrex_mn',    brand: 'Novus',       name: 'Mintrex Mn',                    type: 'Mn-HMTBa bis-chelate',      kind: 'organic',         purity: 0.13, bioavail: 1.45, price: 22.00, note: 'Bis-chelate with methionine analog.' },
    { id: 'intellibond_m', brand: 'Selko/Trouw', name: 'IntelliBond M',                 type: 'Manganese hydroxychloride', kind: 'hydroxychloride', purity: 0.44, bioavail: 1.15, price: 6.00,  note: '44% Mn. Avoids fiber / phytate antagonism.' },
  ],
  Co: [
    { id: 'co_carb',       brand: 'Generic',     name: 'Cobalt Carbonate',        type: 'Carbonate',      kind: 'inorganic', purity: 0.46, bioavail: 1.00, price: 45.00, note: 'Most common ruminant Co source; rumen microbes convert to B12.' },
    { id: 'bioplex_co',    brand: 'Alltech',     name: 'Bioplex Cobalt',          type: 'Co proteinate',  kind: 'organic',   purity: 0.01, bioavail: 1.30, price: 70.00, note: 'Organic Co, slightly higher absorption.' },
    { id: 'co_gluco',      brand: 'Generic',     name: 'Cobalt Glucoheptonate',   type: 'Glucoheptonate', kind: 'organic',   purity: 0.01, bioavail: 1.20, price: 65.00, note: 'Organic carbohydrate complex.' },
  ],
  Se: [
    { id: 'se_selenite',   brand: 'Generic',     name: 'Sodium Selenite',        type: 'Selenite',              kind: 'inorganic', purity: 0.45,  bioavail: 1.00, price: 55.00, note: 'Standard inorganic Se.' },
    { id: 'selplex',       brand: 'Alltech',     name: 'Sel-Plex',               type: 'Selenium yeast (SeMet)', kind: 'organic',  purity: 0.002, bioavail: 1.50, price: 48.00, note: 'SeMet incorporated into muscle; tissue retention ≫ selenite.' },
    { id: 'selisseo',      brand: 'Adisseo',     name: 'Selisseo (HMSeBA)',      type: 'Hydroxy-SeMet',          kind: 'organic',  purity: 0.002, bioavail: 1.80, price: 55.00, note: 'Pure organic Se; ~180% bioavailability of selenite.' },
    { id: 'zinpro_se',     brand: 'Zinpro',      name: 'Availa Se',              type: 'SeMet',                  kind: 'organic',  purity: 0.002, bioavail: 1.55, price: 52.00, note: 'Zinpro organic Se, SeMet form.' },
  ],
  I: [
    { id: 'ki',            brand: 'Generic',     name: 'Potassium Iodide',       type: 'Iodide',                        kind: 'inorganic',       purity: 0.76, bioavail: 1.00, price: 85.00, note: 'Standard; volatile, needs stabilization.' },
    { id: 'eddi',          brand: 'Generic',     name: 'EDDI',                   type: 'Ethylenediamine Dihydroiodide', kind: 'hydroxychloride', purity: 0.80, bioavail: 1.10, price: 90.00, note: 'More stable than KI in premix storage.' },
    { id: 'ca_iodate',     brand: 'Generic',     name: 'Calcium Iodate',         type: 'Iodate',                        kind: 'inorganic',       purity: 0.64, bioavail: 1.00, price: 78.00, note: 'Most stable I form; widely used in salt licks.' },
  ],
  Fe: [
    { id: 'fe_sulfate',    brand: 'Generic',     name: 'Ferrous Sulfate monohydrate', type: 'Sulfate',       kind: 'inorganic', purity: 0.30, bioavail: 1.00, price: 1.80,  note: 'Standard reference.' },
    { id: 'bioplex_fe',    brand: 'Alltech',     name: 'Bioplex Iron',                type: 'Fe proteinate', kind: 'organic',   purity: 0.15, bioavail: 1.30, price: 11.00, note: 'Organic Fe peptide-bound.' },
    { id: 'fe_gly',        brand: 'Generic',     name: 'Iron Glycinate',              type: 'AA chelate',    kind: 'organic',   purity: 0.18, bioavail: 1.35, price: 14.00, note: 'Glycine-chelated Fe.' },
  ],
  Cr: [
    { id: 'kemtrace_cr',   brand: 'Kemin',       name: 'KemTRACE Chromium',           type: 'Chromium propionate',   kind: 'organic',   purity: 0.0004, bioavail: 1.00, price: 95.00, note: 'Organic Cr propionate. Insulin sensitizer — aids marbling, heat-stress tolerance.' },
  ],
};

/** Merge custom (localStorage) products with built-ins for a given mineral. */
export function productsFor(mineral, customProducts = []) {
  const base = PRODUCTS[mineral] || [];
  const customSingles = customProducts
    .filter((c) => c.kind !== 'blend' && c.mineral === mineral)
    .map((c) => ({
      id: c.id,
      brand: c.brand || 'Custom',
      name: c.name,
      type: c.type || 'Custom',
      kind: c.chemistry === 'inorganic' ? 'inorganic' : c.chemistry === 'hydroxychloride' ? 'hydroxychloride' : 'organic',
      purity: c.purity,
      bioavail: c.bioavail || 1.0,
      price: c.price || 0,
      note: c.note || '',
      custom: true,
    }));
  return [...base, ...customSingles];
}

/**
 * Unified catalog for the "Organic Sources" picker.
 * Flattens singles + blends (built-in + custom) into one list where each entry has:
 *   - productKind: 'single' | 'blend'
 *   - minerals: { [mineralKey]: fraction }  (single has one key; blend has many)
 * This normalises the data so the UI can treat both the same way.
 */
export function unifiedCatalog(BLENDS, customProducts = []) {
  const out = [];
  // Single-mineral organic / hydroxychloride products from built-ins
  for (const mineral of Object.keys(PRODUCTS)) {
    for (const p of PRODUCTS[mineral]) {
      if (p.kind === 'inorganic') continue; // inorganic selected separately
      out.push({
        ...p,
        productKind: 'single',
        minerals: { [mineral]: p.purity },
      });
    }
  }
  // Built-in blends
  for (const b of BLENDS) {
    out.push({
      ...b,
      productKind: 'blend',
      kind: 'organic',
    });
  }
  // Custom products
  for (const c of customProducts) {
    if (c.kind === 'blend') {
      out.push({
        id: c.id,
        brand: c.brand || 'Custom',
        name: c.name,
        type: c.type || 'Custom blend',
        kind: 'organic',
        bioavail: c.bioavail || 1.0,
        price: c.price || 0,
        note: c.note || '',
        custom: true,
        productKind: 'blend',
        minerals: c.minerals || {},
      });
    } else if (c.chemistry !== 'inorganic') {
      out.push({
        id: c.id,
        brand: c.brand || 'Custom',
        name: c.name,
        type: c.type || 'Custom',
        kind: c.chemistry === 'hydroxychloride' ? 'hydroxychloride' : 'organic',
        purity: c.purity,
        bioavail: c.bioavail || 1.0,
        price: c.price || 0,
        note: c.note || '',
        custom: true,
        productKind: 'single',
        minerals: { [c.mineral]: c.purity },
      });
    }
  }
  return out;
}

/** Inorganic-only products for a given mineral. */
export function inorganicFor(mineral, customProducts = []) {
  return productsFor(mineral, customProducts).filter((p) => p.kind === 'inorganic' || p.kind === 'hydroxychloride');
}
