import { perKgPremix, downloadBlob, safeName } from './exportHelpers.js';
import { PRODUCTS } from '../data/products.js';
import { BLENDS } from '../data/blends.js';

/**
 * Rationall matrix CSV — single 61-column feed row.
 * Column order matches the user's matrix.csv reference (see CLAUDE.md).
 * Vit A is KIU (IU/1000). Iron is in grams (mg/1000). Cu/Zn/Mn/Co have both
 * inorganic + organic columns. Se has "organic se" and generic "Selenium" columns.
 */
export function exportRationallCSV({ calc, species, stage, dose, currency, currencyRate = 1, customProducts = [] }) {
  const n = perKgPremix(calc, dose, PRODUCTS, BLENDS, customProducts);
  const feedNo = (typeof window !== 'undefined' && window.prompt)
    ? (window.prompt('Feed # for Rationall matrix (e.g. 600):', '600') || '600')
    : '600';
  const feedName = `Custom ${species} Premix ${stage}`.replace(/[^A-Za-z0-9/ -]/g, '');

  const blanks = (k) => Array(k).fill('').join(',');
  let csv = 'Name:,Matrix,' + blanks(57) + '\n';
  csv += 'Dry:,1,' + blanks(57) + '\n';
  csv += ',,Nutrient,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57\n';
  csv += ',,Name,Price,Dry Matter,Wet Matter,protein,ME,Nel 2001,TDN,N.D.F.,For.NDF,A.D.F.,ASH,CA,Phosphoru,Salt,Forage,EE(Fat),RUP,NSC,RDNSC,sugar,starch,RD Starch,NPN,BUFFER,DCAD,VIT A,VIT  E,VIT D,vit biotin,CHOLINE,Niacin,Copper,organic cu,zinc,organic zn,Manganese,organic mn,Cobalt,organic co,organic se,Chromium,calcium,Phosphorus,potassium,sodium,chloride,sulfur,Mg,Iodine,Selenium,Iron,MP,RDP,RUP,Metbolize Met,Metbolize Lys,Carrier,Nel 2021\n';
  csv += 'Feed,Name,Unit,' + currency + ',Kg,Kg,Kg,Mcal,Mcal,%,Kg,Kg,Kg,Kg,g,g,g,Kg,Kg,Kg,Kg,Kg,Kg,Kg,g,g,g,meq,KIU,IU,IU,mg,g,g,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,g,g,g,g,g,g,g,mg,mg,mg,gram,Kg,Kg,g,g,Kg,Mcal\n';

  const pricePerKgUSD = calc.totalCostPerTon / 1000;
  const priceConverted = (pricePerKgUSD * currencyRate).toFixed(2);
  const DM = 0.97, WM = +(1 / DM).toFixed(9);

  const row = [
    feedNo, `"${feedName}"`, 'Kg', priceConverted,
    DM, WM,
    '', '', '',                    // protein, ME, Nel2001
    '', '', '', '', '',            // TDN, NDF, ForNDF, ADF, ASH
    '', '', '',                    // CA, Phosphoru, Salt
    '', '',                        // Forage, EE
    '', '', '',                    // RUP, NSC, RDNSC
    '', '', '',                    // sugar, starch, RDStarch
    '', '', '',                    // NPN, BUFFER, DCAD
    (n.VitA / 1000).toFixed(2),    // VIT A in KIU
    n.VitE || '',                  // VIT E in IU
    n.VitD || '',                  // VIT D in IU
    n.Biotin || '',                // biotin mg
    '', '',                        // CHOLINE, Niacin
    n.Cu_inorg || '', n.Cu_org || '',
    n.Zn_inorg || '', n.Zn_org || '',
    n.Mn_inorg || '', n.Mn_org || '',
    n.Co_inorg || '', n.Co_org || '',
    n.Se_org || '',                // organic Se
    n.Cr || '',                    // Chromium
    '', '', '', '', '', '', '',    // calcium, Phosphorus, potassium, sodium, chloride, sulfur, Mg
    n.I_total || '',
    n.Se_inorg || '',              // "Selenium" col = inorganic Se
    n.Fe_total ? (n.Fe_total / 1000).toFixed(3) : '', // Iron as grams
    '', '', '',                    // MP, RDP, RUP
    '', '',                        // Met Met, Met Lys
    '', '',                        // Carrier, Nel 2021
  ];

  csv += row.join(',') + '\n';
  downloadBlob(csv, 'text/csv', `Rationall_Premix_${safeName(species)}_${safeName(stage)}.csv`);
}
