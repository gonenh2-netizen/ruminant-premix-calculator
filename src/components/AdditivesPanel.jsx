import { useState, useMemo } from 'react';
import { ADDITIVES, ADDITIVE_CATEGORIES } from '../data/additives.js';

/**
 * Feed Additives catalog panel.
 *
 * Grouped by ADDITIVE_CATEGORIES. Each row is one additive with:
 *   - Product info + brand + tooltip (mode-of-action note)
 *   - g/head/day input (empty = not included; placeholder = typicalDose)
 *   - Price / kg (editable via shared `prices` map)
 *   - Species + stage applicability (greyed out when not applicable)
 *
 * Any additive with a positive dose flows into calcFormulation as an
 * ingredient with category='Additive' (dose × price adds to premix cost).
 */
export function AdditivesPanel({
  species, stage,
  additiveDose, setAdditiveDose,
  prices, setPrices,
  fmt,
}) {
  // Group additives by category and keep them in display order
  const grouped = useMemo(() => {
    const out = {};
    for (const cat of ADDITIVE_CATEGORIES) out[cat] = [];
    for (const a of ADDITIVES) {
      if (!out[a.category]) out[a.category] = [];
      out[a.category].push(a);
    }
    return out;
  }, []);

  // Show all categories open by default — users were missing the additive
  // rows because the collapsed-header UX wasn't obvious. A "Collapse all"
  // link lets them tidy up once they've found what they need.
  const [openCats, setOpenCats] = useState(() => {
    const initial = {};
    ADDITIVE_CATEGORIES.forEach((c) => { initial[c] = true; });
    return initial;
  });
  const collapseAll = () => {
    const next = {};
    ADDITIVE_CATEGORIES.forEach((c) => { next[c] = false; });
    setOpenCats(next);
  };
  const expandAll = () => {
    const next = {};
    ADDITIVE_CATEGORIES.forEach((c) => { next[c] = true; });
    setOpenCats(next);
  };

  const toggleCat = (cat) => setOpenCats((o) => ({ ...o, [cat]: !o[cat] }));

  const setDose = (id, val) => {
    setAdditiveDose((prev) => {
      const next = { ...prev };
      if (!val || +val <= 0) delete next[id];
      else next[id] = +val;
      return next;
    });
  };

  const activeCount = Object.values(additiveDose || {}).filter((v) => v > 0).length;

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border">
      <h2 className="font-semibold border-b pb-2 mb-3 flex items-center justify-between">
        <span><i className="fas fa-vial text-purple-600 mr-2"></i>Feed Additives</span>
        <span className="flex items-center gap-2">
          <span className="text-xs font-normal text-slate-400">
            {activeCount > 0 ? `${activeCount} additive${activeCount > 1 ? 's' : ''} in premix` : 'enter g/hd/d to include'}
          </span>
          <button type="button" onClick={expandAll} className="text-[10px] text-emerald-700 hover:underline font-bold">Expand all</button>
          <span className="text-[10px] text-slate-300">|</span>
          <button type="button" onClick={collapseAll} className="text-[10px] text-slate-500 hover:underline font-bold">Collapse all</button>
        </span>
      </h2>
      <p className="text-xs text-slate-500 mb-3">
        Click a category to expand. Set g/head/day to include — dose × price feeds into total premix cost.
        Items that don't apply to <b>{species}</b> / <b>{stage}</b> are dimmed.
      </p>

      <div className="space-y-2">
        {ADDITIVE_CATEGORIES.map((cat) => {
          const items = grouped[cat] || [];
          if (items.length === 0) return null;
          const open = !!openCats[cat];
          const included = items.filter((a) => (additiveDose[a.id] || 0) > 0).length;
          return (
            <div key={cat} className="border rounded-lg">
              <button
                type="button"
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-t-lg text-left"
              >
                <span className="font-bold text-sm text-slate-800">
                  <i className={`fas fa-chevron-${open ? 'down' : 'right'} text-slate-400 text-xs mr-2`}></i>
                  {cat}
                  <span className="text-[10px] text-slate-500 font-normal ml-2">({items.length})</span>
                  {included > 0 && (
                    <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                      {included} in premix
                    </span>
                  )}
                </span>
              </button>
              {open && (
                <div className="divide-y">
                  {items.map((a) => {
                    const appliesSpecies = a.species.includes(species);
                    const appliesStage = a.stages === 'all' || a.stages.includes(stage);
                    const applies = appliesSpecies && appliesStage;
                    const dose = additiveDose[a.id] ?? '';
                    const included = +dose > 0;
                    const price = prices[a.id] ?? a.price;
                    const costPerDay = (+dose || 0) * price / 1000;

                    const overLimit = included && a.maxDose != null && +dose > a.maxDose;

                    return (
                      <div key={a.id} className={`px-3 py-2 ${overLimit ? 'bg-rose-50' : included ? 'bg-emerald-50/60' : ''} ${!applies ? 'opacity-40' : ''}`}>
                        <div className="grid grid-cols-12 gap-2 items-start">
                          <div className="col-span-12 md:col-span-5">
                            <div className="font-medium text-sm text-slate-800">
                              {a.name}
                              {included && !overLimit && <span className="ml-1 text-[9px] bg-emerald-600 text-white px-1 py-0.5 rounded font-bold">IN PREMIX</span>}
                              {overLimit && <span className="ml-1 text-[9px] bg-rose-600 text-white px-1 py-0.5 rounded font-bold animate-pulse">⚠ OVER MAX</span>}
                              {a.regulatoryNote && <span className="ml-1 text-[9px] bg-rose-100 text-rose-700 px-1 py-0.5 rounded font-bold" title={a.regulatoryNote}>⚠ REG</span>}
                              {!applies && <span className="ml-1 text-[9px] bg-slate-200 text-slate-600 px-1 py-0.5 rounded">N/A</span>}
                            </div>
                            <div className="text-[10px] text-slate-500">{a.brand}</div>
                            <div className="text-[10px] text-slate-500 italic">{a.note}</div>
                            {overLimit && (
                              <div className="text-[10px] text-rose-700 font-bold mt-1 leading-snug">
                                {a.maxDoseNote || `Exceeds safety ceiling of ${a.maxDose} g/hd/d.`}
                              </div>
                            )}
                          </div>
                          <div className="col-span-6 md:col-span-3">
                            <label className="block text-[10px] font-bold uppercase text-slate-500">Dose (g/hd/d)</label>
                            <input
                              type="number" step="0.1" min="0"
                              value={dose}
                              onChange={(e) => setDose(a.id, e.target.value)}
                              placeholder={`${a.typicalDose}`}
                              className={`w-full border rounded px-2 py-1 text-sm text-right ${overLimit ? 'bg-rose-100 text-rose-800 border-rose-500 font-bold' : included ? 'bg-white font-bold text-emerald-700' : 'bg-slate-50 text-slate-600'}`}
                              title={overLimit ? `Exceeds max ${a.maxDose} g/hd/d` : `Typical ${a.doseRange}`}
                            />
                            <div className="text-[9px] text-slate-400 mt-0.5">{a.doseRange}</div>
                            {a.maxDose != null && (
                              <div className={`text-[9px] mt-0.5 font-bold ${overLimit ? 'text-rose-700' : 'text-slate-500'}`}>
                                Max {a.maxDose} g/hd/d
                              </div>
                            )}
                          </div>
                          <div className="col-span-6 md:col-span-2">
                            <label className="block text-[10px] font-bold uppercase text-slate-500">Price / kg</label>
                            <input
                              type="number" step="0.01" min="0"
                              value={price}
                              onChange={(e) => setPrices((p) => ({ ...p, [a.id]: +e.target.value }))}
                              className="w-full border rounded px-2 py-1 text-sm text-right bg-white"
                            />
                            <div className="text-[9px] text-slate-500 mt-0.5">{fmt(price)}</div>
                          </div>
                          <div className="col-span-12 md:col-span-2">
                            <label className="block text-[10px] font-bold uppercase text-slate-500">Cost/hd/d</label>
                            <div className={`text-sm font-bold ${included ? 'text-emerald-700' : 'text-slate-400'}`}>
                              {included ? fmt(costPerDay, 4) : '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
