import { Loader2, Clock, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useCurrentWeather } from "../hooks/useWeatherData";
import { useWeather } from "../contexts/WeatherContext";
import { useState, useEffect } from "react";
import { getWeatherIcon } from "../utils/weatherIconMapper";

const AUTO_REFRESH_INTERVAL = 60000; // 1 minute in milliseconds

export function CurrentWeatherCard() {
  // Enable auto-refresh every 1 minute
  const { data, loading, error } = useCurrentWeather(AUTO_REFRESH_INTERVAL);
  const { settings } = useWeather();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update page title when location changes
  useEffect(() => {
    if (data?.location?.name) {
      const temp = data.current ? `${Math.round(data.current.temp_c)}°C` : '';
      const condition = data.current?.condition?.text_vi || data.current?.condition?.text || '';
      document.title = `${temp} ${condition} - ${data.location.name} | WeatherVN`;
    } else {
      document.title = 'Dự báo thời tiết thông minh | WeatherVN';
    }
  }, [data?.location?.name, data?.current?.temp_c, data?.current?.condition]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const convertTemp = (tempC: number) => {
    if (settings.temperatureUnit === 'fahrenheit') {
      return `${Math.round((tempC * 9/5) + 32)}°F`;
    }
    return `${Math.round(tempC)}°C`;
  };

  if (loading) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <img 
              src="/weather_icons/weather-icons-master/production/fill/all/thermometer.svg"
              alt="Weather"
              className="w-5 h-5"
            />
            <span>Thời tiết hiện tại</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <img 
              src="/weather_icons/weather-icons-master/production/fill/all/thermometer.svg"
              alt="Weather"
              className="w-5 h-5"
            />
            <span>Thời tiết hiện tại</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <p>{error}</p>
            <p className="text-sm mt-2">Vui lòng chọn địa điểm trong phần Cài đặt</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <img 
              src="/weather_icons/weather-icons-master/production/fill/all/thermometer.svg"
              alt="Weather"
              className="w-5 h-5"
            />
            <span>Thời tiết hiện tại</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          <p>Chọn địa điểm để xem thời tiết</p>
        </CardContent>
      </Card>
    );
  }

  const { location, current } = data;

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/weather_icons/weather-icons-master/production/fill/all/thermometer.svg"
              alt="Weather"
              className="w-5 h-5"
            />
            <span>Thời tiết tại {location.name}</span>
          </div>
        </CardTitle>
        <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="font-mono font-semibold text-base text-foreground tabular-nums smooth-update">
            {formatTime(currentTime)}
          </span>
          <span className="ml-2">
            {formatDate(currentTime)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 location-change-transition">
          {/* Weather Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {location.name}, {location.country}
                </p>
                <p className="text-4xl font-bold smooth-update stagger-item">{convertTemp(current.temp_c)}</p>
                <p className="text-muted-foreground">{current.condition.text_vi || current.condition.text}</p>
              </div>
              <div className="w-20 h-20 relative">
                <img 
                  src={getWeatherIcon(current.condition.code, Number(current.is_day))}
                  alt={current.condition.text_vi || current.condition.text}
                  className="w-full h-full object-contain transition-all duration-300 hover:scale-110 icon-hover-bounce"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="smooth-update stagger-item stagger-delay-1">
                Cảm giác như {convertTemp(current.feelslike_c)}
              </Badge>
              <Badge variant="outline" className="stagger-item stagger-delay-2">UV Index: {current.uv}</Badge>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg stagger-item stagger-delay-1">
              <img 
                src="/weather_icons/weather-icons-master/production/fill/all/thermometer.svg"
                alt="Temperature"
                className="w-5 h-5"
              />
              <div>
                <p className="text-sm text-muted-foreground">Nhiệt độ</p>
                <p className="font-medium smooth-update">{convertTemp(current.temp_c)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg stagger-item stagger-delay-2">
              <img 
                src="/weather_icons/weather-icons-master/production/fill/all/humidity.svg"
                alt="Humidity"
                className="w-5 h-5"
              />
              <div>
                <p className="text-sm text-muted-foreground">Độ ẩm</p>
                <p className="font-medium smooth-update">{current.humidity}%</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg stagger-item stagger-delay-3">
              <img 
                src="/weather_icons/weather-icons-master/production/fill/all/wind.svg"
                alt="Wind"
                className="w-5 h-5"
              />
              <div>
                <p className="text-sm text-muted-foreground">Gió</p>
                <p className="font-medium smooth-update">{current.wind_kph} km/h</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg stagger-item stagger-delay-4">
              <img 
                src="/weather_icons/weather-icons-master/production/fill/all/horizon.svg"
                alt="Visibility"
                className="w-5 h-5"
              />
              <div>
                <p className="text-sm text-muted-foreground">Tầm nhìn</p>
                <p className="font-medium smooth-update">{current.vis_km} km</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Cập nhật: {new Date(current.last_updated).toLocaleString('vi-VN')}
            </span>
            <span className="text-muted-foreground">
              Áp suất: {current.pressure_mb} mb
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}