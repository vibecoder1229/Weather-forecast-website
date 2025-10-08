import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Loader2, Sun, Moon } from 'lucide-react';
import { weatherApi } from '../../services/weatherApi';
import { useWeather } from '../../contexts/WeatherContext';
import { AnimatedIcon } from '../../utils/animatedIcons';

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

interface IntegratedAstronomyPanelProps {
  className?: string;
}

export function IntegratedAstronomyPanel({ className }: IntegratedAstronomyPanelProps) {
  const { settings } = useWeather();
  const [loading, setLoading] = useState(false);
  const [astronomyData, setAstronomyData] = useState<AstronomyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.location) {
      fetchAstronomyData();
    }
  }, [settings.location]);

  const fetchAstronomyData = async () => {
    if (!settings.location) return;

    setLoading(true);
    setError(null);

    try {
      const response = await weatherApi.getAstronomy({
        location: settings.location
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
    const phaseMap: { [key: string]: string } = {
      'New Moon': 'moon-new',
      'Waxing Crescent': 'moon-waxing-crescent',
      'First Quarter': 'moon-first-quarter',
      'Waxing Gibbous': 'moon-waxing-gibbous',
      'Full Moon': 'moon-full',
      'Waning Gibbous': 'moon-waning-gibbous',
      'Last Quarter': 'moon-last-quarter',
      'Waning Crescent': 'moon-waning-crescent',
    };
    return phaseMap[phase] || 'moon-full';
  };

  const getMoonPhaseVietnamese = (phase: string) => {
    const phaseMap: { [key: string]: string } = {
      'New Moon': 'Trăng mới',
      'Waxing Crescent': 'Trăng lưỡi liềm tăng',
      'First Quarter': 'Trăng thượng huyền',
      'Waxing Gibbous': 'Trăng lồi tăng',
      'Full Moon': 'Trăng tròn',
      'Waning Gibbous': 'Trăng lồi giảm',
      'Last Quarter': 'Trăng hạ huyền',
      'Waning Crescent': 'Trăng lưỡi liềm giảm',
    };
    return phaseMap[phase] || phase;
  };

  const calculateGoldenBlueHours = (sunrise: string, sunset: string) => {
    try {
      const today = new Date().toDateString();
      const sunriseTime = new Date(`${today} ${sunrise}`);
      const sunsetTime = new Date(`${today} ${sunset}`);
      
      // Golden hour: 1 hour before sunset and 1 hour after sunrise
      const goldenHourStart = new Date(sunsetTime.getTime() - 60 * 60 * 1000);
      const goldenHourMorning = new Date(sunriseTime.getTime() + 60 * 60 * 1000);
      
      // Blue hour: 30 minutes before sunrise and 30 minutes after sunset
      const blueHourMorning = new Date(sunriseTime.getTime() - 30 * 60 * 1000);
      const blueHourEvening = new Date(sunsetTime.getTime() + 30 * 60 * 1000);
      
      return {
        goldenHourEvening: `${goldenHourStart.getHours().toString().padStart(2, '0')}:${goldenHourStart.getMinutes().toString().padStart(2, '0')} - ${sunset}`,
        goldenHourMorning: `${sunrise} - ${goldenHourMorning.getHours().toString().padStart(2, '0')}:${goldenHourMorning.getMinutes().toString().padStart(2, '0')}`,
        blueHourMorning: `${blueHourMorning.getHours().toString().padStart(2, '0')}:${blueHourMorning.getMinutes().toString().padStart(2, '0')} - ${sunrise}`,
        blueHourEvening: `${sunset} - ${blueHourEvening.getHours().toString().padStart(2, '0')}:${blueHourEvening.getMinutes().toString().padStart(2, '0')}`,
      };
    } catch {
      return {
        goldenHourEvening: 'N/A',
        goldenHourMorning: 'N/A',
        blueHourMorning: 'N/A',
        blueHourEvening: 'N/A',
      };
    }
  };

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Đang tải dữ liệu thiên văn học...</span>
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

  if (!astronomyData) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <AnimatedIcon iconName="sunrise" className="h-8 w-8 mx-auto mb-2" alt="No data" />
            <p>Không có dữ liệu thiên văn học</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { astronomy, location } = astronomyData;
  const specialHours = calculateGoldenBlueHours(astronomy.sunrise, astronomy.sunset);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AnimatedIcon iconName="sunrise" className="h-5 w-5" alt="Astronomy" />
          Thiên văn học - {location.name_vi || location.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sun Information */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-medium text-sm text-yellow-800 mb-3 flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Thông tin mặt trời
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <AnimatedIcon iconName="sunrise" className="h-4 w-4" alt="Sunrise" />
              <div>
                <div className="text-gray-600">Mặt trời mọc</div>
                <div className="font-medium">{astronomy.sunrise}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AnimatedIcon iconName="sunset" className="h-4 w-4" alt="Sunset" />
              <div>
                <div className="text-gray-600">Mặt trời lặn</div>
                <div className="font-medium">{astronomy.sunset}</div>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-yellow-200">
            <Badge variant={astronomy.is_sun_up ? 'default' : 'secondary'} className="text-xs">
              {astronomy.is_sun_up ? '☀️ Mặt trời đang lên' : '🌙 Mặt trời đã lặn'}
            </Badge>
          </div>
        </div>

        {/* Moon Information */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-sm text-blue-800 mb-3 flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Thông tin mặt trăng
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div className="flex items-center gap-2">
              <AnimatedIcon iconName="moonrise" className="h-4 w-4" alt="Moonrise" />
              <div>
                <div className="text-gray-600">Trăng mọc</div>
                <div className="font-medium">{astronomy.moonrise}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AnimatedIcon iconName="moonset" className="h-4 w-4" alt="Moonset" />
              <div>
                <div className="text-gray-600">Trăng lặn</div>
                <div className="font-medium">{astronomy.moonset}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AnimatedIcon iconName={getMoonPhaseIcon(astronomy.moon_phase)} className="h-6 w-6" alt="Moon phase" />
              <div>
                <div className="text-gray-600 text-xs">Pha trăng</div>
                <div className="font-medium text-sm">{getMoonPhaseVietnamese(astronomy.moon_phase)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-600 text-xs">Độ sáng</div>
              <div className="font-medium text-sm">{astronomy.moon_illumination}%</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <Badge variant={astronomy.is_moon_up ? 'default' : 'secondary'} className="text-xs">
              {astronomy.is_moon_up ? '🌙 Trăng đang lên' : '🌑 Trăng đã lặn'}
            </Badge>
          </div>
        </div>

        {/* Golden & Blue Hours */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <h4 className="font-medium text-sm text-purple-800 mb-3 flex items-center gap-2">
            <AnimatedIcon iconName="eclipse" className="h-4 w-4" alt="Special hours" />
            Giờ đặc biệt cho nhiếp ảnh
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AnimatedIcon iconName="sunrise" className="h-4 w-4" alt="Golden hour" />
                <div>
                  <div className="text-gray-600 text-xs">Giờ vàng buổi sáng</div>
                  <div className="font-medium">{specialHours.goldenHourMorning}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AnimatedIcon iconName="sunset" className="h-4 w-4" alt="Golden hour" />
                <div>
                  <div className="text-gray-600 text-xs">Giờ vàng buổi tối</div>
                  <div className="font-medium">{specialHours.goldenHourEvening}</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AnimatedIcon iconName="star" className="h-4 w-4" alt="Blue hour" />
                <div>
                  <div className="text-gray-600 text-xs">Giờ xanh buổi sáng</div>
                  <div className="font-medium">{specialHours.blueHourMorning}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AnimatedIcon iconName="starry-night" className="h-4 w-4" alt="Blue hour" />
                <div>
                  <div className="text-gray-600 text-xs">Giờ xanh buổi tối</div>
                  <div className="font-medium">{specialHours.blueHourEvening}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Astronomy Tips */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-sm text-gray-800 mb-2 flex items-center gap-2">
            <AnimatedIcon iconName="meteor-rain" className="h-4 w-4" alt="Astronomy tips" />
            Lưu ý quan sát thiên văn
          </h4>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• Giờ vàng và giờ xanh là thời điểm tốt nhất cho nhiếp ảnh</li>
            <li>• Trăng tròn có thể làm mờ các ngôi sao yếu</li>
            <li>• Quan sát tốt nhất khi trời quang đãng, không có mây</li>
            <li>• Tránh ánh sáng đô thị để có tầm nhìn tốt nhất</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}