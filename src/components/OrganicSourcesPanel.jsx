import { useMemo } from 'react';
import { BLENDS } from '../data/blends.js';
import { unifiedCatalog } from '../data/products.js';
import { NUTRIENT_LABELS } from '../data/requirements.js';

/**
 * Unified organic-source picker.
 *
 * Every product (single-mineral like Availa-Zn, multi-mineral blend like Availa-4,
 * custom user products) appears as one row. User ticks ✓ to include.
 *
 * Conflict rule: for every mineral there can be at most one selected product.
 * If Availa-4 (Zn/Cu/Mn/Co) is ticked, rows that also supply Zn/Cu/Mn/Co are
 * disabled with a tooltip naming the conflict.
 *
 * Per selected product the user sets:
 *   - Location: premix | ration
 *   - Mode:
 *       single-mineral: pct (% of that mineral's requirement) OR fixed_g
 *       blend:          anchor_pct (% of one anchor mineral; others come along)
 *                       OR fixed_g
 *     (location=ration forces fixed_g — "% of requirement" only makes sense
 *      when building the premix.)
 *   - Value: % (0-100) or g/head/day
 *   - Anchor mineral (for blend anchor_pct mode)
 *   - Price / kg (editable)
 */
export function OrganicSourcesPanel({
  customProducts,
  organicSelections, setOrganicSelections,
  prices, setPrices,
  fmt,
}) {
  const catalog = useMemo(() => unifiedCatalog(BLENDS, customProducts), [customProducts]);

  // Map of mineral → productId currently selected for it
  const mineralOwner = useMemo(() => {
    const o = {};
    for (const [pid, sel] of Object.entries(organicSelections)) {
      if (!sel) continue;
      const prod = catalog.find((p) => p.id === pid);
      if (!prod) continue;
      Object.keys(prod.minerals).forEach((m) => { o[m] = pid; });
    }
    return o;
  }, [organicSelections, catalog]);

  const setOne = (id, patch) => setOrganicSelections((prev) => {
    const next = { ...prev };
    if (patch === null) delete next[id];
    else next[id] = { ...(prev[id] || {}), ...patch };
    return next;
  });

  const toggleSelect = (prod) => {
    if (organicSelections[prod.id]) {
      setOne(prod.id, null);
      return;
    }
    // Establish sensible defaults for the mode
    const mineralsCovered = Object.keys(prod.minerals);
    const defaultAnchor = mineralsCovered[0];
    const defaultMode = prod.productKind === 'blend' ? 'fixed_g' : 'pct';
    const defaultValue = prod.productKind === 'blend' ? 5 : 30; // 5 g OR 30%
    setOne(prod.id, {
      location: 'premix',
      mode: defaultMode,
      value: defaultValue,
      anchorMineral: defaultAnchor,
    });
  };

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border">
      <h2 className="font-semibold border-b pb-2 mb-3 flex items-center justify-between">
        <span><i className="fas fa-leaf text-emerald-600 mr-2"></i>Organic Sources</span>
        <span className="text-xs font-normal text-slate-400">pick the organic / chelated products you want to use</span>
      </h2>
      <p className="text-xs text-slate-500 mb-3">
        Tick a product to include it. A mineral can be covered by only <b>one</b> organic source — conflicting rows
        are disabled. Blends credit every mineral they supply.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase text-slate-400 font-bold bg-slate-50 border-y">
            <tr>
              <th className="px-2 py-2 text-center w-8">Use</th>
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-left">Minerals</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2 text-left">Mode</th>
              <th className="px-3 py-2 text-right">Value</th>
              <th className="px-3 py-2 text-right">Price / kg</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {catalog.map((prod) => {
              const sel = organicSelections[prod.id];
              const selected = !!sel;
              const mineralsCovered = Object.keys(prod.minerals);
              const conflictMineral = !selected && mineralsCovered.find((m) => mineralOwner[m]);
              const conflictOwnerId = conflictMineral ? mineralOwner[conflictMineral] : null;
              const conflictOwner = conflictOwnerId ? catalog.find((p) => p.id === conflictOwnerId) : null;
              const disabled = !selected && !!conflictMineral;
              const rowCls = selected
                ? 'bg-emerald-50'
                : disabled ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50';
              const priceVal = prices[prod.id] ?? prod.price;

              return (
                <tr key={prod.id} className={rowCls}>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={disabled}
                      onChange={() => toggleSelect(prod)}
                      className="w-4 h-4 accent-emerald-600"
                      title={disabled
                        ? `Conflicts on ${NUTRIENT_LABELS[conflictMineral] || conflictMineral} with ${conflictOwner?.brand || ''} ${conflictOwner?.name || ''}`
                        : ''}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-800">
                      {prod.brand} <span className="text-slate-600">{prod.name}</span>
                      {prod.productKind === 'blend' && (
                        <span className="ml-1 text-[9px] bg-indigo-100 text-indigo-700 px-1 py-0.5 rounded font-bold">BLEND</span>
                      )}
                      {prod.custom && (
                        <span className="ml-1 text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold">CUSTOM</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {prod.type} · bioavail {prod.bioavail.toFixed(2)}×
                    </div>
                    {disabled && (
                      <div className="text-[10px] text-rose-600 mt-0.5">
                        Conflicts on {NUTRIENT_LABELS[conflictMineral] || conflictMineral} with {conflictOwner?.brand} {conflictOwner?.name}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {mineralsCovered.map((m) => (
                        <span key={m} className="text-[10px] bg-white border px-1.5 py-0.5 rounded text-slate-600">
                          {NUTRIENT_LABELS[m] || m} <b>{(prod.minerals[m] * 100).toFixed(2)}%</b>
                        </span>
                      ))}
                    </div>
                  </td>
                  {selected ? (
                    <SelectionControls
                      prod={prod}
                      sel={sel}
                      setOne={(patch) => setOne(prod.id, patch)}
                    />
                  ) : (
                    <>
                      <td className="px-3 py-2 text-slate-300 text-xs">—</td>
                      <td className="px-3 py-2 text-slate-300 text-xs">—</td>
                      <td className="px-3 py-2 text-right text-slate-300 text-xs">—</td>
                    </>
                  )}
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number" step="0.01" value={priceVal}
                      onChange={(e) => setPrices((p) => ({ ...p, [prod.id]: +e.target.value }))}
                      className="w-20 border rounded px-1 py-0.5 text-xs text-right bg-white"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">{fmt(priceVal)}</div>
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

function SelectionControls({ prod, sel, setOne }) {
  const mineralsCovered = Object.keys(prod.minerals);
  const isBlend = prod.productKind === 'blend';
  const isRation = sel.location === 'ration';

  // Ration-side forces fixed_g; premix allows pct/anchor_pct/fixed_g.
  const allowedModes = isRation
    ? ['fixed_g']
    : (isBlend ? ['anchor_pct', 'fixed_g'] : ['pct', 'fixed_g']);

  const currentMode = allowedModes.includes(sel.mode) ? sel.mode : allowedModes[0];

  const setLocation = (loc) => {
    const patch = { location: loc };
    if (loc === 'ration') patch.mode = 'fixed_g';
    setOne(patch);
  };

  const unit = currentMode === 'fixed_g' ? 'g/d' : '%';

  return (
    <>
      <td className="px-3 py-2">
        <select
          value={sel.location}
          onChange={(e) => setLocation(e.target.value)}
          className="bg-white border rounded px-2 py-1 text-xs"
        >
          <option value="premix">In premix</option>
          <option value="ration">In ration (separate)</option>
        </select>
      </td>
      <td className="px-3 py-2">
        <select
          value={currentMode}
          onChange={(e) => setOne({ mode: e.target.value })}
          className="bg-white border rounded px-2 py-1 text-xs"
        >
          {allowedModes.includes('pct') && <option value="pct">% of mineral</option>}
          {allowedModes.includes('anchor_pct') && <option value="anchor_pct">% of anchor mineral</option>}
          {allowedModes.includes('fixed_g') && <option value="fixed_g">Fixed g / head / day</option>}
        </select>
        {currentMode === 'anchor_pct' && (
          <select
            value={sel.anchorMineral || mineralsCovered[0]}
            onChange={(e) => setOne({ anchorMineral: e.target.value })}
            className="ml-1 bg-white border rounded px-2 py-1 text-xs"
          >
            {mineralsCovered.map((m) => (
              <option key={m} value={m}>anchor: {NUTRIENT_LABELS[m] || m}</option>
            ))}
          </select>
        )}
      </td>
      <td className="px-3 py-2 text-right">
        <div className="inline-flex items-center gap-1">
          <input
            type="number" min="0" step={currentMode === 'fixed_g' ? 0.1 : 1}
            value={sel.value}
            onChange={(e) => setOne({ value: +e.target.value })}
            className="w-20 border rounded px-1 py-0.5 text-xs text-right bg-white font-bold text-emerald-700"
          />
          <span className="text-[10px] text-slate-500">{unit}</span>
        </div>
      </td>
    </>
  );
}
