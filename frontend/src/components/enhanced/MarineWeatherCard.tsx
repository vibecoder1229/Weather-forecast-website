import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Anchor, Waves, Wind, Eye, Droplets, Thermometer, Sun } from 'lucide-react';
import { weatherApi } from '../../services/weatherApi';

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

interface MarineWeatherCardProps {
  className?: string;
}

export function MarineWeatherCard({ className }: MarineWeatherCardProps) {
  const [location, setLocation] = useState('');
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [marineData, setMarineData] = useState<MarineWeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetMarineWeather = async () => {
    if (!location.trim()) {
      setError('Vui lòng nhập địa điểm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await weatherApi.getMarineWeather({
        location: location.trim(),
        days: days
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

  const getUVLevel = (uv: number) => {
    if (uv <= 2) return { level: 'Thấp', color: 'text-green-600', bg: 'bg-green-50' };
    if (uv <= 5) return { level: 'Trung bình', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (uv <= 7) return { level: 'Cao', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (uv <= 10) return { level: 'Rất cao', color: 'text-red-600', bg: 'bg-red-50' };
    return { level: 'Cực cao', color: 'text-purple-600', bg: 'bg-purple-50' };
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Anchor className="w-5 h-5 text-blue-500" />
          Thời tiết biển
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập tên cảng, thành phố ven biển..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGetMarineWeather()}
              className="flex-1"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">Số ngày:</label>
            <select 
              value={days} 
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
              aria-label="Chọn số ngày dự báo"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                <option key={d} value={d}>{d} ngày</option>
              ))}
            </select>
            <Button 
              onClick={handleGetMarineWeather} 
              disabled={loading}
              className="ml-auto min-w-[100px]"
            >
              {loading ? 'Đang tải...' : 'Tra cứu'}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Marine Weather Display */}
        {marineData && (
          <div className="space-y-4">
            {/* Location Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-medium text-blue-900">
                {marineData.location.name_vi}, {marineData.location.country_vi}
              </div>
              <div className="text-sm text-blue-700 mt-1">
                Thời gian địa phương: {marineData.location.localtime}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Tọa độ: {marineData.location.lat}°, {marineData.location.lon}°
              </div>
            </div>

            {/* Daily Forecast */}
            <div className="space-y-3">
              {marineData.forecast.forecastday.map((day, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-gray-900">
                      {formatDate(day.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <img 
                        src={`https:${day.day.condition.icon}`} 
                        alt={day.day.condition.text_vi}
                        className="w-8 h-8"
                      />
                      <span className="text-sm text-gray-600">
                        {day.day.condition.text_vi}
                      </span>
                    </div>
                  </div>

                  {/* Weather Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {/* Temperature */}
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <div>
                        <div className="font-medium">{day.day.maxtemp_c}°C</div>
                        <div className="text-xs text-gray-500">Max</div>
                      </div>
                    </div>

                    {/* Wind */}
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="font-medium">{day.day.maxwind_kph} km/h</div>
                        <div className="text-xs text-gray-500">Gió max</div>
                      </div>
                    </div>

                    {/* Visibility */}
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{day.day.avgvis_km} km</div>
                        <div className="text-xs text-gray-500">Tầm nhìn</div>
                      </div>
                    </div>

                    {/* Precipitation */}
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="font-medium">{day.day.totalprecip_mm} mm</div>
                        <div className="text-xs text-gray-500">Mưa</div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Marine Info */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Waves className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">Độ ẩm: {day.day.avghumidity}%</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-yellow-500" />
                        <div className="text-right">
                          <div className={`text-xs px-2 py-1 rounded ${getUVLevel(day.day.uv).bg} ${getUVLevel(day.day.uv).color}`}>
                            UV: {day.day.uv} ({getUVLevel(day.day.uv).level})
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Astronomy Info */}
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>Bình minh: {day.astro.sunrise}</div>
                      <div>Hoàng hôn: {day.astro.sunset}</div>
                      <div>Trăng lên: {day.astro.moonrise || 'N/A'}</div>
                      <div>Trăng lặn: {day.astro.moonset || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Marine Safety Notice */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                <strong>Lưu ý an toàn:</strong> Luôn kiểm tra điều kiện thời tiết và thông báo hàng hải mới nhất trước khi ra khơi.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}