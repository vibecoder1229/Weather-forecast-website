import { useState, useEffect, useCallback } from 'react';
import { weatherApi } from '../services/weatherApi';

export interface City {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  label: string;
}

export function useCitySearch() {
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCities = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setCities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await weatherApi.searchCities(searchQuery);
      setCities(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search cities');
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Debounce the search
    const timeoutId = setTimeout(() => {
      if (query) {
        searchCities(query);
      } else {
        setCities([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchCities]);

  return {
    query,
    setQuery,
    cities,
    loading,
    error,
  };
}
