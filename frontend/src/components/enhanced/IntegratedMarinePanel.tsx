import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Loader2, Wind, Eye, Droplets, Thermometer } from 'lucide-react';
import { weatherApi } from '../../services/weatherApi';
import { useWeather } from '../../contexts/WeatherContext';
import { AnimatedIcon } from '../../utils/animatedIcons';

interface MarineWeatherData {
  location: {
    name: string;
    name_vi: string;
    country: string;
    country_vi: string;
    localtime: string;
    lat: number;
    lon: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        maxwind_kph: number;
        maxwind_mph: number;
        totalprecip_mm: number;
        totalprecip_in: number;
        avgvis_km: number;
        avgvis_miles: number;
        avghumidity: number;
        condition: {
          text: string;
          text_vi: string;
          icon: string;
          code: number;
        };
        uv: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
        moonrise: string;
        moonset: string;
        moon_phase: string;
        moon_illumination: number;
      };
    }>;
  };
}

interface IntegratedMarinePanelProps {
  className?: string;
}

export function IntegratedMarinePanel({ className }: IntegratedMarinePanelProps) {
  const { settings } = useWeather();
  const [loading, setLoading] = useState(false);
  const [marineData, setMarineData] = useState<MarineWeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.location) {
      fetchMarineData();
    }
  }, [settings.location]);

  const fetchMarineData = async () => {
    if (!settings.location) return;

    setLoading(true);
    setError(null);

    try {
      const response = await weatherApi.getMarineWeather({
        location: settings.location,
        days: 3
      });

      if (response.success) {
        setMarineData(response.data);
      } else {
        setError(response.error?.message || 'Không thể lấy dữ liệu thời tiết biển');
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const getSeaCondition = (windKph: number, visibility: number) => {
    if (windKph < 10 && visibility > 5) return { text: 'Tốt', color: 'bg-green-100 text-green-800', icon: 'wave' };
    if (windKph < 25 && visibility > 3) return { text: 'Trung bình', color: 'bg-yellow-100 text-yellow-800', icon: 'waves' };
    return { text: 'Xấu', color: 'bg-red-100 text-red-800', icon: 'storm' };
  };

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Đang tải dữ liệu thời tiết biển...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AnimatedIcon iconName="caution" className="h-8 w-8 mx-auto mb-2" alt="Error" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!marineData || !marineData.forecast?.forecastday?.length) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <AnimatedIcon iconName="ship" className="h-8 w-8 mx-auto mb-2" alt="No data" />
            <p>Không có dữ liệu thời tiết biển cho khu vực này</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AnimatedIcon iconName="ship" className="h-5 w-5" alt="Marine weather" />
          Thời tiết biển - {marineData.location.name_vi || marineData.location.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {marineData.forecast.forecastday.slice(0, 3).map((day, index) => {
          const condition = getSeaCondition(day.day.maxwind_kph, day.day.avgvis_km);
          
          return (
            <div key={day.date} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">
                  {index === 0 ? 'Hôm nay' : formatDate(day.date)}
                </h4>
                <Badge className={condition.color}>
                  <AnimatedIcon iconName={condition.icon} className="h-3 w-3 mr-1" alt={condition.text} />
                  {condition.text}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="text-gray-600">Nhiệt độ</div>
                    <div className="font-medium">{Math.round(day.day.avgtemp_c)}°C</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-gray-600">Gió</div>
                    <div className="font-medium">{Math.round(day.day.maxwind_kph)} km/h</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-gray-600">Tầm nhìn</div>
                    <div className="font-medium">{Math.round(day.day.avgvis_km)} km</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-400" />
                  <div>
                    <div className="text-gray-600">Độ ẩm</div>
                    <div className="font-medium">{day.day.avghumidity}%</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{day.day.condition.text_vi || day.day.condition.text}</span>
                  <span>UV: {day.day.uv}</span>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-sm text-blue-800 mb-2 flex items-center gap-2">
            <AnimatedIcon iconName="buoy" className="h-4 w-4" alt="Marine safety" />
            Lưu ý an toàn hàng hải
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Kiểm tra dự báo thời tiết trước khi ra khơi</li>
            <li>• Trang bị đầy đủ thiết bị an toàn</li>
            <li>• Thông báo lịch trình cho người thân</li>
            <li>• Theo dõi cảnh báo từ các cơ quan khí tượng</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}