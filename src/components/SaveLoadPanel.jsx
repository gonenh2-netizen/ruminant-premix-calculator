import { useRef, useState } from 'react';

/**
 * Saved Formulations card.
 *
 * Save  → write the current calculator state into Firestore (or
 *         localStorage when offline) under the given name.
 * Load  → repopulate every input from a saved entry.
 * Delete → remove a saved entry.
 * Export → download a saved formulation as a JSON file.
 * Import → upload one or more JSON files (or a JSON array) and
 *         add them to the list. Useful for transferring formulations
 *         between accounts (e.g. an admin pulling another user's saves
 *         from Firebase Console).
 *
 * Accepted import shapes:
 *   - { name, state, savedAt? }                  // single formulation
 *   - [ { name, state }, … ]                      // array
 *   - { formulations: [ … ] }                     // wrapped
 *   - [ { id, name, savedAt, state } ]            // Firestore export
 */
export function SaveLoadPanel({ saved, saveFormulation, removeFormulation, currentState, onLoad, t = (k) => k }) {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const [importMsg, setImportMsg] = useState(null); // { kind: 'ok'|'err', text }
  const fileRef = useRef(null);

  const handleSave = () => {
    const n = name.trim();
    if (!n) return;
    saveFormulation(n, currentState);
    setName('');
  };

  const handleExport = (entry) => {
    const payload = { name: entry.name, savedAt: entry.savedAt, state: entry.state };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(entry.name || 'formulation').replace(/[^A-Za-z0-9]+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const normaliseEntries = (parsed) => {
    if (Array.isArray(parsed))                                return parsed;
    if (parsed && Array.isArray(parsed.formulations))         return parsed.formulations;
    if (parsed && parsed.state)                               return [parsed];
    return [];
  };

  const isValidEntry = (e) =>
    e && typeof e === 'object' && e.state && typeof e.state === 'object' &&
    typeof e.state.species === 'string' && typeof e.state.stage === 'string';

  const handleImportFiles = async (fileList) => {
    setImportMsg(null);
    const files = Array.from(fileList || []);
    if (!files.length) return;
    let imported = 0, skipped = 0;
    const errors = [];
    for (const file of files) {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const entries = normaliseEntries(parsed);
        for (const e of entries) {
          if (!isValidEntry(e)) { skipped += 1; continue; }
          const baseName = (e.name && String(e.name).trim()) || file.name.replace(/\.json$/i, '');
          // If a saved formulation with the same name already exists, suffix with " (imported)"
          let finalName = baseName;
          if (saved.some((s) => s.name === finalName)) finalName = `${baseName} (imported)`;
          await saveFormulation(finalName, e.state);
          imported += 1;
        }
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`);
      }
    }
    if (imported && !errors.length) {
      setImportMsg({ kind: 'ok', text: t('saveLoad.importOk', { count: imported, skipped }) });
    } else if (errors.length) {
      setImportMsg({ kind: 'err', text: `${imported} imported, ${errors.length} failed: ${errors.join('; ')}` });
    } else if (skipped) {
      setImportMsg({ kind: 'err', text: t('saveLoad.importNoValid') });
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-semibold text-slate-800">
          <i className="fas fa-save text-emerald-600 mr-2"></i>{t('saveLoad.title')} <span className="text-xs text-slate-400 ml-2">({saved.length})</span>
        </span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-slate-400`}></i>
      </button>
      {open && (
        <div className="p-5 pt-0 space-y-3">
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('saveLoad.placeholder')}
              className="flex-1 border rounded p-2 text-sm"
            />
            <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded text-sm font-semibold">
              {t('saveLoad.save')}
            </button>
          </div>

          {/* Import row */}
          <div className="flex gap-2 items-center pt-2 border-t">
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              multiple
              onChange={(e) => handleImportFiles(e.target.files)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded text-xs font-semibold"
              title={t('saveLoad.importTooltip')}
            >
              <i className="fas fa-file-import mr-1"></i>{t('saveLoad.import')}
            </button>
            <span className="text-[10px] text-slate-500 leading-snug">
              {t('saveLoad.importHelp')}
            </span>
          </div>
          {importMsg && (
            <div className={`text-[11px] p-2 rounded border ${importMsg.kind === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
              {importMsg.text}
            </div>
          )}

          {saved.length === 0 ? (
            <p className="text-xs text-slate-500 italic">{t('saveLoad.noSaves')}</p>
          ) : (
            <div className="space-y-1.5">
              {saved.map((f) => (
                <div key={f.id} className="flex items-center gap-2 border rounded p-2 bg-slate-50 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 truncate">{f.name}</div>
                    <div className="text-[10px] text-slate-500">{f.state?.species} · {f.state?.stage} · {t('saveLoad.savedOn', { date: new Date(f.savedAt).toLocaleDateString() })}</div>
                  </div>
                  <button
                    onClick={() => onLoad(f.state)}
                    className="text-xs bg-sky-600 hover:bg-sky-700 text-white px-2 py-1 rounded font-semibold"
                    title={t('saveLoad.load')}
                  >
                    {t('saveLoad.load')}
                  </button>
                  <button
                    onClick={() => handleExport(f)}
                    className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded font-semibold"
                    title={t('saveLoad.exportTooltip')}
                  >
                    <i className="fas fa-download"></i>
                  </button>
                  <button
                    onClick={() => removeFormulation(f.id)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                    title={t('saveLoad.delete')}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
