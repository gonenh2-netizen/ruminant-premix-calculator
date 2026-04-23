/**
 * Feed additives catalog — comprehensive list for ruminant premixes.
 *
 * Categories (15):
 *   Yeast/DFM · Ionophore · Buffer · RP-AA · RP-Vitamin ·
 *   Methane inhibitor · Phytobiotic · Mycotoxin binder · Tannin ·
 *   DCAD Anionic Salt · Glucogenic Energy · Slow-release N ·
 *   Enzyme · Flavor/Palatability · Metabolic modifier
 *
 * Bypass fat is intentionally EXCLUDED (user preference — added in TMR, not premix).
 *
 * Each additive:
 *   id:             unique identifier (key for user dose state and prices)
 *   name:           display name
 *   brand:          manufacturer (or "Generic")
 *   category:       one of the categories listed above
 *   typicalDose:    default g/head/day (user-editable in UI)
 *   doseRange:      recommended range (human-readable)
 *   price:          USD per kg (user-editable)
 *   note:           mode of action + practical guidance (shown as tooltip)
 *   species:        array — which species this applies to
 *   stages:         'all' or array of stage names where this is commonly used
 *   regulatoryNote: optional flag (e.g. monensin banned for dairy in EU)
 */

export const ADDITIVES = [

  // ===== Yeast / DFM =====
  { id: 'yeast_live_yeasacc',    name: 'Yea-Sacc 1026 (Live yeast)',       brand: 'Alltech',        category: 'Yeast/DFM', typicalDose: 4,   doseRange: '2–10 g/hd/d', price: 18.00, note: 'S. cerevisiae 1026, 10¹⁰ CFU/g. Rumen pH stability + fiber digestion.',                          species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'yeast_live_levucell',   name: 'Levucell SC (Live yeast)',         brand: 'Lallemand',      category: 'Yeast/DFM', typicalDose: 5,   doseRange: '3–10 g/hd/d', price: 19.50, note: 'S. cerevisiae CNCM I-1077. Selected for SARA resistance and NDF digestion.',                    species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'yeast_live_safcattle',  name: 'SafCattle / ActiSaf (Live yeast)', brand: 'Phileo/Lesaffre',category: 'Yeast/DFM', typicalDose: 4,   doseRange: '2–8 g/hd/d',  price: 16.00, note: 'S. cerevisiae Sc47. Feed efficiency + SARA risk reduction.',                                    species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'yeast_dead_diamondv',   name: 'Diamond V XP / XPC (Yeast culture)', brand: 'Diamond V',    category: 'Yeast/DFM', typicalDose: 15,  doseRange: '14–56 g/hd/d', price: 8.50, note: 'Fermentation-based yeast culture (inactivated cells + metabolites). Prebiotic / immunomodulator.', species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'yeast_cellwall_imagro', name: 'IMAGRO / Yeast cell wall (MOS+βG)', brand: 'Biomin/DSM',    category: 'Yeast/DFM', typicalDose: 3,   doseRange: '2–5 g/hd/d',  price: 20.00, note: 'Inactivated yeast cell wall providing MOS + β-glucans. Pathogen binding + immune support.',      species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'dfm_bovamine',          name: 'Bovamine Dairy Plus (DFM)',        brand: 'Nutrition Physiology Co.', category: 'Yeast/DFM', typicalDose: 2, doseRange: '1–3 g/hd/d', price: 24.00, note: 'L. acidophilus + P. freudenreichii. Milk yield + propionate production.',                       species: ['Dairy','Beef'],                 stages: 'all' },
  { id: 'dfm_chrhansen',         name: 'BioPlus YC (Bacillus DFM)',        brand: 'Chr. Hansen',    category: 'Yeast/DFM', typicalDose: 3,   doseRange: '2–5 g/hd/d',  price: 22.00, note: 'B. subtilis + B. licheniformis spores. Stable under pelleting; improves digestibility.',       species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },

  // ===== Ionophore =====
  { id: 'monensin_rumensin',     name: 'Monensin (Rumensin)',              brand: 'Elanco',         category: 'Ionophore', typicalDose: 1.5, doseRange: '0.8–2.5 g/hd/d (300–450 mg monensin)', maxDose: 2.5, maxDoseNote: 'Upper safety ceiling 2.5 g/hd/d (≈500 mg monensin). Higher doses risk hepatotoxicity / cardiotoxicity. Lethal for horses at any dose — do not feed in mixed-species barns.', price: 22.00, note: '+2–6% feed efficiency. Shifts rumen VFA toward propionate, reduces methane.', species: ['Dairy','Beef'], stages: 'all', regulatoryNote: 'Banned for dairy in EU. Check local regulations.' },
  { id: 'lasalocid_bovatec',     name: 'Lasalocid (Bovatec)',              brand: 'Zoetis',         category: 'Ionophore', typicalDose: 1.2, doseRange: '0.6–2.0 g/hd/d', maxDose: 2.0, maxDoseNote: 'Upper safety ceiling 2.0 g/hd/d. Ionophore — overdose risks cardiac/skeletal muscle damage. Never combine with other ionophores or with tiamulin.', price: 20.00, note: 'Alternative to monensin. Broader antimicrobial spectrum.', species: ['Beef'], stages: ['Growing / Stocker','Backgrounding','Finishing'] },
  { id: 'salinomycin',           name: 'Salinomycin',                      brand: 'Generic',        category: 'Ionophore', typicalDose: 1.0, doseRange: '0.4–1.5 g/hd/d', maxDose: 1.5, maxDoseNote: 'Upper safety ceiling 1.5 g/hd/d. Ionophore — narrow therapeutic index. Lethal for horses.', price: 18.00, note: 'Beef feedlot ionophore. Cost-effective alternative in some markets.', species: ['Beef'], stages: ['Backgrounding','Finishing'] },

  // ===== Buffer =====
  { id: 'buffer_sodabicarb',     name: 'Sodium Bicarbonate (NaHCO₃)',      brand: 'Generic',        category: 'Buffer',    typicalDose: 150, doseRange: '100–250 g/hd/d', price: 0.60, note: 'Standard rumen buffer. ~0.7–1.0% of TMR DM for lactating dairy.', species: ['Dairy','Beef'], stages: 'all' },
  { id: 'buffer_acidbuf',        name: 'Acid Buf (Calcified marine algae)',brand: 'Celtic Sea Minerals', category: 'Buffer', typicalDose: 50, doseRange: '30–80 g/hd/d', price: 2.80, note: 'Lithothamnium. Slow-release buffer — out-performs NaHCO₃ at lower dose.', species: ['Dairy','Beef'], stages: 'all' },
  { id: 'buffer_mgo',            name: 'Magnesium Oxide (MgO)',            brand: 'Generic',        category: 'Buffer',    typicalDose: 50,  doseRange: '20–80 g/hd/d',  price: 0.90, note: 'Secondary buffer + Mg source. Use with NaHCO₃.', species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'buffer_kemin_c',        name: 'Rumen Buffer C',                   brand: 'Kemin',          category: 'Buffer',    typicalDose: 80,  doseRange: '40–120 g/hd/d', price: 1.80, note: 'Proprietary slow-release buffer blend. Dairy focus.', species: ['Dairy'], stages: 'all' },

  // ===== Rumen-Protected Amino Acids =====
  { id: 'rp_met_smartamine',     name: 'Smartamine M (RP Methionine)',     brand: 'Adisseo',        category: 'RP-AA',     typicalDose: 18,  doseRange: '12–25 g/hd/d', price: 14.00, note: '75% DL-Met, pH-protected. Target 7–10 g metabolizable Met/hd/day. Improves milk protein %, fertility.', species: ['Dairy'], stages: ['Close-up Dry','Fresh / Early Lactation','Mid Lactation'] },
  { id: 'rp_met_mepron',         name: 'Mepron (RP Methionine)',           brand: 'Evonik',         category: 'RP-AA',     typicalDose: 20,  doseRange: '15–30 g/hd/d', price: 12.50, note: '85% DL-Met in ethyl cellulose matrix. Alternative to Smartamine.', species: ['Dairy'], stages: ['Close-up Dry','Fresh / Early Lactation','Mid Lactation'] },
  { id: 'rp_met_metasmart',      name: 'MetaSmart (HMTBa Met)',            brand: 'Adisseo',        category: 'RP-AA',     typicalDose: 25,  doseRange: '15–40 g/hd/d', price: 8.50,  note: 'HMTBa form. Cheaper, partial rumen degradation.', species: ['Dairy'], stages: 'all' },
  { id: 'rp_lys_ajipro',         name: 'AjiPro-L (RP Lysine)',             brand: 'Ajinomoto',      category: 'RP-AA',     typicalDose: 40,  doseRange: '30–60 g/hd/d', price: 9.50,  note: 'Target 18–25 g metabolizable Lys/hd/d. Pair with RP-Met at 3:1 ratio.', species: ['Dairy'], stages: ['Close-up Dry','Fresh / Early Lactation','Mid Lactation'] },
  { id: 'rp_lys_lysigem',        name: 'LysiGEM (RP Lysine)',              brand: 'Kemin',          category: 'RP-AA',     typicalDose: 50,  doseRange: '35–80 g/hd/d', price: 8.00,  note: 'Encapsulated L-Lys HCl.', species: ['Dairy'], stages: ['Close-up Dry','Fresh / Early Lactation','Mid Lactation'] },
  { id: 'rp_hist',               name: 'RP Histidine',                     brand: 'Ajinomoto/Kemin',category: 'RP-AA',     typicalDose: 8,   doseRange: '5–12 g/hd/d',  price: 25.00, note: 'Emerging 3rd-limiting AA after Met/Lys in high-yielding dairy.', species: ['Dairy'], stages: ['Fresh / Early Lactation'] },

  // ===== Rumen-Protected B-vitamins + Hy-D =====
  { id: 'rp_choline_reashure',   name: 'ReaShure (RP Choline)',            brand: 'Balchem',        category: 'RP-Vitamin',typicalDose: 60,  doseRange: '30–60 g/hd/d close-up; 15–30 lactation', price: 11.00, note: '15 g choline/hd/d close-up reduces fatty liver, improves milk yield.', species: ['Dairy'], stages: ['Close-up Dry','Fresh / Early Lactation'] },
  { id: 'rp_niacin_niashure',    name: 'Niashure (RP Niacin)',             brand: 'Balchem',        category: 'RP-Vitamin',typicalDose: 18,  doseRange: '12–24 g/hd/d', price: 15.00, note: '6–12 g niacin/hd/d; heat stress + fresh cows.', species: ['Dairy'], stages: ['Close-up Dry','Fresh / Early Lactation','Mid Lactation'] },
  { id: 'hyd_rovimix',           name: 'Rovimix Hy-D (25-OH-D3)',          brand: 'DSM',            category: 'RP-Vitamin',typicalDose: 0.7, doseRange: '0.5–1.0 g/hd/d', price: 180.00, note: 'Pre-activated 25-hydroxy-vitamin D3. Improves Ca homeostasis and hoof integrity.', species: ['Dairy','Beef'], stages: 'all' },

  // ===== Methane inhibitors =====
  { id: 'bovaer_3nop',           name: 'Bovaer (3-NOP)',                   brand: 'DSM-Firmenich',  category: 'Methane inhibitor', typicalDose: 1.5, doseRange: '60–80 mg 3-NOP/kg DM diet', price: 55.00, note: '3-nitrooxypropanol. Methane −25 to −40%.', species: ['Dairy','Beef'], stages: 'all' },
  { id: 'mootral',               name: 'Mootral (garlic + citrus)',        brand: 'Mootral',        category: 'Methane inhibitor', typicalDose: 15, doseRange: '10–20 g/hd/d', price: 6.00, note: 'Garlic + bitter citrus. Methane −20 to −30%.', species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'asparagopsis',          name: 'Asparagopsis seaweed',             brand: 'Sea Forest / Volta Greentech', category: 'Methane inhibitor', typicalDose: 3, doseRange: '1–5 g/hd/d (freeze-dried)', price: 140.00, note: 'Red seaweed with bromoform. Methane −80% in feedlot trials. High cost, limited supply.', species: ['Dairy','Beef'], stages: 'all', regulatoryNote: 'Check local regulations on bromoform residues.' },

  // ===== Phytobiotic =====
  { id: 'agolin_ruminant',       name: 'Agolin Ruminant (EO blend)',       brand: 'Agolin',         category: 'Phytobiotic', typicalDose: 1,   doseRange: '0.8–1.2 g/hd/d', price: 45.00, note: 'Coriander + clove + geranyl acetate. Feed efficiency + methane −10%.', species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'phyto_crina',           name: 'Crina Ruminants',                  brand: 'DSM-Firmenich',  category: 'Phytobiotic', typicalDose: 1.2, doseRange: '0.8–1.5 g/hd/d', price: 48.00, note: 'Essential-oil premix. Feed efficiency + milk yield.', species: ['Dairy','Beef'], stages: 'all' },
  { id: 'digestarom_dc',         name: 'Digestarom DC',                    brand: 'Biomin/DSM',     category: 'Phytobiotic', typicalDose: 2,   doseRange: '1–3 g/hd/d',   price: 32.00, note: 'Phytogenic + mannose-rich carb complex. Digestive support.', species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'oregostim',             name: 'Oregostim (Oregano oil)',          brand: 'Meriden',        category: 'Phytobiotic', typicalDose: 2,   doseRange: '1–4 g/hd/d',   price: 28.00, note: 'Oregano essential oil. Antimicrobial; helps subclinical mastitis and GI health.', species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'yucca_microaid',        name: 'Micro-Aid (Yucca schidigera)',     brand: 'DPI Global',     category: 'Phytobiotic', typicalDose: 2,   doseRange: '1–4 g/hd/d',   price: 14.00, note: 'Yucca saponins bind rumen ammonia, reduce heat stress and environmental N.', species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },

  // ===== Mycotoxin binder =====
  { id: 'mycotoxin_mycofix',     name: 'Mycofix (multi-component)',        brand: 'Biomin/DSM',     category: 'Mycotoxin binder', typicalDose: 50, doseRange: '20–100 g/hd/d', price: 6.50, note: 'Bentonite + enzymes + plant extracts. Broad-spectrum.', species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'mycotoxin_mycosorb',    name: 'Mycosorb A+ (yeast cell wall)',    brand: 'Alltech',        category: 'Mycotoxin binder', typicalDose: 30, doseRange: '15–60 g/hd/d', price: 8.00, note: 'Modified yeast cell wall. Broad-spectrum binder.', species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'mycotoxin_bentonite',   name: 'Sodium/Calcium Bentonite',         brand: 'Generic',        category: 'Mycotoxin binder', typicalDose: 100, doseRange: '50–200 g/hd/d', price: 0.40, note: 'Basic clay binder. Strongest vs aflatoxin.', species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'mycotoxin_fixat',       name: 'Fixat (clay + enzyme binder)',     brand: 'Agrofeed',       category: 'Mycotoxin binder', typicalDose: 40,  doseRange: '20–80 g/hd/d', price: 4.50, note: 'Clay + biotransformation enzymes. Popular in CIS / Eastern Europe.', species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },

  // ===== Tannin =====
  { id: 'tannin_bypro',          name: 'ByPro (chestnut + quebracho)',     brand: 'Silvateam',      category: 'Tannin', typicalDose: 50, doseRange: '30–80 g/hd/d', price: 4.50, note: 'Condensed + hydrolyzable tannins. Protein bypass + methane ↓ + parasite ↓.', species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'tannin_silvafeed_q',    name: 'SilvaFeed Q (quebracho)',          brand: 'Silvateam',      category: 'Tannin', typicalDose: 40, doseRange: '20–60 g/hd/d', price: 4.00, note: 'Pure quebracho condensed tannin. Protein protection + parasite control in small ruminants.', species: ['Goat','Sheep','Beef'], stages: 'all' },

  // ===== DCAD Anionic Salts (close-up dry, hypocalcemia prevention) =====
  { id: 'dcad_soychlor',         name: 'SoyChlor',                         brand: 'West Central',   category: 'DCAD Anionic Salt', typicalDose: 400, doseRange: '300–600 g/hd/d', price: 1.20, note: 'Soybean meal + HCl, ~4.5% Cl. Target diet DCAD −100 to −150 mEq/kg. Most palatable anionic.', species: ['Dairy'], stages: ['Close-up Dry'] },
  { id: 'dcad_biochlor',         name: 'Bio-Chlor',                        brand: 'Church & Dwight',category: 'DCAD Anionic Salt', typicalDose: 400, doseRange: '300–600 g/hd/d', price: 1.10, note: 'Fermentation extract + anionic salts, ~6–7% Cl. Palatable; US mainstream.', species: ['Dairy'], stages: ['Close-up Dry'] },
  { id: 'dcad_animate',          name: 'Animate',                          brand: 'Phibro',         category: 'DCAD Anionic Salt', typicalDose: 450, doseRange: '300–600 g/hd/d', price: 1.15, note: 'Anionic salt blend for close-up. Good palatability.', species: ['Dairy'], stages: ['Close-up Dry'] },
  // X-Zelit belongs in its own category — P-binder — because its mechanism is
  // distinct from DCAD acidification. It works by binding rumen phosphorus, which
  // triggers a controlled blood-P drop, lowers FGF23, and cues bone to mobilise
  // both Ca and P before calving. No DCAD manipulation or low-K forage needed.
  { id: 'xzelit',                name: 'X-Zelit (Synthetic zeolite P-binder)', brand: 'Vilofoss',   category: 'P-binder (Dry Cow)', typicalDose: 400, doseRange: '350–500 g/hd/d for last 14–21 days pre-calving', price: 2.40, note: 'Sodium aluminum silicate. Binds rumen P → blood P drops → FGF23 falls → bone mobilises Ca+P. Dose: ~10 g X-Zelit per g dietary P. No DCAD manipulation, no low-K forage requirement, no urine pH monitoring.', species: ['Dairy'], stages: ['Close-up Dry'] },
  { id: 'dcad_nh4cl',            name: 'Ammonium Chloride (NH₄Cl)',        brand: 'Generic',        category: 'DCAD Anionic Salt', typicalDose: 100, doseRange: '50–150 g/hd/d',  price: 0.80, note: 'Cheapest acidogenic salt, 66% Cl. Very unpalatable — must mix well in TMR.', species: ['Dairy'], stages: ['Close-up Dry'] },
  { id: 'dcad_nh4so4',           name: 'Ammonium Sulfate ((NH₄)₂SO₄)',    brand: 'Generic',        category: 'DCAD Anionic Salt', typicalDose: 100, doseRange: '50–150 g/hd/d',  price: 0.45, note: 'Acidogenic; S + N. Paired with NH₄Cl. Poor palatability.', species: ['Dairy'], stages: ['Close-up Dry'] },
  { id: 'dcad_mgso4',            name: 'Magnesium Sulfate (Epsom)',        brand: 'Generic',        category: 'DCAD Anionic Salt', typicalDose: 80,  doseRange: '50–100 g/hd/d',  price: 0.35, note: 'Supplies acidogenic SO₄ + Mg. Laxative in high doses.', species: ['Dairy'], stages: ['Close-up Dry'] },
  { id: 'dcad_cacl2',            name: 'Calcium Chloride',                 brand: 'Generic',        category: 'DCAD Anionic Salt', typicalDose: 60,  doseRange: '40–80 g/hd/d',   price: 0.70, note: 'Strongly acidogenic + Ca. Hygroscopic — handling challenge. Also used in oral fresh-cow boluses.', species: ['Dairy'], stages: ['Close-up Dry','Fresh / Early Lactation'] },

  // ===== Glucogenic Energy (fresh-cow / ketosis prevention) =====
  { id: 'gluco_propyleneglycol', name: 'Propylene Glycol (liquid)',        brand: 'Generic',        category: 'Glucogenic Energy', typicalDose: 250, doseRange: '150–400 g/hd/d oral drench', price: 2.10, note: 'Glucogenic precursor. Standard sub-clinical ketosis treatment. Usually drenched, not in premix.', species: ['Dairy'], stages: ['Fresh / Early Lactation'] },
  { id: 'gluco_capropionate',    name: 'Calcium Propionate',               brand: 'Generic',        category: 'Glucogenic Energy', typicalDose: 200, doseRange: '100–300 g/hd/d', price: 2.80, note: 'Propionic acid precursor + Ca. Anti-ketosis + anti-milk-fever. Pelletable.', species: ['Dairy'], stages: ['Close-up Dry','Fresh / Early Lactation'] },
  { id: 'gluco_glycerol',        name: 'Glycerol (dried / pelleted)',      brand: 'Generic',        category: 'Glucogenic Energy', typicalDose: 400, doseRange: '200–600 g/hd/d', price: 1.20, note: 'Glucogenic; ~2.2 Mcal NEL/kg. By-product of biodiesel — price varies regionally.', species: ['Dairy','Beef'], stages: ['Close-up Dry','Fresh / Early Lactation'] },

  // ===== Slow-release Nitrogen =====
  { id: 'optigen',               name: 'Optigen (Slow-release urea)',      brand: 'Alltech',        category: 'Slow-release N', typicalDose: 100, doseRange: '60–150 g/hd/d', price: 2.30, note: 'Polymer-coated urea. Replaces veg. protein; gradual NH₃ release matches rumen microbial demand.', species: ['Dairy','Beef'], stages: 'all' },
  { id: 'nitroshure',            name: 'NitroShure',                       brand: 'Balchem',        category: 'Slow-release N', typicalDose: 80,  doseRange: '50–120 g/hd/d', price: 2.50, note: 'Controlled-release urea. Alternative to Optigen.', species: ['Dairy','Beef'], stages: 'all' },

  // ===== Enzymes =====
  { id: 'enzyme_fibrozyme',      name: 'FibroZyme (Fibrolytic enzyme)',    brand: 'Alltech',        category: 'Enzyme', typicalDose: 15,  doseRange: '10–25 g/hd/d', price: 22.00, note: 'Cellulase/xylanase. Improves NDF digestion in high-forage diets.', species: ['Dairy','Beef'], stages: 'all' },
  { id: 'enzyme_ronozyme',       name: 'Ronozyme RumiStar (Amylase)',      brand: 'DSM',            category: 'Enzyme', typicalDose: 10,  doseRange: '5–15 g/hd/d',  price: 28.00, note: 'α-amylase for starch. Improves energy capture from corn/starch diets; helps transition cows.', species: ['Dairy'], stages: ['Close-up Dry','Fresh / Early Lactation','Mid Lactation'] },

  // ===== Flavor / Palatability =====
  { id: 'flavor_luctarom',       name: 'Luctarom (Flavor)',                brand: 'Lucta',          category: 'Flavor/Palatability', typicalDose: 1, doseRange: '0.5–2 g/hd/d', price: 32.00, note: 'Flavor enhancer — masks bitter anionic salts and ionophores. Vanilla/fruit/dairy profiles.', species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'flavor_sucram',         name: 'Sucram (Sweetener)',               brand: 'Pancosma',       category: 'Flavor/Palatability', typicalDose: 0.5, doseRange: '0.3–1 g/hd/d', price: 48.00, note: 'High-intensity saccharin. Increases intake of bitter / anionic diets. Useful in close-up TMR.', species: ['Dairy','Beef','Goat','Sheep'], stages: ['Close-up Dry','Fresh / Early Lactation'] },

  // ===== Metabolic modifier =====
  { id: 'betaine_betafin',       name: 'Betafin (Betaine anhydrous)',      brand: 'DuPont / IFF',   category: 'Metabolic modifier', typicalDose: 25, doseRange: '15–40 g/hd/d', price: 6.50, note: 'Methyl donor + osmolyte. Heat-stress support, Met-sparing, improved milk yield.', species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },
  { id: 'betaine_hcl',           name: 'Betaine HCl',                      brand: 'Generic',        category: 'Metabolic modifier', typicalDose: 30, doseRange: '20–50 g/hd/d', price: 5.00, note: 'Cheaper betaine form. Similar function to Betafin but less stable in moist feeds.', species: ['Dairy','Beef','Goat','Sheep'], stages: 'all' },

  // ===== Carotenoid (β-Carotene — muscle antioxidant + fertility) =====
  // β-Carotene is a provitamin-A. In fattening bulls the case is antioxidant
  // protection of muscle under feedlot stress and a provitamin-A reserve that
  // doesn't spike retinol. In breeding bulls / cows it supports corpus luteum
  // and sperm quality. CAVEAT: it partially counteracts the low-Vit-A
  // marbling protocol — calcFormulation flags a warning if Marbling is ON.
  { id: 'betacarotene_rovimix',  name: 'Rovimix β-Carotene 10%',            brand: 'DSM',     category: 'Carotenoid', typicalDose: 4,   doseRange: '2–6 g/hd/d (200–600 mg β-carotene)', price: 65.00, note: '10% β-carotene beadlets. For bull fattening: antioxidant protection of muscle under feedlot oxidative stress; provitamin-A reserve that releases slowly (does not spike retinol). Also fertility/sperm-quality support in breeding bulls and reproduction in dairy cows. Typical fattening dose 300–500 mg β-carotene/hd/d = 3–5 g product.', species: ['Dairy','Beef'], stages: 'all', conflictsWith: ['marbling'] },
  { id: 'betacarotene_lucarotin',name: 'Lucarotin 10% (β-Carotene)',        brand: 'BASF',    category: 'Carotenoid', typicalDose: 4,   doseRange: '2–6 g/hd/d (200–600 mg β-carotene)', price: 62.00, note: '10% β-carotene spray-dried beadlets. Direct equivalent to Rovimix. Same role: antioxidant muscle support for fattening bulls, fertility support in breeding stock.', species: ['Dairy','Beef'], stages: 'all', conflictsWith: ['marbling'] },
];

// Display order for the UI — groups categories logically
export const ADDITIVE_CATEGORIES = [
  'Yeast/DFM',
  'Ionophore',
  'Buffer',
  'RP-AA',
  'RP-Vitamin',
  'Carotenoid',
  'DCAD Anionic Salt',
  'P-binder (Dry Cow)',
  'Glucogenic Energy',
  'Slow-release N',
  'Enzyme',
  'Methane inhibitor',
  'Phytobiotic',
  'Mycotoxin binder',
  'Tannin',
  'Flavor/Palatability',
  'Metabolic modifier',
];

/**
 * Dry-cow milk-fever prevention strategies. These are orthogonal to the
 * additives catalog — the calculator's UI exposes a selector (Close-up /
 * Far-off Dry stages only for Dairy species) that auto-configures premix
 * targets and suggests which additives to include. See CLAUDE.md for the
 * full strategy decision logic.
 */
export const DRY_COW_STRATEGIES = [
  { id: 'standard', label: 'Standard (no intervention)', desc: 'Baseline premix only. Not recommended for high-yielding herds.' },
  { id: 'dcad',     label: 'Negative DCAD',               desc: 'Acidify with anionic salts. Target urine pH 6.0–6.5. Ca target 150–180 g/hd/d.' },
  { id: 'pbinder',  label: 'P-binder (Vilofoss X-Zelit)', desc: 'Binds rumen P → bone mobilises Ca + P. No DCAD manipulation. 350–500 g X-Zelit/hd/d, 14–21 days pre-calving.' },
  { id: 'lowCa',    label: 'Low Calcium (Goff method)',   desc: 'Restrict dietary Ca (typically to 30, 50, or 70 g/hd/d). Hard to achieve with modern high-Ca forages.' },
  { id: 'lowP',     label: 'Low Phosphorus',              desc: 'Restrict dietary P to ~30 g/hd/d. Low blood P stimulates vitamin-D activation → improved Ca absorption.' },
];
