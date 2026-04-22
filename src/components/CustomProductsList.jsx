import { NUTRIENT_LABELS } from '../data/requirements.js';

export function CustomProductsList({ customProducts, onRemove, onAddClick }) {
  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border">
      <h2 className="font-semibold border-b pb-2 mb-3 flex items-center justify-between">
        <span><i className="fas fa-star text-amber-500 mr-2"></i>My Custom Products</span>
        <button onClick={onAddClick} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded font-semibold">
          <i className="fas fa-plus mr-1"></i>Add Product
        </button>
      </h2>
      {customProducts.length === 0 ? (
        <p className="text-xs text-slate-500 italic">
          No custom products yet. Add branded or region-specific products your supplier sells to pick them from the mineral-source dropdowns.
        </p>
      ) : (
        <div className="space-y-1.5">
          {customProducts.map((p) => (
            <div key={p.id} className="flex items-start gap-3 border rounded-md p-2 bg-slate-50 text-sm">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold">{p.brand}</span>
                  <span>{p.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${p.kind === 'blend' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {p.kind === 'blend' ? 'BLEND' : 'SINGLE'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {p.kind === 'blend' ? (
                    Object.entries(p.minerals || {}).map(([m, f]) => (
                      <span key={m} className="mr-2">{NUTRIENT_LABELS[m] || m} {(f * 100).toFixed(2)}%</span>
                    ))
                  ) : (
                    <>{NUTRIENT_LABELS[p.mineral] || p.mineral} · {(p.purity * 100).toFixed(2)}% · bioavail {p.bioavail}× · ${p.price}/kg</>
                  )}
                </div>
                {p.note && <div className="text-[10px] text-slate-400 mt-0.5 italic">{p.note}</div>}
              </div>
              <button onClick={() => onRemove(p.id)} className="text-rose-500 hover:text-rose-700 p-1" title="Delete">
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
