import { useState } from 'react';
import {
  SHELF_LIFE_MONTHS_OPTIONS, STORAGE_OPTIONS, VIT_A_FORM_OPTIONS,
  computeOverages, remainingFraction,
} from '../data/shelfLife.js';
import { NUTRIENT_LABELS, MINERAL_KEYS, VITAMIN_KEYS } from '../data/requirements.js';

/**
 * Commercial Shelf-Life & Overage panel.
 *
 * Lets the user tell the calculator how long the finished premix will sit
 * in storage, in what environment, and in which Vit A form. The app then
 * computes a per-nutrient overage (% above biological requirement) so the
 * premix still delivers the animal's target dose at END of shelf life.
 *
 * Users can override the computed % per nutrient — e.g. to push Vit A
 * overage higher than the suggestion, or to zero out an overage if the
 * premix is produced fresh weekly.
 *
 * All values flow into adjustReqs → calcFormulation as the `formulated`
 * target. The Requirements table shows biological vs formulated side-by-side.
 */
export function CommercialOveragePanel({
  shelfLifeConfig, setShelfLifeConfig,
  overageOverrides, setOverageOverrides,
  adjustedReqs,
}) {
  const [open, setOpen] = useState(false);
  const { months = 6, storage = 'standard', vitAForm = 'standard' } = shelfLifeConfig || {};
  const suggested = computeOverages({ months, storage, vitAForm });

  const setField = (patch) => setShelfLifeConfig({ ...(shelfLifeConfig || {}), months, storage, vitAForm, ...patch });

  const setOverride = (k, v) => {
    setOverageOverrides((prev) => {
      const next = { ...prev };
      if (v === '' || v == null) delete next[k];
      else next[k] = +v;
      return next;
    });
  };
  const resetKey = (k) => setOverageOverrides((prev) => {
    const next = { ...prev };
    delete next[k];
    return next;
  });

  // Show only the nutrients that actually have decay or a meaningful
  // analytical floor (all of them, but order them so vitamins come first).
  const keys = [...VITAMIN_KEYS, ...MINERAL_KEYS];

  const activeOverages = Object.keys(overageOverrides || {}).length;

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-sky-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="font-semibold">
          <i className="fas fa-box-archive text-sky-600 mr-2"></i>
          Commercial Shelf Life &amp; Overage
          <span className="ml-2 text-xs font-normal text-slate-500">
            {months} mo · {storage === 'tropical' ? 'Tropical' : 'Standard'} · Vit A: {vitAForm}
            {activeOverages > 0 && <span className="ml-2 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold">{activeOverages} custom</span>}
          </span>
        </h2>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-slate-400 text-xs`}></i>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-slate-500">
            Biological NRC targets assume fresh intake. A real premix loses potency in storage —
            Vit A up to 3%/mo, doubled in tropical warehouses, tripled again if co-mixed with choline chloride.
            Set shelf life and storage below; the app bumps each nutrient's <b>formulated target</b> so the
            premix still delivers the animal's requirement at the END of shelf life.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Shelf life (months)</label>
              <select value={months} onChange={(e) => setField({ months: +e.target.value })} className="w-full border rounded p-2 text-sm bg-white">
                {SHELF_LIFE_MONTHS_OPTIONS.map((m) => <option key={m} value={m}>{m} months</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Storage environment</label>
              <select value={storage} onChange={(e) => setField({ storage: e.target.value })} className="w-full border rounded p-2 text-sm bg-white">
                {STORAGE_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Vit A form</label>
              <select value={vitAForm} onChange={(e) => setField({ vitAForm: e.target.value })} className="w-full border rounded p-2 text-sm bg-white">
                {VIT_A_FORM_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase text-slate-400 font-bold border-b">
                <tr>
                  <th className="px-2 py-2 text-left">Nutrient</th>
                  <th className="px-2 py-2 text-right">Biological / kg DM</th>
                  <th className="px-2 py-2 text-right">Suggested overage</th>
                  <th className="px-2 py-2 text-right">Your overage</th>
                  <th className="px-2 py-2 text-right">Formulated / kg DM</th>
                  <th className="px-2 py-2 text-right">Expected at {months} mo</th>
                  <th className="px-2 py-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {keys.map((k) => {
                  const bio = adjustedReqs?.base?.[k] ?? 0;
                  const suggestedPct = suggested[k] ?? 0;
                  const override = overageOverrides?.[k];
                  const effPct = override != null ? +override : suggestedPct;
                  const formulated = bio * (1 + effPct / 100);
                  const remain = remainingFraction(k, { months, storage, vitAForm });
                  const expected = formulated * remain;
                  const unit = (k === 'VitA' || k === 'VitD' || k === 'VitE') ? 'IU' : 'mg';
                  const excluded = bio === 0;
                  const isCustom = override != null;
                  const pctCls = effPct >= 30 ? 'bg-amber-50 text-amber-800'
                    : effPct >= 15 ? 'bg-sky-50 text-sky-800'
                    : 'bg-white';
                  return (
                    <tr key={k} className={excluded ? 'text-slate-400' : ''}>
                      <td className="px-2 py-1.5 font-medium">
                        {NUTRIENT_LABELS[k] || k}
                        {isCustom && !excluded && <span className="ml-1 text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold">CUSTOM</span>}
                        {excluded && <span className="ml-1 text-[9px] bg-rose-100 text-rose-700 px-1 py-0.5 rounded font-bold">EXCLUDED</span>}
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono">{fmtNum(bio, 3)} <span className="text-slate-400 text-[9px]">{unit}</span></td>
                      <td className="px-2 py-1.5 text-right font-mono text-slate-500">{suggestedPct.toFixed(1)}%</td>
                      <td className="px-2 py-1.5 text-right">
                        <input
                          type="number" step="0.5" min="0" max="200"
                          disabled={excluded}
                          value={override ?? ''}
                          onChange={(e) => setOverride(k, e.target.value)}
                          placeholder={suggestedPct.toFixed(1)}
                          className={`w-16 border rounded px-1 py-0.5 text-xs text-right ${pctCls}`}
                        />
                        <span className="text-[9px] text-slate-400 ml-1">%</span>
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono font-bold text-emerald-700">
                        {fmtNum(formulated, 3)} <span className="text-slate-400 text-[9px] font-normal">{unit}</span>
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono">
                        {fmtNum(expected, 3)} <span className="text-slate-400 text-[9px]">{unit}</span>
                        {!excluded && remain < 1 && (
                          <div className="text-[9px] text-slate-400">({(remain * 100).toFixed(1)}% retained)</div>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {isCustom && (
                          <button onClick={() => resetKey(k)} className="text-[10px] text-slate-500 hover:text-rose-600 underline">reset</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-slate-400 leading-snug">
            Decay rates: Vit A 3%/mo (5× at <i>with-choline</i>, 0.5× if coated), Vit D 2%/mo,
            Vit E 0.5%/mo, Biotin 1%/mo, Se (selenite) 0.5%/mo, I (KI) 2%/mo. Minerals treated as
            analytically stable (3% floor for assay variability). Tropical storage scales decay ×1.5.
            Sources: DSM "Stability of Vitamins in Feed," Adisseo Selisseo data, NRC 2005 Mineral
            Tolerance Appendix. These are industry-consensus starting points — your QC program
            should measure actual retained potency and tune the overage table accordingly.
          </p>
        </div>
      )}
    </section>
  );
}

function fmtNum(n, d = 2) {
  if (n == null || !isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: d });
}
