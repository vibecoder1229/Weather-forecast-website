import { Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useForecast } from "../hooks/useWeatherData";
import { useWeather } from "../contexts/WeatherContext";
import { getWeatherIcon } from "../utils/weatherIconMapper";

export function WeatherForecast() {
  // WeatherAPI free plan only supports 3 days, paid plans support up to 14 days
  const { data, loading, error } = useForecast(3);
  const { settings } = useWeather();

  const convertTemp = (tempC: number | null | undefined) => {
    if (tempC == null) return '--°';
    
    if (settings.temperatureUnit === 'fahrenheit') {
      return `${Math.round((tempC * 9/5) + 32)}°F`;
    }
    return `${Math.round(tempC)}°C`;
  };

  const getDayName = (dateStr: string, index: number) => {
    if (index === 0) return 'Hôm nay';
    if (index === 1) return 'Mai';
    const date = new Date(dateStr);
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  };

  const getFormattedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card className="col-span-full lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Dự báo 3 ngày</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.forecast) {
    return (
      <Card className="col-span-full lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Dự báo 3 ngày</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          <p>{error || 'Chọn địa điểm để xem dự báo'}</p>
        </CardContent>
      </Card>
    );
  }

  const forecastDays = data.forecast.forecastday || [];

  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>Dự báo 3 ngày</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {forecastDays.map((item: any, index: number) => {
            const rainChance = `${item.day.daily_chance_of_rain}%`;
            return (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 text-sm font-medium">
                    {getDayName(item.date, index)}
                  </div>
                  <div className="text-sm text-muted-foreground w-12">
                    {getFormattedDate(item.date)}
                  </div>
                  <div className="flex items-center space-x-2 flex-1">
                    <img 
                      src={getWeatherIcon(item.day.condition.code, 1)}
                      alt={item.day.condition.text_vi || item.day.condition.text}
                      className="w-8 h-8 transition-transform duration-300 hover:scale-110"
                      loading="lazy"
                    />
                    <span className="text-sm">{item.day.condition.text_vi || item.day.condition.text}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge 
                    variant={parseInt(rainChance) === 0 ? "secondary" : parseInt(rainChance) < 30 ? "secondary" : "destructive"} 
                    className="text-xs"
                  >
                    {rainChance}
                  </Badge>
                  <div className="flex items-center space-x-2 min-w-[80px] justify-end">
                    <span className="font-medium">{convertTemp(item.day.maxtemp_c)}</span>
                    <span className="text-sm text-muted-foreground">{convertTemp(item.day.mintemp_c)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Temperature Chart Preview */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center space-x-2 mb-3">
            <img 
              src="/weather_icons/weather-icons-master/production/fill/all/barometer.svg"
              alt="Temperature trend"
              className="w-4 h-4 animate-pulse"
              style={{ filter: 'hue-rotate(120deg) brightness(1.2)' }}
            />
            <span className="text-sm font-medium">Xu hướng nhiệt độ</span>
          </div>
          <div className="h-16 bg-gradient-to-r from-blue-100 to-orange-100 dark:from-blue-900/20 dark:to-orange-900/20 rounded-lg flex items-end justify-between px-3 pb-2">
            {forecastDays.map((item: any, index: number) => {
              const maxTemp = item.day.maxtemp_c;
              const minTemp = item.day.mintemp_c;
              const humidity = item.day.avghumidity;
              const height = Math.max(16, Math.min(48, (maxTemp - 10) * 2.5));
              return (
                <div key={index} className="flex flex-col items-center space-y-1">
                  <div className="flex flex-col items-center text-xs text-muted-foreground mb-1">
                    <span className="font-medium">{convertTemp(maxTemp)}</span>
                    <span className="text-[10px] opacity-75">{convertTemp(minTemp)}</span>
                  </div>
                  <div 
                    className="w-1.5 bg-gradient-to-t from-blue-500 to-orange-500 rounded-full relative"
                    style={{ height: `${height}px` }}
                  >
                    <div 
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-sm"
                      title={`Độ ẩm: ${humidity}%`}
                    ></div>
                  </div>
                  <span className="text-[10px] text-muted-foreground/75">{humidity}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}