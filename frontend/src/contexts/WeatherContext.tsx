import React, { createContext, useContext, useState, useEffect } from 'react';

interface WeatherSettings {
  language: string;
  temperatureUnit: 'celsius' | 'fahrenheit';
  notifications: boolean;
  autoLocation: boolean;
  location: string | null;
  coordinates: { lat: number; lon: number } | null;
}

interface WeatherContextType {
  settings: WeatherSettings;
  updateSettings: (newSettings: Partial<WeatherSettings>) => void;
  getCurrentLocation: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WeatherSettings>(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('weatherSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      language: 'vi',
      temperatureUnit: 'celsius',
      notifications: true,
      autoLocation: true,
      location: null,
      coordinates: null,
    };
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('weatherSettings', JSON.stringify(settings));
  }, [settings]);

  // Get user's current location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setSettings((prev) => ({ ...prev, coordinates: coords }));
          resolve();
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        }
      );
    });
  };

  // Auto-get location on mount if enabled
  useEffect(() => {
    if (settings.autoLocation && !settings.coordinates) {
      getCurrentLocation().catch(console.error);
    }
  }, [settings.autoLocation]);

  const updateSettings = (newSettings: Partial<WeatherSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <WeatherContext.Provider value={{ settings, updateSettings, getCurrentLocation }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
