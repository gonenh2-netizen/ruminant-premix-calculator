import { DRY_COW_STRATEGIES } from '../data/additives.js';

/**
 * Dry-Cow Milk-Fever Strategy selector.
 *
 * Visible only when species='Dairy' AND stage ∈ {'Close-up Dry', 'Far-off Dry'}.
 * The parent App decides visibility; this component just renders the picker.
 *
 * Sub-parameters per strategy:
 *   - dcad:    DCAD target slider -200 … -50 mEq/kg DM (default -100)
 *   - pbinder: X-Zelit dose input 300 … 600 g/hd/d (default 400)
 *   - lowCa:   cap buttons 30 / 50 / 70 g/hd/d
 *
 * Side effects that live in App.jsx (not here):
 *   - When strategy='pbinder', additiveDose.xzelit auto-syncs to xzelitDose.
 *   - When strategy='dcad' or 'pbinder', Vit D3 is bumped to ≥1500 IU/kg DM in adjustReqs.
 *   - Each strategy appends a tailored note to adjustedReqs.notes.
 */
export function DryCowStrategyPanel({
  dryCowStrategy, setDryCowStrategy,
  dcadTarget, setDcadTarget,
  maxCaGPerDay, setMaxCaGPerDay,
  xzelitDose, setXzelitDose,
}) {
  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-amber-200">
      <h2 className="font-semibold border-b pb-2 mb-3 flex items-center justify-between">
        <span><i className="fas fa-cow text-amber-600 mr-2"></i>Dry-Cow Milk-Fever Strategy</span>
        <span className="text-xs font-normal text-slate-400">close-up / far-off dry only</span>
      </h2>
      <p className="text-xs text-slate-500 mb-3">
        Pick the hypocalcemia-prevention approach. The selection adjusts premix targets
        (Vit D3 bump for DCAD / P-binder) and drops a tailored note into Applied Adjustments.
        With <b>P-binder</b> selected the X-Zelit additive dose auto-populates.
      </p>

      <div className="space-y-2">
        {DRY_COW_STRATEGIES.map((s) => {
          const active = dryCowStrategy === s.id;
          return (
            <label
              key={s.id}
              className={`block border rounded-lg p-3 cursor-pointer transition ${active ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <div className="flex items-start gap-2">
                <input
                  type="radio"
                  name="dry-cow-strategy"
                  value={s.id}
                  checked={active}
                  onChange={() => setDryCowStrategy(s.id)}
                  className="mt-0.5 accent-amber-600"
                />
                <div className="flex-1">
                  <div className="font-semibold text-sm text-slate-800">{s.label}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{s.desc}</div>

                  {active && s.id === 'dcad' && (
                    <div className="mt-2 pl-2 border-l-2 border-amber-300">
                      <label className="block text-[10px] font-bold uppercase text-slate-500">
                        DCAD target: <span className="text-amber-700 font-black">{dcadTarget} mEq/kg DM</span>
                      </label>
                      <input
                        type="range" min="-200" max="-50" step="5" value={dcadTarget}
                        onChange={(e) => setDcadTarget(+e.target.value)}
                        className="w-full accent-amber-600"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400">
                        <span>−200 (aggressive)</span>
                        <span>−100 (standard)</span>
                        <span>−50 (mild)</span>
                      </div>
                    </div>
                  )}

                  {active && s.id === 'pbinder' && (
                    <div className="mt-2 pl-2 border-l-2 border-amber-300">
                      <label className="block text-[10px] font-bold uppercase text-slate-500">
                        X-Zelit dose (g / hd / d)
                      </label>
                      <input
                        type="number" min="300" max="600" step="10" value={xzelitDose}
                        onChange={(e) => setXzelitDose(+e.target.value)}
                        className="w-24 border rounded px-2 py-1 text-sm text-right bg-white font-bold text-amber-700"
                      />
                      <div className="text-[10px] text-slate-500 mt-1">
                        Typical 350–500 g/hd/d for the last 14–21 days pre-calving.
                        Auto-populated to the X-Zelit additive row.
                      </div>
                    </div>
                  )}

                  {active && s.id === 'lowCa' && (
                    <div className="mt-2 pl-2 border-l-2 border-amber-300">
                      <label className="block text-[10px] font-bold uppercase text-slate-500">
                        Max dietary Ca (g / hd / d)
                      </label>
                      <div className="flex gap-2 mt-1">
                        {[30, 50, 70].map((v) => (
                          <button
                            key={v} type="button"
                            onClick={() => setMaxCaGPerDay(v)}
                            className={`px-3 py-1 text-sm rounded border font-bold ${maxCaGPerDay === v ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                          >
                            {v} g
                          </button>
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Hard to achieve with alfalfa-based forage. Best paired with cereal straws or corn silage.
                      </div>
                    </div>
                  )}

                  {active && s.id === 'lowP' && (
                    <div className="mt-2 pl-2 border-l-2 border-amber-300 text-[11px] text-slate-600">
                      Target dietary P ~30 g/hd/d. No specific additive — manage through forage choice (low-P corn silage,
                      minimise P-rich concentrates like DDGS/brewers grains).
                    </div>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
