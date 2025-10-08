import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Sun, Moon, MapPin, Clock, Sunrise } from 'lucide-react';
import { weatherApi } from '../../services/weatherApi';

interface AstronomyData {
  astronomy: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    moon_phase: string;
    moon_illumination: number;
    is_sun_up: number;
    is_moon_up: number;
  };
  location: {
    name: string;
    name_vi: string;
    country: string;
    country_vi: string;
    localtime: string;
    lat: number;
    lon: number;
  };
}

interface AstronomyDetailsProps {
  className?: string;
}

export function AstronomyDetails({ className }: AstronomyDetailsProps) {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [astronomyData, setAstronomyData] = useState<AstronomyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetAstronomy = async () => {
    if (!location.trim()) {
      setError('Vui lòng nhập địa điểm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await weatherApi.getAstronomy({
        location: location.trim()
      });

      if (response.success) {
        setAstronomyData(response.data);
      } else {
        setError(response.error?.message || 'Không thể lấy dữ liệu thiên văn học');
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getMoonPhaseIcon = (phase: string) => {
    // Return appropriate moon phase icon based on phase name
    const phases: { [key: string]: string } = {
      'New Moon': '🌑',
      'Waxing Crescent': '🌒',
      'First Quarter': '🌓',
      'Waxing Gibbous': '🌔',
      'Full Moon': '🌕',
      'Waning Gibbous': '🌖',
      'Last Quarter': '🌗',
      'Waning Crescent': '🌘',
    };
    return phases[phase] || '🌙';
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-yellow-500" />
          Thông tin thiên văn học
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="flex gap-2">
          <Input
            placeholder="Nhập tên thành phố..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGetAstronomy()}
            className="flex-1"
          />
          <Button 
            onClick={handleGetAstronomy} 
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? 'Đang tải...' : 'Tra cứu'}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Astronomy Data Display */}
        {astronomyData && (
          <div className="space-y-4">
            {/* Location Info */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{astronomyData.location.name_vi}, {astronomyData.location.country_vi}</span>
              <Clock className="w-4 h-4 ml-2" />
              <span>{astronomyData.location.localtime}</span>
            </div>

            {/* Sun and Moon Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg border ${astronomyData.astronomy.is_sun_up ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sun className={`w-4 h-4 ${astronomyData.astronomy.is_sun_up ? 'text-yellow-500' : 'text-gray-400'}`} />
                  Mặt trời
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {astronomyData.astronomy.is_sun_up ? 'Đang chiếu sáng' : 'Đã lặn'}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${astronomyData.astronomy.is_moon_up ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Moon className={`w-4 h-4 ${astronomyData.astronomy.is_moon_up ? 'text-blue-500' : 'text-gray-400'}`} />
                  Mặt trăng
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {astronomyData.astronomy.is_moon_up ? 'Đang lên' : 'Đã lặn'}
                </div>
              </div>
            </div>

            {/* Sun Times */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Sunrise className="w-4 h-4 text-orange-500" />
                Lịch mặt trời
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bình minh:</span>
                  <span className="font-medium">{astronomyData.astronomy.sunrise || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hoàng hôn:</span>
                  <span className="font-medium">{astronomyData.astronomy.sunset || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Moon Times and Phase */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Moon className="w-4 h-4 text-blue-500" />
                Lịch mặt trăng
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mọc:</span>
                  <span className="font-medium">{astronomyData.astronomy.moonrise || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lặn:</span>
                  <span className="font-medium">{astronomyData.astronomy.moonset || 'N/A'}</span>
                </div>
              </div>
              
              {/* Moon Phase */}
              <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Pha mặt trăng</div>
                    <div className="text-xs text-gray-600">{astronomyData.astronomy.moon_phase || 'Không xác định'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl">
                      {getMoonPhaseIcon(astronomyData.astronomy.moon_phase)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {astronomyData.astronomy.moon_illumination}% sáng
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}