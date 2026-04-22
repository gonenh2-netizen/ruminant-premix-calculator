/**
 * Apply species/stage-specific adjustments to baseline NRC/NASEM requirements.
 * Factors: milk yield, breed, beef quality toggles, tropical-breed climate.
 *
 * Inputs: base = REQS[species].stages[stage] (object of nutrient → mg/IU per kg DM)
 * Returns: { base: adjusted requirements, notes: array of human-readable change explanations }
 */

export function adjustReqs({ REQS, species, stage, breed, milkYield, marbling, colorFocus, shelfLife }) {
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

  // Beef meat-quality adjustments
  base.Cr = 0;
  if (species === 'Beef') {
    if (marbling) {
      if (stage === 'Finishing' || stage === 'Backgrounding') {
        base.VitA = Math.round(base.VitA * 0.50);
        base.Cr = 0.5;
        base.Biotin = 0.20;
        notes.push('Marbling ON: Vit A restricted to ~50% (promotes IMF during finishing). Cr + biotin added.');
      }
      if (stage === 'Calf (Preweaning)' || stage === 'Growing / Stocker') {
        base.VitA = Math.round(base.VitA * 1.80);
        notes.push('Marbling ON (early-life): Vit A boosted ~80% to seed intramuscular adipocytes.');
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
      base.Cu = Math.min(base.Cu, 10);
      notes.push('Shelf life ON: Vit E ≥200 IU/kg DM, Se 0.30. Fe/Cu capped to slow lipid oxidation.');
    }
  }

  return { base, notes };
}
