import { Dataset } from '../types';

export const downloadJSON = (dataset: Dataset) => {
  // Export the full dataset state including providers, canonical fields, and mappings
  const exportData = {
    name: dataset.name,
    providers: dataset.providers,
    canonicalFields: dataset.canonicalFields,
    exportedAt: new Date().toISOString()
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${dataset.name || 'dataset'}_mapping.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const loadJSON = async (file: File): Promise<Dataset> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate the structure
        if (!data.providers || !Array.isArray(data.providers)) {
          throw new Error('Invalid file format: missing providers array');
        }
        if (!data.canonicalFields || !Array.isArray(data.canonicalFields)) {
          throw new Error('Invalid file format: missing canonicalFields array');
        }

        const dataset: Dataset = {
          name: data.name || '',
          providers: data.providers,
          canonicalFields: data.canonicalFields
        };

        resolve(dataset);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
