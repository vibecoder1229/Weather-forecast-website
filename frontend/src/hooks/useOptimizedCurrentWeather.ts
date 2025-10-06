import { useState, useEffect, useRef, useCallback } from 'react';
import { weatherApi } from '../services/weatherApi';
import { useWeather } from '../contexts/WeatherContext';
import type { Location, Condition, CurrentWeatherResponse } from '../types/api';

interface DynamicWeatherData {
  temp_c: number;
  feelslike_c: number;
  humidity: number;
  wind_kph: number;
  vis_km: number;
  pressure_mb: number;
  uv: number;
  last_updated: string;
  last_updated_epoch: number;
}

interface StaticWeatherData {
  location: Location;
  condition: Condition & { text_vi?: string };
  is_day: number;
}

interface UseOptimizedCurrentWeatherResult {
  staticData: StaticWeatherData | null;
  dynamicData: DynamicWeatherData | null;
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  lastRefresh: Date | null;
  refetch: () => void;
}

const AUTO_REFRESH_INTERVAL = 60000; // 1 minute

export function useOptimizedCurrentWeather(): UseOptimizedCurrentWeatherResult {
  const { settings } = useWeather();
  const [staticData, setStaticData] = useState<StaticWeatherData | null>(null);
  const [dynamicData, setDynamicData] = useState<DynamicWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  const intervalRef = useRef<number | null>(null);
  const lastLocationRef = useRef<string | null>(null);
  const lastCoordinatesRef = useRef<{ lat: number; lon: number } | null>(null);

  const currentLocation = settings.location;
  const currentCoordinates = settings.coordinates;

  const fetchWeather = useCallback(async (isRefreshOnly = false) => {
    if (!currentLocation && !currentCoordinates) {
      setLoading(false);
      setError('Vui lòng chọn địa điểm trong phần Cài đặt');
      return;
    }

    // Only show loading for initial fetch, not for refreshes
    if (!isRefreshOnly) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    setError(null);

    try {
      const query = currentLocation 
        ? { location: currentLocation }
        : { lat: currentCoordinates!.lat, lon: currentCoordinates!.lon };

      const data: CurrentWeatherResponse = await weatherApi.getCurrentWeather(query);
      
      const newStaticData: StaticWeatherData = {
        location: data.location,
        condition: {
          ...data.current.condition,
          text_vi: (data.current.condition as any).text_vi // Add Vietnamese text if available
        },
        is_day: data.current.is_day
      };

      const newDynamicData: DynamicWeatherData = {
        temp_c: data.current.temp_c,
        feelslike_c: data.current.feelslike_c,
        humidity: data.current.humidity,
        wind_kph: data.current.wind_kph,
        vis_km: data.current.vis_km,
        pressure_mb: data.current.pressure_mb,
        uv: data.current.uv,
        last_updated: data.current.last_updated,
        last_updated_epoch: data.current.last_updated_epoch
      };

      // Only update static data if location changed or this is initial load
      const locationChanged = 
        lastLocationRef.current !== currentLocation ||
        JSON.stringify(lastCoordinatesRef.current) !== JSON.stringify(currentCoordinates);

      if (!isRefreshOnly || locationChanged) {
        setStaticData(newStaticData);
        lastLocationRef.current = currentLocation;
        lastCoordinatesRef.current = currentCoordinates;
      } else {
        // For refresh-only, check if weather condition changed
        setStaticData(prevStaticData => {
          if (prevStaticData && 
              (prevStaticData.condition.code !== newStaticData.condition.code ||
               prevStaticData.is_day !== newStaticData.is_day)) {
            return newStaticData;
          }
          return prevStaticData;
        });
      }

      setDynamicData(newDynamicData);
      setLastRefresh(new Date());
      
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối đến server');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [currentLocation, currentCoordinates]); // Removed staticData dependency

  // Setup auto-refresh interval
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Initial fetch
    fetchWeather(false);

    // Setup auto-refresh
    intervalRef.current = setInterval(() => {
      console.log('[useOptimizedCurrentWeather] Auto-refreshing dynamic data...');
      fetchWeather(true);
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchWeather]);

  // Manual refetch function
  const refetch = useCallback(() => {
    fetchWeather(false);
  }, [fetchWeather]);

  return {
    staticData,
    dynamicData,
    loading,
    error,
    isRefreshing,
    lastRefresh,
    refetch
  };
}