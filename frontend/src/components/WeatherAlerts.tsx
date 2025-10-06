import { AlertTriangle, Info, Zap, Thermometer, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { useAlerts } from "../hooks/useWeatherData";

// Helper function to get animated icon based on alert type/severity
const getAlertIcon = (alert: any) => {
  const severity = alert.severity?.toLowerCase() || '';
  const event = alert.event?.toLowerCase() || '';
  const headline = alert.headline?.toLowerCase() || '';
  
  // Map common weather events to appropriate animated icons
  if (event.includes('thunder') || event.includes('lightning') || headline.includes('sấm')) {
    return "/weather_icons/weather-icons-master/design/fill/animation-ready/thunderstorms.svg";
  }
  if (event.includes('hurricane') || event.includes('cyclone')) {
    return "/weather_icons/weather-icons-master/design/fill/animation-ready/hurricane.svg";
  }
  if (event.includes('tornado')) {
    return "/weather_icons/weather-icons-master/design/fill/animation-ready/tornado.svg";
  }
  if (event.includes('rain') || event.includes('flood')) {
    return "/weather_icons/weather-icons-master/design/fill/animation-ready/rain.svg";
  }
  if (event.includes('snow') || event.includes('blizzard')) {
    return "/weather_icons/weather-icons-master/design/fill/animation-ready/snow.svg";
  }
  if (event.includes('fog') || event.includes('mist')) {
    return "/weather_icons/weather-icons-master/design/fill/animation-ready/fog.svg";
  }
  if (event.includes('heat') || event.includes('temperature')) {
    return "/weather_icons/weather-icons-master/design/fill/animation-ready/thermometer.svg";
  }
  if (event.includes('wind')) {
    return "/weather_icons/weather-icons-master/design/fill/animation-ready/wind.svg";
  }
  if (event.includes('dust') || event.includes('smoke')) {
    return "/weather_icons/weather-icons-master/design/fill/animation-ready/smoke.svg";
  }
  
  // Default based on severity
  if (severity.includes('severe') || severity.includes('extreme')) {
    return "/weather_icons/weather-icons-master/design/fill/animation-ready/lightning-bolt.svg";
  }
  
  // Default warning icon
  return "/weather_icons/weather-icons-master/design/fill/animation-ready/not-available.svg";
};

export function WeatherAlerts() {
  const { data, loading, error } = useAlerts();

  const getAqiColor = (index: number) => {
    if (index <= 50) return 'bg-green-500';
    if (index <= 100) return 'bg-yellow-500';
    if (index <= 150) return 'bg-orange-500';
    if (index <= 200) return 'bg-red-500';
    if (index <= 300) return 'bg-purple-500';
    return 'bg-maroon-500';
  };

  if (loading) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span>Cảnh báo & Sức khỏe</span>
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
            <Zap className="w-5 h-5 text-yellow-500" />
            <span>Cảnh báo & Sức khỏe</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  const alerts = data?.alerts?.alert || [];
  const airQuality = data?.air_quality;
  const hasWarnings = data?.has_warnings;
  const healthAdvice = data?.health_advice || [];

  // Get the AQI value - handle both field name formats
  const aqiValue = airQuality?.aqi_us || airQuality?.['us-epa-index'] || 0;

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span>Cảnh báo & Sức khỏe</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Air Quality Index */}
        {airQuality && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <img 
                  src="/weather_icons/weather-icons-master/design/fill/animation-ready/wind.svg" 
                  alt="Air Quality" 
                  className="w-5 h-5"
                />
                <span className="font-medium">Chỉ số AQI</span>
              </div>
              <Badge 
                variant={aqiValue > 100 ? "destructive" : "secondary"}
                className="text-xs"
              >
                {aqiValue}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getAqiColor(aqiValue)}`}></div>
                <span className="text-sm">{airQuality.aqi_category_vi || airQuality.aqi_category || 'Không xác định'}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {airQuality.aqi_recommendation_vi || airQuality.aqi_recommendation || 'Không có khuyến nghị'}
              </p>
            </div>
          </div>
        )}

        {/* Weather Alerts */}
        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert: any, index: number) => (
              <Alert key={index} className="border-l-4 border-l-destructive py-2 px-3">
                <div className="flex items-start space-x-2">
                  <img 
                    src={getAlertIcon(alert)} 
                    alt="Alert" 
                    className="w-4 h-4 mt-0.5 flex-shrink-0 text-destructive" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {alert.headline || alert.event_vi || alert.event}
                      </h4>
                      <Badge variant="destructive" className="text-xs ml-2 flex-shrink-0">
                        {alert.severity_vi || alert.severity || 'Cảnh báo'}
                      </Badge>
                    </div>
                    <AlertDescription className="text-xs">
                      {alert.desc || alert.description || 'Không có mô tả'}
                    </AlertDescription>
                    {alert.instruction && (
                      <p className="text-xs text-muted-foreground mt-1">
                        💡 {alert.instruction}
                      </p>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        ) : !hasWarnings && (
          <Alert className="border-l-4 border-l-green-500 py-2 px-3">
            <div className="flex items-start space-x-2">
              <img 
                src="/weather_icons/weather-icons-master/design/fill/animation-ready/clear-day.svg" 
                alt="No alerts" 
                className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" 
              />
              <div className="flex-1">
                <h4 className="font-medium text-sm">Không có cảnh báo</h4>
                <AlertDescription className="text-xs">
                  Thời tiết hiện tại ổn định, không có cảnh báo đặc biệt.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Health Tips */}
        {healthAdvice.length > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center space-x-2 mb-3">
              <img 
                src="/weather_icons/weather-icons-master/design/fill/animation-ready/thermometer.svg" 
                alt="Health Advice" 
                className="w-4 h-4 text-red-500" 
              />
              <span className="text-sm font-medium">Lời khuyên sức khỏe</span>
            </div>
            <ul className="space-y-2">
              {healthAdvice.map((advice: any, index: number) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <span className="text-blue-500">•</span>
                  <span className="text-muted-foreground">
                    {advice.tip_vi || advice.tip || advice}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}