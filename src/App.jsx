import { useState, useMemo, useEffect } from 'react';
import { REQS, MINERAL_KEYS, NUTRIENT_LABELS } from './data/requirements.js';
import { PRODUCTS } from './data/products.js';
import { BLENDS } from './data/blends.js';
import { VITAMIN_SOURCES, CARRIERS, CURRENCIES, BIOAVAIL_TIERS } from './data/misc.js';
import { adjustReqs } from './logic/adjustReqs.js';
import { calcFormulation } from './logic/calcFormulation.js';

/**
 * Minimal working skeleton.
 * Claude Code: the full UI (per-mineral dropdowns, blend panel, custom-product modal,
 * bioavail guide, Rationall & AMTS exports) is specified in CLAUDE.md.
 * Port the feature set from the legacy single-file HTML into the components listed
 * in CLAUDE.md's "Target file layout" section.
 */

const CUSTOM_STORAGE_KEY = 'premix_calculator_custom_products_v1';

export default function App() {
  const [species, setSpecies] = useState('Dairy');
  const [breed, setBreed] = useState('Holstein');
  const [stage, setStage] = useState('Fresh / Early Lactation');
  const [dmi, setDmi] = useState(24);
  const [dose, setDose] = useState(100);
  const [milkYield, setMilkYield] = useState(35);
  const [carrier, setCarrier] = useState('limestone');
  const [currency, setCurrency] = useState('USD');
  const [marbling, setMarbling] = useState(false);
  const [colorFocus, setColorFocus] = useState(false);
  const [shelfLife, setShelfLife] = useState(false);
  const [organicPct, setOrganicPct] = useState({ Zn: 30, Cu: 30, Mn: 20, Co: 100, Se: 100, I: 0, Fe: 0 });
  const [orgSrc, setOrgSrc] = useState({ Zn: 'availa_zn', Cu: 'availa_cu', Mn: 'availa_mn', Co: 'co_gluco', Se: 'selplex', I: 'eddi', Fe: 'fe_gly' });
  const [inorgSrc, setInorgSrc] = useState({ Zn: 'zn_sulfate', Cu: 'cu_sulfate', Mn: 'mn_sulfate', Co: 'co_carb', Se: 'se_selenite', I: 'ki', Fe: 'fe_sulfate' });
  const [blendRates, setBlendRates] = useState({});
  const [prices, setPrices] = useState(() => {
    const p = {};
    for (const m in PRODUCTS) PRODUCTS[m].forEach((prod) => { p[prod.id] = prod.price; });
    BLENDS.forEach((b) => { p[b.id] = b.price; });
    for (const v in VITAMIN_SOURCES) p[v] = VITAMIN_SOURCES[v].price;
    CARRIERS.forEach((c) => { p[c.id] = c.price; });
    return p;
  });

  // localStorage-backed custom products (Claude Code: surface in UI via a modal + list)
  const [customProducts, setCustomProducts] = useState([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
      if (raw) setCustomProducts(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(customProducts)); } catch {}
  }, [customProducts]);

  // Reset stage/breed when species changes
  useEffect(() => {
    const stages = Object.keys(REQS[species].stages);
    if (!stages.includes(stage)) setStage(stages[0]);
    const breeds = REQS[species].breeds;
    if (!breeds.includes(breed)) setBreed(breeds[0]);
  }, [species]);  // eslint-disable-line react-hooks/exhaustive-deps

  const adjustedReqs = useMemo(
    () => adjustReqs({ REQS, species, stage, breed, milkYield, marbling, colorFocus, shelfLife }),
    [species, stage, breed, milkYield, marbling, colorFocus, shelfLife],
  );

  const calc = useMemo(
    () => calcFormulation({
      adjustedReqs, dmi, dose, organicPct, orgSrc, inorgSrc, blendRates, prices, carrier,
      PRODUCTS, BLENDS, VITAMIN_SOURCES, CARRIERS,
    }),
    [adjustedReqs, dmi, dose, organicPct, orgSrc, inorgSrc, blendRates, prices, carrier],
  );

  const c = CURRENCIES[currency];
  const fmt = (usd, decimals = 2) => `${c.symbol}${(usd * c.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: decimals })}`;

  const sp = REQS[species];
  const stages = Object.keys(sp.stages);

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            <i className="fas fa-flask-vial text-emerald-600 mr-2"></i>
            Ruminant Vitamin &amp; Mineral Premix Calculator
          </h1>
          <p className="text-sm text-slate-500 mt-1">Dairy · Beef · Goats · Sheep — Vite/React skeleton</p>
        </div>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-white border rounded-lg px-3 py-2">
          {Object.entries(CURRENCIES).map(([k, v]) => <option key={k} value={k}>{v.symbol} {k}</option>)}
        </select>
      </header>

      <div className="bg-white rounded-xl p-2 flex gap-1 mb-5 shadow-sm border">
        {Object.keys(REQS).map((s) => (
          <button
            key={s}
            onClick={() => setSpecies(s)}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm ${species === s ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <section className="bg-white rounded-xl p-5 shadow-sm border space-y-3">
          <h2 className="font-semibold border-b pb-2">Animal Profile</h2>
          <label className="block text-xs font-bold text-slate-500 uppercase">Breed</label>
          <select value={breed} onChange={(e) => setBreed(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2 text-sm">
            {sp.breeds.map((b) => <option key={b}>{b}</option>)}
          </select>
          <label className="block text-xs font-bold text-slate-500 uppercase">Stage</label>
          <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2 text-sm">
            {stages.map((s) => <option key={s}>{s}</option>)}
          </select>
          {sp.hasMilkYield && stage.toLowerCase().includes('lactation') && (
            <>
              <label className="block text-xs font-bold text-slate-500 uppercase">Milk Yield (kg/d)</label>
              <input type="number" step="0.1" value={milkYield} onChange={(e) => setMilkYield(+e.target.value)}
                     className="w-full bg-emerald-50 border border-emerald-200 rounded-lg p-2 font-bold text-emerald-700" />
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">DMI kg/d</label>
              <input type="number" step="0.1" value={dmi} onChange={(e) => setDmi(+e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Dose g/d</label>
              <input type="number" value={dose} onChange={(e) => setDose(+e.target.value)} className="w-full bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-sm font-bold text-emerald-700" />
            </div>
          </div>
          {species === 'Beef' && (
            <div className="pt-3 border-t space-y-2 text-sm">
              <div className="font-semibold text-rose-700">Meat Quality Targets</div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={marbling} onChange={(e) => setMarbling(e.target.checked)} /> Marbling (IMF)</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={colorFocus} onChange={(e) => setColorFocus(e.target.checked)} /> Bright red color</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={shelfLife} onChange={(e) => setShelfLife(e.target.checked)} /> Extended shelf life</label>
            </div>
          )}
        </section>

        <section className="md:col-span-2 space-y-5">
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Final premix cost</p>
            <div className="text-3xl font-black text-emerald-400 mt-1">{fmt(calc.totalCostPerTon)}</div>
            <div className="text-xs text-slate-400 uppercase">per ton · {fmt(calc.totalCostPerDose, 4)} per {dose}g dose</div>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-5 py-3 border-b">
              <h3 className="font-bold text-slate-800">Daily Nutrient Requirements</h3>
              <p className="text-xs text-slate-500">Per animal at {dmi} kg DMI · {adjustedReqs.notes.length > 0 && <span className="text-blue-600">{adjustedReqs.notes.length} adjustment(s) applied</span>}</p>
            </div>
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase text-slate-400 font-bold border-b">
                <tr><th className="px-5 py-2 text-left">Nutrient</th><th className="px-5 py-2 text-right">Per kg DM</th><th className="px-5 py-2 text-right text-blue-600">Daily</th></tr>
              </thead>
              <tbody className="divide-y">
                {calc.summary.map((s) => (
                  <tr key={s.key}>
                    <td className="px-5 py-2 font-medium">{s.label}</td>
                    <td className="px-5 py-2 text-right text-slate-500">{s.reqPerKgDm} <span className="text-[10px]">{s.unit}</span></td>
                    <td className="px-5 py-2 text-right font-bold text-blue-600">{s.dailyTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-[10px] font-normal text-blue-400">{s.unit}/d</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {adjustedReqs.notes.length > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg text-sm">
              <div className="font-bold text-blue-800 mb-1">Applied adjustments</div>
              <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                {adjustedReqs.notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}
        </section>
      </div>

      <footer className="mt-8 text-center text-xs text-slate-400">
        Skeleton build — port the full UI from the legacy HTML per CLAUDE.md. Custom products stored in localStorage key <code>{CUSTOM_STORAGE_KEY}</code>.
      </footer>
    </div>
  );
}
