import { Dataset } from '../types';

export const downloadCSV = (dataset: Dataset) => {
  if (dataset.canonicalFields.length === 0) return;

  // 1. Build Header Row
  // "Canonical", "Provider 1", "Provider 2"...
  const headers = ['Canonical', ...dataset.providers.map(p => p.name)];

  // 2. Build Data Rows
  const rows = dataset.canonicalFields.map(field => {
    // First col is canonical name
    const row = [field.name];
    
    // Subsequent cols are the mapped keys for each provider
    dataset.providers.forEach(provider => {
      const mappedKey = field.mappings[provider.id] || '';
      row.push(mappedKey);
    });
    
    return row;
  });

  // 3. Construct CSV String
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  // 4. Trigger Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${dataset.name || 'dataset'}_mapping.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
