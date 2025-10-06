import { useState, useEffect } from 'react';
import { weatherApi } from '../services/weatherApi';
import { useWeather } from '../contexts/WeatherContext';

interface WeatherData {
  location: any;
  current: any;
  forecast?: any;
  alerts?: any[];
  air_quality?: any;
}

interface UseWeatherDataResult {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCurrentWeather(autoRefreshInterval?: number): UseWeatherDataResult {
  const { settings } = useWeather();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    if (!settings.location && !settings.coordinates) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = settings.location 
        ? { location: settings.location }
        : { lat: settings.coordinates!.lat, lon: settings.coordinates!.lon };

      // weatherApi.getCurrentWeather now returns just the data (already extracted from {success, data, timestamp})
      const data = await weatherApi.getCurrentWeather(query);
      setData(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    
    // Set up auto-refresh if interval is provided
    if (autoRefreshInterval && autoRefreshInterval > 0) {
      console.log(`[useCurrentWeather] Setting up auto-refresh every ${autoRefreshInterval}ms`);
      const intervalId = setInterval(() => {
        console.log('[useCurrentWeather] Auto-refreshing weather data...');
        fetchWeather();
      }, autoRefreshInterval);

      // Cleanup interval on unmount or when dependencies change
      return () => {
        console.log('[useCurrentWeather] Cleaning up auto-refresh interval');
        clearInterval(intervalId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.location, settings.coordinates, autoRefreshInterval]);

  return { data, loading, error, refetch: fetchWeather };
}

export function useForecast(days: number = 7): UseWeatherDataResult {
  const { settings } = useWeather();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    if (!settings.location && !settings.coordinates) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = settings.location 
        ? { location: settings.location, days }
        : { lat: settings.coordinates!.lat, lon: settings.coordinates!.lon, days };

      // weatherApi.getForecast now returns just the data (already extracted from {success, data, timestamp})
      const data = await weatherApi.getForecast(query);
      setData(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.location, settings.coordinates, days]);

  return { data, loading, error, refetch: fetchForecast };
}

export function useAlerts(): UseWeatherDataResult {
  const { settings } = useWeather();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    if (!settings.location && !settings.coordinates) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = settings.location 
        ? { location: settings.location }
        : { lat: settings.coordinates!.lat, lon: settings.coordinates!.lon };

      // weatherApi.getAlerts now returns just the data (already extracted from {success, data, timestamp})
      const data = await weatherApi.getAlerts(query);
      setData(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.location, settings.coordinates]);

  return { data, loading, error, refetch: fetchAlerts };
}

