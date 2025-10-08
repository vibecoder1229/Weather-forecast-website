import type { EnhancedCurrentWeatherResponse } from '../types/api';

/**
 * Utility functions for validating and ensuring data consistency
 */

export interface WeatherDataValidation {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}

/**
 * Validate that the enhanced weather response has all required fields
 */
export function validateWeatherData(data: EnhancedCurrentWeatherResponse | null): WeatherDataValidation {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  if (!data) {
    return {
      isValid: false,
      missingFields: ['entire_response'],
      warnings: ['No data received from backend']
    };
  }

  // Check location data
  if (!data.location) {
    missingFields.push('location');
  } else {
    if (!data.location.name) warnings.push('location.name is missing');
    if (!data.location.country) warnings.push('location.country is missing');
  }

  // Check current weather data
  if (!data.current) {
    missingFields.push('current');
  } else {
    if (typeof data.current.temp_c !== 'number') warnings.push('current.temp_c is not a number');
    if (!data.current.condition) {
      warnings.push('current.condition is missing');
    } else {
      if (typeof data.current.condition.code !== 'number') warnings.push('current.condition.code is missing or invalid');
      if (typeof data.current.is_day !== 'number') warnings.push('current.is_day is missing or invalid');
    }
  }

  // Check enhancement data availability
  const enhancements = ['astronomy', 'environmental', 'recommendations', 'air_quality_enhanced', 'insights'];
  for (const enhancement of enhancements) {
    if (!(enhancement in data) || !data[enhancement as keyof EnhancedCurrentWeatherResponse]) {
      warnings.push(`${enhancement} data is missing or empty`);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings
  };
}

/**
 * Provide safe defaults for missing weather data
 */
export function getWeatherDataWithDefaults(data: EnhancedCurrentWeatherResponse | null): Partial<EnhancedCurrentWeatherResponse> {
  if (!data) {
    return createDefaultWeatherData();
  }

  return {
    location: {
      name: data.location?.name || 'Unknown Location',
      region: data.location?.region || '',
      country: data.location?.country || 'Unknown Country',
      lat: data.location?.lat || 0,
      lon: data.location?.lon || 0,
      tz_id: data.location?.tz_id || '',
      localtime_epoch: data.location?.localtime_epoch || Date.now() / 1000,
      localtime: data.location?.localtime || new Date().toLocaleString()
    },
    current: {
      ...data.current,
      temp_c: data.current?.temp_c ?? 0,
      temp_f: data.current?.temp_f ?? 32,
      is_day: data.current?.is_day ?? 1,
      condition: {
        text: data.current?.condition?.text || 'Unknown',
        text_vi: data.current?.condition?.text_vi || data.current?.condition?.text || 'Không xác định',
        icon: data.current?.condition?.icon || '',
        code: data.current?.condition?.code || 1000
      },
      humidity: data.current?.humidity ?? 0,
      wind_kph: data.current?.wind_kph ?? 0,
      pressure_mb: data.current?.pressure_mb ?? 0,
      feelslike_c: data.current?.feelslike_c ?? data.current?.temp_c ?? 0,
      // Add other required fields with defaults
      last_updated_epoch: data.current?.last_updated_epoch ?? Date.now() / 1000,
      last_updated: data.current?.last_updated ?? new Date().toISOString(),
      wind_mph: data.current?.wind_mph ?? 0,
      wind_degree: data.current?.wind_degree ?? 0,
      wind_dir: data.current?.wind_dir ?? 'N',
      pressure_in: data.current?.pressure_in ?? 0,
      precip_mm: data.current?.precip_mm ?? 0,
      precip_in: data.current?.precip_in ?? 0,
      cloud: data.current?.cloud ?? 0,
      feelslike_f: data.current?.feelslike_f ?? 32,
      windchill_c: data.current?.windchill_c ?? 0,
      windchill_f: data.current?.windchill_f ?? 32,
      heatindex_c: data.current?.heatindex_c ?? 0,
      heatindex_f: data.current?.heatindex_f ?? 32,
      dewpoint_c: data.current?.dewpoint_c ?? 0,
      dewpoint_f: data.current?.dewpoint_f ?? 32,
      vis_km: data.current?.vis_km ?? 0,
      vis_miles: data.current?.vis_miles ?? 0,
      uv: data.current?.uv ?? 0,
      gust_kph: data.current?.gust_kph ?? 0,
      gust_mph: data.current?.gust_mph ?? 0
    },
    astronomy: data.astronomy || {},
    environmental: data.environmental || {},
    recommendations: data.recommendations || {},
    air_quality_enhanced: data.air_quality_enhanced || {},
    insights: data.insights || {}
  };
}

/**
 * Create default weather data structure when no data is available
 */
function createDefaultWeatherData(): Partial<EnhancedCurrentWeatherResponse> {
  return {
    astronomy: {},
    environmental: {},
    recommendations: {},
    air_quality_enhanced: {},
    insights: {}
  };
}