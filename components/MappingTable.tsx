import React, { useState } from 'react';
import { Dataset, CanonicalField, Provider } from '../types';
import { Button } from './ui/Button';
import { AttributeSelector } from './AttributeSelector';
import { Plus, Trash2, X, Database, ChevronDown, ChevronUp, Link2 } from 'lucide-react';

interface MappingTableProps {
  dataset: Dataset;
  onUpdateCanonical: (fieldId: string, name: string) => void;
  onDeleteCanonical: (fieldId: string) => void;
  onUpdateMapping: (fieldId: string, providerId: string, providerKey: string | undefined) => void;
  onAddCanonical: () => void;
  onDeleteProvider: (providerId: string) => void;
}

export const MappingTable: React.FC<MappingTableProps> = ({
  dataset,
  onUpdateCanonical,
  onDeleteCanonical,
  onUpdateMapping,
  onAddCanonical,
  onDeleteProvider
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const getMappedKeyCount = (providerId: string) => {
    const keys = new Set<string>();
    dataset.canonicalFields.forEach(f => {
        const k = f.mappings[providerId];
        if (k) keys.add(k);
    });
    return keys.size;
  };

  return (
    <div className={`${isExpanded ? 'flex-1' : ''} flex flex-col min-h-0 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden`}>
      <div 
        className={`px-4 py-3 bg-slate-50 ${isExpanded ? 'border-b border-slate-200' : ''} flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Schema Mapping
        </h2>
        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
      </div>

      {isExpanded && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-3 text-left font-semibold text-slate-800 border-b border-slate-200 min-w-[200px] w-1/4 bg-white">
                    <div className="flex items-center justify-between gap-2">
                      <span>Canonical</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddCanonical();
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                        title="Add Canonical Field"
                      >
                        <Plus className="w-3 h-3" />
                        Add Field
                      </button>
                    </div>
                  </th>
              {dataset.providers.map(provider => (
                <th 
                    key={provider.id} 
                    className="p-3 text-left font-semibold text-slate-800 border-b border-slate-200 border-l min-w-[200px] group/header bg-slate-50 relative"
                >
                  {/* Top visual accent for providers */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-500"></div>
                  
                  <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5">
                            <Database className="w-3 h-3 text-indigo-500" />
                            {provider.name}
                        </span>
                        <span className="text-[10px] font-normal text-slate-500 flex gap-2">
                            <span>{provider.flatKeys.length} keys</span>
                            <span className="text-indigo-600 font-medium">{getMappedKeyCount(provider.id)} mapped</span>
                        </span>
                      </div>
                      <button 
                        onClick={() => onDeleteProvider(provider.id)}
                        className="text-slate-400 hover:text-red-600 opacity-0 group-hover/header:opacity-100 transition-opacity p-1 rounded hover:bg-slate-200"
                        title="Remove Provider"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                  </div>
                </th>
              ))}
              <th className="p-3 w-12 border-b border-slate-200 bg-white"></th>
            </tr>
          </thead>
          <tbody>
            {dataset.canonicalFields.length === 0 ? (
               <tr>
                <td colSpan={dataset.providers.length + 2} className="p-12 text-center text-slate-400">
                    <p>No canonical fields defined.</p>
                    <p className="text-xs mt-2">Click "Add Canonical Field" to start mapping.</p>
                </td>
               </tr>
            ) : (
                dataset.canonicalFields.map((field) => (
                <tr key={field.id} className="hover:bg-slate-50 group border-b border-slate-100 last:border-0">
                    <td className="p-2 border-r border-slate-100 bg-white group-hover:bg-slate-50 transition-colors">
                    <input
                        type="text"
                        value={field.name}
                        onChange={(e) => onUpdateCanonical(field.id, e.target.value)}
                        placeholder="field_name"
                        className="w-full px-2 py-1.5 bg-transparent border border-transparent rounded hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono text-slate-800"
                    />
                    </td>
                    {dataset.providers.map((provider) => (
                    <td key={provider.id} className="p-2 border-r border-slate-100 bg-white group-hover:bg-slate-50 transition-colors">
                        <AttributeSelector
                            options={provider.flatKeys}
                            value={field.mappings[provider.id]}
                            onChange={(newValue) => onUpdateMapping(field.id, provider.id, newValue)}
                            sampleValue={field.mappings[provider.id] ? provider.sampleData[field.mappings[provider.id]!] : undefined}
                        />
                         {field.mappings[provider.id] && (
                            <div className="mt-1 px-1 text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                                Ex: {JSON.stringify(provider.sampleData[field.mappings[provider.id]!])}
                            </div>
                        )}
                    </td>
                    ))}
                    <td className="p-2 text-center bg-white group-hover:bg-slate-50 transition-colors">
                    <button 
                        onClick={() => onDeleteCanonical(field.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Field"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
        </div>
      </div>
      )}
    </div>
  );
};