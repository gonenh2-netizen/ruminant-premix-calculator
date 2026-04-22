import { useState } from 'react';

export function SaveLoadPanel({ saved, saveFormulation, removeFormulation, currentState, onLoad }) {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    const n = name.trim();
    if (!n) return;
    saveFormulation(n, currentState);
    setName('');
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-semibold text-slate-800">
          <i className="fas fa-save text-emerald-600 mr-2"></i>Saved Formulations <span className="text-xs text-slate-400 ml-2">({saved.length})</span>
        </span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-slate-400`}></i>
      </button>
      {open && (
        <div className="p-5 pt-0 space-y-3">
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name this formulation…"
              className="flex-1 border rounded p-2 text-sm"
            />
            <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded text-sm font-semibold">
              Save
            </button>
          </div>
          {saved.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No saved formulations yet. Save the current setup for quick recall.</p>
          ) : (
            <div className="space-y-1.5">
              {saved.map((f) => (
                <div key={f.id} className="flex items-center gap-2 border rounded p-2 bg-slate-50 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800">{f.name}</div>
                    <div className="text-[10px] text-slate-500">{f.state?.species} · {f.state?.stage} · saved {new Date(f.savedAt).toLocaleDateString()}</div>
                  </div>
                  <button onClick={() => onLoad(f.state)} className="text-xs bg-sky-600 hover:bg-sky-700 text-white px-2 py-1 rounded font-semibold">Load</button>
                  <button onClick={() => removeFormulation(f.id)} className="text-rose-500 hover:text-rose-700 p-1" title="Delete"><i className="fas fa-trash"></i></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
