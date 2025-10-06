import { WeatherProvider } from "./contexts/WeatherContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { WeatherNavbar } from "./components/WeatherNavbar";
import { CurrentWeatherCard } from "./components/CurrentWeatherCard";
import { WeatherForecast } from "./components/WeatherForecast";
import { WeatherAlerts } from "./components/WeatherAlerts";
import { WeatherMap } from "./components/WeatherMap";
import { AISummary } from "./components/AISummary";
import { TripWeather } from "./components/TripWeather";
import { UserSettings } from "./components/UserSettings";
import { WeatherFooter } from "./components/WeatherFooter";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

export default function App() {
  return (
    <ErrorBoundary>
      <WeatherProvider>
        <div className="min-h-screen bg-background">
      {/* Navigation */}
      <WeatherNavbar />

      {/* Hero Section with Animated Background */}
      <div className="relative h-48 lg:h-64 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1722586663817-1e595f5123ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8c3VubnklMjBjbGVhciUyMGJsdWUlMjBza3l8ZW58MXx8fHwxNzU5MzI1NjQ1fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Weather background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient-animated opacity-80"></div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-white stagger-item">
            <h1 className="text-3xl lg:text-5xl font-bold mb-4 stagger-item stagger-delay-1">
              Dự báo thời tiết thông minh
            </h1>
            <p className="text-lg lg:text-xl text-blue-100 stagger-item stagger-delay-2">
              “Không chỉ là dự báo, mà là sự chuẩn bị.”
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Current Weather - Full width on mobile, 2 cols on desktop */}
          <div className="col-span-full lg:col-span-2 weather-card-float">
            <CurrentWeatherCard />
          </div>
          
          {/* Weather Alerts - 2 cols on desktop */}
          <div className="col-span-full lg:col-span-2 weather-card-float stagger-delay-1">
            <WeatherAlerts />
          </div>
          
          {/* 7-day Forecast - 3 cols on desktop */}
          <div className="col-span-full lg:col-span-3 weather-card-float stagger-delay-2">
            <WeatherForecast />
          </div>
          
          {/* Weather Map - 3 cols on desktop */}
          <div className="col-span-full lg:col-span-3 weather-card-float stagger-delay-3">
            <WeatherMap />
          </div>
          
          {/* AI Summary - 2 cols on desktop */}
          <div className="col-span-full lg:col-span-2 weather-card-float stagger-delay-4">
            <AISummary />
          </div>
          
          {/* Trip Weather - 2 cols on desktop */}
          <div className="col-span-full lg:col-span-2 weather-card-float stagger-delay-5">
            <TripWeather />
          </div>
          
          {/* User Settings - 2 cols on desktop */}
          <div className="col-span-full lg:col-span-2 weather-card-float stagger-delay-1">
            <UserSettings />
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Tính năng nổi bật</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Những tính năng nổi bật - độc đáo nhất của chúng tôi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-card rounded-lg border border-border">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🎯</span>
              </div>
              <h3 className="font-medium mb-2">Dự báo chính xác</h3>
              <p className="text-sm text-muted-foreground">
                Độ chính xác lên đến 70% với công nghệ AI tiên tiến và dữ liệu đến từ API thời gian thực
              </p>
            </div>
            
            <div className="text-center p-6 bg-card rounded-lg border border-border">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🚨</span>
              </div>
              <h3 className="font-medium mb-2">Cảnh báo kịp thời</h3>
              <p className="text-sm text-muted-foreground">
                Nhận thông báo sớm về thời tiết xấu, thiên tai để chuẩn bị và bảo vệ an toàn
              </p>
            </div>
            
            <div className="text-center p-6 bg-card rounded-lg border border-border">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🗺️</span>
              </div>
              <h3 className="font-medium mb-2">Bản đồ tương tác</h3>
              <p className="text-sm text-muted-foreground">
                Theo dõi thời tiết trên bản đồ với nhiều lớp thông tin chi tiết và trực quan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <WeatherFooter />
    </div>
    </WeatherProvider>
    </ErrorBoundary>
  );
}