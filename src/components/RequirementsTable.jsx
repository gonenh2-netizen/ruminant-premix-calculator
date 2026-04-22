import { MINERAL_KEYS, VITAMIN_KEYS } from '../data/requirements.js';

/**
 * Editable daily nutrient requirement table.
 *
 * Each row shows:
 *   - "Use" checkbox (exclude a nutrient from the premix)
 *   - Editable per-kg-DM target (override above or below the NRC baseline)
 *   - NRC / adjusted default as a hint (and a Reset button when overridden)
 *   - Daily total recomputed from the current value × DMI
 *
 * When a nutrient is excluded it is set to 0 mg/d everywhere downstream —
 * no inorganic fill, no vitamin source, no premix cost line.
 */
export function RequirementsTable({ calc, dmi, adjustedReqs, nutrientOverrides, setNutrientOverrides }) {
  // Render rows in a fixed order so the user can enable nutrients that currently read 0.
  const orderedKeys = [...MINERAL_KEYS, ...VITAMIN_KEYS];
  const hasCr = (adjustedReqs?.defaults?.Cr || 0) > 0 || (nutrientOverrides?.Cr && nutrientOverrides.Cr.enabled !== false);
  if (hasCr) orderedKeys.push('Cr');

  const defaults = adjustedReqs?.defaults || {};
  const summaryByKey = Object.fromEntries((calc?.summary || []).map((s) => [s.key, s]));

  const unitFor = (k) => {
    if (summaryByKey[k]) return summaryByKey[k].unit;
    if (MINERAL_KEYS.includes(k) || k === 'Cr' || k === 'Biotin') return 'mg';
    return 'IU';
  };
  const labelFor = (k) => (summaryByKey[k]?.label) || k;

  const setOverride = (key, patch) => {
    setNutrientOverrides((prev) => {
      const next = { ...prev };
      const existing = prev[key] || { enabled: true, value: null };
      const merged = { ...existing, ...patch };
      // If merged is a no-op relative to "no override", drop the entry.
      if (merged.enabled !== false && (merged.value == null || merged.value === '' || +merged.value === defaults[key])) {
        delete next[key];
      } else {
        next[key] = merged;
      }
      return next;
    });
  };

  const resetKey = (key) => setNutrientOverrides((prev) => {
    const next = { ...prev };
    delete next[key];
    return next;
  });

  return (
    <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
      <div className="bg-slate-50 px-5 py-3 border-b">
        <h3 className="font-bold text-slate-800">Daily Nutrient Requirements</h3>
        <p className="text-xs text-slate-500">
          Per animal at {dmi} kg DMI — tick to include, edit to override above / below the NRC baseline.
          {adjustedReqs.notes.length > 0 && <span className="text-blue-600"> · {adjustedReqs.notes.length} adjustment(s) applied</span>}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase text-slate-400 font-bold border-b">
            <tr>
              <th className="px-3 py-2 text-center w-10">Use</th>
              <th className="px-3 py-2 text-left">Nutrient</th>
              <th className="px-3 py-2 text-right">Per kg DM</th>
              <th className="px-3 py-2 text-left">Default</th>
              <th className="px-3 py-2 text-right text-blue-600">Daily total</th>
              <th className="px-3 py-2 text-center w-14"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orderedKeys.map((k) => {
              const ov = nutrientOverrides[k];
              const enabled = !ov || ov.enabled !== false;
              const defaultVal = defaults[k] ?? 0;
              const currentVal = ov && ov.value != null ? +ov.value : defaultVal;
              const daily = enabled ? currentVal * dmi : 0;
              const unit = unitFor(k);
              const isOverridden = !!ov && (ov.enabled === false || (ov.value != null && +ov.value !== defaultVal));

              return (
                <tr key={k} className={enabled ? '' : 'bg-slate-50 text-slate-400'}>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setOverride(k, { enabled: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600"
                      title={enabled ? 'Click to exclude from premix' : 'Click to include'}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span className={`font-medium ${enabled ? 'text-slate-800' : 'line-through'}`}>{labelFor(k)}</span>
                    {!enabled && <span className="ml-2 text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">EXCLUDED</span>}
                    {isOverridden && enabled && <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">CUSTOM</span>}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="number" step="0.01" min="0"
                        disabled={!enabled}
                        value={enabled ? currentVal : defaultVal}
                        onChange={(e) => setOverride(k, { value: +e.target.value, enabled: true })}
                        className={`w-24 border rounded px-1 py-0.5 text-xs text-right ${enabled ? 'bg-white' : 'bg-slate-100 text-slate-400'}`}
                      />
                      <span className="text-[10px] text-slate-500">{unit}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-left text-[10px] text-slate-500">
                    NRC {fmtNum(defaultVal)} {unit}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-blue-600">
                    {fmtNum(daily, 2)}
                    <span className="text-[10px] font-normal text-blue-400 ml-1">{unit}/d</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {isOverridden && (
                      <button
                        onClick={() => resetKey(k)}
                        className="text-[10px] text-slate-500 hover:text-rose-600 underline"
                        title="Reset to NRC default"
                      >
                        reset
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {adjustedReqs.notes.length > 0 && (
        <div className="bg-blue-50 border-t p-3 text-xs">
          <div className="font-bold text-blue-800 mb-1">Applied adjustments</div>
          <ul className="text-blue-700 list-disc list-inside space-y-0.5">
            {adjustedReqs.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function fmtNum(n, d = 2) {
  if (n == null || !isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: d });
}
