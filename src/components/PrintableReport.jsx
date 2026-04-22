import { NUTRIENT_LABELS } from '../data/requirements.js';

/**
 * Clean, print-only "Premix Formulation Report" layout.
 * Screen visibility is controlled via the .print-only CSS class — this component
 * renders nothing visually when viewing the app; window.print() reveals it.
 */
export function PrintableReport({
  species, breed, stage,
  dmi, dose, batchKg, currency,
  marbling, colorFocus, shelfLife,
  milkYield,
  calc, adjustedReqs, fmt,
}) {
  const today = new Date();
  const dateStr = today.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = today.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const scale = (batchKg * 1000) / dose;

  const beefFlags = [
    marbling ? 'Marbling' : null,
    colorFocus ? 'Color' : null,
    shelfLife ? 'Shelf life' : null,
  ].filter(Boolean).join(', ');

  return (
    <div className="print-only printable-root">
      <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#111', padding: '24px', maxWidth: '780px', margin: '0 auto' }}>
        <header style={{ borderBottom: '2px solid #111', paddingBottom: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Premix Formulation Report</h1>
            <div style={{ fontSize: 11, color: '#555' }}>{dateStr} · {timeStr}</div>
          </div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
            Ruminant Vitamin &amp; Mineral Premix Calculator · NRC / NASEM baselines
          </div>
        </header>

        <section style={{ marginBottom: 16 }}>
          <Grid2>
            <Field label="Species" value={species} />
            <Field label="Breed"   value={breed} />
            <Field label="Stage"   value={stage} />
            {species === 'Dairy' && milkYield != null && stage.toLowerCase().includes('lactation') && (
              <Field label="Milk yield" value={`${milkYield} kg/d`} />
            )}
            <Field label="DMI"         value={`${dmi} kg/d`} />
            <Field label="Dose"        value={`${dose} g/d`} />
            <Field label="Batch size"  value={`${batchKg.toLocaleString()} kg (${scale.toLocaleString()} doses)`} />
            <Field label="Currency"    value={currency} />
            {species === 'Beef' && beefFlags && <Field label="Quality targets" value={beefFlags} />}
          </Grid2>
        </section>

        {adjustedReqs?.notes?.length > 0 && (
          <section style={sectionStyle}>
            <SectionHeader>Adjustments applied</SectionHeader>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11 }}>
              {adjustedReqs.notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </section>
        )}

        <section style={sectionStyle}>
          <SectionHeader>Daily Nutrient Requirements</SectionHeader>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRowStyle}>
                <th style={thLeft}>Nutrient</th>
                <th style={thRight}>Per kg DM</th>
                <th style={thRight}>Daily total</th>
                <th style={thLeft}>Unit</th>
              </tr>
            </thead>
            <tbody>
              {calc.summary.map((s) => (
                <tr key={s.key} style={tbodyRowStyle}>
                  <td style={tdLeft}>{s.label}</td>
                  <td style={tdRight}>{fmtNum(s.reqPerKgDm, 2)}</td>
                  <td style={tdRight}>{fmtNum(s.dailyTotal, 2)}</td>
                  <td style={tdLeft}>{s.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {calc.mineralDelivery?.length > 0 && (
          <section style={sectionStyle}>
            <SectionHeader>Mineral Delivery (mg / day)</SectionHeader>
            <table style={tableStyle}>
              <thead>
                <tr style={theadRowStyle}>
                  <th style={thLeft}>Mineral</th>
                  <th style={thRight}>Required</th>
                  <th style={thRight}>From ration</th>
                  <th style={thRight}>Premix · organic</th>
                  <th style={thRight}>Premix · inorganic</th>
                  <th style={thRight}>Total</th>
                  <th style={thRight}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {calc.mineralDelivery.map((r) => {
                  const excluded = r.required === 0;
                  return (
                    <tr key={r.mineral} style={{ ...tbodyRowStyle, color: excluded ? '#888' : '#111' }}>
                      <td style={tdLeft}>
                        {r.label}
                        {excluded && <span style={{ marginLeft: 6, fontSize: 9, padding: '1px 4px', background: '#fee2e2', color: '#b91c1c', borderRadius: 3 }}>EXCLUDED</span>}
                      </td>
                      <td style={tdRight}>{fmtNum(r.required, 2)}</td>
                      <td style={tdRight}>{fmtNum(r.ration, 2)}</td>
                      <td style={tdRight}>{fmtNum(r.premixOrganic, 2)}</td>
                      <td style={tdRight}>{fmtNum(r.premixInorganic, 2)}</td>
                      <td style={tdRight}><b>{fmtNum(r.total, 2)}</b></td>
                      <td style={{ ...tdRight, color: excluded ? (r.total > 0.01 ? '#92400e' : '#888') : (r.balance < 0 ? '#b91c1c' : '#065f46') }}>
                        {excluded
                          ? (r.total > 0.01 ? `+${fmtNum(r.total, 2)} over` : '—')
                          : `${r.balance >= 0 ? '+' : ''}${fmtNum(r.balance, 2)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        <section style={sectionStyle}>
          <SectionHeader>Batch Formula</SectionHeader>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRowStyle}>
                <th style={thLeft}>Ingredient</th>
                <th style={thLeft}>Category</th>
                <th style={thRight}>g / dose</th>
                <th style={thRight}>kg / ton</th>
                <th style={thRight}>kg / batch</th>
                <th style={thRight}>Price / kg</th>
                <th style={thRight}>Cost / ton</th>
              </tr>
            </thead>
            <tbody>
              {calc.ingredients.map((ing) => {
                const kgPerBatch = ing.perTonKg * (batchKg / 1000);
                const costPerTon = ing.pricePerKg * ing.perTonKg;
                return (
                  <tr key={ing.key} style={tbodyRowStyle}>
                    <td style={tdLeft}>
                      <div style={{ fontWeight: 600 }}>{ing.name}</div>
                      <div style={{ fontSize: 9, color: '#666' }}>
                        {ing.brand}{ing.nutrient && ing.nutrient !== '-' ? ` · ${NUTRIENT_LABELS[ing.nutrient] || ing.nutrient}` : ''}
                      </div>
                    </td>
                    <td style={tdLeft}>{ing.category}</td>
                    <td style={tdRight}>{fmtNum(ing.perDoseG, 3)}</td>
                    <td style={tdRight}>{fmtNum(ing.perTonKg, 3)}</td>
                    <td style={tdRight}>{fmtNum(kgPerBatch, 3)}</td>
                    <td style={tdRight}>{fmt(ing.pricePerKg)}</td>
                    <td style={tdRight}><b>{fmt(costPerTon)}</b></td>
                  </tr>
                );
              })}
              <tr style={{ ...tbodyRowStyle, borderTop: '2px solid #111', fontWeight: 700 }}>
                <td style={tdLeft} colSpan={2}>TOTAL</td>
                <td style={tdRight}>{fmtNum(dose, 2)} g</td>
                <td style={tdRight}>1,000 kg</td>
                <td style={tdRight}>{batchKg.toLocaleString()} kg</td>
                <td style={tdRight}>—</td>
                <td style={tdRight}>{fmt(calc.totalCostPerTon)}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 10, color: '#555', marginTop: 6 }}>
            Active ingredients {fmtNum(calc.totalActiveG, 2)} g + carrier {fmtNum(calc.carrierG, 2)} g = {dose} g dose
          </div>
        </section>

        <section style={{ ...sectionStyle, background: '#f6f6f6', padding: 10, borderRadius: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#555', letterSpacing: 0.5 }}>Final premix cost</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{fmt(calc.totalCostPerTon)} <span style={{ fontSize: 11, fontWeight: 400, color: '#555' }}>per ton</span></div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: '#333' }}>
              <div>{fmt(calc.totalCostPerDose, 4)} per {dose} g dose</div>
              {calc.dietCuPpm != null && (
                <div>Diet Cu: {calc.dietCuPpm.toFixed(2)} mg/kg DM</div>
              )}
            </div>
          </div>
        </section>

        {calc.warnings?.length > 0 && (
          <section style={{ ...sectionStyle, border: '1px solid #b91c1c', padding: 8, borderRadius: 4 }}>
            <SectionHeader style={{ color: '#b91c1c' }}>Warnings</SectionHeader>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: '#7f1d1d' }}>
              {calc.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </section>
        )}

        <footer style={{ marginTop: 20, paddingTop: 8, borderTop: '1px solid #ccc', fontSize: 9, color: '#777', textAlign: 'center' }}>
          Ruminant Vitamin &amp; Mineral Premix Calculator · NRC / NASEM baselines · Prices in {currency} (editable per product).
        </footer>
      </div>
    </div>
  );
}

// ---- presentational helpers ----
const sectionStyle = { marginBottom: 14 };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 11 };
const theadRowStyle = { borderBottom: '1px solid #111', background: '#eee' };
const tbodyRowStyle = { borderBottom: '1px solid #ddd' };
const thLeft  = { textAlign: 'left',  padding: '4px 6px', fontSize: 10, textTransform: 'uppercase', color: '#333', letterSpacing: 0.3 };
const thRight = { textAlign: 'right', padding: '4px 6px', fontSize: 10, textTransform: 'uppercase', color: '#333', letterSpacing: 0.3 };
const tdLeft  = { textAlign: 'left',  padding: '4px 6px', verticalAlign: 'top' };
const tdRight = { textAlign: 'right', padding: '4px 6px', verticalAlign: 'top', fontFamily: 'Consolas, monospace' };

function SectionHeader({ children, style }) {
  return (
    <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 6px', borderBottom: '1px solid #ccc', paddingBottom: 3, ...style }}>
      {children}
    </h2>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 9, textTransform: 'uppercase', color: '#555', letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function Grid2({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 12 }}>{children}</div>;
}

function fmtNum(n, d = 2) {
  if (n == null || !isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: d });
}
