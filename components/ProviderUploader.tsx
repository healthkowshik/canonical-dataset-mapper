import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { Upload, FileJson, AlertCircle } from 'lucide-react';

interface ProviderUploaderProps {
  onUpload: (name: string, data: any) => void;
  existingNames: string[];
}

export const ProviderUploader: React.FC<ProviderUploaderProps> = ({ onUpload, existingNames }) => {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      
      // Auto-suggest name if empty
      if (!name) {
        const fileName = e.target.files[0].name.replace(/\.[^/.]+$/, "").toLowerCase();
        // Remove special chars
        const cleanName = fileName.replace(/[^a-z0-9]/g, '');
        setName(cleanName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Provider name is required");
      return;
    }
    if (existingNames.includes(name.trim())) {
      setError("Provider name must be unique");
      return;
    }
    if (!file) {
      setError("Please select a JSON file");
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      onUpload(name.trim(), json);
      // Reset form
      setName('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError("Invalid JSON file");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <Upload className="w-4 h-4" />
        Add Provider
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Provider Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. apple, fitbit"
            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            JSON Schema File
          </label>
          <div className="relative">
             <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100
                bg-white border border-slate-300 rounded-md h-10 cursor-pointer
              "
            />
          </div>
        </div>
        <div className="pb-[2px]">
            <Button type="submit" disabled={!file || !name}>
                Add Provider
            </Button>
        </div>
      </form>
      {error && (
        <div className="mt-2 text-red-600 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
};