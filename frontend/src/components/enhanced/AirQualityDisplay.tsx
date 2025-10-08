import React from 'react';
import type { EnhancedAirQuality } from '../../types/api';
import { AnimatedIcon, WeatherIcons } from '../../utils/animatedIcons';

interface AirQualityDisplayProps {
  airQuality: EnhancedAirQuality;
  className?: string;
}

export const AirQualityDisplay: React.FC<AirQualityDisplayProps> = ({
  airQuality,
  className = ''
}) => {
  const getAQIIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'good':
      case 'tốt':
        return <AnimatedIcon iconName="day-sunny" size={24} />;
      case 'moderate':
      case 'trung bình':
        return <AnimatedIcon iconName="cloudy" size={24} />;
      case 'unhealthy for sensitive groups':
      case 'không tốt cho nhóm nhạy cảm':
        return <AnimatedIcon iconName="dust" size={24} />;
      case 'unhealthy':
      case 'không tốt':
        return <AnimatedIcon iconName="smog" size={24} />;
      case 'very unhealthy':
      case 'rất không tốt':
        return <AnimatedIcon iconName="fog" size={24} />;
      case 'hazardous':
      case 'nguy hiểm':
        return <AnimatedIcon iconName="tornado" size={24} />;
      default:
        return <WeatherIcons.Wind />;
    }
  };

  const getPollutantIcon = (pollutant: string) => {
    switch (pollutant) {
      case 'pm2_5':
        return <AnimatedIcon iconName="dust" size={16} />;
      case 'pm10':
        return <AnimatedIcon iconName="dust" size={16} />;
      case 'co':
        return <AnimatedIcon iconName="smog" size={16} />;
      case 'no2':
        return <AnimatedIcon iconName="fog" size={16} />;
      case 'so2':
        return <AnimatedIcon iconName="fog" size={16} />;
      case 'o3':
        return <AnimatedIcon iconName="day-haze" size={16} />;
      default:
        return <AnimatedIcon iconName="fog" size={16} />;
    }
  };

  const getPollutantName = (pollutant: string) => {
    switch (pollutant) {
      case 'pm2_5':
        return 'PM2.5';
      case 'pm10':
        return 'PM10';
      case 'co':
        return 'CO';
      case 'no2':
        return 'NO₂';
      case 'so2':
        return 'SO₂';
      case 'o3':
        return 'O₃';
      default:
        return pollutant.toUpperCase();
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'good':
      case 'tốt':
        return 'text-green-600 bg-green-100';
      case 'moderate':
      case 'trung bình':
        return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy for sensitive groups':
      case 'không tốt cho nhóm nhạy cảm':
        return 'text-orange-600 bg-orange-100';
      case 'unhealthy':
      case 'không tốt':
        return 'text-red-600 bg-red-100';
      case 'very unhealthy':
      case 'rất không tốt':
        return 'text-purple-600 bg-purple-100';
      case 'hazardous':
      case 'nguy hiểm':
        return 'text-red-800 bg-red-200';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const translateActivity = (activity: string) => {
    const translations: { [key: string]: string } = {
      'all_outdoor_activities': 'Tất cả hoạt động ngoài trời',
      'indoor_activities': 'Hoạt động trong nhà',
      'light_outdoor': 'Hoạt động ngoài trời nhẹ',
      'moderate_outdoor': 'Hoạt động ngoài trời vừa phải',
      'avoid_outdoor': 'Tránh hoạt động ngoài trời',
      'walking': 'Đi bộ',
      'running': 'Chạy bộ',
      'cycling': 'Đạp xe',
      'sports': 'Thể thao',
      'gardening': 'Làm vườn',
    };
    
    return translations[activity] || activity;
  };

  return (
    <div className={`space-y-6 ${className}`} role="region" aria-labelledby="air-quality-heading">
      <h2 id="air-quality-heading" className="sr-only">Thông tin chất lượng không khí</h2>
      
      {/* Overall Air Quality */}
      <section className="bg-card rounded-xl shadow-lg p-6" aria-labelledby="overall-aqi-heading">
        <h3 id="overall-aqi-heading" className="text-xl font-bold text-foreground mb-4 flex items-center">
          <WeatherIcons.Wind className="mr-2" aria-hidden="true" />
          Chất lượng không khí
        </h3>

        <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border mb-4" 
             role="region" 
             aria-label={`Chỉ số chất lượng không khí ${airQuality.aqi_us}, mức độ ${airQuality.aqi_category_vi}`}>
          <div className="flex items-center">
            <span className="text-4xl mr-4" aria-hidden="true">
              {getAQIIcon(airQuality.aqi_category_vi)}
            </span>
            <div>
              <div className="font-bold text-foreground text-lg">
                AQI: {airQuality.aqi_us}
              </div>
              <div className="text-sm text-muted-foreground">{airQuality.description_vi}</div>
            </div>
          </div>
          
          <div 
            className={`px-4 py-2 rounded-full font-medium ${getLevelColor(airQuality.aqi_category_vi)}`}
          >
            {airQuality.aqi_category_vi}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Lời khuyên sức khỏe</div>
            <div className="font-medium text-foreground">
              {airQuality.health_advice_vi}
            </div>
          </div>

          {airQuality.mask_recommended && (
            <div className="p-3 bg-yellow-50 rounded-lg flex items-center">
              <span className="text-2xl mr-3">😷</span>
              <div className="text-sm font-medium text-yellow-800">
                Khuyến nghị đeo khẩu trang khi ra ngoài
              </div>
            </div>
          )}

          {airQuality.recommended_activities.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Hoạt động được khuyến nghị:</div>
              <div className="flex flex-wrap gap-2">
                {airQuality.recommended_activities.map((activity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm"
                  >
                    {translateActivity(activity)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Detailed Pollutant Information */}
      <section className="bg-card rounded-xl shadow-lg p-6" aria-labelledby="pollutant-details-heading">
        <h3 id="pollutant-details-heading" className="text-xl font-bold text-foreground mb-4 flex items-center">
          <span role="img" aria-label="Microscope">🔬</span> Chi tiết chất ô nhiễm
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(airQuality.pollutants).map(([pollutant, data]) => (
            <div
              key={pollutant}
              className="p-4 border-2 border-gray-100 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xl mr-2">
                    {getPollutantIcon(pollutant)}
                  </span>
                  <span className="font-bold text-foreground">
                    {getPollutantName(pollutant)}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(data.level_vi)}`}>
                  {data.level_vi}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {data.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.unit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};