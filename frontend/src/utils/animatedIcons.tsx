// Utility for using animated weather icons from the weather_icons folder
export const WEATHER_ICONS_BASE_PATH = '/weather_icons/weather-icons-master/design/fill/animation-ready';

export interface AnimatedIconProps {
  iconName: string;
  className?: string;
  alt?: string;
  size?: number;
}

export function AnimatedIcon({ iconName, className = '', alt = '', size = 24 }: AnimatedIconProps) {
  const iconPath = `${WEATHER_ICONS_BASE_PATH}/${iconName}.svg`;
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    const fallbackPath = `${WEATHER_ICONS_BASE_PATH}/not-available.svg`;
    
    console.error('[AnimatedIcon] Failed to load icon:', iconName);
    console.error('[AnimatedIcon] Attempted path:', iconPath);
    console.error('[AnimatedIcon] Falling back to:', fallbackPath);
    
    // Fallback to a default icon if the specific icon is not found
    target.src = fallbackPath;
  };
  
  const handleLoad = () => {
    if (import.meta.env.DEV) {
      console.log('[AnimatedIcon] Successfully loaded:', iconName);
    }
  };
  
  return (
    <img
      src={iconPath}
      alt={alt || iconName}
      className={className}
      width={size}
      height={size}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
}

// Icon name mappings for different contexts
export const ICON_MAPPINGS = {
  // Weather conditions
  weather: {
    sunny: 'clear-day',
    clear_night: 'clear-night',
    cloudy: 'cloudy',
    overcast: 'overcast',
    partly_cloudy_day: 'partly-cloudy-day',
    partly_cloudy_night: 'partly-cloudy-night',
    rain: 'rain',
    drizzle: 'drizzle',
    snow: 'snow',
    fog: 'fog',
    mist: 'mist',
    haze: 'haze',
    thunderstorm: 'thunderstorms',
    hurricane: 'hurricane',
    tornado: 'tornado',
  },
  
  // Astronomy
  astronomy: {
    sunrise: 'sunrise',
    sunset: 'sunset',
    moonrise: 'moonrise',
    moonset: 'moonset',
    golden_hour: 'sunrise', // Use sunrise for golden hour
    blue_hour: 'starry-night',
    moon_new: 'moon-new',
    moon_waxing_crescent: 'moon-waxing-crescent',
    moon_first_quarter: 'moon-first-quarter',
    moon_waxing_gibbous: 'moon-waxing-gibbous',
    moon_full: 'moon-full',
    moon_waning_gibbous: 'moon-waning-gibbous',
    moon_last_quarter: 'moon-last-quarter',
    moon_waning_crescent: 'moon-waning-crescent',
    eclipse_solar: 'eclipse',
    eclipse_lunar: 'eclipse',
    meteor_shower: 'meteor-rain',
    sunrise_time: 'sunrise',
  },
  
  // Environmental
  environment: {
    temperature: 'thermometer',
    temperature_hot: 'thermometer-warmer',
    temperature_cold: 'thermometer-colder',
    humidity: 'humidity',
    pressure: 'barometer',
    pressure_high: 'pressure-high',
    pressure_low: 'pressure-low',
    uv_index: 'uv-index',
    wind: 'wind',
    visibility: 'horizon',
  },
  
  // Activities
  activities: {
    outdoor_fitness: 'wind', // Representing outdoor activities
    beach: 'clear-day', // Beach activities
    gardening: 'partly-cloudy-day', // Gardening
    umbrella: 'umbrella',
    sunglasses: 'clear-day', // No specific sunglasses icon
    sunscreen: 'uv-index',
  },
  
  // Transportation
  transport: {
    driving: 'wind', // General driving conditions
    visibility: 'horizon',
  },
  
  // Air Quality
  air_quality: {
    good: 'clear-day',
    moderate: 'haze',
    unhealthy: 'smoke',
    hazardous: 'smoke-particles',
    mask: 'dust', // For mask recommendations
  },
  
  // Trends
  trends: {
    increasing: 'thermometer-warmer',
    decreasing: 'thermometer-colder',
    stable: 'thermometer',
    fluctuating: 'wind',
  },
  
  // Weather conditions severity
  severity: {
    extreme_temperature: 'thermometer-warmer',
    high_wind: 'wind',
    heavy_rain: 'rain',
    low_visibility: 'fog',
    high_humidity: 'humidity',
    storm: 'thunderstorms',
    heat_wave: 'thermometer-warmer',
    cold_snap: 'thermometer-colder',
  },

  // Sports & Activities
  sports: {
    football: 'cycling',      // Use cycling as closest sport animation
    cricket: 'strategy-board', // Use strategy board for cricket
    golf: 'running',          // Use running for golf activities
    general_sports: 'cycling1',
    outdoor_sports: 'hiking',
    team_sports: 'strategy-board',
    running: 'running',
    cycling: 'cycling',
    cycling_tour: 'cycling1',
  },

  // Marine & Maritime
  marine: {
    ship: 'ship',
    boat: 'ship', 
    buoy: 'buoy',
    waves: 'waves',
    calm_seas: 'wave',
    rough_seas: 'waves',
    marine_storm: 'storm',
    maritime_warning: 'storm1',
    coastal: 'buoy',
    ocean: 'waves',
    sea: 'wave',
  },

  // Advanced Activities
  outdoor_activities: {
    hiking: 'hiking',
    mountain_hiking: 'hiking1',
    picnic: 'picnic',
    family_picnic: 'picnic1',
    camping: 'fire',
    forest_activities: 'forest_fire',
    running: 'running',
    cycling: 'cycling',
    cycling_tour: 'cycling1',
  },

  // Weather Warnings & Alerts
  warnings: {
    tornado_warning: 'tornado',
    severe_tornado: 'tornado1',
    flood_warning: 'flood',
    flash_flood: 'flood1',
    general_caution: 'caution',
    storm_warning: 'storm',
    severe_storm: 'storm1',
    wind_warning: 'strong_wind',
    fire_danger: 'fire',
    forest_fire_warning: 'forest_fire',
  }
};

// Helper function to get icon name from mapping
export function getAnimatedIconName(category: keyof typeof ICON_MAPPINGS, key: string): string {
  const categoryMapping = ICON_MAPPINGS[category];
  if (categoryMapping && key in categoryMapping) {
    return (categoryMapping as any)[key];
  }
  return 'not-available';
}

// Common icon components for easy use
export const WeatherIcons = {
  Sunrise: (props: Omit<AnimatedIconProps, 'iconName'>) => 
    <AnimatedIcon {...props} iconName="sunrise" alt="Sunrise" />,
  
  Sunset: (props: Omit<AnimatedIconProps, 'iconName'>) => 
    <AnimatedIcon {...props} iconName="sunset" alt="Sunset" />,
  
  Temperature: (props: Omit<AnimatedIconProps, 'iconName'>) => 
    <AnimatedIcon {...props} iconName="thermometer" alt="Temperature" />,
  
  Humidity: (props: Omit<AnimatedIconProps, 'iconName'>) => 
    <AnimatedIcon {...props} iconName="humidity" alt="Humidity" />,
  
  Wind: (props: Omit<AnimatedIconProps, 'iconName'>) => 
    <AnimatedIcon {...props} iconName="wind" alt="Wind" />,
  
  Pressure: (props: Omit<AnimatedIconProps, 'iconName'>) => 
    <AnimatedIcon {...props} iconName="barometer" alt="Pressure" />,
  
  UVIndex: (props: Omit<AnimatedIconProps, 'iconName'>) => 
    <AnimatedIcon {...props} iconName="uv-index" alt="UV Index" />,
  
  Umbrella: (props: Omit<AnimatedIconProps, 'iconName'>) => 
    <AnimatedIcon {...props} iconName="umbrella" alt="Umbrella" />,
  
  GoldenHour: (props: Omit<AnimatedIconProps, 'iconName'>) => 
    <AnimatedIcon {...props} iconName="star" alt="Golden Hour" />,
  
  BlueHour: (props: Omit<AnimatedIconProps, 'iconName'>) => 
    <AnimatedIcon {...props} iconName="starry-night" alt="Blue Hour" />,
  
  Moon: (props: Omit<AnimatedIconProps, 'iconName'> & { phase?: string }) => {
    const iconName = getAnimatedIconName('astronomy', props.phase || 'moon_full');
    return <AnimatedIcon {...props} iconName={iconName} alt={`Moon ${props.phase}`} />;
  },
  
  AirQuality: (props: Omit<AnimatedIconProps, 'iconName'> & { quality?: string }) => {
    const iconName = getAnimatedIconName('air_quality', props.quality || 'good');
    return <AnimatedIcon {...props} iconName={iconName} alt={`Air Quality ${props.quality}`} />;
  },
  
  // Sports Icons
  Sports: (props: Omit<AnimatedIconProps, 'iconName'> & { sport?: string }) => {
    const iconName = getAnimatedIconName('sports', props.sport || 'general_sports');
    return <AnimatedIcon {...props} iconName={iconName} alt={`${props.sport} sport`} />;
  },
  
  // Marine Icons
  Marine: (props: Omit<AnimatedIconProps, 'iconName'> & { type?: string }) => {
    const iconName = getAnimatedIconName('marine', props.type || 'sea');
    return <AnimatedIcon {...props} iconName={iconName} alt={`Marine ${props.type}`} />;
  },
  
  // Activity Icons
  Activity: (props: Omit<AnimatedIconProps, 'iconName'> & { activity?: string }) => {
    const iconName = getAnimatedIconName('outdoor_activities', props.activity || 'hiking');
    return <AnimatedIcon {...props} iconName={iconName} alt={`${props.activity} activity`} />;
  },
  
  // Warning Icons
  Warning: (props: Omit<AnimatedIconProps, 'iconName'> & { type?: string }) => {
    const iconName = getAnimatedIconName('warnings', props.type || 'general_caution');
    return <AnimatedIcon {...props} iconName={iconName} alt={`${props.type} warning`} />;
  },
};