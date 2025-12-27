import React, { useMemo, useState } from 'react';
import { Dataset, Provider } from '../types';
import { ChevronDown, ChevronUp, Copy, Check, Search } from 'lucide-react';

interface UnmappedPanelProps {
  dataset: Dataset;
  onCopyAttribute: (attr: string) => void;
}

export const UnmappedPanel: React.FC<UnmappedPanelProps> = ({ dataset, onCopyAttribute }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const unmappedData = useMemo(() => {
    return dataset.providers.map(provider => {
      // Find all mapped keys for this provider
      const mappedKeys = new Set<string>();
      dataset.canonicalFields.forEach(field => {
        const mapping = field.mappings[provider.id];
        if (mapping) mappedKeys.add(mapping);
      });

      // Filter provider keys
      let unmapped = provider.flatKeys.filter(k => !mappedKeys.has(k));
      
      // Apply search filter
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        unmapped = unmapped.filter(k => k.toLowerCase().includes(lowerTerm));
      }

      return {
        provider,
        unmapped
      };
    });
  }, [dataset, searchTerm]);

  const totalUnmapped = unmappedData.reduce((acc, curr) => acc + curr.unmapped.length, 0);

  const formatValue = (val: any) => {
    if (val === undefined) return 'undefined';
    if (val === null) return 'null';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className={`mt-6 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col transition-all duration-300 ${isExpanded ? 'h-96' : 'h-12'}`}>
      <div 
        className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
            Unmapped Attributes
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-normal">
                {totalUnmapped} total
            </span>
        </h3>
        <div className="flex items-center gap-3">
             {isExpanded && (
                 <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <Search className="absolute left-2 top-1.5 w-3 h-3 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search attributes..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-7 pr-2 py-1 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-48 bg-white"
                    />
                 </div>
             )}
            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-hidden flex divide-x divide-slate-200">
          {unmappedData.map(({ provider, unmapped }) => (
            <div key={provider.id} className="flex-1 flex flex-col min-w-[250px]">
              <div className="px-3 py-2 bg-slate-50/50 border-b border-slate-100 text-xs font-medium text-slate-700 flex justify-between">
                <span>{provider.name}</span>
                <span className="text-slate-400">{unmapped.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {unmapped.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400 flex flex-col items-center">
                    {searchTerm ? "No matches found" : (
                         <>
                            <Check className="w-4 h-4 mb-1 text-green-500" />
                            <span className="text-green-600">All mapped</span>
                         </>
                    )}
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {unmapped.map(key => {
                        const val = provider.sampleData[key];
                        return (
                            <li key={key} className="group flex flex-col px-2 py-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <span 
                                        className="font-mono text-xs font-semibold text-slate-700 truncate mr-2" 
                                        title={key}
                                    >
                                        {key}
                                    </span>
                                    <button 
                                        onClick={() => onCopyAttribute(key)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600"
                                        title="Copy attribute name"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono truncate bg-slate-50 px-1.5 py-0.5 rounded w-full" title={formatValue(val)}>
                                    {formatValue(val)}
                                </div>
                            </li>
                        );
                    })}
                  </ul>
                )}
              </div>
            </div>
          ))}
          {unmappedData.length === 0 && (
             <div className="flex-1 p-8 text-center text-sm text-slate-400">
                No providers added yet. Upload a JSON file to see attributes.
             </div>
          )}
        </div>
      )}
    </div>
  );
};