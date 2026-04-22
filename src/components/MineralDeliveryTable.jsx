/**
 * Per-mineral delivery breakdown: how much of each mineral's daily requirement
 * is supplied by ration-side products, premix-side organic sources, and
 * premix-side inorganic fallback.
 */
export function MineralDeliveryTable({ calc }) {
  const rows = calc.mineralDelivery || [];
  if (!rows.length) return null;
  return (
    <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-5 py-3 border-b">
        <h3 className="font-bold text-slate-800">Mineral Delivery — Daily (mg)</h3>
        <p className="text-xs text-slate-500">
          Required per day = ration (external) + premix organic + premix inorganic
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase text-slate-400 font-bold border-b bg-slate-50/50">
            <tr>
              <th className="px-4 py-2 text-left">Mineral</th>
              <th className="px-4 py-2 text-right">Required</th>
              <th className="px-4 py-2 text-right text-amber-700">From ration</th>
              <th className="px-4 py-2 text-right text-emerald-700">Premix · Organic</th>
              <th className="px-4 py-2 text-right text-slate-700">Premix · Inorganic</th>
              <th className="px-4 py-2 text-right">Total delivered</th>
              <th className="px-4 py-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => {
              const balPct = r.required > 0 ? (r.balance / r.required) * 100 : 0;
              const balCls = Math.abs(balPct) < 5
                ? 'text-emerald-700'
                : balPct < 0 ? 'text-rose-700' : 'text-amber-700';
              return (
                <tr key={r.mineral} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium">{r.label}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs">{fmt(r.required)}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-amber-700">{fmt(r.ration)}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-emerald-700">{fmt(r.premixOrganic)}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-slate-700">{fmt(r.premixInorganic)}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs font-bold">{fmt(r.total)}</td>
                  <td className={`px-4 py-2 text-right font-mono text-xs font-bold ${balCls}`}>
                    {r.balance >= 0 ? '+' : ''}{fmt(r.balance)}
                    {r.required > 0 && <span className="text-[10px] font-normal ml-1">({balPct >= 0 ? '+' : ''}{balPct.toFixed(0)}%)</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function fmt(n) {
  if (!isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
