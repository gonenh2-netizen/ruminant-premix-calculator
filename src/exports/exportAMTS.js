import { perKgPremix, downloadBlob, safeName } from './exportHelpers.js';
import { PRODUCTS } from '../data/products.js';
import { BLENDS } from '../data/blends.js';

/**
 * AMTS / NDS Professional Standard_XML_Data feed entry.
 * Premix is ~97% dry, ~95% ash (mostly mineral salts + carrier).
 * Trace minerals as ppm (mg/kg), vitamins as IU/kg or mg/kg.
 */
export function exportAMTS_XML({ calc, species, stage, dose, customProducts = [] }) {
  const n = perKgPremix(calc, dose, PRODUCTS, BLENDS, customProducts);
  const sampleNo = (typeof window !== 'undefined' && window.prompt)
    ? (window.prompt('Sample No. (e.g. PRM-001):', 'PRM-' + Date.now().toString().slice(-6)) || 'PRM-001')
    : 'PRM-' + Date.now().toString().slice(-6);

  const feedName = `Custom ${species} Premix ${stage}`;
  const today = new Date();
  const dateStr = `${pad(today.getMonth() + 1)}/${pad(today.getDate())}/${today.getFullYear()}`;
  const DM_PCT = 97;

  const tag = (name, value, unit, label) => {
    if (value === undefined || value === null || value === '' || isNaN(value)) return '';
    const u = unit ? ` unit="${unit}"` : '';
    return `\t\t<${name} Value="${value}" Name="${label || name}"${u}/>\n`;
  };

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<Standard_XML_Data>\n';
  xml += `\t<Lab_Name Value="Ruminant Premix Calculator" Name="Lab_Name"/>\n`;
  xml += '\t<Sample_Data>\n';
  xml += tag('Sample_No', sampleNo, null, 'Sample_No.');
  xml += tag('Desc_1', feedName, null, 'Description-1');
  xml += tag('Type', 'Vitamin Mineral Premix', null, 'Feed Type');
  xml += tag('datesampled', dateStr, null, 'datesampled');
  xml += tag('Name', 'Premix Calculator', null, 'Name');
  xml += tag('DM', DM_PCT.toFixed(2), '%', 'Dry Matter');
  xml += tag('CP', '0', '%DM', 'CP');
  xml += tag('Ash', '95', '%DM', 'Ash');

  xml += tag('VitA_IU', n.VitA || 0, 'IU/kg', 'VitA');
  xml += tag('VitD_IU', n.VitD || 0, 'IU/kg', 'VitD');
  xml += tag('VitE_IU', n.VitE || 0, 'IU/kg', 'VitE');
  xml += tag('Biotin', n.Biotin || 0, 'mg/kg', 'Biotin');

  xml += tag('Cu', n.Cu_total || 0, 'ppm', 'Cu');
  xml += tag('Zn', n.Zn_total || 0, 'ppm', 'Zn');
  xml += tag('Mn', n.Mn_total || 0, 'ppm', 'Mn');
  xml += tag('Fe', n.Fe_total || 0, 'ppm', 'Fe');
  xml += tag('Co', n.Co_total || 0, 'ppm', 'Co');
  xml += tag('I',  n.I_total  || 0, 'ppm', 'I');
  xml += tag('Se', n.Se_total || 0, 'ppm', 'Se');
  if (n.Cr) xml += tag('Cr', n.Cr, 'ppm', 'Cr');

  xml += tag('Cu_Organic', n.Cu_org || 0, 'ppm', 'Cu_Organic');
  xml += tag('Zn_Organic', n.Zn_org || 0, 'ppm', 'Zn_Organic');
  xml += tag('Mn_Organic', n.Mn_org || 0, 'ppm', 'Mn_Organic');
  xml += tag('Se_Organic', n.Se_org || 0, 'ppm', 'Se_Organic');

  xml += '\t</Sample_Data>\n';
  xml += '</Standard_XML_Data>\n';

  downloadBlob(xml, 'application/xml', `AMTS_Premix_${safeName(species)}_${safeName(stage)}.xml`);
}

function pad(n) { return String(n).padStart(2, '0'); }
