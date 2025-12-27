export interface Provider {
  id: string;
  name: string;
  flatKeys: string[];
  // Store a flattened sample for preview: key -> value
  sampleData: Record<string, any>; 
}

export interface CanonicalField {
  id: string;
  name: string;
  // Map providerId to the key in that provider's schema
  mappings: Record<string, string>;
}

export interface Dataset {
  name: string;
  providers: Provider[];
  canonicalFields: CanonicalField[];
}

export interface ImportEvent {
  providerName: string;
  jsonData: any;
}
