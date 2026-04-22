import { useState } from 'react';
import { BIOAVAIL_TIERS } from '../data/misc.js';

export function BioavailGuide() {
  const [open, setOpen] = useState(false);
  return (
    <section className="bg-white rounded-xl shadow-sm border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-semibold text-slate-800">
          <i className="fas fa-book text-sky-600 mr-2"></i>Bioavailability Reference Guide
        </span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-slate-400`}></i>
      </button>
      {open && (
        <div className="p-5 pt-0">
          <p className="text-xs text-slate-500 mb-3">
            Sulfate = 100% reference. Higher numbers mean more mineral absorbed per mg fed — but also higher cost per mg.
            Rumen protection (bypass + antagonist resistance) is the other axis that matters beyond the headline number.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase text-slate-400 font-bold border-b">
                <tr>
                  <th className="p-2 text-left">Tier</th>
                  <th className="p-2 text-left">Bioavail</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Examples</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {BIOAVAIL_TIERS.map((t) => (
                  <tr key={t.tier} className="text-xs">
                    <td className="p-2 font-bold text-slate-800">{t.tier}</td>
                    <td className="p-2 font-mono text-emerald-700">{t.range}</td>
                    <td className="p-2 text-slate-600">{t.desc}</td>
                    <td className="p-2 text-slate-500 italic">{t.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
