import { useState } from 'react';

/**
 * Help / documentation modal.
 *
 * Sidebar navigation + scrollable content pane. Section titles and
 * the close button are translated via i18n; body content is written
 * in English (industry-standard for ruminant-nutrition terminology).
 * If deeper localisation is needed later, each section.body can be
 * moved into the locale JSON files.
 */
export function HelpModal({ open, onClose, t = (k) => k }) {
  const sections = SECTIONS.map((s) => ({ ...s, title: t(s.titleKey) || s.title }));
  const [activeId, setActiveId] = useState(sections[0].id);

  if (!open) return null;

  const active = sections.find((s) => s.id === activeId) || sections[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-sky-600 to-sky-700 text-white px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <i className="fas fa-circle-question mr-2"></i>
            {t('help.title')}
          </h1>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-3 py-1.5 text-sm font-semibold"
          >
            {t('common.close')} ✕
          </button>
        </div>

        {/* Body — sidebar + content */}
        <div className="flex-1 flex overflow-hidden">
          <aside className="w-64 border-r bg-slate-50 overflow-y-auto hidden md:block">
            <nav className="p-3 space-y-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm font-medium ${activeId === s.id ? 'bg-sky-600 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
                >
                  <i className={`${s.icon} w-5 mr-2 text-xs`}></i>
                  {s.title}
                </button>
              ))}
            </nav>
          </aside>
          <div className="flex-1 overflow-y-auto">
            {/* Mobile: show section picker as select */}
            <div className="md:hidden p-3 border-b bg-slate-50">
              <select
                value={activeId}
                onChange={(e) => setActiveId(e.target.value)}
                className="w-full bg-white border rounded-lg p-2 text-sm"
              >
                {sections.map((s) => (<option key={s.id} value={s.id}>{s.title}</option>))}
              </select>
            </div>
            <article className="px-6 py-5 prose-sm max-w-none text-slate-800 leading-relaxed">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <i className={`${active.icon} text-sky-600`}></i>
                {active.title}
              </h2>
              {active.body()}
            </article>
          </div>
        </div>

        {/* Footer hint */}
        <div className="border-t bg-slate-50 px-6 py-2 text-[10px] text-slate-500 text-center">
          {t('help.footer')}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section definitions — each returns a JSX body block.
// ---------------------------------------------------------------------------

const P = ({ children }) => <p className="mb-3">{children}</p>;
const B = ({ children }) => <b className="text-slate-900">{children}</b>;
const UL = ({ children }) => <ul className="list-disc list-outside ml-5 mb-3 space-y-1">{children}</ul>;
const OL = ({ children }) => <ol className="list-decimal list-outside ml-5 mb-3 space-y-1">{children}</ol>;
const H3 = ({ children }) => <h3 className="text-lg font-bold text-slate-900 mt-5 mb-2">{children}</h3>;
const H4 = ({ children }) => <h4 className="text-base font-semibold text-slate-800 mt-3 mb-1">{children}</h4>;
const Note = ({ children }) => <div className="bg-amber-50 border-l-4 border-amber-400 px-3 py-2 text-sm mb-3"><i className="fas fa-lightbulb text-amber-600 mr-2"></i>{children}</div>;
const Warn = ({ children }) => <div className="bg-rose-50 border-l-4 border-rose-500 px-3 py-2 text-sm mb-3"><i className="fas fa-triangle-exclamation text-rose-600 mr-2"></i>{children}</div>;

const SECTIONS = [
  {
    id: 'getting-started', icon: 'fas fa-flag-checkered',
    titleKey: 'help.sections.gettingStarted', title: 'Getting Started',
    body: () => (
      <>
        <P>This calculator designs a vitamin &amp; mineral premix for ruminants — dairy cattle, beef cattle, goats, and sheep. A single run produces a batch formula with per-ingredient grams, a cost breakdown, and exports for downstream ration software (Rationall CSV, AMTS/NDS XML, PDF report).</P>
        <H3>Five steps to a finished premix</H3>
        <OL>
          <li><B>Pick species + stage + breed.</B> Select along the top (Dairy / Beef / Goats / Sheep) and in the Animal Profile card. Stage and breed change the baseline requirements — e.g. a fresh-lactation cow has different Zn and Vit E needs than a close-up dry cow.</li>
          <li><B>Enter DMI + dose.</B> DMI (dry-matter intake, kg/d) scales every nutrient target to a daily milligram or IU figure. Dose (g/hd/d) is how much of the finished premix each animal eats — usually 80–150 g/d for cattle, 15–30 g for small ruminants.</li>
          <li><B>Choose organic sources.</B> In the <B>Organic Sources</B> panel tick the chelated / amino-acid complexes or blends you want to include. A mineral can be covered by only one organic source — conflicting rows are disabled. For each selected product set whether it goes <i>in the premix</i> or is fed <i>separately in the ration</i>, and specify % of requirement or fixed g/d.</li>
          <li><B>Pick the inorganic fallback</B> per mineral (below). Whatever the organic sources don't cover is made up from the sulfate, oxide, or hydroxychloride of your choice.</li>
          <li><B>(Optional) Add additives, dry-cow strategy, commercial overage.</B> Anything you add flows into the batch formula and the cost per ton.</li>
        </OL>
        <H3>Reading the output</H3>
        <UL>
          <li><B>Final premix cost</B> (black card, top-right) — cost per ton of finished premix in your chosen currency.</li>
          <li><B>Daily Nutrient Requirements</B> table — shows NRC baseline, your % override, effective target, and MTL ceiling per nutrient.</li>
          <li><B>Mineral Delivery</B> table — per-mineral breakdown: required / from ration / from premix-organic / from premix-inorganic / total / balance. The balance column tells you if you are under- or over-supplying.</li>
          <li><B>Batch Formula</B> — the actual ingredient list. g/dose, kg/ton, kg/batch, price/kg, cost/ton. Carrier fills the balance to match your target dose.</li>
        </UL>
        <H3>Saving your work</H3>
        <P>Once logged in, click <B>Save</B> in the "Saved Formulations" card (left column). Named formulations sync to your account and are available on any device. Load one and every field in the app repopulates.</P>
      </>
    ),
  },

  {
    id: 'principles', icon: 'fas fa-atom',
    titleKey: 'help.sections.principles', title: 'Calculator Principles',
    body: () => (
      <>
        <P>The calculator follows the standard ruminant-nutrition workflow: start from the animal's daily nutrient requirement, subtract what the ration already provides, build the premix to fill the remainder, and sanity-check that the formulated premix doesn't cross toxicity ceilings.</P>
        <H3>Four-layer mineral delivery model</H3>
        <OL>
          <li><B>Biological requirement</B> per kg DMI — from NRC / NASEM tables (see Species Guide for sources).</li>
          <li><B>Formulated target</B> = biological × (1 + overage %) — accounts for shelf-life decay and analytical variability. Defaults are lean (see Commercial Shelf Life section).</li>
          <li><B>Delivery stack:</B>
            <UL>
              <li><B>Ration-side</B> organic products reduce the daily requirement but don't enter the premix.</li>
              <li><B>Premix-organic</B> products fill the remaining requirement and add grams to the premix dose.</li>
              <li><B>Premix-inorganic</B> source fills whatever is still uncovered (usually the cheapest).</li>
              <li><B>Carrier</B> (limestone, rice hulls, wheat middlings) fills the balance to the target dose.</li>
            </UL>
          </li>
          <li><B>MTL check</B> — total-diet delivered mg/kg DM is compared against species-specific Maximum Tolerable Level from NRC <i>Mineral Tolerance of Animals</i> 2005 + NASEM 2021. Over-shoots raise a red "⚠ TOXIC" banner.</li>
        </OL>
        <H3>Vitamins</H3>
        <P>Vitamins A, D3, E and Biotin are target-driven: the calculator sizes the vitamin source to deliver the per-kg-DM target × DMI. Chromium (beef marbling protocols) is the same — auto-added via KemTRACE if the target is above zero and you haven't placed one manually.</P>
        <H3>How % of Rqd works</H3>
        <P>Every nutrient row in the Requirements table has a <B>% of Rqd</B> column. 100% = the NRC/adjusted baseline. Typing 120 pushes the target +20%; typing 80 trims it 20%; typing 0 (or unticking Use) excludes the nutrient entirely. The "safe ≤ N%" hint under each input shows the maximum multiplier that stays within MTL.</P>
        <Note>Rule of thumb: boost when a ration antagonist is suspected (e.g. bump Zn when feeding high-Cu or high-Mo forage). Exclude when the ration already supplies abundant amounts (e.g. Fe in a mineral-rich water source).</Note>
      </>
    ),
  },

  {
    id: 'species-dairy', icon: 'fas fa-droplet',
    titleKey: 'help.sections.dairy', title: 'Dairy — NASEM 2021',
    body: () => (
      <>
        <P>Primary source: <B>NASEM 2021 Nutrient Requirements of Dairy Cattle, 8th revised edition</B> (Erdman &amp; Weiss chairs). Values in the app mirror the Adequate Intake (AI) numbers from the Weiss &amp; Erdman 2021 presentation summary.</P>
        <H3>Stages supported</H3>
        <UL>
          <li><B>Calf (Preweaning)</B> — high Vit A (9,000 IU/kg DM), elevated trace minerals for immune development.</li>
          <li><B>Heifer (Growing)</B> — lower intake of most nutrients; Cu 10, Zn 40, Vit A 2,500.</li>
          <li><B>Far-off Dry</B> (60–22 d pre-calving) — Zn 28, Cu 17, Mn 40, Vit A 5,000, Vit D 1,100.</li>
          <li><B>Close-up Dry</B> (21–0 d pre-calving) — same TM targets as far-off; Vit E bumped to 175 IU/kg DM (NASEM 3 IU/kg BW prefresh).</li>
          <li><B>Fresh / Early Lactation</B> — Zn 60, Cu 11, Mn 30, Vit D 1,300 (40 IU/kg BW lactating), Biotin 0.85 mg.</li>
          <li><B>Mid Lactation</B> — slightly lower Zn (55), otherwise similar.</li>
          <li><B>Late Lactation</B> — Zn 50, Mn 28, Biotin drops to 0.60.</li>
        </UL>
        <H3>Breed adjustments</H3>
        <UL>
          <li><B>Jersey / Guernsey</B> — Vit A +5% (butterfat-rich milk demands more retinol precursor).</li>
          <li><B>Holstein / Brown Swiss</B> — baseline.</li>
        </UL>
        <H3>Milk-yield scaling</H3>
        <P>If milk yield is &gt;10% above the 30 kg/d reference (or &gt;10% below), Zn / Cu / Se / Vit E / Biotin scale proportionally up to +35% / down to –25%. Baseline yields by species: Dairy 30, Goat 3, Sheep 1.5 kg/d.</P>
        <H3>Dry-cow milk-fever strategies</H3>
        <P>For Close-up Dry or Far-off Dry stages a dedicated panel appears offering five approaches: Standard, Negative DCAD, P-binder (Vilofoss X-Zelit), Low Ca (Goff), Low P. Each adjusts the premix and drops a note in the "Applied Adjustments" panel. See the <B>Dry-Cow Strategies</B> help section for the decision matrix.</P>
        <Note>Weiss &amp; Erdman caveat: most Dairy vitamin/mineral numbers are labelled "Adequate Intake (AI)" not "Requirement" because the committee judged the data too thin to set strict Requirements. Treat the targets as well-grounded starting points, not absolutes.</Note>
      </>
    ),
  },

  {
    id: 'species-beef', icon: 'fas fa-cow',
    titleKey: 'help.sections.beef', title: 'Beef — NRC 2016',
    body: () => (
      <>
        <P>Primary source: <B>NRC 2016 Nutrient Requirements of Beef Cattle, 8th revised edition</B>, with SEA tropical-breed adjustments.</P>
        <H3>Stages</H3>
        <UL>
          <li><B>Calf (Preweaning)</B>, <B>Growing / Stocker</B>, <B>Stressed / Receiving</B> (Vit A 5,000, Vit E 90 IU/kg DM for feedlot arrival stress), <B>Backgrounding</B>, <B>Finishing</B>, <B>Gestating Cow</B>, <B>Lactating Cow</B>.</li>
        </UL>
        <H3>Tropical / <i>Bos indicus</i> breeds</H3>
        <P>Brahman, Thai Native (Kha-Korat), Brahman × Charolais, Brahman × Angus, Droughtmaster, Bali Cattle, Kedah-Kelantan — these SEA breeds get a standard adjustment:</P>
        <UL>
          <li>Zn <B>+15%</B> — hoof integrity in humid climates.</li>
          <li>Vit E <B>+20%</B> — heat-stress antioxidant.</li>
          <li>Vit A <B>+10%</B> — compensates for variable green-forage quality.</li>
        </UL>
        <H3>Meat-quality targets</H3>
        <P>When species is Beef (or Goat/Sheep) the Animal Profile exposes three toggles:</P>
        <UL>
          <li><B>Marbling (IMF)</B> — in Finishing / Backgrounding: Vit A restricted to ~50% of baseline, Cr auto-added at 0.5 mg/kg DM, Biotin 0.20 mg/kg DM. In early-life stages Vit A is <i>boosted</i> 80% to seed intramuscular adipocyte differentiation.</li>
          <li><B>Bright-red colour</B> — Vit E ≥150 IU/kg DM, Se ≥0.30 mg/kg DM (oxymyoglobin stabilisation).</li>
          <li><B>Extended shelf life</B> — Vit E ≥200, Se ≥0.30, Fe capped at 40, Cu capped at 10 (lipid-oxidation control in retail display).</li>
        </UL>
        <Warn>Never stack <B>Marbling</B> with <B>β-carotene</B> supplementation — β-carotene is a provitamin A and partially cancels the low-Vit-A protocol. The calculator flags this combination automatically.</Warn>
        <H3>Ionophores</H3>
        <P>Monensin, lasalocid, and salinomycin improve feed efficiency. The catalog lists three monensin concentrations (Rumensin 200, Rumensin 100, Monensin 60) so you can match your supplier's product. <B>All ionophores are lethal to horses</B> at any dose — never feed in mixed-species barns.</P>
      </>
    ),
  },

  {
    id: 'species-goat', icon: 'fas fa-shield-dog',
    titleKey: 'help.sections.goat', title: 'Goat — NRC 2007',
    body: () => (
      <>
        <P>Primary source: <B>NRC 2007 Nutrient Requirements of Small Ruminants</B>, Table 15-4 for meat-and-milk goats, extended with Alabama Cooperative Extension summary values.</P>
        <H3>Stages supported</H3>
        <UL>
          <li><B>Growing Kid</B>, <B>Maintenance</B>, <B>Late Gestation</B>, <B>Early / Mid / Late Lactation</B>, <B>Finishing</B> (meat goats).</li>
        </UL>
        <H3>Differences from cattle</H3>
        <UL>
          <li><B>Much higher Cu tolerance</B> than sheep (goats are more like cattle) — MTL 40 mg/kg DM.</li>
          <li><B>Higher Zn lactation</B> (45 mg/kg DM even at modest 2–3 kg/d yield) — goat milk has more Zn per kg than cow milk.</li>
          <li>Lower Vit D requirement (500–650 IU/kg DM depending on stage).</li>
        </UL>
        <H3>Milk-yield scaling</H3>
        <P>Baseline yield for dairy goats is 3 kg/d. Yields above ~3.3 kg/d ratchet Zn, Cu, Se, Vit E, and Biotin up; yields below ~2.7 kg/d trim Zn and Vit E. Dairy-breed-specific tweaks for Saanen / Alpine / Toggenburg / LaMancha / Nubian are not applied — all goats use the same breed baseline.</P>
        <H3>Meat-quality targets</H3>
        <P>The Marbling / Color / Shelf-life toggles also apply to goats in Finishing or Growing Kid stages (same biology as beef — oxymyoglobin chemistry, IMF development). Less commercial marbling market than beef but the option is there.</P>
      </>
    ),
  },

  {
    id: 'species-sheep', icon: 'fas fa-shield-cat',
    titleKey: 'help.sections.sheep', title: 'Sheep — NRC 2007 + Cu ceiling',
    body: () => (
      <>
        <P>Primary source: <B>NRC 2007 Small Ruminants</B>. Sheep share the lookup tables with goats but have one critical difference:</P>
        <Warn><B>Sheep Cu ceiling = 15 mg/kg DM total diet</B> (vs 40 for goats and cattle). Sheep have no effective hepatic Cu excretion — chronic intake above 15 mg/kg DM causes fatal Cu accumulation. The calculator enforces this ceiling automatically and raises a red warning if exceeded.</Warn>
        <H3>Stages</H3>
        <UL>
          <li><B>Growing Lamb</B>, <B>Maintenance</B>, <B>Late Gestation</B>, <B>Early / Mid-Late Lactation</B>, <B>Finishing</B>.</li>
        </UL>
        <H3>Dairy sheep breeds</H3>
        <P>East Friesian, Awassi, Lacaune get automatic adjustments: <B>Zn +10%</B> and <B>Vit E +20%</B> for milk production support. Baseline yield for dairy sheep is 1.5 kg/d.</P>
        <H3>Safe Cu sources for sheep</H3>
        <UL>
          <li>Avoid copper sulfate in sheep premixes unless closely monitored.</li>
          <li>If Cu supplementation is needed, prefer organic (e.g. Availa-Cu) at low % of Rqd — the chelate form is less hepatically loading and easier to control.</li>
          <li>Watch Mo and S in forages — they are the natural Cu antagonists that keep sheep out of toxicity; if forage is low-Mo, even sulfate Cu can become risky.</li>
        </UL>
        <H3>Feedlot urolithiasis (water belly)</H3>
        <P>High-grain finishing diets for lambs produce phosphate stones in the urinary tract (urolithiasis). The <B>Ammonium Chloride (urinary acidifier)</B> entry in the Metabolic Modifier category is the standard preventative — 5–15 g/hd/d for lambs. Different from the Dairy DCAD use of NH₄Cl (which is 50–150 g/hd/d).</P>
      </>
    ),
  },

  {
    id: 'sources', icon: 'fas fa-leaf',
    titleKey: 'help.sections.sources', title: 'Mineral Sources (Organic / Inorganic)',
    body: () => (
      <>
        <H3>Organic sources panel</H3>
        <P>Every organic (chelated) product and multi-mineral blend in the catalog appears as one checkbox row: Availa-Zn, Bioplex Copper, Mintrex Mn, Availa-4 (Zn/Mn/Cu/Co blend), Bioplex Quadra, and so on. Check the ones you want to include.</P>
        <UL>
          <li><B>Location — In premix vs In ration.</B> Ration-side products (usually delivered via TMR separately) reduce the daily requirement but don't enter the premix dose or cost. Useful for companies that dose an AA-complex blend directly into the TMR instead of through the premix.</li>
          <li><B>Mode — % of mineral vs Anchor % vs Fixed g.</B> For a single-mineral product (Availa-Zn), set what % of the Zn requirement it should cover. For a blend (Availa-4), set an anchor-mineral % OR a fixed g/d rate and the system credits each mineral in the blend.</li>
          <li><B>Conflict rule.</B> A mineral can only be covered by one organic source. Selecting Availa-4 disables Availa-Zn, Bioplex Zinc, etc. for Zn. Tooltip shows the conflict.</li>
        </UL>
        <H3>Inorganic sources panel</H3>
        <P>Per-mineral dropdown: sulfate, oxide, hydroxychloride, carbonate, iodate / iodide. Whatever part of the requirement isn't covered by the organic source above is filled with the inorganic you pick.</P>
        <H4>Bioavailability tiers (sulfate = 100% reference)</H4>
        <UL>
          <li>AA Complex / Bis-Chelate: 140–170% (Availa, Mintrex)</li>
          <li>Proteinate: 120–140% (Bioplex)</li>
          <li>Glycinate / simple chelate: 115–140% (E.C.O.Trace)</li>
          <li>Hydroxychloride: 110–125% (IntelliBond)</li>
          <li>Selenium yeast / hydroxy-SeMet: 150–180% (Sel-Plex, Selisseo)</li>
          <li>Sulfate: 100% (baseline)</li>
          <li>Oxide: 30–80% (cheapest, lowest bioavailability, worst with antagonists)</li>
        </UL>
        <H4>When to use what</H4>
        <UL>
          <li><B>High-producing dairy / beef finishing</B> — organic on Cu, Zn, Mn, Se at 30–60% of requirement. Protects against ration antagonists (S, Mo, Fe, phytate).</li>
          <li><B>Low-to-moderate production</B> — sulfate / oxide inorganic only is often adequate.</li>
          <li><B>Sheep</B> — organic Cu is strongly preferred (less hepatic loading).</li>
          <li><B>Tropical / humid regions</B> — hydroxychloride (IntelliBond) is the best stability vs cost compromise — 55% Zn, 58% Cu, low rumen solubility so antagonists don't react.</li>
        </UL>
      </>
    ),
  },

  {
    id: 'additives', icon: 'fas fa-vial',
    titleKey: 'help.sections.additives', title: 'Feed Additives',
    body: () => (
      <>
        <P>The Feed Additives panel lists 60+ products across 16 categories. Each additive has a g/hd/d dose input (blank = not included), an editable price, a tooltip with mode of action, and a safety ceiling (<B>maxDose</B>) where one applies.</P>
        <H3>Categories</H3>
        <UL>
          <li><B>Yeast / DFM</B> — live yeasts (Yea-Sacc, Levucell, SafCattle), yeast culture (Diamond V), cell wall (IMAGRO), bacterial DFM (Bovamine).</li>
          <li><B>Ionophore</B> — monensin (three concentrations), lasalocid, salinomycin. ⚠ Lethal to horses.</li>
          <li><B>Buffer</B> — NaHCO₃, Acid Buf (4 variants), MgO, Kemin Rumen Buffer C.</li>
          <li><B>RP Amino Acid</B> — Smartamine, Mepron, MetaSmart (Met); AjiPro-L, LysiGEM (Lys); RP Histidine.</li>
          <li><B>RP Vitamin</B> — ReaShure (choline), Niashure (niacin), Rovimix Hy-D (25-OH-D3). ⚠ Hy-D has a hypervitaminosis-D ceiling of 1 g/hd/d.</li>
          <li><B>Carotenoid</B> — Rovimix β-Carotene 10%, Lucarotin 10%. For bull fattening and fertility. Conflicts with Marbling toggle.</li>
          <li><B>DCAD Anionic Salt</B> — SoyChlor, Bio-Chlor, Animate, plus generic NH₄Cl, (NH₄)₂SO₄, MgSO₄, CaCl₂. Close-up Dry only.</li>
          <li><B>P-binder (Dry Cow)</B> — Vilofoss X-Zelit (the only product in this category, with its own mechanism — see Dry-Cow Strategies).</li>
          <li><B>Glucogenic Energy</B> — Propylene glycol, Calcium propionate, Glycerol. Fresh-cow ketosis prevention.</li>
          <li><B>Slow-release N</B> — Optigen, NitroShure. ⚠ NPN toxicity risk above maxDose.</li>
          <li><B>Enzyme</B> — FibroZyme (cellulase/xylanase), Ronozyme RumiStar (α-amylase).</li>
          <li><B>Methane inhibitor</B> — Bovaer (3-NOP), Mootral, Asparagopsis.</li>
          <li><B>Phytobiotic</B> — Agolin, Crina, Digestarom, Oregostim, Micro-Aid (yucca).</li>
          <li><B>Mycotoxin binder</B> — Mycofix, Mycosorb A+, bentonite, Fixat.</li>
          <li><B>Tannin</B> — ByPro, SilvaFeed Q.</li>
          <li><B>Flavor / Palatability</B> — Luctarom, Sucram.</li>
          <li><B>Metabolic modifier</B> — Betafin, Betaine HCl, NH₄Cl urinary acidifier (beef/sheep urolithiasis prevention).</li>
        </UL>
        <Note>Bypass fat is intentionally excluded. Add it directly to the TMR — don't put it in the premix.</Note>
        <H3>Safety ceiling (maxDose)</H3>
        <P>Products with a real overdose risk — ionophores, Hy-D, NH₄Cl, (NH₄)₂SO₄, MgSO₄ (laxative), CaCl₂ (irritant), Optigen / NitroShure (ammonia toxicity), propylene glycol (CNS depression), Bovaer (label cap), Asparagopsis (bromoform residue) — carry a hard ceiling. Exceeding it turns the dose input red, pulses a "⚠ OVER MAX" badge, and drops a line into the warnings banner explaining the specific risk.</P>
      </>
    ),
  },

  {
    id: 'drycow', icon: 'fas fa-cow',
    titleKey: 'help.sections.drycow', title: 'Dry-Cow Milk-Fever Strategies',
    body: () => (
      <>
        <P>Hypocalcemia (milk fever) is the biggest single transition-cow disease. The Dry-Cow Strategy panel (visible only for Dairy + Close-up Dry / Far-off Dry) offers five distinct mechanisms. They are not additive — pick one.</P>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs border">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 text-left border">Strategy</th>
                <th className="p-2 text-left border">Mechanism</th>
                <th className="p-2 text-left border">Key premix effect</th>
                <th className="p-2 text-left border">Suggested additives</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t"><td className="p-2 border">Standard</td><td className="p-2 border">No intervention.</td><td className="p-2 border">Normal Ca ~100 g/d.</td><td className="p-2 border">—</td></tr>
              <tr className="border-t"><td className="p-2 border">Negative DCAD</td><td className="p-2 border">Acidify blood via anionic salts → parathyroid activation → bone Ca mobilisation.</td><td className="p-2 border">Vit D3 bumped to ≥1500 IU/kg DM. Target urine pH 6.0–6.5. Ca 150–180 g/hd/d.</td><td className="p-2 border">SoyChlor / Bio-Chlor / Animate or generic NH₄Cl + (NH₄)₂SO₄ + MgSO₄ blend.</td></tr>
              <tr className="border-t"><td className="p-2 border">P-binder (X-Zelit)</td><td className="p-2 border">Binds rumen P → blood P drops → FGF23 falls → bone mobilises Ca + P.</td><td className="p-2 border">Vit D3 bumped to ≥1500 IU/kg DM. No DCAD manipulation, no low-K forage, no urine pH monitoring.</td><td className="p-2 border">X-Zelit 350–500 g/hd/d, last 14–21 days pre-calving. Auto-populated.</td></tr>
              <tr className="border-t"><td className="p-2 border">Low Ca (Goff)</td><td className="p-2 border">Hard Ca restriction primes parathyroid.</td><td className="p-2 border">Ca cap 30 / 50 / 70 g/d.</td><td className="p-2 border">Switch limestone carrier to rice hulls or wheat middlings.</td></tr>
              <tr className="border-t"><td className="p-2 border">Low P</td><td className="p-2 border">Low blood P → vitamin-D activation → Ca absorption ↑.</td><td className="p-2 border">P target ~30 g/hd/d.</td><td className="p-2 border">Forage choice: low-P corn silage, avoid DDGS / brewers grains.</td></tr>
            </tbody>
          </table>
        </div>
        <H3>Choosing between them</H3>
        <UL>
          <li><B>Negative DCAD</B> is the dairy industry's gold standard for high-yielding herds, but requires anionic salts in the TMR (palatability cost) and urine-pH monitoring.</li>
          <li><B>P-binder (X-Zelit)</B> is the low-hassle alternative: no palatability problem, no urine pH test, no low-K forage requirement. Costs more per cow per day but saves labour.</li>
          <li><B>Low-Ca Goff method</B> is hard to achieve with alfalfa-based forages (which are naturally Ca-rich). Best paired with cereal straws or corn silage.</li>
          <li><B>Low-P</B> is the least-used strategy; mostly a forage-management intervention rather than a premix design.</li>
        </UL>
      </>
    ),
  },

  {
    id: 'shelf-life', icon: 'fas fa-box-archive',
    titleKey: 'help.sections.shelfLife', title: 'Commercial Shelf Life &amp; Overage',
    body: () => (
      <>
        <P>NRC/NASEM targets are for <B>what the animal needs, biologically</B>. A commercial premix also has to survive storage. This panel adds the industry-standard "overage" so the premix still delivers the biological dose at the end of shelf life.</P>
        <H3>Three inputs</H3>
        <UL>
          <li><B>Shelf life</B> — 3 / 6 / 9 / 12 / 18 / 24 months.</li>
          <li><B>Storage environment</B> — Standard (&lt;25°C, &lt;75% RH, sealed bag) or Tropical / humid (scales decay ×1.5).</li>
          <li><B>Vit A form</B> — Coated CWS beadlets (most stable, 0.5× multiplier, <i>default</i>), Standard uncoated, or Co-mixed with choline chloride (2.5× multiplier — choline is a powerful pro-oxidant for Vit A).</li>
        </UL>
        <H3>Decay rates (%/month, standard conditions)</H3>
        <UL>
          <li>Vit A acetate 3.0 · 25-OH-D3 / Vit D3 2.0 · dl-α-tocopheryl acetate (Vit E) 0.5 · Biotin 1.0</li>
          <li>Sodium selenite 0.5 · Selenium yeast / HMSeBA 0.1 (much more stable)</li>
          <li>Potassium iodide (KI) 2.0 · EDDI / calcium iodate 0.3</li>
          <li>Minerals (Zn, Cu, Mn, Co, Fe, Cr) 0.0 (no chemical decay; analytical floor of 1% applied).</li>
        </UL>
        <P>Sources: DSM "Stability of Vitamins in Feed", Lonza / BASF product data, Adisseo Selisseo data, NRC 2005 <i>Mineral Tolerance of Animals</i> Appendix.</P>
        <H3>Formula</H3>
        <P className="font-mono bg-slate-100 p-2 rounded">overage% = max( 1/(1-decay) - 1, analytical_floor )</P>
        <P>where <i>decay = 1 - (1 - monthly_rate × multipliers)^months</i>.</P>
        <P>The formulated target = biological × (1 + overage%). The premix delivers the formulated target on day 1 and still meets the biological target at the end of shelf life.</P>
        <H3>Defaults are lean</H3>
        <P>On the current build the analytical floor is 1–2% (vs 3–5% in manufacturer literature) and the Vit A form defaults to coated. For a 6-month dairy premix this gives ~7% overage on Vit A and 1% on minerals — not 20%. If you're producing premix with a long shelf life or mixing Vit A with choline, manually raise the per-nutrient overage % in the panel table.</P>
        <H3>Incompatibility suggestions</H3>
        <UL>
          <li>Vit A + trace-mineral sulfates + choline chloride → suggests coated Vit A or organic chelates or separate-bag choline.</li>
          <li>Iodine as KI → suggests EDDI or calcium iodate for shelf life &gt;3 months.</li>
        </UL>
      </>
    ),
  },

  {
    id: 'safety', icon: 'fas fa-shield-halved',
    titleKey: 'help.sections.safety', title: 'Safety &amp; MTL',
    body: () => (
      <>
        <P>Two independent safety layers protect against toxicity:</P>
        <H3>1. Per-ingredient maxDose (additives)</H3>
        <P>Every additive with a toxicity, regulatory or efficacy ceiling carries a <B>maxDose</B> in g/hd/d. Entering a dose above it turns the input red and pulses a "⚠ OVER MAX" badge. The warnings banner at the top of the requirements column names the product, the ceiling, and why the ceiling exists (hepatotoxicity, ammonia toxicity, hypervitaminosis D, bromoform residue, etc.).</P>
        <H3>2. Maximum Tolerable Level (MTL)</H3>
        <P>Per-species MTL values per NRC <i>Mineral Tolerance of Animals</i> 2005 + NASEM 2021 updates:</P>
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-xs border">
            <thead className="bg-slate-100">
              <tr><th className="p-2 border">Species</th><th className="p-2 border">Zn</th><th className="p-2 border">Cu</th><th className="p-2 border">Mn</th><th className="p-2 border">Se</th><th className="p-2 border">I</th><th className="p-2 border">VitA</th><th className="p-2 border">VitD</th><th className="p-2 border">VitE</th></tr>
            </thead>
            <tbody className="font-mono">
              <tr className="border-t"><td className="p-2 border">Dairy / Beef / Goat</td><td className="p-2 border">500</td><td className="p-2 border">40</td><td className="p-2 border">1000</td><td className="p-2 border">5</td><td className="p-2 border">50</td><td className="p-2 border">22,000</td><td className="p-2 border">2,200</td><td className="p-2 border">2,000</td></tr>
              <tr className="border-t"><td className="p-2 border">Sheep</td><td className="p-2 border">500</td><td className="p-2 border font-bold text-rose-700">15</td><td className="p-2 border">1000</td><td className="p-2 border">5</td><td className="p-2 border">50</td><td className="p-2 border">22,000</td><td className="p-2 border">2,200</td><td className="p-2 border">2,000</td></tr>
            </tbody>
          </table>
          <P className="text-[10px] text-slate-500">Minerals + Cr + Biotin in mg/kg DM; vitamins in IU/kg DM. Sheep Cu is the well-known hypersensitivity ceiling.</P>
        </div>
        <P>MTL is checked against the <B>formulated</B> (initial-potency) premix delivery, not just biological target. Shelf-life overage could in principle push a safe biological dose above MTL — the check catches that.</P>
        <Note>Weiss &amp; Erdman 2021 note: human data suggest a <i>lower</i> MTL for Vit A, and limited animal data suggest a lower MTL for Vit E. The 22,000 / 2,000 IU/kg DM values are conservative industry ceilings; chronic Vit A feeding anywhere above ~10,000 IU/kg DM merits caution.</Note>
      </>
    ),
  },

  {
    id: 'faq', icon: 'fas fa-circle-question',
    titleKey: 'help.sections.faq', title: 'FAQ',
    body: () => (
      <>
        <H4>Q: My premix cost seems very high. What is driving it?</H4>
        <P>Usually organic-mineral products. Check the Batch Formula table — the "Cost / ton" column ranks ingredients by contribution. If an Availa-something or Mintrex is dominating, try reducing the % of Rqd (say from 40% to 20% organic) and let sulfates fill more of the gap.</P>

        <H4>Q: The active grams exceed the dose. What happened?</H4>
        <P>You over-filled. The calculator shows a warning "Active ingredients exceed the dose — no room for carrier." Fix by either (a) raising the dose (e.g. 100 → 150 g/hd/d), (b) trimming blend inclusion rates, or (c) dropping some % of Rqd on generously-dosed minerals.</P>

        <H4>Q: Why does Sheep Cu always show a ceiling warning?</H4>
        <P>Sheep Cu MTL is 15 mg/kg DM total diet. If your basal ration already has, say, 8 mg/kg DM from forage, you only have 7 mg/kg DM of headroom. The calculator assumes the ration Cu is zero unless you add ration-side Cu — so the number it shows is premix delivery only. Check the Mineral Delivery table and compare the total to 15.</P>

        <H4>Q: What's the difference between "Organic" and "Organic blend"?</H4>
        <P>An organic single-mineral product (e.g. Availa-Zn) supplies one mineral. A blend (Availa-4, Bioplex Quadra) supplies multiple minerals in a fixed ratio. Blends are convenient but you can't independently tune each mineral's inclusion.</P>

        <H4>Q: Can I use the calculator for other species (pigs, poultry, aquaculture)?</H4>
        <P>No. The physiology, digestive system, and NRC references are ruminant-specific. For monogastrics look at NRC Swine 2012, NRC Poultry 1994 / Rostagno 2017 tables.</P>

        <H4>Q: How do I know my formulation is safe?</H4>
        <P>Watch the red warnings banner at the top of the requirements column. Any "⚠ TOXIC" or "⚠ OVER MAX" message is a hard flag. Green and amber rows in the Mineral Delivery table mean you're on-target; red means over-delivery (possibly toxic) or under-delivery.</P>

        <H4>Q: Is my data private?</H4>
        <P>Your saved formulations sync to Firestore under your user account. Firestore security rules enforce that no other user can read or write your data. Your email is used only for login and password recovery; it's not shared or sold.</P>

        <H4>Q: Legal responsibility?</H4>
        <P>See the Terms of Use displayed at signup. In short: the calculator is an educational / informational tool. You (the user) are the sole responsible party for every premix you design, produce, or feed. Verify every formulation with a qualified veterinarian or nutritionist before use.</P>
      </>
    ),
  },
];
