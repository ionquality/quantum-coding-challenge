import { useEffect, useState } from 'react';

export interface Option {
  id: number | string;
  name: string;
}

export const useSelectOptions = (modelName: string | null) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Convert the model name to an endpoint.
  const getEndpointFromModel = (modelName: string) => {
    // Example: "App\\Models\\User" becomes "/api/users"
    const parts = modelName.split('\\');
    const model = parts[parts.length - 1];
    return `/api/form-input-select?model_name=${model.toLowerCase()}s`;
  };

  useEffect(() => {
    if (!modelName) return;
    const endpoint = getEndpointFromModel(modelName);
    setLoading(true);
    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch options from ${endpoint}`);
        return res.json();
      })
      .then((data) => {
        // Assume your API returns an array of options in data.data
        setOptions(data.data || []);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [modelName]);

  return { options, loading, error };
};
