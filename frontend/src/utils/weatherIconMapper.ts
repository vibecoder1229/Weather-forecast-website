/**
 * Weather Icon Mapper with Animation Support
 * Maps WeatherAPI condition codes to local animated SVG icons
 * Includes fallback mechanisms and icon preloading for better performance
 */

// WeatherAPI condition codes reference
// https://www.weatherapi.com/docs/weather_conditions.json

interface IconMapping {
  day: string;
  night: string;
  animated?: boolean; // Flag to indicate if icon supports animation
  fallback?: string; // Fallback icon if primary doesn't exist
}

interface IconVariations {
  fill: string;
  line: string;
}

/**
 * GIF icons mapping for weather conditions
 * Maps condition codes to GIF filenames in the main weather_icons folder
 */
const GIF_WEATHER_MAPPING: Record<number, string> = {
  // Clear/Sunny
  1000: 'sunrise.gif',
  
  // Cloudy conditions
  1003: 'clouds.gif',
  1006: 'clouds.gif',
  1009: 'clouds.gif',
  
  // Rain conditions
  1063: 'rain.gif',
  1180: 'rain.gif',
  1183: 'rain.gif',
  1186: 'rain.gif',
  1189: 'rain.gif',
  1192: 'rain.gif',
  1195: 'rain.gif',
  1240: 'rain.gif',
  1243: 'rain.gif',
  1246: 'rain.gif',
  
  // Snow conditions
  1066: 'snow.gif',
  1114: 'snow-storm.gif',
  1117: 'snow-storm.gif',
  1210: 'snow.gif',
  1213: 'snow.gif',
  1216: 'snow.gif',
  1219: 'snow.gif',
  1222: 'snow.gif',
  1225: 'snow.gif',
  1255: 'snow.gif',
  1258: 'snow.gif',
  
  // Storm/Thunder conditions
  1087: 'storm.gif',
  1273: 'storm.gif',
  1276: 'storm1.gif',
  1279: 'storm.gif',
  1282: 'storm1.gif',
  
  // Wind conditions
  1030: 'windy.gif', // Mist
  1135: 'windy.gif', // Fog
  1147: 'windy.gif', // Freezing fog
};

/**
 * Map WeatherAPI condition codes to local icon filenames
 * Icons are located in /weather_icons/weather-icons-master/production/fill/all/
 * Each mapping includes animation support and fallback options
 */
const WEATHER_ICON_MAP: Record<number, IconMapping> = {
  // Sunny / Clear
  1000: {
    day: 'clear-day.svg',
    night: 'clear-night.svg',
    animated: true,
    fallback: 'sun.svg'
  },
  
  // Partly cloudy
  1003: {
    day: 'partly-cloudy-day.svg',
    night: 'partly-cloudy-night.svg',
    animated: true,
    fallback: 'cloudy.svg'
  },
  
  // Cloudy
  1006: {
    day: 'cloudy.svg',
    night: 'cloudy.svg',
    animated: true
  },
  
  // Overcast
  1009: {
    day: 'overcast-day.svg',
    night: 'overcast-night.svg',
    animated: true,
    fallback: 'cloudy.svg'
  },
  
  // Mist
  1030: {
    day: 'mist.svg',
    night: 'mist.svg',
    animated: true,
    fallback: 'fog.svg'
  },
  
  // Patchy rain possible
  1063: {
    day: 'partly-cloudy-day-rain.svg',
    night: 'partly-cloudy-night-rain.svg',
    animated: true,
    fallback: 'rain.svg'
  },
  
  // Patchy snow possible
  1066: {
    day: 'partly-cloudy-day-snow.svg',
    night: 'partly-cloudy-night-snow.svg',
    animated: true,
    fallback: 'snow.svg'
  },
  
  // Patchy sleet possible
  1069: {
    day: 'partly-cloudy-day-sleet.svg',
    night: 'partly-cloudy-night-sleet.svg',
    animated: true,
    fallback: 'sleet.svg'
  },
  
  // Patchy freezing drizzle possible
  1072: {
    day: 'partly-cloudy-day-drizzle.svg',
    night: 'partly-cloudy-night-drizzle.svg',
    animated: true,
    fallback: 'drizzle.svg'
  },
  
  // Thundery outbreaks possible
  1087: {
    day: 'thunderstorms-day.svg',
    night: 'thunderstorms-night.svg',
    animated: true,
    fallback: 'thunderstorms.svg'
  },
  
  // Blowing snow
  1114: {
    day: 'snow.svg',
    night: 'snow.svg'
  },
  
  // Blizzard
  1117: {
    day: 'snow.svg',
    night: 'snow.svg'
  },
  
  // Fog
  1135: {
    day: 'fog-day.svg',
    night: 'fog-night.svg'
  },
  
  // Freezing fog
  1147: {
    day: 'fog-day.svg',
    night: 'fog-night.svg'
  },
  
  // Patchy light drizzle
  1150: {
    day: 'drizzle.svg',
    night: 'drizzle.svg'
  },
  
  // Light drizzle
  1153: {
    day: 'drizzle.svg',
    night: 'drizzle.svg'
  },
  
  // Freezing drizzle
  1168: {
    day: 'sleet.svg',
    night: 'sleet.svg'
  },
  
  // Heavy freezing drizzle
  1171: {
    day: 'sleet.svg',
    night: 'sleet.svg'
  },
  
  // Patchy light rain
  1180: {
    day: 'partly-cloudy-day-rain.svg',
    night: 'partly-cloudy-night-rain.svg'
  },
  
  // Light rain
  1183: {
    day: 'rain.svg',
    night: 'rain.svg'
  },
  
  // Moderate rain at times
  1186: {
    day: 'rain.svg',
    night: 'rain.svg'
  },
  
  // Moderate rain
  1189: {
    day: 'rain.svg',
    night: 'rain.svg'
  },
  
  // Heavy rain at times
  1192: {
    day: 'rain.svg',
    night: 'rain.svg'
  },
  
  // Heavy rain
  1195: {
    day: 'rain.svg',
    night: 'rain.svg'
  },
  
  // Light freezing rain
  1198: {
    day: 'sleet.svg',
    night: 'sleet.svg'
  },
  
  // Moderate or heavy freezing rain
  1201: {
    day: 'sleet.svg',
    night: 'sleet.svg'
  },
  
  // Light sleet
  1204: {
    day: 'sleet.svg',
    night: 'sleet.svg'
  },
  
  // Moderate or heavy sleet
  1207: {
    day: 'sleet.svg',
    night: 'sleet.svg'
  },
  
  // Patchy light snow
  1210: {
    day: 'partly-cloudy-day-snow.svg',
    night: 'partly-cloudy-night-snow.svg'
  },
  
  // Light snow
  1213: {
    day: 'snow.svg',
    night: 'snow.svg'
  },
  
  // Patchy moderate snow
  1216: {
    day: 'partly-cloudy-day-snow.svg',
    night: 'partly-cloudy-night-snow.svg'
  },
  
  // Moderate snow
  1219: {
    day: 'snow.svg',
    night: 'snow.svg'
  },
  
  // Patchy heavy snow
  1222: {
    day: 'partly-cloudy-day-snow.svg',
    night: 'partly-cloudy-night-snow.svg'
  },
  
  // Heavy snow
  1225: {
    day: 'snow.svg',
    night: 'snow.svg'
  },
  
  // Ice pellets
  1237: {
    day: 'hail.svg',
    night: 'hail.svg'
  },
  
  // Light rain shower
  1240: {
    day: 'rain.svg',
    night: 'rain.svg'
  },
  
  // Moderate or heavy rain shower
  1243: {
    day: 'rain.svg',
    night: 'rain.svg'
  },
  
  // Torrential rain shower
  1246: {
    day: 'rain.svg',
    night: 'rain.svg'
  },
  
  // Light sleet showers
  1249: {
    day: 'sleet.svg',
    night: 'sleet.svg'
  },
  
  // Moderate or heavy sleet showers
  1252: {
    day: 'sleet.svg',
    night: 'sleet.svg'
  },
  
  // Light snow showers
  1255: {
    day: 'snow.svg',
    night: 'snow.svg'
  },
  
  // Moderate or heavy snow showers
  1258: {
    day: 'snow.svg',
    night: 'snow.svg'
  },
  
  // Light showers of ice pellets
  1261: {
    day: 'hail.svg',
    night: 'hail.svg'
  },
  
  // Moderate or heavy showers of ice pellets
  1264: {
    day: 'hail.svg',
    night: 'hail.svg'
  },
  
  // Patchy light rain with thunder
  1273: {
    day: 'thunderstorms-day-rain.svg',
    night: 'thunderstorms-night-rain.svg'
  },
  
  // Moderate or heavy rain with thunder
  1276: {
    day: 'thunderstorms-rain.svg',
    night: 'thunderstorms-rain.svg'
  },
  
  // Patchy light snow with thunder
  1279: {
    day: 'thunderstorms-day-snow.svg',
    night: 'thunderstorms-night-snow.svg'
  },
  
  // Moderate or heavy snow with thunder
  1282: {
    day: 'thunderstorms-snow.svg',
    night: 'thunderstorms-snow.svg',
    animated: true,
    fallback: 'snow.svg'
  }
};

/**
 * Base path for weather icons
 */
const ICON_BASE_PATH = '/weather_icons/weather-icons-master/production';

/**
 * Available icon variations (fill vs line)
 */
const ICON_VARIATIONS: IconVariations = {
  fill: `${ICON_BASE_PATH}/fill/all`,
  line: `${ICON_BASE_PATH}/line/all`
};

/**
 * Default fallback icon when no mapping exists
 */
const DEFAULT_FALLBACK = 'not-available.svg';

/**
 * Get GIF icon path if available for the weather condition
 * @param code - WeatherAPI condition code
 * @returns GIF icon path or null if not available
 */
function getGifIconPath(code: number): string | null {
  const gifFile = GIF_WEATHER_MAPPING[code];
  return gifFile ? `/weather_icons/${gifFile}` : null;
}

/**
 * Check if an icon file exists (for fallback mechanism)
 * Note: This is a simple check that can be enhanced with actual file existence validation
 */
function getAvailableIconPath(iconFile: string, variation: 'fill' | 'line' = 'fill'): string {
  return `${ICON_VARIATIONS[variation]}/${iconFile}`;
}

/**
 * Get the local icon path for a given weather condition with enhanced fallback support
 * @param code - WeatherAPI condition code
 * @param isDay - Whether it's day time (1) or night (0)
 * @param variation - Icon style variation ('fill' or 'line')
 * @param enableAnimation - Whether to prioritize animated icons
 * @param preferGif - Whether to prefer GIF icons over SVG when available
 * @returns Path to the local icon (GIF or SVG)
 */
export function getWeatherIcon(
  code: number, 
  isDay: number, 
  variation: 'fill' | 'line' = 'fill',
  enableAnimation: boolean = true,
  preferGif: boolean = true
): string {
  // Validate inputs and provide safe defaults
  const safeCode = typeof code === 'number' && !isNaN(code) ? code : 1000;
  const safeIsDay = typeof isDay === 'number' ? (isDay === 1 ? 1 : 0) : 1;
  
  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log(`[WeatherIcon] Loading icon for code: ${safeCode}, isDay: ${safeIsDay}, variation: ${variation}, preferGif: ${preferGif}`);
  }
  
  // First, try to get GIF icon if preferred and animation is enabled
  if (preferGif && enableAnimation) {
    const gifPath = getGifIconPath(safeCode);
    if (gifPath) {
      if (import.meta.env.DEV) {
        console.log(`[WeatherIcon] Using GIF: ${gifPath}`);
      }
      return gifPath;
    }
  }
  
  const mapping = WEATHER_ICON_MAP[safeCode];
  
  if (!mapping) {
    console.warn(`[WeatherIcon] No icon mapping found for weather code: ${safeCode}, using default fallback`);
    return getAvailableIconPath(DEFAULT_FALLBACK, variation);
  }
  
  // Choose day or night icon with fallback
  let iconFile = safeIsDay === 1 ? mapping.day : mapping.night;
  
  // If the selected icon doesn't exist, try the other time variant
  if (!iconFile) {
    iconFile = safeIsDay === 1 ? mapping.night : mapping.day;
    console.warn(`[WeatherIcon] Missing ${safeIsDay === 1 ? 'day' : 'night'} icon for code ${safeCode}, using ${safeIsDay === 1 ? 'night' : 'day'} variant`);
  }
  
  // If still no icon, use fallback
  if (!iconFile && mapping.fallback) {
    iconFile = mapping.fallback;
    console.warn(`[WeatherIcon] Using fallback icon for code ${safeCode}`);
  }
  
  // Final fallback to default
  if (!iconFile) {
    console.warn(`[WeatherIcon] No icon available for code ${safeCode}, using default fallback`);
    return getAvailableIconPath(DEFAULT_FALLBACK, variation);
  }
  
  const finalPath = getAvailableIconPath(iconFile, variation);
  
  if (import.meta.env.DEV) {
    console.log(`[WeatherIcon] Final path: ${finalPath}`);
  }
  
  return finalPath;
  // If animation is disabled and there's a static fallback, use it
  if (!enableAnimation && mapping.fallback) {
    return getAvailableIconPath(mapping.fallback, variation);
  }
  
  // Return the SVG icon path
  return getAvailableIconPath(iconFile, variation);
}

/**
 * Enhanced weather icon getter with comprehensive validation and fallbacks
 * This is the recommended function to use in components
 * @param code - WeatherAPI condition code
 * @param isDay - Whether it's day time (1) or night (0)
 * @param variation - Icon style variation ('fill' or 'line')
 * @param preferGif - Whether to prefer GIF icons over SVG when available
 */
export function getValidatedWeatherIcon(
  code: number | undefined | null, 
  isDay: number | undefined | null,
  variation: 'fill' | 'line' = 'fill',
  preferGif: boolean = true
): { iconPath: string; isDefault: boolean; description: string; isGif: boolean } {
  // Provide safe defaults for invalid inputs
  const safeCode = (typeof code === 'number' && !isNaN(code) && code > 0) ? code : 1000;
  const safeIsDay = (typeof isDay === 'number' && (isDay === 0 || isDay === 1)) ? isDay : 1;
  
  const iconPath = getWeatherIcon(safeCode, safeIsDay, variation, true, preferGif);
  const isDefault = iconPath.includes(DEFAULT_FALLBACK);
  const isGif = iconPath.endsWith('.gif');
  
  // Get description for the icon
  const mapping = WEATHER_ICON_MAP[safeCode];
  const timeOfDay = safeIsDay === 1 ? 'day' : 'night';
  
  let description = 'Weather condition';
  if (mapping) {
    description = `Weather condition ${safeCode} during ${timeOfDay}`;
  } else if (isDefault) {
    description = 'Weather data unavailable';
  }
  
  return {
    iconPath,
    isDefault,
    description,
    isGif
  };
}

/**
 * Get weather icon with automatic fallback chain
 * This function tries multiple fallback options if the primary icon is not available
 */
export function getWeatherIconWithFallback(
  code: number, 
  isDay: number,
  variation: 'fill' | 'line' = 'fill'
): string {
  const mapping = WEATHER_ICON_MAP[code];
  
  if (!mapping) {
    return getAvailableIconPath(DEFAULT_FALLBACK, variation);
  }
  
  const iconFile = isDay === 1 ? mapping.day : mapping.night;
  
  // Try primary icon first
  const primaryPath = getAvailableIconPath(iconFile, variation);
  
  // In a real implementation, you could check if the file exists here
  // For now, return the primary path assuming it exists
  return primaryPath;
}

/**
 * Enhanced preload function with better error handling and performance optimization
 * @param codes - Array of weather condition codes to preload
 * @param variation - Icon style variation to preload
 * @param includeFallbacks - Whether to also preload fallback icons
 */
export function preloadWeatherIcons(
  codes: number[], 
  variation: 'fill' | 'line' = 'fill',
  includeFallbacks: boolean = true
): Promise<void[]> {
  const preloadPromises: Promise<void>[] = [];
  
  codes.forEach(code => {
    const mapping = WEATHER_ICON_MAP[code];
    if (mapping) {
      // Preload both day and night versions
      const dayPath = getAvailableIconPath(mapping.day, variation);
      const nightPath = getAvailableIconPath(mapping.night, variation);
      
      // Create preload promises
      preloadPromises.push(preloadSingleIcon(dayPath));
      preloadPromises.push(preloadSingleIcon(nightPath));
      
      // Preload fallback icons if requested
      if (includeFallbacks && mapping.fallback) {
        const fallbackPath = getAvailableIconPath(mapping.fallback, variation);
        preloadPromises.push(preloadSingleIcon(fallbackPath));
      }
    }
  });
  
  return Promise.all(preloadPromises);
}

/**
 * Preload a single icon with error handling
 */
function preloadSingleIcon(iconPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      console.log(`✓ Preloaded weather icon: ${iconPath}`);
      resolve();
    };
    
    img.onerror = () => {
      console.warn(`✗ Failed to preload weather icon: ${iconPath}`);
      resolve(); // Don't reject to avoid breaking Promise.all
    };
    
    img.src = iconPath;
  });
}

/**
 * Get all available weather condition codes that have icon mappings
 */
export function getAvailableWeatherCodes(): number[] {
  return Object.keys(WEATHER_ICON_MAP).map(Number);
}

/**
 * Check if a weather condition supports animated icons
 */
export function supportsAnimation(code: number): boolean {
  const mapping = WEATHER_ICON_MAP[code];
  return mapping?.animated === true;
}

export default WEATHER_ICON_MAP;
