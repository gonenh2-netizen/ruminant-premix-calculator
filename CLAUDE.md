# Ruminant Vitamin & Mineral Premix Calculator

This file is the entry context for Claude Code. Read it in full before making changes. It covers the project's purpose, data model, open tasks, and file layout.

## What this tool does

Single-page calculator (React + Vite, builds to a standalone HTML file) for formulating vitamin & mineral premixes for ruminants — **dairy cattle, beef cattle, goats, and sheep**. Farmers/nutritionists pick a species, breed, stage/phase, enter DMI + dose + milk yield, and the app outputs:

1. **Daily nutrient requirement** (per-animal mg/IU based on NRC/NASEM targets × DMI).
2. **Batch formula** (g per dose and kg per 1,000-kg ton) with editable raw-material pricing.
3. **Cost summary** in the user's chosen currency (USD / EUR / ILS / GBP / VND / AZN / IDR and extendable).
4. **Exports** for downstream ration software: Rationall matrix CSV, AMTS/NDS XML, generic report CSV.

The calculator adjusts formulations for:
- **Beef quality targets** — marbling (IMF), bright-red steak color, extended shelf/display life — each toggle modifies Vit A, E, Se, Fe, Cu, Cr, Biotin in species-correct ways.
- **Milk yield** — scales Zn, Cu, Se, Vit E, Biotin for lactating animals above/below baseline yield.
- **Breed-specific tweaks** — Jersey/Guernsey (Vit A up for butterfat), East Friesian/Awassi/Lacaune (dairy sheep), Wagyu (marbling hint), and all SEA / *Bos indicus* breeds (Zn +15%, Vit E +20%, Vit A +10% for humid-climate / heat-stress support).
- **Sheep copper ceiling** — enforces the 15 mg/kg DM cap and surfaces a warning; sheep are highly susceptible to chronic Cu toxicity.

## Current state (April 2026)

The live file `Ruminant_Premix_Calculator.html` is a single pre-compiled React app (no build step; uses React UMD + Tailwind CDN). **It works and is in production use.** It has:

- All four species with NASEM 2021 (dairy) / NRC 2007 (goat/sheep) / NRC 2016 (beef) requirement tables.
- Breed lists including SEA tropical beef breeds (Brahman, Thai Native Kha-Korat, Brahman crosses, Bali Cattle, Kedah-Kelantan, Droughtmaster) ahead of temperate breeds.
- Beef quality toggles with tooltips explaining the biology.
- Organic/inorganic split sliders per mineral.
- Editable ingredient pricing, carrier selector, CSV/Rationall/AMTS-XML exports.

## What's missing (top-priority features to rebuild)

### 1. Branded organic product catalog

Per-mineral dropdown with actual industry products, not just "Zn Glycinate". Users pick their supplier's product. Data to include (partial — extend as needed):

| Brand | Product | Minerals | Type | Purity | Bioavail | Notes |
|---|---|---|---|---|---|---|
| Zinpro | Availa-Zn | Zn | Zn-AA complex | 6% | 1.60 | Flagship MAAC |
| Zinpro | Availa-Cu | Cu | Cu-AA complex | 10% | 1.50 | |
| Zinpro | Availa-Mn | Mn | Mn-AA complex | 6% | 1.55 | |
| Zinpro | Availa-4 (blend) | Zn/Mn/Cu/Co | AA complex blend | Zn 5.15%, Mn 2.86%, Cu 1.8%, Co 0.18% | 1.60 | Flagship feedlot blend |
| Zinpro | Availa-6 (blend) | Zn/Mn/Cu/Co/Se/I | AA + SeMet + KI | adds Se 0.006%, I 0.2% | 1.55 | Dairy focus |
| Zinpro | 4-Plex C (blend) | Zn/Mn/Cu/Co | Older chelate | 3.4% each | 1.40 | Legacy |
| Alltech | Bioplex Zinc | Zn | Zn proteinate | 15% | 1.30 | |
| Alltech | Bioplex Copper | Cu | Cu proteinate | 10% | 1.25 | |
| Alltech | Bioplex Manganese | Mn | Mn proteinate | 15% | 1.25 | |
| Alltech | Bioplex Iron | Fe | Fe proteinate | 15% | 1.30 | |
| Alltech | Bioplex Cobalt | Co | Co proteinate | 1% | 1.30 | |
| Alltech | Bioplex Quadra (blend) | Zn/Cu/Mn/Fe | Proteinate blend | Zn 5.5%, Cu 4.5%, Mn 5.5%, Fe 4% | 1.30 | |
| Alltech | Sel-Plex | Se | Selenium yeast (SeMet) | 0.2% | 1.50 | Industry standard organic Se |
| Adisseo | Selisseo (HMSeBA) | Se | Hydroxy-selenomethionine | 0.2% | 1.80 | Highest Se bioavail |
| Novus | Mintrex Zn | Zn | Zn-HMTBa bis-chelate | 15% | 1.50 | ~54% rumen bypass |
| Novus | Mintrex Cu | Cu | Cu-HMTBa bis-chelate | 15% | 1.45 | |
| Novus | Mintrex Mn | Mn | Mn-HMTBa bis-chelate | 13% | 1.45 | |
| Novus | Mintrex Dairy Blend | Zn/Cu/Mn | HMTBa bis-chelate blend | Zn 8%, Cu 5%, Mn 6% | 1.45 | |
| Kemin | KemTRACE Chromium | Cr | Chromium propionate | 0.04% | 1.00 | Marbling / heat stress |
| Selko/Trouw | IntelliBond Z | Zn | Zinc hydroxychloride | 55% | 1.15 | |
| Selko/Trouw | IntelliBond C | Cu | Basic copper chloride | 58% | 1.20 | Low Mo interaction |
| Selko/Trouw | IntelliBond M | Mn | Manganese hydroxychloride | 44% | 1.15 | |
| Selko/Trouw | IntelliBond Vitals (blend) | Zn/Cu/Mn | Hydroxychloride blend | Zn 25%, Cu 20%, Mn 18% | 1.18 | Concentrated |
| Biochem | E.C.O.Trace Zn | Zn | Zn glycinate | 18% | 1.40 | |
| Biochem | E.C.O.Trace Cu | Cu | Cu glycinate | 18% | 1.35 | |
| Generic | ZnSO₄ monohydrate | Zn | Sulfate | 35% | 1.00 (ref) | |
| Generic | ZnO | Zn | Oxide | 72% | 0.60 | Cheapest, lowest bioavail |
| Generic | CuSO₄ pentahydrate | Cu | Sulfate | 25% | 1.00 | |
| Generic | MnSO₄ monohydrate | Mn | Sulfate | 32% | 1.00 | |
| Generic | MnO | Mn | Oxide | 60% | 0.70 | |
| Generic | Cobalt carbonate | Co | Carbonate | 46% | 1.00 | Rumen microbes convert to B12 |
| Generic | Cobalt glucoheptonate | Co | Organic | 1% | 1.20 | |
| Generic | Sodium selenite | Se | Inorganic | 45% | 1.00 | |
| Generic | KI (Potassium iodide) | I | Iodide | 76% | 1.00 | |
| Generic | EDDI | I | Ethylenediamine dihydroiodide | 80% | 1.10 | More stable than KI |
| Generic | Calcium iodate | I | Iodate | 64% | 1.00 | Most stable for salt licks |
| Generic | Ferrous sulfate monohydrate | Fe | Sulfate | 30% | 1.00 | |
| Generic | Iron glycinate | Fe | AA chelate | 18% | 1.35 | |

### 2. Multi-mineral blend panel

Separate UI section where user sets a g/head/day inclusion rate for a branded blend (Availa-4, Bioplex Quadra, IntelliBond Vitals, KemTRACE, Mintrex Dairy, etc.). Calculator subtracts the blend's mineral contribution from NRC targets, then fills the remaining gap from the per-mineral sources. Never double-doses.

### 3. Custom product builder with localStorage persistence

Modal form where the user enters name, brand, chemistry, mineral composition (%), bioavailability, price, notes. Two modes:
- **Single-mineral**: pick one mineral + purity %
- **Multi-mineral blend**: enter % for any combination of Zn/Cu/Mn/Co/Se/I/Fe/Cr

Saved products persist in browser localStorage under key `premix_calculator_custom_products_v1` (JSON array). Custom products appear in the same dropdowns as built-in ones with a `CUSTOM` badge. "My Custom Products" section at the bottom of the page lists all saved products with a trash icon to delete.

### 4. Bioavailability guide

Toggleable reference table comparing the relative bioavailability tiers:
- AA Complex / Bis-Chelate: 140–170%
- Proteinate: 120–140%
- Glycinate / Simple Chelate: 115–140%
- Hydroxychloride: 110–125%
- Selenium Yeast / Hydroxy-SeMet: 150–180%
- Sulfate: 100% (reference baseline)
- Oxide: 30–80%

Reference = sulfate form. Explain the trade-offs (rumen stability, antagonist protection, cost).

### 5. Additional features

- **XML export polish** — verify against an actual AMTS import and adjust tag names if needed. Current format follows the `Standard_XML_Data` structure from NDS/Yarvet lab files.
- **Save/load formulation** — let users save named formulations (species + stage + all overrides) to localStorage and recall them.
- **Batch-size selector** — currently assumes 1-ton batches; add 500 kg / 100 kg options.
- **PDF export** — via `window.print()` with print-specific CSS, or html2pdf library.

## Data sources — where the requirement tables come from

- **Dairy (NASEM 2021)** — extracted from user's NotebookLM notebook [_Nutritional Quality of Forage and Dairy Cattle Dietary Requirements_](https://notebooklm.google.com/notebook/15ee8c12-1e60-4162-891d-fbb64ca58835) (89 sources).
- **Goats & Sheep (NRC 2007 Small Ruminants)** — from [_Nutrient Requirements of Meat and Milk Goats_](https://notebooklm.google.com/notebook/5c08d08d-120b-447f-8210-e9d9450e9c4b) (52 sources). The NRC Goats 2007 PDF and Alabama Cooperative Extension Sheep & Goat summary are the primary references. Sheep Cu ceiling: 15 mg/kg DM total diet.
- **Beef (NRC 2016 Beef Cattle)** — confirmed by [_Beef Nutrition Strategies for Digestibility and Methane Reduction_](https://notebooklm.google.com/notebook/15c0ffb7-f21c-41fc-8589-2eb6ee78c481) (102 sources, Southeast-Asia focus).
- **Beef quality logic** — Vit A restriction for marbling: Harris et al. 2017, plus meta-analysis PMC10050684. Vit E + Se for oxymyoglobin protection: Faustman et al., 500 IU Vit E/head/day for 100 days pre-slaughter. BBC (Betaine-Biotin-Chromium) for Wagyu IMF.
- **Tropical breed adjustment** — Bos indicus breeds get Zn +15% (hoof integrity in humid climates), Vit E +20% (heat stress antioxidant), Vit A +10% (variable green-forage quality in SEA).

## Target file layout (once migrated to Vite)

```
/
├── CLAUDE.md                        # This file
├── README.md                        # Public-facing intro
├── package.json
├── vite.config.js                   # with vite-plugin-singlefile for standalone HTML output
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx                      # Top-level layout; composes all sections
│   ├── data/
│   │   ├── requirements.js          # REQS object (all 4 species)
│   │   ├── products.js              # Per-mineral product catalog (branded + generic)
│   │   ├── blends.js                # Multi-mineral blend products
│   │   ├── vitamins.js              # Vitamin sources + potencies
│   │   ├── carriers.js
│   │   ├── currencies.js
│   │   └── bioavail-tiers.js
│   ├── components/
│   │   ├── Header.jsx               # Title + currency + export buttons
│   │   ├── SpeciesTabs.jsx
│   │   ├── AnimalProfile.jsx        # Breed, stage, DMI, dose, milk yield, carrier
│   │   ├── BeefQualityToggles.jsx
│   │   ├── MineralSources.jsx       # Per-mineral organic/inorganic dropdowns + slider
│   │   ├── BlendPanel.jsx           # Multi-mineral blend inclusion rates
│   │   ├── CustomProductModal.jsx   # Add custom product
│   │   ├── CustomProductsList.jsx   # Saved custom products
│   │   ├── BioavailGuide.jsx
│   │   ├── RequirementsTable.jsx
│   │   ├── FormulaTable.jsx
│   │   └── CostHeadline.jsx
│   ├── hooks/
│   │   ├── useCustomProducts.js     # localStorage sync
│   │   └── useFormulation.js        # adjustedReqs + calc useMemo logic
│   ├── logic/
│   │   ├── adjustReqs.js            # Species/stage/breed/milk-yield/beef-quality modifiers
│   │   └── calcFormulation.js       # Blends-first, then per-mineral fill
│   └── exports/
│       ├── exportCSV.js             # Full formulation report
│       ├── exportRationall.js       # 61-column matrix row
│       └── exportAMTS.js            # Standard_XML_Data format
└── dist/
    └── Ruminant_Premix_Calculator.html   # Single-file build output (auto-generated)
```

## Build / dev commands (once package.json exists)

```bash
npm install         # Install React, Vite, Tailwind, vite-plugin-singlefile
npm run dev         # Dev server with HMR
npm run build       # Produces dist/Ruminant_Premix_Calculator.html (single self-contained file)
npm run preview     # Serve the built file locally
```

The build uses `vite-plugin-singlefile` to inline CSS/JS into one HTML, so end users still get a single file to double-click.

## Coding conventions for Claude Code

- Keep data (REQS, PRODUCTS, BLENDS) in `src/data/*.js` as exported constants. Never hardcode numbers in components.
- Requirement tables are expressed per kg DMI. Daily need = `REQS[species].stages[stage][nutrient] * dmi`.
- Purity is a fraction (0 — 1), never a percent. Bioavailability is a multiplier vs sulfate (1.0 = reference).
- Calculations: compute requirements in **mg** for minerals, **IU** for fat-soluble vitamins, **mg** for biotin / chromium.
- The formulation calc order matters: (1) start with daily mg target per nutrient, (2) deduct contributions from enabled multi-mineral blends, (3) fill remaining deficit using per-mineral organic/inorganic split at the user's chosen organic %, (4) cap by sheep Cu ceiling if species === 'Sheep'. Never double-dose.
- For the **Rationall** export: the feed row must be 61 columns in the exact order from `matrix.csv` reference. Vit A is in **KIU** not IU. Iron is in **grams** not mg. Cu/Zn/Mn/Co each have two columns — the inorganic one holds the sulfate/oxide portion, the organic one holds the chelate portion. Se has `organic se` and generic `Selenium` columns — organic for SeMet/yeast, generic for selenite.
- For the **AMTS/NDS** XML: every nutrient is a child tag with `Value`, `Name`, and optional `unit`. Minerals as ppm (mg/kg). Vitamins as IU/kg (or mg/kg for biotin). Wrap in `<Standard_XML_Data><Lab_Name/><Sample_Data>…</Sample_Data></Standard_XML_Data>`.
- Currency values are stored in USD internally and converted for display via `CURRENCIES[code].rate`. Never store converted values; only convert at render time.
- localStorage key for custom products: `premix_calculator_custom_products_v1`. Bump the version suffix if schema changes.
- When adding new branded products, also add a short note explaining the chemistry and typical bioavailability so the bioavail-guide stays accurate.

## Testing ideas

No formal test suite yet. When adding logic, at minimum verify by hand:
1. **Dairy fresh cow, 35 kg milk, 24 kg DMI, 100 g dose** → expect Zn/day ≈ 1,584 mg (66 × 24), Cu/day ≈ 264 mg, Vit E/day ≈ 720 IU, batch cost per ton in the $1.8K–$4.5K range depending on organic %.
2. **Beef Brahman finishing with Marbling + Color toggles ON** → Vit A should drop to ~1,100 IU/kg DM (0.5× NRC 2,200), Cr should appear at 0.5 mg/kg DM, Vit E should be ≥150 IU/kg DM, Biotin should show.
3. **Sheep with Cu slider at 100% organic** → check total diet Cu doesn't exceed 15 mg/kg DM; warning banner should display.
4. **Dairy goat early lactation with 6 kg yield (2× baseline)** → Zn should bump 35% above baseline, Vit E and Biotin proportionally.

## Known issues / things to verify

- XML tag naming for AMTS may need adjustment — I don't have a verified AMTS premix XML sample to compare against. First import attempt will tell us what the importer expects.
- Currency conversion rates are hardcoded April 2026 estimates. Consider adding a "rates updated" note and optionally fetching live rates (probably overkill for a feed calculator).
- Prices in the catalog are rough 2025/2026 values. They vary heavily by region and supplier — the per-ingredient editable fields are the primary tool for users to customize.
- The standalone HTML version loads Tailwind, React, ReactDOM from CDN. If offline use is needed, the Vite build solves this.
