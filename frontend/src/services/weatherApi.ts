import type {
  ApiResponse,
  ApiErrorResponse,
  LocationQuery,
  ForecastQuery,
  CurrentWeatherResponse,
  ForecastWeatherResponse,
  CitySearchResponse,
  HealthCheckResponse,
  EnhancedCurrentWeatherResponse,
  EnhancedForecastWeatherResponse,
} from '../types/api';
import { isApiError, isApiSuccess } from '../types/api';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 10000;

/**
 * Custom error class for API errors
 */
export class WeatherApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', status: number = 500) {
    super(message);
    this.name = 'WeatherApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = REQUEST_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new WeatherApiError('Yêu cầu quá thời gian. Vui lòng thử lại.', 'TIMEOUT_ERROR', 504);
    }
    throw error;
  }
}

/**
 * Generic API call handler with proper error handling
 */
async function apiCall<T>(url: string, options: RequestInit = {}): Promise<T> {
  console.log('[WeatherAPI] Calling:', url);
  
  try {
    const response = await fetchWithTimeout(url, options);
    console.log('[WeatherAPI] Response status:', response.status);

    // Parse JSON response
    let result: ApiResponse<T>;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error('[WeatherAPI] JSON parse error:', parseError);
      throw new WeatherApiError('Lỗi định dạng dữ liệu từ máy chủ', 'PARSE_ERROR', response.status);
    }

    // Check if response is ok
    if (!response.ok) {
      console.error('[WeatherAPI] Error response:', result);
      
      if (isApiError(result)) {
        throw new WeatherApiError(
          result.error.message,
          result.error.code,
          result.error.status
        );
      }
      
      // Fallback for non-standard error format
      throw new WeatherApiError(
        'Đã xảy ra lỗi không xác định',
        'UNKNOWN_ERROR',
        response.status
      );
    }

    // Extract data from success response
    if (isApiSuccess(result)) {
      console.log('[WeatherAPI] Success:', result);
      return result.data;
    }

    // Should never reach here if types are correct
    throw new WeatherApiError('Định dạng phản hồi không hợp lệ', 'INVALID_RESPONSE', 500);
    
  } catch (error) {
    console.error('[WeatherAPI] Request error:', error);
    
    // Re-throw our custom errors
    if (error instanceof WeatherApiError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new WeatherApiError(
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
        'NETWORK_ERROR',
        0
      );
    }
    
    // Generic error fallback
    throw new WeatherApiError(
      error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định',
      'UNKNOWN_ERROR',
      500
    );
  }
}

export const weatherApi = {
  /**
   * Get current weather by location or coordinates
   */
  async getCurrentWeather(query: LocationQuery): Promise<CurrentWeatherResponse> {
    return apiCall<CurrentWeatherResponse>(
      `${API_BASE_URL}/api/weather/current`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      }
    );
  },

  /**
   * Get 7-day weather forecast
   */
  async getForecast(query: ForecastQuery): Promise<ForecastWeatherResponse> {
    return apiCall<ForecastWeatherResponse>(
      `${API_BASE_URL}/api/weather/forecast`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      }
    );
  },

  /**
   * Get weather alerts and air quality warnings
   */
  async getAlerts(query: LocationQuery): Promise<ForecastWeatherResponse> {
    return apiCall<ForecastWeatherResponse>(
      `${API_BASE_URL}/api/weather/alerts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      }
    );
  },

  /**
   * Search for cities by name (autocomplete)
   */
  async searchCities(query: string): Promise<CitySearchResponse> {
    return apiCall<CitySearchResponse>(
      `${API_BASE_URL}/api/weather/search?q=${encodeURIComponent(query)}`
    );
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    return apiCall<HealthCheckResponse>(`${API_BASE_URL}/api/health`);
  },

  // ============================================================================
  // Enhanced Weather API Methods
  // ============================================================================

  /**
   * Get enhanced current weather with comprehensive recommendations and insights
   */
  async getEnhancedCurrentWeather(query: LocationQuery): Promise<EnhancedCurrentWeatherResponse> {
    return apiCall<EnhancedCurrentWeatherResponse>(
      `${API_BASE_URL}/api/weather/enhanced-current`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      }
    );
  },

  /**
   * Get enhanced forecast with hourly data and comprehensive recommendations
   */
  async getEnhancedForecast(query: ForecastQuery): Promise<EnhancedForecastWeatherResponse> {
    return apiCall<EnhancedForecastWeatherResponse>(
      `${API_BASE_URL}/api/weather/enhanced-forecast`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      }
    );
  },

  // ============================================================================
  // New Weather API Methods
  // ============================================================================

  /**
   * Get astronomy data (sunrise, sunset, moon phase)
   */
  async getAstronomy(query: LocationQuery): Promise<any> {
    return apiCall<any>(
      `${API_BASE_URL}/api/weather/astronomy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      }
    );
  },

  /**
   * Get historical weather data
   */
  async getHistoricalWeather(query: LocationQuery & { date: string }): Promise<any> {
    return apiCall<any>(
      `${API_BASE_URL}/api/weather/history`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      }
    );
  },

  /**
   * Get marine weather conditions
   */
  async getMarineWeather(query: LocationQuery & { days?: number }): Promise<any> {
    return apiCall<any>(
      `${API_BASE_URL}/api/weather/marine`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      }
    );
  },

  /**
   * Get sports events
   */
  async getSportsEvents(query: LocationQuery): Promise<any> {
    return apiCall<any>(
      `${API_BASE_URL}/api/weather/sports`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      }
    );
  },

  /**
   * Get timezone information
   */
  async getTimezone(query: LocationQuery): Promise<any> {
    return apiCall<any>(
      `${API_BASE_URL}/api/weather/timezone`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      }
    );
  },

  /**
   * Get future weather forecast
   */
  async getFutureWeather(query: LocationQuery & { date: string }): Promise<any> {
    return apiCall<any>(
      `${API_BASE_URL}/api/weather/future`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      }
    );
  },
};

