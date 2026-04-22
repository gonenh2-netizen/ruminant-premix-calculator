import { downloadBlob, safeName } from './exportHelpers.js';

/**
 * Generic formulation report CSV — full ingredient breakdown for the batch.
 */
export function exportFormulationCSV({ calc, species, stage, breed, dmi, dose, batchKg, currency }) {
  const rows = [
    ['Ruminant Premix Calculator — Formulation Report'],
    ['Species', species],
    ['Breed', breed],
    ['Stage', stage],
    ['DMI (kg/d)', dmi],
    ['Dose (g/d)', dose],
    ['Batch size (kg)', batchKg],
    ['Currency', currency],
    ['Generated', new Date().toISOString()],
    [],
    ['Daily Nutrient Requirements'],
    ['Nutrient', 'Per kg DM', 'Daily Total', 'Unit'],
    ...calc.summary.map((s) => [s.label, s.reqPerKgDm, s.dailyTotal.toFixed(3), s.unit]),
    [],
    ['Batch Formula'],
    ['Ingredient', 'Brand', 'Nutrient', 'Type', 'Category', 'g/dose', 'kg/ton', 'kg/batch', 'Price/kg', 'Cost/ton'],
    ...calc.ingredients.map((ing) => [
      ing.name, ing.brand, ing.nutrient, ing.type, ing.category,
      ing.perDoseG.toFixed(4),
      ing.perTonKg.toFixed(4),
      (ing.perTonKg * (batchKg / 1000)).toFixed(4),
      ing.pricePerKg.toFixed(4),
      (ing.pricePerKg * ing.perTonKg).toFixed(2),
    ]),
    [],
    ['TOTAL cost per ton (USD)', calc.totalCostPerTon.toFixed(2)],
    ['TOTAL cost per dose (USD)', calc.totalCostPerDose.toFixed(4)],
    ...(calc.warnings.length ? [[], ['Warnings'], ...calc.warnings.map((w) => [w])] : []),
  ];
  const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n');
  downloadBlob(csv, 'text/csv', `Premix_${safeName(species)}_${safeName(stage)}.csv`);
}

function csvCell(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
