import { NUTRIENT_LABELS } from '../data/requirements.js';

const categoryStyle = {
  Organic:   'bg-emerald-100 text-emerald-800',
  Inorganic: 'bg-slate-100 text-slate-700',
  Blend:     'bg-indigo-100 text-indigo-800',
  Vitamin:   'bg-amber-100 text-amber-800',
  Carrier:   'bg-slate-100 text-slate-500',
};

export function FormulaTable({ calc, dose, batchKg, fmt, setPrices }) {
  const scale = batchKg * 1000 / dose;   // doses per batch
  return (
    <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-5 py-3 border-b flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800">Batch Formula</h3>
          <p className="text-xs text-slate-500">{dose} g / dose · {batchKg.toLocaleString()} kg batch · {scale.toLocaleString()} doses</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase text-slate-400 font-bold border-b bg-slate-50/50">
            <tr>
              <th className="px-4 py-2 text-left">Ingredient</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-right">g / dose</th>
              <th className="px-4 py-2 text-right">kg / ton</th>
              <th className="px-4 py-2 text-right">kg / batch</th>
              <th className="px-4 py-2 text-right">Price / kg</th>
              <th className="px-4 py-2 text-right">Cost / ton</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {calc.ingredients.map((ing) => {
              const kgPerBatch = ing.perTonKg * (batchKg / 1000);
              const costPerTon = ing.pricePerKg * ing.perTonKg;
              return (
                <tr key={ing.key} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <div className="font-medium text-slate-800">
                      {ing.name}
                      {ing.custom && <span className="ml-1 text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold">CUSTOM</span>}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {ing.brand}{ing.nutrient && ing.nutrient !== '-' ? ` · ${NUTRIENT_LABELS[ing.nutrient] || ing.nutrient}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${categoryStyle[ing.category] || 'bg-slate-100'}`}>
                      {ing.category}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs">{fmtNum(ing.perDoseG, 3)}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs">{fmtNum(ing.perTonKg, 3)}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-slate-500">{fmtNum(kgPerBatch, 3)}</td>
                  <td className="px-4 py-2 text-right">
                    {setPrices && ing.category !== 'Carrier' ? (
                      <input
                        type="number" step="0.01" value={ing.pricePerKg}
                        onChange={(e) => setPrices((p) => ({ ...p, [ing.key.replace(/_auto$/, '')]: +e.target.value }))}
                        className="w-20 border rounded px-1 py-0.5 text-xs text-right bg-white"
                      />
                    ) : (
                      <span className="text-xs text-slate-500">{fmt(ing.pricePerKg)}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-emerald-700">{fmt(costPerTon)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 text-white">
              <td colSpan={3} className="px-4 py-3 font-bold">TOTAL</td>
              <td className="px-4 py-3 text-right font-mono">{fmtNum(dose, 2)} g</td>
              <td className="px-4 py-3 text-right font-mono">1,000 kg</td>
              <td className="px-4 py-3 text-right font-mono text-slate-300">{batchKg.toLocaleString()} kg</td>
              <td className="px-4 py-3 text-right font-bold text-emerald-400">{fmt(calc.totalCostPerTon)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function fmtNum(n, d = 2) {
  if (!isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: d });
}
