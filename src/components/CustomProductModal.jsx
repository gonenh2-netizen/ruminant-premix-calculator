import { useState } from 'react';
import { MINERAL_KEYS, NUTRIENT_LABELS } from '../data/requirements.js';

const ALL_MINERAL_KEYS = [...MINERAL_KEYS, 'Cr'];
const EMPTY_BLEND = ALL_MINERAL_KEYS.reduce((acc, k) => ({ ...acc, [k]: 0 }), {});

export function CustomProductModal({ open, onClose, onSave }) {
  const [mode, setMode] = useState('single');
  const [form, setForm] = useState({
    name: '',
    brand: '',
    chemistry: 'organic',
    mineral: 'Zn',
    purityPct: 15,
    blendPct: { ...EMPTY_BLEND },
    bioavail: 1.3,
    price: 0,
    note: '',
  });

  if (!open) return null;

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setBlendPct = (m, v) => setForm((f) => ({ ...f, blendPct: { ...f.blendPct, [m]: v } }));

  const save = () => {
    if (!form.name.trim()) return;
    if (mode === 'single') {
      onSave({
        kind: 'single',
        name: form.name.trim(),
        brand: form.brand.trim() || 'Custom',
        chemistry: form.chemistry,
        type: `Custom ${form.chemistry}`,
        mineral: form.mineral,
        purity: Math.max(0, Math.min(1, (+form.purityPct || 0) / 100)),
        bioavail: +form.bioavail || 1.0,
        price: +form.price || 0,
        note: form.note.trim(),
      });
    } else {
      const minerals = {};
      Object.entries(form.blendPct).forEach(([m, pct]) => {
        const p = +pct || 0;
        if (p > 0) minerals[m] = p / 100;
      });
      if (Object.keys(minerals).length === 0) return;
      onSave({
        kind: 'blend',
        name: form.name.trim(),
        brand: form.brand.trim() || 'Custom',
        type: 'Custom blend',
        minerals,
        bioavail: +form.bioavail || 1.0,
        price: +form.price || 0,
        note: form.note.trim(),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 no-print" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg"><i className="fas fa-plus-circle text-emerald-600 mr-2"></i>Add Custom Product</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><i className="fas fa-times"></i></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('single')}
              className={`flex-1 py-1.5 rounded-md text-sm font-semibold ${mode === 'single' ? 'bg-white text-emerald-700 shadow' : 'text-slate-500'}`}
            >Single-mineral</button>
            <button
              onClick={() => setMode('blend')}
              className={`flex-1 py-1.5 rounded-md text-sm font-semibold ${mode === 'blend' ? 'bg-white text-indigo-700 shadow' : 'text-slate-500'}`}
            >Multi-mineral blend</button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Product name">
              <input value={form.name} onChange={(e) => setField('name', e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="e.g. SuperZn Plus" />
            </Field>
            <Field label="Brand">
              <input value={form.brand} onChange={(e) => setField('brand', e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="e.g. MyCo" />
            </Field>
          </div>

          {mode === 'single' ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                <Field label="Mineral">
                  <select value={form.mineral} onChange={(e) => setField('mineral', e.target.value)} className="w-full border rounded p-2 text-sm">
                    {ALL_MINERAL_KEYS.map((m) => <option key={m} value={m}>{NUTRIENT_LABELS[m] || m}</option>)}
                  </select>
                </Field>
                <Field label="Chemistry">
                  <select value={form.chemistry} onChange={(e) => setField('chemistry', e.target.value)} className="w-full border rounded p-2 text-sm">
                    <option value="organic">Organic</option>
                    <option value="inorganic">Inorganic</option>
                    <option value="hydroxychloride">Hydroxychloride</option>
                  </select>
                </Field>
                <Field label="Purity %">
                  <input type="number" step="0.01" min="0" max="100" value={form.purityPct} onChange={(e) => setField('purityPct', e.target.value)} className="w-full border rounded p-2 text-sm" />
                </Field>
              </div>
            </>
          ) : (
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Mineral composition (%)</div>
              <div className="grid grid-cols-4 gap-2">
                {ALL_MINERAL_KEYS.map((m) => (
                  <div key={m}>
                    <label className="block text-[10px] uppercase text-slate-500">{m}</label>
                    <input
                      type="number" step="0.01" min="0"
                      value={form.blendPct[m]}
                      onChange={(e) => setBlendPct(m, e.target.value)}
                      className="w-full border rounded p-1 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Field label="Bioavailability ×">
              <input type="number" step="0.05" value={form.bioavail} onChange={(e) => setField('bioavail', e.target.value)} className="w-full border rounded p-2 text-sm" />
            </Field>
            <Field label="Price USD / kg">
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setField('price', e.target.value)} className="w-full border rounded p-2 text-sm" />
            </Field>
          </div>

          <Field label="Notes (optional)">
            <textarea rows={2} value={form.note} onChange={(e) => setField('note', e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="Chemistry notes, usage tips..." />
          </Field>
        </div>
        <div className="p-5 border-t flex justify-end gap-2 bg-slate-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200">Cancel</button>
          <button onClick={save} className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700">
            <i className="fas fa-save mr-1"></i> Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">{label}</label>
      {children}
    </div>
  );
}
