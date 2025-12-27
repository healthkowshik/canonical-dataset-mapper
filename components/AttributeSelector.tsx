import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface AttributeSelectorProps {
  options: string[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  sampleValue?: any;
}

export const AttributeSelector: React.FC<AttributeSelectorProps> = ({ options, value, onChange, sampleValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options
  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const displayValue = value || "Select...";

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {!isOpen ? (
        <div 
          onClick={() => {
            setIsOpen(true);
            setSearch('');
          }}
          className={`
            w-full px-2 py-1.5 text-xs rounded border cursor-pointer flex justify-between items-center group shadow-sm min-h-[28px]
            ${value 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-900' 
              : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-300'
            }
            transition-all
          `}
        >
          <span className="truncate font-mono flex-1" title={value}>{displayValue}</span>
          {value && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
              className="ml-1 p-0.5 hover:bg-indigo-200 rounded text-indigo-400 hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        <div className="absolute top-0 left-0 w-full min-w-[240px] z-50 bg-white rounded-md shadow-lg border border-slate-200">
            <div className="p-2 border-b border-slate-100">
                <div className="relative">
                    <Search className="absolute left-2 top-1.5 w-3 h-3 text-slate-400" />
                    <input
                        autoFocus
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search attribute..."
                        className="w-full pl-7 pr-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
                    />
                </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
                <div 
                    onClick={() => {
                        onChange(undefined);
                        setIsOpen(false);
                    }}
                    className="px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer border-b border-slate-50"
                >
                    -- Clear Selection --
                </div>
                {filteredOptions.length === 0 && (
                    <div className="px-3 py-2 text-xs text-slate-400 text-center">No matches</div>
                )}
                {filteredOptions.map(opt => (
                    <div
                        key={opt}
                        onClick={() => {
                            onChange(opt);
                            setIsOpen(false);
                        }}
                        className={`px-3 py-2 text-xs cursor-pointer hover:bg-indigo-50 flex flex-col ${value === opt ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
                    >
                        <span className="font-mono truncate font-medium">{opt}</span>
                        {/* Optional: We could pass the sample data here to show a preview */}
                    </div>
                ))}
            </div>
        </div>
      )}
      {/* Tooltip for value preview could go here */}
    </div>
  );
};