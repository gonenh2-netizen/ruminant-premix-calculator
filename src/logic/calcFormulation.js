/**
 * Core formulation calculator.
 *
 * Order of operations:
 *   1. Start with daily mg/IU target per nutrient (reqs × DMI).
 *   2. Deduct contributions from enabled multi-mineral blends (deficitMg -= inclusion × fraction × 1000).
 *   3. Fill remaining deficit with the user's chosen organic + inorganic sources per mineral,
 *      using the organic% slider to split.
 *   4. Add vitamins from their dedicated sources.
 *   5. Add chromium if base.Cr > 0 (beef marbling).
 *   6. Carrier fills the balance to hit the total dose.
 *
 * Returns: { ingredients, summary, carrierG, carrierCostPerDose, totalCostPerDose, totalCostPerTon }
 */

import { MINERAL_KEYS, VITAMIN_KEYS, NUTRIENT_LABELS } from '../data/requirements.js';

export function calcFormulation({
  adjustedReqs,
  dmi,
  dose,
  organicPct,
  orgSrc,
  inorgSrc,
  blendRates,
  prices,
  carrier,
  PRODUCTS,
  BLENDS,
  VITAMIN_SOURCES,
  CARRIERS,
}) {
  const reqs = adjustedReqs.base;
  const ingredients = [];
  let totalActiveG = 0;
  let totalCostPerDose = 0;

  // Initialize daily-mg deficit tracker
  const deficitMg = {};
  MINERAL_KEYS.forEach((k) => { deficitMg[k] = (reqs[k] || 0) * dmi; });
  let crDeficitMg = (reqs.Cr || 0) * dmi;

  // 1. Apply multi-mineral blends
  BLENDS.forEach((b) => {
    const inclG = +blendRates[b.id] || 0;
    if (inclG <= 0) return;
    const cost = (inclG * (prices[b.id] || b.price)) / 1000;
    totalActiveG += inclG;
    totalCostPerDose += cost;
    ingredients.push({
      key: b.id,
      name: `${b.brand} ${b.name}`,
      brand: b.brand,
      nutrient: Object.keys(b.minerals).join('+'),
      type: b.type,
      category: 'Blend',
      perDoseG: inclG,
      perTonKg: (inclG / dose) * 1000,
      pricePerKg: prices[b.id] || b.price,
      costPerDose: cost,
      note: b.note,
    });
    Object.entries(b.minerals).forEach(([m, frac]) => {
      const mgDelivered = inclG * frac * 1000;
      if (m === 'Cr') crDeficitMg -= mgDelivered;
      else if (deficitMg[m] !== undefined) deficitMg[m] -= mgDelivered;
    });
  });

  // 2. Fill per-mineral gaps
  MINERAL_KEYS.forEach((m) => {
    const remain = Math.max(0, deficitMg[m]);
    if (remain <= 0.001) return;
    const orgFrac = (organicPct[m] || 0) / 100;
    const inorgFrac = 1 - orgFrac;

    const pushProduct = (prodId, portion, tag) => {
      if (portion <= 0) return;
      const prod = (PRODUCTS[m] || []).find((p) => p.id === prodId);
      if (!prod) return;
      const gProd = (remain * portion) / 1000 / prod.purity;
      const cost = (gProd * (prices[prodId] || prod.price)) / 1000;
      totalActiveG += gProd;
      totalCostPerDose += cost;
      ingredients.push({
        key: prodId,
        name: prod.name,
        brand: prod.brand,
        nutrient: m,
        type: prod.type,
        category: tag,
        perDoseG: gProd,
        perTonKg: (gProd / dose) * 1000,
        pricePerKg: prices[prodId] || prod.price,
        costPerDose: cost,
        note: prod.note,
      });
    };
    pushProduct(orgSrc[m], orgFrac, 'Organic');
    pushProduct(inorgSrc[m], inorgFrac, 'Inorganic');
  });

  // 3. Vitamins
  VITAMIN_KEYS.forEach((k) => {
    const req = reqs[k] || 0;
    if (req <= 0) return;
    const daily = req * dmi;
    const src = VITAMIN_SOURCES[k];
    const gProd = daily / src.potency;
    const cost = (gProd * (prices[k] || src.price)) / 1000;
    totalActiveG += gProd;
    totalCostPerDose += cost;
    ingredients.push({
      key: k,
      name: src.name,
      brand: 'Generic',
      nutrient: k,
      type: 'Vitamin',
      category: 'Vitamin',
      perDoseG: gProd,
      perTonKg: (gProd / dose) * 1000,
      pricePerKg: prices[k] || src.price,
      costPerDose: cost,
    });
  });

  // 4. Chromium (for marbling, if not already covered by KemTRACE blend)
  if (crDeficitMg > 0.001) {
    const gProd = crDeficitMg / 1000 / 0.0004; // default KemTRACE 0.04% Cr
    const cost = (gProd * (prices.kem_cr || 95)) / 1000;
    totalActiveG += gProd;
    totalCostPerDose += cost;
    ingredients.push({
      key: 'cr_auto',
      name: 'Kemin KemTRACE Chromium (auto-added)',
      brand: 'Kemin',
      nutrient: 'Cr',
      type: 'Chromium propionate',
      category: 'Blend',
      perDoseG: gProd,
      perTonKg: (gProd / dose) * 1000,
      pricePerKg: prices.kem_cr || 95,
      costPerDose: cost,
      note: 'Auto-added to meet Cr target. Add KemTRACE in blends panel to override.',
    });
  }

  // 5. Carrier
  const carrierObj = CARRIERS.find((c) => c.id === carrier) || CARRIERS[0];
  const carrierG = Math.max(0, dose - totalActiveG);
  const carrierCostPerDose = (carrierG * (prices[carrier] || carrierObj.price)) / 1000;
  totalCostPerDose += carrierCostPerDose;

  // Summary of requirements
  const summary = [];
  [...MINERAL_KEYS, ...VITAMIN_KEYS].forEach((k) => {
    const v = reqs[k];
    if (v === undefined || v === null) return;
    const unit = MINERAL_KEYS.includes(k) ? 'mg' : k === 'Biotin' ? 'mg' : 'IU';
    summary.push({ key: k, label: NUTRIENT_LABELS[k] || k, unit, reqPerKgDm: v, dailyTotal: v * dmi });
  });
  if ((reqs.Cr || 0) > 0) {
    summary.push({ key: 'Cr', label: 'Chromium', unit: 'mg', reqPerKgDm: reqs.Cr, dailyTotal: reqs.Cr * dmi });
  }

  return {
    ingredients,
    summary,
    carrierObj,
    carrierG,
    carrierCostPerDose,
    totalCostPerDose,
    totalCostPerTon: totalCostPerDose * (1000000 / dose),
  };
}
