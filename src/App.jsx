import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS } from './i18n.js';
import { useAuth } from './hooks/useAuth.js';
import { CLOUD_ENABLED } from './firebase.js';
import { AuthModal } from './components/AuthModal.jsx';
import { REQS } from './data/requirements.js';
import { PRODUCTS } from './data/products.js';
import { BLENDS } from './data/blends.js';
import { VITAMIN_SOURCES, CARRIERS, CURRENCIES } from './data/misc.js';
import { ADDITIVES } from './data/additives.js';
import { adjustReqs } from './logic/adjustReqs.js';
import { calcFormulation } from './logic/calcFormulation.js';
import { useCustomProducts, useSavedFormulations } from './hooks/useCustomProducts.js';

import { OrganicSourcesPanel } from './components/OrganicSourcesPanel.jsx';
import { InorganicSourcesPanel } from './components/InorganicSourcesPanel.jsx';
import { MineralDeliveryTable } from './components/MineralDeliveryTable.jsx';
import { PrintableReport } from './components/PrintableReport.jsx';
import { RequirementsTable } from './components/RequirementsTable.jsx';
import { AdditivesPanel } from './components/AdditivesPanel.jsx';
import { DryCowStrategyPanel } from './components/DryCowStrategyPanel.jsx';
import { CustomProductModal } from './components/CustomProductModal.jsx';
import { CustomProductsList } from './components/CustomProductsList.jsx';
import { BioavailGuide } from './components/BioavailGuide.jsx';
import { FormulaTable } from './components/FormulaTable.jsx';
import { SaveLoadPanel } from './components/SaveLoadPanel.jsx';

import { exportFormulationCSV } from './exports/exportCSV.js';
import { exportRationallCSV } from './exports/exportRationall.js';
import { exportAMTS_XML } from './exports/exportAMTS.js';

const BATCH_OPTIONS = [
  { value: 1000, label: '1,000 kg (1 ton)' },
  { value: 500,  label: '500 kg' },
  { value: 100,  label: '100 kg' },
];

const DEFAULT_STATE = {
  species: 'Dairy',
  breed: 'Holstein',
  stage: 'Fresh / Early Lactation',
  dmi: 24,
  dose: 100,
  milkYield: 35,
  carrier: 'limestone',
  currency: 'USD',
  batchKg: 1000,
  marbling: false,
  colorFocus: false,
  shelfLife: false,
  // organicSelections: { [productId]: { location, mode, value, anchorMineral? } }
  organicSelections: {
    availa_zn: { location: 'premix', mode: 'pct',    value: 30, anchorMineral: 'Zn' },
    availa_cu: { location: 'premix', mode: 'pct',    value: 30, anchorMineral: 'Cu' },
    availa_mn: { location: 'premix', mode: 'pct',    value: 20, anchorMineral: 'Mn' },
    co_gluco:  { location: 'premix', mode: 'pct',    value: 100, anchorMineral: 'Co' },
    selplex:   { location: 'premix', mode: 'pct',    value: 100, anchorMineral: 'Se' },
  },
  inorgSrc:   { Zn: 'zn_sulfate',  Cu: 'cu_sulfate',  Mn: 'mn_sulfate',  Co: 'co_carb',   Se: 'se_selenite', I: 'ki',      Fe: 'fe_sulfate' },
  priceOverrides: {},
};

function defaultPrices() {
  const p = {};
  for (const m in PRODUCTS) PRODUCTS[m].forEach((prod) => { p[prod.id] = prod.price; });
  BLENDS.forEach((b) => { p[b.id] = b.price; });
  for (const v in VITAMIN_SOURCES) p[v] = VITAMIN_SOURCES[v].price;
  CARRIERS.forEach((c) => { p[c.id] = c.price; });
  ADDITIVES.forEach((a) => { p[a.id] = a.price; });
  return p;
}

export default function App() {
  const [species, setSpecies] = useState(DEFAULT_STATE.species);
  const [breed, setBreed] = useState(DEFAULT_STATE.breed);
  const [stage, setStage] = useState(DEFAULT_STATE.stage);
  const [dmi, setDmi] = useState(DEFAULT_STATE.dmi);
  const [dose, setDose] = useState(DEFAULT_STATE.dose);
  const [milkYield, setMilkYield] = useState(DEFAULT_STATE.milkYield);
  const [carrier, setCarrier] = useState(DEFAULT_STATE.carrier);
  const [currency, setCurrency] = useState(DEFAULT_STATE.currency);
  const [batchKg, setBatchKg] = useState(DEFAULT_STATE.batchKg);
  const [marbling, setMarbling] = useState(false);
  const [colorFocus, setColorFocus] = useState(false);
  const [shelfLife, setShelfLife] = useState(false);
  const [organicSelections, setOrganicSelections] = useState(DEFAULT_STATE.organicSelections);
  const [inorgSrc, setInorgSrc] = useState(DEFAULT_STATE.inorgSrc);
  const [prices, setPrices] = useState(defaultPrices);
  const [nutrientOverrides, setNutrientOverrides] = useState({});
  const [additiveDose, setAdditiveDose] = useState({});
  const [dryCowStrategy, setDryCowStrategy] = useState('standard');
  const [dcadTarget, setDcadTarget] = useState(-100);
  const [maxCaGPerDay, setMaxCaGPerDay] = useState(50);
  const [xzelitDose, setXzelitDose] = useState(400);
  const [modalOpen, setModalOpen] = useState(false);

  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const { customProducts, addCustom, removeCustom } = useCustomProducts();
  const { saved, saveFormulation, removeFormulation } = useSavedFormulations(auth.user);

  useEffect(() => {
    const stages = Object.keys(REQS[species].stages);
    if (!stages.includes(stage)) setStage(stages[0]);
    const breeds = REQS[species].breeds;
    if (!breeds.includes(breed)) setBreed(breeds[0]);
  }, [species]);  // eslint-disable-line react-hooks/exhaustive-deps

  const adjustedReqs = useMemo(
    () => adjustReqs({
      REQS, species, stage, breed, milkYield, marbling, colorFocus, shelfLife,
      nutrientOverrides,
      dryCowStrategy, dcadTarget, maxCaGPerDay, xzelitDose,
    }),
    [species, stage, breed, milkYield, marbling, colorFocus, shelfLife, nutrientOverrides,
     dryCowStrategy, dcadTarget, maxCaGPerDay, xzelitDose],
  );

  const calc = useMemo(
    () => calcFormulation({
      adjustedReqs, dmi, dose, organicSelections, inorgSrc, prices, carrier,
      species,
      PRODUCTS, BLENDS, VITAMIN_SOURCES, CARRIERS,
      customProducts,
      cuCeiling: REQS[species].cuCeiling || null,
      additiveDose,
      marbling,
    }),
    [adjustedReqs, dmi, dose, organicSelections, inorgSrc, prices, carrier, customProducts, species, additiveDose, marbling],
  );

  // When pbinder strategy is chosen, auto-populate the X-Zelit additive dose
  // with the user's chosen xzelitDose. When strategy moves away from pbinder,
  // remove xzelit from the additive map so it doesn't linger.
  useEffect(() => {
    if (dryCowStrategy === 'pbinder') {
      setAdditiveDose((prev) => ({ ...prev, xzelit: xzelitDose }));
    } else {
      setAdditiveDose((prev) => {
        if (!prev.xzelit) return prev;
        const next = { ...prev };
        delete next.xzelit;
        return next;
      });
    }
  }, [dryCowStrategy, xzelitDose]);

  const c = CURRENCIES[currency];
  const fmt = (usd, decimals = 2) => `${c.symbol}${(usd * c.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: decimals })}`;

  const sp = REQS[species];
  const stages = Object.keys(sp.stages);

  const currentState = {
    species, breed, stage, dmi, dose, milkYield, carrier, currency, batchKg,
    marbling, colorFocus, shelfLife,
    organicSelections, inorgSrc, nutrientOverrides,
    additiveDose, dryCowStrategy, dcadTarget, maxCaGPerDay, xzelitDose,
    priceOverrides: prices,
  };

  const loadFormulation = (s) => {
    if (!s) return;
    setSpecies(s.species); setBreed(s.breed); setStage(s.stage);
    setDmi(s.dmi); setDose(s.dose); setMilkYield(s.milkYield || 30);
    setCarrier(s.carrier); setCurrency(s.currency); setBatchKg(s.batchKg || 1000);
    setMarbling(!!s.marbling); setColorFocus(!!s.colorFocus); setShelfLife(!!s.shelfLife);
    // Back-compat: older saves have organicPct/orgSrc/blendRates — migrate to organicSelections
    if (s.organicSelections) {
      setOrganicSelections(s.organicSelections);
    } else if (s.organicPct && s.orgSrc) {
      const migrated = {};
      Object.entries(s.organicPct).forEach(([m, pct]) => {
        const pid = s.orgSrc[m];
        if (!pid || !pct) return;
        migrated[pid] = { location: 'premix', mode: 'pct', value: pct, anchorMineral: m };
      });
      Object.entries(s.blendRates || {}).forEach(([pid, g]) => {
        if (!g) return;
        migrated[pid] = { location: 'premix', mode: 'fixed_g', value: g };
      });
      setOrganicSelections(migrated);
    }
    if (s.inorgSrc) setInorgSrc(s.inorgSrc);
    setNutrientOverrides(s.nutrientOverrides || {});
    setAdditiveDose(s.additiveDose || {});
    setDryCowStrategy(s.dryCowStrategy || 'standard');
    setDcadTarget(s.dcadTarget ?? -100);
    setMaxCaGPerDay(s.maxCaGPerDay ?? 50);
    setXzelitDose(s.xzelitDose ?? 400);
    if (s.priceOverrides) setPrices((prev) => ({ ...prev, ...s.priceOverrides }));
  };

  // Gate the app behind login when cloud is configured. While Firebase is
  // still booting we show a tiny splash so the UI doesn't flicker.
  if (CLOUD_ENABLED && auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <div className="text-center">
          <i className="fas fa-flask-vial text-emerald-600 text-3xl animate-pulse mb-3"></i>
          <div>{t('auth.pleaseWait')}</div>
        </div>
      </div>
    );
  }
  if (CLOUD_ENABLED && !auth.user) {
    return (
      <AuthModal
        signUp={auth.signUp}
        signIn={auth.signIn}
        resetPassword={auth.resetPassword}
        t={t}
      />
    );
  }

  return (
    <>
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto screen-only">
      <Header t={t} i18n={i18n}
              auth={auth}
              currency={currency} setCurrency={setCurrency}
              onExportCSV={() => exportFormulationCSV({ calc, species, stage, breed, dmi, dose, batchKg, currency })}
              onExportRationall={() => exportRationallCSV({ calc, species, stage, dose, currency, currencyRate: c.rate, customProducts })}
              onExportAMTS={() => exportAMTS_XML({ calc, species, stage, dose, customProducts })}
              onPrint={() => window.print()} />

      <div className="bg-white rounded-xl p-2 flex gap-1 mb-5 shadow-sm border no-print">
        {Object.keys(REQS).map((s) => (
          <button key={s} onClick={() => setSpecies(s)}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition ${species === s ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-5">
          <AnimalProfile
            t={t}
            sp={sp} stages={stages}
            breed={breed} setBreed={setBreed}
            stage={stage} setStage={setStage}
            dmi={dmi} setDmi={setDmi}
            dose={dose} setDose={setDose}
            milkYield={milkYield} setMilkYield={setMilkYield}
            carrier={carrier} setCarrier={setCarrier}
            batchKg={batchKg} setBatchKg={setBatchKg}
            species={species}
            marbling={marbling} setMarbling={setMarbling}
            colorFocus={colorFocus} setColorFocus={setColorFocus}
            shelfLife={shelfLife} setShelfLife={setShelfLife}
          />
          <SaveLoadPanel
            saved={saved}
            saveFormulation={saveFormulation}
            removeFormulation={removeFormulation}
            currentState={currentState}
            onLoad={loadFormulation}
          />

          {species === 'Dairy' && (stage === 'Close-up Dry' || stage === 'Far-off Dry') && (
            <DryCowStrategyPanel
              dryCowStrategy={dryCowStrategy} setDryCowStrategy={setDryCowStrategy}
              dcadTarget={dcadTarget} setDcadTarget={setDcadTarget}
              maxCaGPerDay={maxCaGPerDay} setMaxCaGPerDay={setMaxCaGPerDay}
              xzelitDose={xzelitDose} setXzelitDose={setXzelitDose}
            />
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">
          <CostHeadline t={t} calc={calc} dose={dose} fmt={fmt} />

          {calc.warnings.length > 0 && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg text-sm">
              <div className="font-bold text-rose-800 mb-1"><i className="fas fa-triangle-exclamation mr-1"></i>{t('warnings.title')}</div>
              <ul className="text-xs text-rose-700 list-disc list-inside space-y-1">
                {calc.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          <RequirementsTable
            calc={calc} dmi={dmi} adjustedReqs={adjustedReqs}
            nutrientOverrides={nutrientOverrides}
            setNutrientOverrides={setNutrientOverrides}
          />
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <OrganicSourcesPanel
          customProducts={customProducts}
          organicSelections={organicSelections} setOrganicSelections={setOrganicSelections}
          prices={prices} setPrices={setPrices}
          fmt={fmt}
        />

        <InorganicSourcesPanel
          customProducts={customProducts}
          inorgSrc={inorgSrc} setInorgSrc={setInorgSrc}
          prices={prices} setPrices={setPrices}
          fmt={fmt}
        />

        <AdditivesPanel
          species={species} stage={stage}
          additiveDose={additiveDose} setAdditiveDose={setAdditiveDose}
          prices={prices} setPrices={setPrices}
          fmt={fmt}
        />

        <MineralDeliveryTable calc={calc} />

        <FormulaTable calc={calc} dose={dose} batchKg={batchKg} fmt={fmt} setPrices={setPrices} />

        <BioavailGuide />

        <CustomProductsList
          customProducts={customProducts}
          onRemove={removeCustom}
          onAddClick={() => setModalOpen(true)}
        />
      </div>

      <footer className="mt-8 text-center text-xs text-slate-400">
        {t('app.footer')}
      </footer>

      <CustomProductModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={addCustom} />
    </div>

    <PrintableReport
      species={species} breed={breed} stage={stage}
      dmi={dmi} dose={dose} batchKg={batchKg} currency={currency}
      milkYield={milkYield}
      marbling={marbling} colorFocus={colorFocus} shelfLife={shelfLife}
      calc={calc} adjustedReqs={adjustedReqs} fmt={fmt}
    />
    </>
  );
}

function Header({ t, i18n, auth, currency, setCurrency, onExportCSV, onExportRationall, onExportAMTS, onPrint }) {
  const changeLang = (code) => i18n.changeLanguage(code);
  const activeLang = SUPPORTED_LANGS.find((l) => l.code === (i18n.resolvedLanguage || i18n.language)) || SUPPORTED_LANGS[0];
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6 no-print">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          <i className="fas fa-flask-vial text-emerald-600 mr-2"></i>
          {t('app.title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t('app.tagline')}</p>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={activeLang.code}
          onChange={(e) => changeLang(e.target.value)}
          className="bg-white border rounded-lg px-3 py-2 text-sm"
          title={t('header.language')}
        >
          {SUPPORTED_LANGS.map((l) => (
            <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
          ))}
        </select>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-white border rounded-lg px-3 py-2 text-sm" title={t('header.currency')}>
          {Object.entries(CURRENCIES).map(([k, v]) => <option key={k} value={k}>{v.symbol} {k}</option>)}
        </select>
        <button onClick={onExportCSV} className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-semibold" title={t('header.exportCSVTooltip')}>
          <i className="fas fa-file-csv mr-1"></i> {t('header.exportCSV')}
        </button>
        <button onClick={onExportRationall} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-semibold" title={t('header.exportRationallTooltip')}>
          <i className="fas fa-table mr-1"></i> {t('header.exportRationall')}
        </button>
        <button onClick={onExportAMTS} className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg text-xs font-semibold" title={t('header.exportAMTSTooltip')}>
          <i className="fas fa-file-code mr-1"></i> {t('header.exportAMTS')}
        </button>
        <button onClick={onPrint} className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-semibold" title={t('header.printTooltip')}>
          <i className="fas fa-print mr-1"></i> {t('header.print')}
        </button>
        {auth?.cloudEnabled && auth.user && (
          <div className="flex items-center gap-2 border-l pl-2 ml-1">
            <div className="text-right leading-tight">
              <div className="text-[10px] text-slate-400 uppercase font-bold">{t('auth.signedInAs')}</div>
              <div className="text-xs font-semibold text-slate-700 truncate max-w-[180px]">
                {auth.user.displayName || auth.user.email}
              </div>
            </div>
            <button
              onClick={() => auth.logout()}
              className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-2 py-1 rounded text-[10px] font-bold"
              title={t('auth.logout')}
            >
              <i className="fas fa-arrow-right-from-bracket"></i>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function AnimalProfile({
  t,
  sp, stages, breed, setBreed, stage, setStage, dmi, setDmi, dose, setDose,
  milkYield, setMilkYield, carrier, setCarrier, batchKg, setBatchKg,
  species, marbling, setMarbling, colorFocus, setColorFocus, shelfLife, setShelfLife,
}) {
  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border space-y-3">
      <h2 className="font-semibold border-b pb-2">{t('animalProfile.title')}</h2>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase">{t('animalProfile.breed')}</label>
        <select value={breed} onChange={(e) => setBreed(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2 text-sm">
          {sp.breeds.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase">{t('animalProfile.stage')}</label>
        <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2 text-sm">
          {stages.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {sp.hasMilkYield && stage.toLowerCase().includes('lactation') && (
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase">{t('animalProfile.milkYield')}</label>
          <input type="number" step="0.1" value={milkYield} onChange={(e) => setMilkYield(+e.target.value)}
                 className="w-full bg-emerald-50 border border-emerald-200 rounded-lg p-2 font-bold text-emerald-700" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase">{t('animalProfile.dmi')}</label>
          <input type="number" step="0.1" value={dmi} onChange={(e) => setDmi(+e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase">{t('animalProfile.dose')}</label>
          <input type="number" value={dose} onChange={(e) => setDose(+e.target.value)} className="w-full bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-sm font-bold text-emerald-700" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase">{t('animalProfile.carrier')}</label>
          <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2 text-sm">
            {CARRIERS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase">{t('animalProfile.batchSize')}</label>
          <select value={batchKg} onChange={(e) => setBatchKg(+e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2 text-sm">
            {BATCH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      {['Beef', 'Goat', 'Sheep'].includes(species) && (
        <div className="pt-3 border-t space-y-2 text-sm">
          <div className="font-semibold text-rose-700"><i className="fas fa-bullseye mr-1"></i>{t('animalProfile.meatQualityTitle')}</div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={marbling} onChange={(e) => setMarbling(e.target.checked)} className="mt-0.5" />
            <span>
              <b>{t('animalProfile.marbling')}</b>
              <span className="block text-[10px] text-slate-500">{t('animalProfile.marblingNote')}</span>
            </span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={colorFocus} onChange={(e) => setColorFocus(e.target.checked)} className="mt-0.5" />
            <span>
              <b>{t('animalProfile.color')}</b>
              <span className="block text-[10px] text-slate-500">{t('animalProfile.colorNote')}</span>
            </span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={shelfLife} onChange={(e) => setShelfLife(e.target.checked)} className="mt-0.5" />
            <span>
              <b>{t('animalProfile.shelfLife')}</b>
              <span className="block text-[10px] text-slate-500">{t('animalProfile.shelfLifeNote')}</span>
            </span>
          </label>
        </div>
      )}
    </section>
  );
}

function CostHeadline({ t, calc, dose, fmt }) {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow">
      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t('cost.finalPremixCost')}</p>
      <div className="text-3xl md:text-4xl font-black text-emerald-400 mt-1">{fmt(calc.totalCostPerTon)}</div>
      <div className="text-xs text-slate-400 uppercase">{t('cost.perTon')} · {fmt(calc.totalCostPerDose, 4)} {t('cost.perDose', { dose })}</div>
      <div className="text-[10px] text-slate-500 mt-2">{t('cost.activeAndCarrier', { active: calc.totalActiveG.toFixed(2), carrier: calc.carrierG.toFixed(2), dose })}</div>
    </div>
  );
}

