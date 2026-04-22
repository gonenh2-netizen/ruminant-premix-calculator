/**
 * Apply species/stage-specific adjustments to baseline NRC/NASEM requirements,
 * then apply per-nutrient user overrides (exclude or bump above/below baseline).
 *
 * Inputs:
 *   base = REQS[species].stages[stage] (object of nutrient → mg/IU per kg DM)
 *   nutrientOverrides: { [key]: { enabled: boolean, multiplier: number|null } }
 *     enabled=false   → nutrient excluded from the premix (set to 0)
 *     multiplier!=null → scale NRC/adjusted baseline by multiplier/100
 *                        (100 = baseline, 120 = +20%, 80 = -20%, 0 = excluded)
 *
 * Returns: { base: adjusted requirements, notes: array of human-readable change explanations,
 *            defaults: the pre-override values (so the UI can show the NRC default) }
 */

export function adjustReqs({ REQS, species, stage, breed, milkYield, marbling, colorFocus, shelfLife, nutrientOverrides = {} }) {
  const base = { ...REQS[species].stages[stage] };
  const notes = [];

  // Milk yield scaling (dairy, goat, sheep)
  if (REQS[species].hasMilkYield && stage.toLowerCase().includes('lactation')) {
    let baseYield = 30;
    if (species === 'Goat') baseYield = 3;
    if (species === 'Sheep') baseYield = 1.5;
    const ratio = milkYield / baseYield;
    if (ratio > 1.1) {
      const bump = Math.min(0.35, (ratio - 1) * 0.5);
      base.Zn = Math.round(base.Zn * (1 + bump));
      base.Cu = Math.round(base.Cu * (1 + bump * 0.3));
      base.Se = +(base.Se * (1 + bump * 0.5)).toFixed(2);
      base.VitE = Math.round(base.VitE * (1 + bump * 0.5));
      base.Biotin = +(base.Biotin * (1 + bump * 0.5)).toFixed(2);
      notes.push(`High milk yield (${milkYield} kg/d) → Zn, Cu, Se, Vit E, Biotin raised proportionally.`);
    } else if (ratio < 0.9 && ratio > 0) {
      const trim = Math.min(0.25, (1 - ratio) * 0.3);
      base.Zn = Math.round(base.Zn * (1 - trim));
      base.VitE = Math.round(base.VitE * (1 - trim * 0.5));
      notes.push(`Below-average milk yield (${milkYield} kg/d) → Zn, Vit E trimmed.`);
    }
  }

  // Breed-specific tweaks
  if (species === 'Dairy' && (breed === 'Jersey' || breed === 'Guernsey')) {
    base.VitA = Math.round(base.VitA * 1.05);
    notes.push('Jersey/Guernsey: slightly elevated Vit A (higher butterfat milk).');
  }
  if (species === 'Sheep' && ['East Friesian', 'Awassi', 'Lacaune'].includes(breed)) {
    base.Zn = Math.round(base.Zn * 1.10);
    base.VitE = Math.round(base.VitE * 1.20);
    notes.push('Dairy sheep breed: Zn and Vit E raised for milk production support.');
  }
  if (species === 'Beef' && breed === 'Wagyu' && stage === 'Finishing') {
    notes.push('Wagyu finishing: extra marbling support recommended (toggle Marbling).');
  }
  const tropicalBeef = ['Brahman', 'Thai Native (Kha-Korat)', 'Bali Cattle', 'Kedah-Kelantan', 'Droughtmaster'];
  if (species === 'Beef' && (tropicalBeef.includes(breed) || breed.startsWith('Brahman ×'))) {
    base.Zn = Math.round(base.Zn * 1.15);
    base.VitE = Math.round(base.VitE * 1.20);
    base.VitA = Math.round(base.VitA * 1.10);
    notes.push('Tropical / Bos indicus breed: Zn +15% (hoof integrity), Vit E +20% (heat-stress antioxidant), Vit A +10% (SEA forage variability).');
  }

  // Meat-quality adjustments — Beef, Goat, and Sheep. Biology is shared across
  // ruminant red meat (oxymyoglobin color chemistry, IMF via Vit A restriction),
  // but stage names differ per species, so we map them explicitly.
  base.Cr = 0;
  if (['Beef', 'Goat', 'Sheep'].includes(species)) {
    // Stage sets that gate Marbling's Vit A swing: "finishing-like" restricts,
    // "early growth" boosts to seed intramuscular adipocytes.
    const finishingStages = {
      Beef:  ['Finishing', 'Backgrounding'],
      Goat:  ['Finishing'],
      Sheep: ['Finishing'],
    }[species];
    const earlyGrowthStages = {
      Beef:  ['Calf (Preweaning)', 'Growing / Stocker'],
      Goat:  ['Growing Kid'],
      Sheep: ['Growing Lamb'],
    }[species];

    if (marbling) {
      if (finishingStages.includes(stage)) {
        base.VitA = Math.round(base.VitA * 0.50);
        base.Cr = 0.5;
        base.Biotin = 0.20;
        notes.push(`Marbling ON (${species} ${stage}): Vit A restricted to ~50% (promotes IMF). Cr + biotin added.`);
      }
      if (earlyGrowthStages.includes(stage)) {
        base.VitA = Math.round(base.VitA * 1.80);
        notes.push(`Marbling ON (${species} ${stage}, early-life): Vit A boosted ~80% to seed intramuscular adipocytes.`);
      }
    }
    if (colorFocus) {
      base.VitE = Math.max(base.VitE, 150);
      base.Se = Math.max(base.Se, 0.30);
      notes.push('Meat color ON: Vit E ≥150 IU/kg DM, Se ≥0.30 mg/kg DM (oxymyoglobin protection).');
    }
    if (shelfLife) {
      base.VitE = Math.max(base.VitE, 200);
      base.Se = Math.max(base.Se, 0.30);
      base.Fe = Math.min(base.Fe, 40);
      // Sheep already has a 15 mg/kg DM Cu toxicity ceiling; capping to 10 is
      // stricter and safe. Other species just cap at 10.
      base.Cu = Math.min(base.Cu, 10);
      notes.push('Shelf life ON: Vit E ≥200 IU/kg DM, Se 0.30. Fe/Cu capped to slow lipid oxidation.');
    }
  }

  // Snapshot of the adjusted-but-not-yet-overridden values so the UI can
  // surface the "NRC / adjusted default" alongside the user's override.
  const defaults = { ...base };

  // Per-nutrient user overrides (exclude or multiplier)
  const overridden = [];
  const excluded = [];
  for (const [k, ov] of Object.entries(nutrientOverrides)) {
    if (!ov) continue;
    if (ov.enabled === false) {
      base[k] = 0;
      excluded.push(k);
      continue;
    }
    if (ov.multiplier != null && isFinite(+ov.multiplier)) {
      const mult = Math.max(0, +ov.multiplier) / 100;
      base[k] = (defaults[k] || 0) * mult;
      if (+ov.multiplier !== 100) overridden.push(`${k} ${+ov.multiplier}%`);
    }
  }
  if (excluded.length) notes.push(`Excluded from premix: ${excluded.join(', ')}.`);
  if (overridden.length) notes.push(`User-overridden targets: ${overridden.join(', ')}.`);

  return { base, notes, defaults };
}
