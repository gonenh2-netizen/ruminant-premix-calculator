/**
 * Shared helper: compute per-kg-premix delivered amounts per nutrient split
 * into inorganic / organic / total buckets.
 *
 * Returns: { Zn_inorg, Zn_org, Zn_total, ..., VitA, VitE, VitD, Biotin, Cr }
 * Minerals in mg/kg premix, vitamins A/D/E in IU/kg, Biotin + Cr in mg/kg.
 */
import { MINERAL_KEYS, VITAMIN_KEYS } from '../data/requirements.js';

export function perKgPremix(calc, dose, PRODUCTS, BLENDS, customProducts = []) {
  const scale = 1000 / dose; // doses → per kg premix
  const out = {};
  MINERAL_KEYS.forEach((k) => { out[`${k}_inorg`] = 0; out[`${k}_org`] = 0; out[`${k}_total`] = 0; });
  VITAMIN_KEYS.forEach((k) => { out[k] = 0; });
  out.Cr = 0;

  const blendMap = new Map([
    ...BLENDS.map((b) => [b.id, b]),
    ...customProducts.filter((c) => c.kind === 'blend').map((c) => [c.id, c]),
  ]);

  calc.ingredients.forEach((ing) => {
    const mgPerDose = ing.perDoseG * 1000; // g → mg of product
    const mgPerKgPremix = mgPerDose * scale;

    if (ing.category === 'Blend') {
      const b = blendMap.get(ing.key.replace(/_auto$/, ''));
      if (b && b.minerals) {
        Object.entries(b.minerals).forEach(([m, frac]) => {
          const mgMineral = mgPerKgPremix * frac;
          if (m === 'Cr') out.Cr += mgMineral;
          else if (out[`${m}_org`] !== undefined) {
            out[`${m}_org`] += mgMineral;
            out[`${m}_total`] += mgMineral;
          }
        });
      }
      return;
    }

    if (ing.category === 'Vitamin') {
      // ing.nutrient is the vitamin key; potency comes from source. Re-derive from req × dmi ÷ dose × 1000
      // Simpler: use the known IU delivered per dose = g × IU/g; we know ing nutrient but not potency here.
      // Fall back to calc.summary for authoritative numbers.
      return;
    }

    if (ing.nutrient && out[`${ing.nutrient}_total`] !== undefined) {
      const m = ing.nutrient;
      const prod = (PRODUCTS[m] || []).find((p) => p.id === ing.key)
        || customProducts.find((p) => p.id === ing.key);
      const purity = prod ? prod.purity : 0;
      const mgMineral = mgPerKgPremix * purity;
      out[`${m}_total`] += mgMineral;
      if (ing.category === 'Organic') out[`${m}_org`] += mgMineral;
      else if (ing.category === 'Inorganic') out[`${m}_inorg`] += mgMineral;
    } else if (ing.nutrient === 'Cr') {
      const prod = (PRODUCTS.Cr || []).find((p) => p.id === ing.key.replace(/_auto$/, ''));
      const purity = prod ? prod.purity : 0.0004;
      out.Cr += mgPerKgPremix * purity;
    }
  });

  // Vitamins: pull directly from summary × scale (authoritative)
  calc.summary.forEach((s) => {
    if (VITAMIN_KEYS.includes(s.key)) {
      out[s.key] = s.dailyTotal * scale;   // IU or mg per kg premix
    }
  });

  // Round for display
  Object.keys(out).forEach((k) => { out[k] = +out[k].toFixed(2); });
  return out;
}

export function downloadBlob(content, mimeType, filename) {
  const blob = new Blob(['﻿' + content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function safeName(s) {
  return (s || 'premix').replace(/[^A-Za-z0-9]+/g, '_');
}
