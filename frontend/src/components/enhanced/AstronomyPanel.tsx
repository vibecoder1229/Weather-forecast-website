import React from 'react';
import type { EnhancedAstronomy, EnvironmentalData } from '../../types/api';
import { AnimatedIcon, WeatherIcons } from '../../utils/animatedIcons';

interface AstronomyPanelProps {
  astronomy: EnhancedAstronomy;
  environmental: EnvironmentalData;
  className?: string;
}

export const AstronomyPanel: React.FC<AstronomyPanelProps> = ({
  astronomy,
  environmental,
  className = ''
}) => {
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  };

  const getComfortIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent':
      case 'tuyệt vời':
        return <AnimatedIcon iconName="thermometer-exterior" size={20} />;
      case 'good':
      case 'tốt':
        return <AnimatedIcon iconName="thermometer" size={20} />;
      case 'fair':
      case 'khá':
        return <AnimatedIcon iconName="cloudy" size={20} />;
      case 'poor':
      case 'kém':
        return <AnimatedIcon iconName="rain" size={20} />;
      default:
        return <AnimatedIcon iconName="partly-cloudy-day" size={20} />;
    }
  };

  const getComfortColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent':
      case 'tuyệt vời':
        return 'text-green-600 bg-green-100';
      case 'good':
      case 'tốt':
        return 'text-green-500 bg-green-50';
      case 'fair':
      case 'khá':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
      case 'kém':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getUVColor = (index: number) => {
    if (index <= 2) return 'text-green-600 bg-green-100';
    if (index <= 5) return 'text-yellow-600 bg-yellow-100';
    if (index <= 7) return 'text-orange-600 bg-orange-100';
    if (index <= 10) return 'text-red-600 bg-red-100';
    return 'text-purple-600 bg-purple-100';
  };

  const getUVLevel = (index: number) => {
    if (index <= 2) return 'Thấp';
    if (index <= 5) return 'Trung bình';
    if (index <= 7) return 'Cao';
    if (index <= 10) return 'Rất cao';
    return 'Cực kỳ cao';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Astronomy Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <WeatherIcons.Sunrise className="mr-2" />
          Thông tin thiên văn
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg">
            <div className="text-2xl mb-2">
              <WeatherIcons.Sunrise />
            </div>
            <div className="text-sm text-gray-600">Bình minh</div>
            <div className="font-bold text-gray-800">
              {formatTime(astronomy.sunrise)}
            </div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
            <div className="text-2xl mb-2">
              <WeatherIcons.Sunset />
            </div>
            <div className="text-sm text-gray-600">Hoàng hôn</div>
            <div className="font-bold text-gray-800">
              {formatTime(astronomy.sunset)}
            </div>
          </div>

          {astronomy.golden_hour && (
            <div className="text-center p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg">
              <div className="text-2xl mb-2">✨</div>
              <div className="text-sm text-gray-600">Giờ vàng (sáng)</div>
              <div className="font-bold text-gray-800">
                {formatTime(astronomy.golden_hour.morning_start)}
              </div>
            </div>
          )}

          {astronomy.blue_hour && (
            <div className="text-center p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
              <div className="text-2xl mb-2">🔵</div>
              <div className="text-sm text-gray-600">Giờ xanh (sáng)</div>
              <div className="font-bold text-gray-800">
                {formatTime(astronomy.blue_hour.morning_start)}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Chiều dài ngày</div>
          <div className="font-bold text-gray-800">
            {(() => {
              try {
                const sunrise = new Date(`1970-01-01T${astronomy.sunrise}:00`);
                const sunset = new Date(`1970-01-01T${astronomy.sunset}:00`);
                
                if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) {
                  return 'Không có dữ liệu';
                }
                
                const diffMs = sunset.getTime() - sunrise.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);
                
                if (isNaN(diffHours) || diffHours < 0) {
                  return 'Không có dữ liệu';
                }
                
                const hours = Math.floor(diffHours);
                const minutes = Math.round((diffHours - hours) * 60);
                return `${hours} giờ ${minutes} phút`;
              } catch (error) {
                return 'Không có dữ liệu';
              }
            })()}
          </div>
        </div>
      </div>

      {/* Comfort Index */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <AnimatedIcon iconName="thermometer" size={24} className="mr-2" />
          Chỉ số thoải mái
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-100">
            <div className="flex items-center">
              <span className="text-3xl mr-4">
                {getComfortIcon(environmental.comfort_index.level_vi)}
              </span>
              <div>
                <div className="font-bold text-gray-800">Cảm giác chung</div>
                <div className="text-sm text-gray-600">Điểm số: {environmental.comfort_index.score}/10</div>
              </div>
            </div>
            
            <div className={`px-4 py-2 rounded-full font-medium ${getComfortColor(environmental.comfort_index.level_vi)}`}>
              {environmental.comfort_index.level_vi}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Chỉ số nhiệt</div>
              <div className="font-bold text-blue-700">
                {environmental.heat_index}°C
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Điểm sương</div>
              <div className="font-bold text-green-700">
                {environmental.dew_point}°C
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UV Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <WeatherIcons.UVIndex className="mr-2" />
          Thông tin tia UV
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-100">
            <div>
              <div className="font-bold text-gray-800 text-lg">
                Chỉ số UV: {environmental.uv_index}
              </div>
              <div className="text-sm text-gray-600">{environmental.category_vi}</div>
            </div>
            
            <div className={`px-4 py-2 rounded-full font-medium ${getUVColor(environmental.uv_index)}`}>
              {getUVLevel(environmental.uv_index)}
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Khuyến nghị bảo vệ</div>
              <div className="font-medium text-gray-800">
                {environmental.recommendations_vi}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};