import React from 'react';
import { getWeatherIcon, getValidatedWeatherIcon } from '../utils/weatherIconMapper';
import { AnimatedIcon } from '../utils/animatedIcons';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

/**
 * IconDebugPanel - Test component to verify all icon paths are working
 * This helps diagnose icon loading issues by testing different icon systems
 */
export function IconDebugPanel() {
  const testWeatherCodes = [
    { code: 1000, name: 'Clear/Sunny', isDay: 1 },
    { code: 1003, name: 'Partly Cloudy', isDay: 1 },
    { code: 1006, name: 'Cloudy', isDay: 1 },
    { code: 1063, name: 'Patchy Rain', isDay: 1 },
    { code: 1180, name: 'Light Rain', isDay: 1 },
    { code: 1210, name: 'Patchy Snow', isDay: 1 },
  ];

  const testUtilityIcons = [
    'thermometer',
    'wind',
    'humidity',
    'barometer',
    'sunrise',
    'sunset',
  ];

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Weather Icon Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Weather Condition Icons Test */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Weather Condition Icons (SVG)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {testWeatherCodes.map(({ code, name, isDay }) => {
                const { iconPath, isDefault } = getValidatedWeatherIcon(code, isDay, 'fill', false);
                return (
                  <div key={code} className="p-3 border rounded">
                    <img 
                      src={iconPath} 
                      alt={name}
                      className="w-16 h-16 mx-auto"
                      onError={(e) => {
                        console.error(`Failed to load icon for ${name} (${code}):`, iconPath);
                        (e.target as HTMLImageElement).style.border = '2px solid red';
                      }}
                      onLoad={() => console.log(`✓ Loaded ${name}:`, iconPath)}
                    />
                    <p className="text-xs text-center mt-2">{name}</p>
                    <p className="text-xs text-center text-gray-500">Code: {code}</p>
                    {isDefault && <p className="text-xs text-center text-red-500">Using Fallback</p>}
                    <p className="text-xs text-center text-gray-400 break-all">{iconPath.split('/').pop()}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GIF Icons Test */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Weather Condition Icons (GIF - if available)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {testWeatherCodes.map(({ code, name, isDay }) => {
                const { iconPath, isGif } = getValidatedWeatherIcon(code, isDay, 'fill', true);
                return (
                  <div key={code} className="p-3 border rounded">
                    <img 
                      src={iconPath} 
                      alt={name}
                      className="w-16 h-16 mx-auto"
                      onError={(e) => {
                        console.error(`Failed to load GIF for ${name} (${code}):`, iconPath);
                        (e.target as HTMLImageElement).style.border = '2px solid red';
                      }}
                      onLoad={() => console.log(`✓ Loaded GIF ${name}:`, iconPath)}
                    />
                    <p className="text-xs text-center mt-2">{name}</p>
                    <p className="text-xs text-center text-gray-500">{isGif ? '🎬 GIF' : '📄 SVG'}</p>
                    <p className="text-xs text-center text-gray-400 break-all">{iconPath.split('/').pop()}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Utility Icons Test */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Utility Icons (AnimatedIcon Component)</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {testUtilityIcons.map((iconName) => (
                <div key={iconName} className="p-3 border rounded">
                  <AnimatedIcon 
                    iconName={iconName}
                    size={48}
                    className="mx-auto"
                    alt={iconName}
                  />
                  <p className="text-xs text-center mt-2">{iconName}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Path Test */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Direct Path Tests</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 border rounded">
                <img 
                  src="/weather_icons/weather-icons-master/production/fill/all/clear-day.svg"
                  alt="Direct SVG"
                  className="w-16 h-16 mx-auto"
                  onError={() => console.error('❌ Failed: /weather_icons/weather-icons-master/production/fill/all/clear-day.svg')}
                  onLoad={() => console.log('✓ Success: Direct SVG path')}
                />
                <p className="text-xs text-center mt-2">Direct SVG</p>
              </div>
              <div className="p-3 border rounded">
                <img 
                  src="/weather_icons/sunrise.gif"
                  alt="Direct GIF"
                  className="w-16 h-16 mx-auto"
                  onError={() => console.error('❌ Failed: /weather_icons/sunrise.gif')}
                  onLoad={() => console.log('✓ Success: Direct GIF path')}
                />
                <p className="text-xs text-center mt-2">Direct GIF</p>
              </div>
              <div className="p-3 border rounded">
                <img 
                  src="/weather_icons/weather-icons-master/design/fill/animation-ready/thermometer.svg"
                  alt="Animation Ready"
                  className="w-16 h-16 mx-auto"
                  onError={() => console.error('❌ Failed: animation-ready path')}
                  onLoad={() => console.log('✓ Success: Animation-ready path')}
                />
                <p className="text-xs text-center mt-2">Animation Ready</p>
              </div>
              <div className="p-3 border rounded">
                <img 
                  src="/weather_icons/utils_icons/location.gif"
                  alt="Utils Icon"
                  className="w-16 h-16 mx-auto"
                  onError={() => console.error('❌ Failed: utils_icons path')}
                  onLoad={() => console.log('✓ Success: Utils icons path')}
                />
                <p className="text-xs text-center mt-2">Utils Icons</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 rounded">
            <h4 className="font-semibold mb-2">📋 Instructions:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Open your browser's DevTools (F12)</li>
              <li>Go to the Console tab</li>
              <li>Look for icon loading messages</li>
              <li>Red borders = failed to load</li>
              <li>Check the Network tab for 404 errors</li>
              <li>Verify the actual file paths match what's being requested</li>
            </ol>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
