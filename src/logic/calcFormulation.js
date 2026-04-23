/**
 * Core formulation calculator.
 *
 * State model (new):
 *   organicSelections = { [productId]: { location, mode, value, anchorMineral? } }
 *     location    : 'premix' | 'ration'
 *     mode        : 'pct' (single only) | 'anchor_pct' (blend only) | 'fixed_g' (all)
 *     value       : percentage (0–100) for pct / anchor_pct, grams/head/day for fixed_g
 *     anchorMineral : which mineral the anchor_pct refers to
 *   inorgSrc = { [mineralKey]: productId }   — per-mineral inorganic fallback
 *
 * Order of operations:
 *   1. Start with daily mg/IU target per nutrient (reqs × DMI).
 *   2. Process ration-side organic products (location='ration'):
 *        — deliver their mineral contribution (reduce the daily deficit)
 *        — do NOT add to premix ingredients (they live in the TMR).
 *   3. Process premix-side organic products (location='premix'):
 *        — deliver mineral contribution (reduce deficit)
 *        — add product to premix ingredients.
 *   4. Fill remaining per-mineral deficit with the inorganic source.
 *   5. Vitamins, Cr auto-fill (KemTRACE), sheep Cu ceiling, carrier.
 */

import { MINERAL_KEYS, VITAMIN_KEYS, NUTRIENT_LABELS, MTL } from '../data/requirements.js';
import { productsFor, unifiedCatalog } from '../data/products.js';
import { ADDITIVES } from '../data/additives.js';

export function calcFormulation({
  adjustedReqs,
  dmi,
  dose,
  organicSelections = {},
  inorgSrc,
  prices,
  carrier,
  species,
  PRODUCTS,
  BLENDS,
  VITAMIN_SOURCES,
  CARRIERS,
  customProducts = [],
  cuCeiling = null,
  additiveDose = {},
  marbling = false,
}) {
  const reqs = adjustedReqs.base;
  const ingredients = [];
  const warnings = [];
  let totalActiveG = 0;
  let totalCostPerDose = 0;

  // Per-mineral daily requirement (mg)
  const requiredMg = {};
  [...MINERAL_KEYS, 'Cr'].forEach((m) => { requiredMg[m] = (reqs[m] || 0) * dmi; });

  // Per-mineral remaining deficit (mg) — gets drained as we place sources
  const deficitMg = { ...requiredMg };

  // Per-mineral delivery buckets (mg/day)
  const delivered = {
    ration: {},
    premix_org: {},
    premix_inorg: {},
  };
  [...MINERAL_KEYS, 'Cr'].forEach((m) => {
    delivered.ration[m] = 0;
    delivered.premix_org[m] = 0;
    delivered.premix_inorg[m] = 0;
  });

  const catalog = unifiedCatalog(BLENDS, customProducts);

  // Helper: compute grams of product needed to deliver target_mg of its anchor mineral
  const gFromMineralTarget = (prod, mineral, targetMg) => {
    const frac = prod.minerals[mineral];
    if (!frac || frac <= 0) return 0;
    return targetMg / 1000 / frac;
  };

  /**
   * Deliver a product's minerals to the buckets.
   * @param prod unified catalog entry
   * @param gProd grams of the product delivered per head per day
   * @param bucket 'ration' | 'premix_org'
   */
  const deliverProduct = (prod, gProd, bucket) => {
    Object.entries(prod.minerals).forEach(([m, frac]) => {
      const mgDelivered = gProd * frac * 1000;
      if (delivered[bucket][m] === undefined) delivered[bucket][m] = 0;
      delivered[bucket][m] += mgDelivered;
      if (deficitMg[m] !== undefined) deficitMg[m] -= mgDelivered;
    });
  };

  // Sort selections so blends process before singles (stability for mineral ownership)
  const entries = Object.entries(organicSelections).filter(([, s]) => s);
  const rationEntries = entries.filter(([, s]) => s.location === 'ration');
  const premixEntries = entries.filter(([, s]) => s.location !== 'ration');

  // 1. Ration-side products (reduce deficit, NOT in premix)
  rationEntries.forEach(([pid, sel]) => {
    const prod = catalog.find((p) => p.id === pid);
    if (!prod) return;
    // Ration mode must be fixed_g
    const gProd = Math.max(0, +sel.value || 0);
    if (gProd <= 0) return;
    deliverProduct(prod, gProd, 'ration');
    // Not added to ingredients — this is external to the premix
  });

  // 2. Premix-side organic products (reduce deficit + add to premix)
  premixEntries.forEach(([pid, sel]) => {
    const prod = catalog.find((p) => p.id === pid);
    if (!prod) return;

    let gProd = 0;
    if (sel.mode === 'fixed_g') {
      gProd = Math.max(0, +sel.value || 0);
    } else if (sel.mode === 'pct' && prod.productKind === 'single') {
      const mineral = Object.keys(prod.minerals)[0];
      const remaining = Math.max(0, deficitMg[mineral] || 0);
      const targetMg = remaining * (Math.max(0, Math.min(100, +sel.value || 0)) / 100);
      gProd = gFromMineralTarget(prod, mineral, targetMg);
    } else if (sel.mode === 'anchor_pct' && prod.productKind === 'blend') {
      const anchor = sel.anchorMineral || Object.keys(prod.minerals)[0];
      const remaining = Math.max(0, deficitMg[anchor] || 0);
      const targetMg = remaining * (Math.max(0, Math.min(100, +sel.value || 0)) / 100);
      gProd = gFromMineralTarget(prod, anchor, targetMg);
    }
    if (gProd <= 0) return;

    deliverProduct(prod, gProd, 'premix_org');

    const pricePerKg = prices[prod.id] ?? prod.price;
    const cost = (gProd * pricePerKg) / 1000;
    totalActiveG += gProd;
    totalCostPerDose += cost;

    ingredients.push({
      key: prod.id,
      name: prod.name,
      brand: prod.brand,
      nutrient: Object.keys(prod.minerals).join('+'),
      type: prod.type,
      category: prod.productKind === 'blend' ? 'Blend' : 'Organic',
      perDoseG: gProd,
      perTonKg: (gProd / dose) * 1000,
      pricePerKg,
      costPerDose: cost,
      note: prod.note,
      custom: prod.custom,
    });
  });

  // 3. Per-mineral inorganic fill
  MINERAL_KEYS.forEach((m) => {
    const remain = Math.max(0, deficitMg[m] || 0);
    if (remain <= 0.001) return;
    const pid = inorgSrc[m];
    if (!pid) return;
    const pool = productsFor(m, customProducts);
    const prod = pool.find((p) => p.id === pid);
    if (!prod) return;
    const gProd = remain / 1000 / prod.purity;
    const pricePerKg = prices[pid] ?? prod.price;
    const cost = (gProd * pricePerKg) / 1000;
    totalActiveG += gProd;
    totalCostPerDose += cost;
    delivered.premix_inorg[m] += remain;
    deficitMg[m] = 0;
    ingredients.push({
      key: pid,
      name: prod.name,
      brand: prod.brand,
      nutrient: m,
      type: prod.type,
      category: 'Inorganic',
      perDoseG: gProd,
      perTonKg: (gProd / dose) * 1000,
      pricePerKg,
      costPerDose: cost,
      note: prod.note,
      custom: prod.custom,
    });
  });

  // 4. Vitamins
  VITAMIN_KEYS.forEach((k) => {
    const req = reqs[k] || 0;
    if (req <= 0) return;
    const daily = req * dmi;
    const src = VITAMIN_SOURCES[k];
    const gProd = daily / src.potency;
    const pricePerKg = prices[k] ?? src.price;
    const cost = (gProd * pricePerKg) / 1000;
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
      pricePerKg,
      costPerDose: cost,
    });
  });

  // 5. Chromium auto-add via KemTRACE if deficit remains
  const crDeficit = Math.max(0, deficitMg.Cr || 0);
  if (crDeficit > 0.001) {
    const crProd = (PRODUCTS.Cr || [])[0];
    if (crProd) {
      const gProd = crDeficit / 1000 / crProd.purity;
      const pricePerKg = prices[crProd.id] ?? crProd.price;
      const cost = (gProd * pricePerKg) / 1000;
      totalActiveG += gProd;
      totalCostPerDose += cost;
      delivered.premix_org.Cr += crDeficit;
      deficitMg.Cr = 0;
      ingredients.push({
        key: crProd.id + '_auto',
        name: `${crProd.brand} ${crProd.name} (auto)`,
        brand: crProd.brand,
        nutrient: 'Cr',
        type: crProd.type,
        category: 'Blend',
        perDoseG: gProd,
        perTonKg: (gProd / dose) * 1000,
        pricePerKg,
        costPerDose: cost,
        note: 'Auto-added to meet Cr target. Include KemTRACE directly in the Organic Sources panel to override.',
      });
    }
  }

  // 5b. Maximum Tolerable Level (MTL) check — species-specific ceilings
  // for every mineral + vitamin. Guards against the user overriding a
  // target above the toxic threshold, a blend over-supplying one element,
  // or the ration + premix stack pushing total intake past the ceiling.
  const mtl = MTL[species] || {};
  const mtlExceedances = [];
  if (dmi > 0) {
    MINERAL_KEYS.forEach((m) => {
      const limit = mtl[m];
      if (!limit) return;
      const totalMg = (delivered.ration[m] || 0) + (delivered.premix_org[m] || 0) + (delivered.premix_inorg[m] || 0);
      const perKgDm = totalMg / dmi;
      if (perKgDm > limit) {
        const pct = ((perKgDm / limit) * 100).toFixed(0);
        warnings.push(
          `⚠ TOXIC ${NUTRIENT_LABELS[m] || m}: total delivery ${perKgDm.toFixed(2)} mg/kg DM exceeds ${species} Maximum Tolerable Level ` +
          `(${limit} mg/kg DM, ${pct}%). Lower the mineral target, reduce the organic product dose, or switch to a blend that supplies less ${m}.`
        );
        mtlExceedances.push({ key: m, current: perKgDm, limit });
      }
    });
    // Vitamin / Cr MTL: target-driven delivery, so check the adjusted target itself.
    [...VITAMIN_KEYS, 'Cr'].forEach((k) => {
      const limit = mtl[k];
      if (!limit) return;
      const target = adjustedReqs.base[k] || 0;
      if (target > limit) {
        const unit = (k === 'VitA' || k === 'VitD' || k === 'VitE') ? 'IU/kg DM' : 'mg/kg DM';
        const pct = ((target / limit) * 100).toFixed(0);
        warnings.push(
          `⚠ TOXIC ${NUTRIENT_LABELS[k] || k}: target ${target.toFixed(0)} ${unit} exceeds ${species} Maximum Tolerable Level ` +
          `(${limit} ${unit}, ${pct}%). Lower the % of Rqd in the Requirements table.`
        );
        mtlExceedances.push({ key: k, current: target, limit });
      }
    });
  }

  // 6. Sheep Cu ceiling check — includes ration + premix Cu
  let dietCuPpm = null;
  if (species === 'Sheep' && cuCeiling) {
    const totalCu = (delivered.ration.Cu || 0) + (delivered.premix_org.Cu || 0) + (delivered.premix_inorg.Cu || 0);
    dietCuPpm = dmi > 0 ? totalCu / dmi : 0;
    if (dietCuPpm > cuCeiling) {
      warnings.push(
        `Diet Cu = ${dietCuPpm.toFixed(2)} mg/kg DM exceeds sheep ceiling of ${cuCeiling} mg/kg DM. ` +
        `Reduce Cu sources or lower organic Cu dose.`
      );
    }
  }

  // 6b. Feed additives (yeast, ionophores, RP-AA, buffers, DCAD salts, etc.)
  // Each additive contributes grams to the premix dose and cost to the total.
  // Minerals / vitamins contributed by additives (e.g. anionic salts supplying
  // Ca/Mg/Cl) are NOT credited to the mineral deficit — those macros are not
  // tracked in this tool. Additives are advisory on top of the premix math.
  for (const [id, gPerHead] of Object.entries(additiveDose || {})) {
    const g = +gPerHead || 0;
    if (g <= 0) continue;
    const a = ADDITIVES.find((x) => x.id === id);
    if (!a) continue;

    // Safety check: enforce maxDose (ionophore toxicity ceiling, etc.)
    if (a.maxDose != null && g > a.maxDose) {
      warnings.push(
        `${a.name} dose ${g.toFixed(2)} g/hd/d exceeds safety ceiling of ${a.maxDose} g/hd/d. ${a.maxDoseNote || 'Reduce the dose.'}`
      );
    }
    // Species / stage applicability check
    if (!a.species.includes(species)) {
      warnings.push(`${a.name} is not labelled for ${species}. Review before use.`);
    }
    if (a.regulatoryNote) {
      warnings.push(`${a.name}: ${a.regulatoryNote}`);
    }
    // Additive ↔ strategy conflicts (e.g. β-carotene vs Marbling's low-Vit-A protocol)
    if (Array.isArray(a.conflictsWith) && a.conflictsWith.includes('marbling') && marbling) {
      warnings.push(
        `${a.name} is a provitamin-A source and partially counteracts the Marbling (low Vit A) protocol. ` +
        `Either turn off Marbling for this animal or lower the β-carotene dose.`
      );
    }

    const pricePerKg = prices[id] ?? a.price;
    const cost = (g * pricePerKg) / 1000;
    totalActiveG += g;
    totalCostPerDose += cost;
    ingredients.push({
      key: id,
      name: a.name,
      brand: a.brand,
      nutrient: '-',
      type: a.category,
      category: 'Additive',
      perDoseG: g,
      perTonKg: (g / dose) * 1000,
      pricePerKg,
      costPerDose: cost,
      note: a.note,
    });
  }

  // 7. Carrier fills the balance
  const carrierObj = CARRIERS.find((c) => c.id === carrier) || CARRIERS[0];
  const carrierG = Math.max(0, dose - totalActiveG);
  const carrierCostPerDose = (carrierG * (prices[carrier] ?? carrierObj.price)) / 1000;
  totalCostPerDose += carrierCostPerDose;
  if (carrierG > 0) {
    ingredients.push({
      key: carrierObj.id,
      name: carrierObj.name,
      brand: 'Carrier',
      nutrient: '-',
      type: 'Carrier',
      category: 'Carrier',
      perDoseG: carrierG,
      perTonKg: (carrierG / dose) * 1000,
      pricePerKg: prices[carrier] ?? carrierObj.price,
      costPerDose: carrierCostPerDose,
    });
  } else if (totalActiveG > dose) {
    warnings.push(`Active ingredients (${totalActiveG.toFixed(1)} g) exceed the ${dose} g dose — no room for carrier. Increase dose or lower organic inclusion.`);
  }

  // 8. Per-mineral delivery rows (for the 3-column breakdown table)
  const mineralDelivery = MINERAL_KEYS.map((m) => {
    const ration = delivered.ration[m] || 0;
    const premixOrg = delivered.premix_org[m] || 0;
    const premixInorg = delivered.premix_inorg[m] || 0;
    const total = ration + premixOrg + premixInorg;
    const req = requiredMg[m] || 0;
    return {
      mineral: m,
      label: NUTRIENT_LABELS[m] || m,
      required: req,
      ration,
      premixOrganic: premixOrg,
      premixInorganic: premixInorg,
      total,
      balance: total - req,
    };
  });
  if ((reqs.Cr || 0) > 0) {
    const ration = delivered.ration.Cr || 0;
    const premixOrg = delivered.premix_org.Cr || 0;
    const premixInorg = delivered.premix_inorg.Cr || 0;
    const total = ration + premixOrg + premixInorg;
    mineralDelivery.push({
      mineral: 'Cr',
      label: NUTRIENT_LABELS.Cr,
      required: requiredMg.Cr || 0,
      ration,
      premixOrganic: premixOrg,
      premixInorganic: premixInorg,
      total,
      balance: total - (requiredMg.Cr || 0),
    });
  }

  // 9. Summary of requirements (unchanged contract)
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

  // deliveredMg kept for legacy compatibility (flat Cu total etc.)
  const deliveredMg = {};
  [...MINERAL_KEYS, 'Cr'].forEach((m) => {
    deliveredMg[m] = (delivered.ration[m] || 0) + (delivered.premix_org[m] || 0) + (delivered.premix_inorg[m] || 0);
  });

  return {
    ingredients,
    summary,
    mineralDelivery,
    carrierObj,
    carrierG,
    carrierCostPerDose,
    totalCostPerDose,
    totalCostPerTon: totalCostPerDose * (1000000 / dose),
    totalActiveG,
    delivered,
    deliveredMg,
    warnings,
    dietCuPpm,
    mtl,
    mtlExceedances,
  };
}
