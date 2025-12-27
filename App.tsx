import React, { useState, useEffect } from 'react';
import { Dataset, Provider, CanonicalField } from './types';
import { processUploadedJSON } from './utils/jsonUtils';
import { downloadJSON, loadJSON } from './utils/exportUtils';
import { ProviderUploader } from './components/ProviderUploader';
import { MappingTable } from './components/MappingTable';
import { UnmappedPanel } from './components/UnmappedPanel';
import { Button } from './components/ui/Button';
import { FileDown, FileUp, Database, Trash, Save, Play } from 'lucide-react';
import suuntoData from './samples/sleep/suunto.json';
import garminData from './samples/sleep/garmin.json';
import appleData from './samples/sleep/apple.json';

const STORAGE_KEY = 'canonical-mapper-v1';

const App: React.FC = () => {
  const [dataset, setDataset] = useState<Dataset>({
    name: '',
    providers: [],
    canonicalFields: []
  });

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDataset(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load session", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
  }, [dataset]);

  const handleDatasetNameChange = (name: string) => {
    setDataset(prev => ({ ...prev, name }));
  };

  const handleAddProvider = (name: string, jsonData: any) => {
    const { sample, keys } = processUploadedJSON(jsonData);
    const newProvider: Provider = {
      id: crypto.randomUUID(),
      name,
      flatKeys: keys,
      sampleData: sample
    };
    setDataset(prev => ({
      ...prev,
      providers: [...prev.providers, newProvider]
    }));
  };

  const handleDeleteProvider = (providerId: string) => {
    if (confirm("Are you sure you want to remove this provider and all its mappings?")) {
      setDataset(prev => {
        // Remove provider from list
        const newProviders = prev.providers.filter(p => p.id !== providerId);
        
        // Remove mappings for this provider from all canonical fields
        const newCanonicalFields = prev.canonicalFields.map(field => {
          const newMappings = { ...field.mappings };
          delete newMappings[providerId];
          return { ...field, mappings: newMappings };
        });

        return {
          ...prev,
          providers: newProviders,
          canonicalFields: newCanonicalFields
        };
      });
    }
  };

  const handleAddCanonicalField = () => {
    const newField: CanonicalField = {
      id: crypto.randomUUID(),
      name: '',
      mappings: {}
    };
    setDataset(prev => ({
      ...prev,
      canonicalFields: [...prev.canonicalFields, newField]
    }));
  };

  const handleUpdateCanonical = (id: string, name: string) => {
    setDataset(prev => ({
      ...prev,
      canonicalFields: prev.canonicalFields.map(f => 
        f.id === id ? { ...f, name } : f
      )
    }));
  };

  const handleDeleteCanonical = (id: string) => {
    setDataset(prev => ({
      ...prev,
      canonicalFields: prev.canonicalFields.filter(f => f.id !== id)
    }));
  };

  const handleUpdateMapping = (fieldId: string, providerId: string, providerKey: string | undefined) => {
    setDataset(prev => ({
      ...prev,
      canonicalFields: prev.canonicalFields.map(f => {
        if (f.id !== fieldId) return f;
        
        // Remove mapping if undefined, else set it
        const newMappings = { ...f.mappings };
        if (providerKey === undefined) {
          delete newMappings[providerId];
        } else {
          newMappings[providerId] = providerKey;
        }
        return { ...f, mappings: newMappings };
      })
    }));
  };

  const handleResetSession = () => {
    if (confirm("Are you sure you want to clear the current session? This cannot be undone.")) {
      setDataset({
        name: '',
        providers: [],
        canonicalFields: []
      });
    }
  };

  const handleLoadDemo = () => {
    if (dataset.providers.length > 0 || dataset.canonicalFields.length > 0) {
      if (!confirm("This will replace your current data with demo data. Continue?")) {
        return;
      }
    }

    const sampleFiles = [
      { name: 'suunto', data: suuntoData },
      { name: 'garmin', data: garminData },
      { name: 'apple', data: appleData }
    ];

    const providers: Provider[] = sampleFiles.map(({ name, data }) => {
      const { sample, keys } = processUploadedJSON(data);
      return {
        id: crypto.randomUUID(),
        name,
        flatKeys: keys,
        sampleData: sample
      };
    });

    setDataset({
      name: 'Sleep Data Mapping',
      providers,
      canonicalFields: []
    });
  };

  const handleImportJSON = async () => {
    if (dataset.providers.length > 0 || dataset.canonicalFields.length > 0) {
      if (!confirm("This will replace your current data with the imported file. Continue?")) {
        return;
      }
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const importedDataset = await loadJSON(file);
        setDataset(importedDataset);
      } catch (error) {
        alert(`Failed to load file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <Database className="w-5 h-5" />
            </div>
            <div>
                <h1 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Canonical Dataset Mapper</h1>
                <input
                    type="text"
                    value={dataset.name}
                    onChange={(e) => handleDatasetNameChange(e.target.value)}
                    className="font-semibold text-lg bg-transparent border-none focus:ring-0 p-0 text-slate-900 placeholder-slate-400 w-64"
                    placeholder="Enter dataset name"
                />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={handleLoadDemo}>
              <Play className="w-4 h-4 mr-2" />
              Demo
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <Button variant="ghost" size="sm" onClick={handleResetSession} className="text-red-500 hover:text-red-700 hover:bg-red-50">
              <Trash className="w-4 h-4 mr-2" />
              Clear Session
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <Button variant="secondary" size="sm" onClick={handleImportJSON}>
              <FileUp className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button size="sm" onClick={() => downloadJSON(dataset)} disabled={dataset.providers.length === 0}>
              <FileDown className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col">
        
        <ProviderUploader 
            onUpload={handleAddProvider} 
            existingNames={dataset.providers.map(p => p.name)} 
        />

        <UnmappedPanel 
            dataset={dataset}
            onCopyAttribute={(attr) => {
                navigator.clipboard.writeText(attr);
                // Could add toast notification here
            }}
            onDeleteProvider={handleDeleteProvider}
        />

        <div className="flex-1 flex flex-col min-h-[500px]">
            <MappingTable
                dataset={dataset}
                onAddCanonical={handleAddCanonicalField}
                onUpdateCanonical={handleUpdateCanonical}
                onDeleteCanonical={handleDeleteCanonical}
                onUpdateMapping={handleUpdateMapping}
                onDeleteProvider={handleDeleteProvider}
            />
        </div>
      </main>
    </div>
  );
};

export default App;