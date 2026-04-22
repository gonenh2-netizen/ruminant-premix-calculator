import { MINERAL_KEYS, NUTRIENT_LABELS } from '../data/requirements.js';
import { inorganicFor } from '../data/products.js';

/**
 * Per-mineral inorganic source picker.
 * The inorganic source fills whatever part of each mineral requirement is not
 * already covered by the chosen organic sources (ration-side + premix-side).
 */
export function InorganicSourcesPanel({
  customProducts,
  inorgSrc, setInorgSrc,
  prices, setPrices,
  fmt,
}) {
  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border">
      <h2 className="font-semibold border-b pb-2 mb-3 flex items-center justify-between">
        <span><i className="fas fa-gears text-slate-600 mr-2"></i>Inorganic Sources</span>
        <span className="text-xs font-normal text-slate-400">fills the remaining requirement per mineral</span>
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase text-slate-400 font-bold bg-slate-50 border-y">
            <tr>
              <th className="px-3 py-2 text-left">Mineral</th>
              <th className="px-3 py-2 text-left">Inorganic product</th>
              <th className="px-3 py-2 text-left">Chemistry</th>
              <th className="px-3 py-2 text-right">Purity</th>
              <th className="px-3 py-2 text-right">Price / kg</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {MINERAL_KEYS.map((m) => {
              const options = inorganicFor(m, customProducts);
              const current = options.find((p) => p.id === inorgSrc[m]);
              const price = prices[inorgSrc[m]] ?? current?.price ?? 0;
              return (
                <tr key={m}>
                  <td className="px-3 py-2 font-medium">{NUTRIENT_LABELS[m]}</td>
                  <td className="px-3 py-2">
                    <select
                      value={inorgSrc[m] || ''}
                      onChange={(e) => setInorgSrc((s) => ({ ...s, [m]: e.target.value }))}
                      className="bg-white border rounded px-2 py-1 text-xs w-full"
                    >
                      <option value="">— none —</option>
                      {options.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.custom ? '★ ' : ''}{p.brand} · {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-[10px] text-slate-500">
                    {current?.type || '—'}
                  </td>
                  <td className="px-3 py-2 text-right text-xs text-slate-600">
                    {current ? `${(current.purity * 100).toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {current ? (
                      <>
                        <input
                          type="number" step="0.01" value={price}
                          onChange={(e) => setPrices((p) => ({ ...p, [inorgSrc[m]]: +e.target.value }))}
                          className="w-20 border rounded px-1 py-0.5 text-xs text-right bg-white"
                        />
                        <div className="text-[10px] text-slate-500 mt-0.5">{fmt(price)}</div>
                      </>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
