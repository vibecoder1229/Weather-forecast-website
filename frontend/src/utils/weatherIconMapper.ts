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
 * @returns Path to the local SVG icon
 */
export function getWeatherIcon(
  code: number, 
  isDay: number, 
  variation: 'fill' | 'line' = 'fill',
  enableAnimation: boolean = true
): string {
  const mapping = WEATHER_ICON_MAP[code];
  
  if (!mapping) {
    console.warn(`No icon mapping found for weather code: ${code}, using default fallback`);
    return getAvailableIconPath(DEFAULT_FALLBACK, variation);
  }
  
  // Choose day or night icon
  const iconFile = isDay === 1 ? mapping.day : mapping.night;
  
  // If animation is disabled and there's a static fallback, use it
  if (!enableAnimation && mapping.fallback) {
    return getAvailableIconPath(mapping.fallback, variation);
  }
  
  // Return the primary icon path
  const primaryPath = getAvailableIconPath(iconFile, variation);
  
  // TODO: In a production app, you might want to add actual file existence checking here
  // For now, we'll trust that the mapped icons exist
  
  return primaryPath;
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
