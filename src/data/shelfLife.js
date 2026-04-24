/**
 * Commercial shelf-life and over-formulation (overage) model.
 *
 * A nutritionist designing a REAL premix for sale must add "overage" to
 * every nutrient target to account for two things:
 *   1. Analytical variability — batch-to-batch assay drift of 3–5% is
 *      normal even with perfect mixing.
 *   2. Degradation over shelf life — fat-soluble vitamins, biotin, and
 *      some iodine/selenium forms lose potency every month in storage,
 *      especially when co-mixed with trace mineral sulfates or choline
 *      chloride (both powerful pro-oxidants at premix concentrations).
 *
 * The baseline monthly decay rates below are industry-consensus values
 * for a premix stored cool (<25°C) and dry (<75% RH) in a sealed bag.
 *
 * Sources (transcribed from manufacturer technical bulletins — DSM
 * "Stability of Vitamins in Feed," Lonza / BASF product data, Adisseo
 * Selisseo stability studies, NRC 2005 Mineral Tolerance Appendix):
 *   Vit A acetate                    2–5 %/mo   (use 3.0%)
 *   25-OH-D3 / Vit D3                1–2 %/mo   (use 2.0%)
 *   dl-α-tocopheryl acetate (Vit E)  0.3–0.6 %/mo (use 0.5%)
 *   Biotin                           0.5–1.5 %/mo (use 1.0%)
 *   Sodium selenite (inorganic Se)   0.5 %/mo
 *   Selenium yeast / HMSeBA           0.1 %/mo  (much more stable)
 *   Potassium iodide (KI)             2 %/mo   (volatile)
 *   EDDI / calcium iodate             0.3 %/mo (stable)
 *   Minerals (Zn,Cu,Mn,Co,Fe,Cr)      0 %/mo   (no chemical decay)
 *
 * Two real-world modifiers shift these rates:
 *   Storage  : tropical / humid warehouses accelerate decay ~1.5×.
 *   Vit A form : coated CWS beadlets ~0.5×; uncoated ~1×; co-formulated
 *                with choline chloride ~2.5× (choline-induced oxidation).
 *
 * The final "overage %" chosen for each nutrient is:
 *     max(1 / (1 - decay_fraction) - 1,  analytical_floor)
 * i.e. enough to guarantee biological target at END of shelf life,
 * never below a minimum analytical-variability floor.
 */

// Monthly decay rates (%/month) per nutrient under STANDARD storage.
export const DECAY_MONTHLY_PCT = {
  VitA:   3.0,
  VitD:   2.0,
  VitE:   0.5,
  Biotin: 1.0,
  Se:     0.5,  // selenite baseline; organic Se is more stable
  I:      2.0,  // KI baseline; EDDI/Ca iodate more stable
  Zn:     0.0,
  Cu:     0.0,
  Mn:     0.0,
  Co:     0.0,
  Fe:     0.0,
  Cr:     0.0,
};

// Minimum analytical-variability floor in %, applied even if chemical
// decay is zero (assay drift, mixing CV, etc.).
// Intentionally low — the user asked for a lean default overage so that
// Weiss/NASEM 2021 targets aren't silently inflated. If a nutritionist
// wants more padding for shelf life they can raise the per-nutrient % in
// the Commercial Overage panel.
export const ANALYTICAL_FLOOR_PCT = {
  VitA:   2, VitD: 2, VitE: 2, Biotin: 2,
  Zn: 1, Cu: 1, Mn: 1, Co: 1, Se: 2, I: 2, Fe: 1, Cr: 1,
};

// Storage-environment multiplier on the monthly decay rate.
export const STORAGE_MULTIPLIER = {
  standard: 1.0,  // <25°C, <75% RH, sealed bag
  tropical: 1.5,  // humid / hot warehouse common in SEA
};

// Extra Vit A specific form factor. Applied ONLY to Vit A.
export const VIT_A_FORM_MULTIPLIER = {
  coated:       0.5,  // CWS beadlets / matrix-protected
  standard:     1.0,  // uncoated 500 KIU/g
  with_choline: 2.5,  // Vit A co-mixed with choline chloride
};

export const SHELF_LIFE_MONTHS_OPTIONS = [3, 6, 9, 12, 18, 24];
export const STORAGE_OPTIONS = [
  { id: 'standard', label: 'Standard (<25°C, <75% RH, sealed bag)' },
  { id: 'tropical', label: 'Tropical / humid warehouse (>25°C or >75% RH)' },
];
export const VIT_A_FORM_OPTIONS = [
  { id: 'coated',       label: 'Coated CWS beadlets (most stable)' },
  { id: 'standard',     label: 'Standard uncoated 500 KIU/g' },
  { id: 'with_choline', label: 'Co-mixed with choline chloride (least stable)' },
];

/**
 * Compute the per-nutrient overage % suggested for this shelf-life
 * configuration. Returns a map { [nutrient]: percent }.
 */
export function computeOverages({ months = 6, storage = 'standard', vitAForm = 'standard' }) {
  const storageMult = STORAGE_MULTIPLIER[storage] ?? 1.0;
  const vitAMult    = VIT_A_FORM_MULTIPLIER[vitAForm] ?? 1.0;
  const out = {};
  for (const [k, base] of Object.entries(DECAY_MONTHLY_PCT)) {
    const mult = (k === 'VitA' ? vitAMult : 1.0) * storageMult;
    const monthly = (base * mult) / 100;
    const remaining = Math.pow(1 - monthly, months);
    const decayPct = (1 - remaining) * 100;
    const decayOverage = decayPct > 0 ? (100 / (100 - decayPct) - 1) * 100 : 0;
    const floor = ANALYTICAL_FLOOR_PCT[k] ?? 3;
    out[k] = Math.round(Math.max(decayOverage, floor) * 10) / 10;
  }
  return out;
}

/**
 * Predicted remaining potency at end of shelf life, as a fraction (0–1),
 * for use in the expiry-potency display.
 */
export function remainingFraction(nutrient, { months, storage, vitAForm }) {
  const storageMult = STORAGE_MULTIPLIER[storage] ?? 1.0;
  const vitAMult    = VIT_A_FORM_MULTIPLIER[vitAForm] ?? 1.0;
  const base = DECAY_MONTHLY_PCT[nutrient] ?? 0;
  const mult = (nutrient === 'VitA' ? vitAMult : 1.0) * storageMult;
  const monthly = (base * mult) / 100;
  return Math.pow(1 - monthly, months);
}
