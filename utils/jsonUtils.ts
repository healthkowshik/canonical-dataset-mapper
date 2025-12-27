/**
 * Flattens a JSON object into a single-level object with dot-notation keys.
 * Handles arrays by taking the first element (index 0) to represent the schema.
 */
export const flattenJSON = (data: any, prefix = ''): Record<string, any> => {
  let result: Record<string, any> = {};

  // Handle null/undefined
  if (data === null || data === undefined) {
    if (prefix) result[prefix] = null;
    return result;
  }

  // If it's a primitive, just return it
  if (typeof data !== 'object') {
    result[prefix] = data;
    return result;
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    if (data.length > 0) {
      // Recurse into the first element for schema discovery
      // We explicitly include the index '0' to indicate array structure in the path
      // This is common in many ETL flattening strategies
      const newPrefix = prefix ? `${prefix}.0` : '0';
      const flatChild = flattenJSON(data[0], newPrefix);
      result = { ...result, ...flatChild };
    } else {
      // Empty array
      result[prefix] = [];
    }
    return result;
  }

  // Handle Objects
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      const flatChild = flattenJSON(value, newKey);
      result = { ...result, ...flatChild };
    }
  }

  return result;
};

/**
 * Prepares the raw uploaded JSON for processing.
 * If input is an array, take the first item as the record representative.
 */
export const processUploadedJSON = (raw: any): { sample: Record<string, any>, keys: string[] } => {
  let root = raw;
  if (Array.isArray(raw)) {
    root = raw.length > 0 ? raw[0] : {};
  }

  const flattened = flattenJSON(root);
  const keys = Object.keys(flattened).sort();

  return {
    sample: flattened,
    keys
  };
};
