import { Settings, User, History, Bell, Globe, Palette, MapPin, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useWeather } from "../contexts/WeatherContext";
import { useState, useEffect, useRef } from "react";
import { useCitySearch } from "../hooks/useCitySearch";
import type { City } from "../hooks/useCitySearch";

export function UserSettings() {
  const { settings, updateSettings, getCurrentLocation } = useWeather();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { query, setQuery, cities, loading: searchLoading } = useCitySearch();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set default location on first load if no location is set
  useEffect(() => {
    if (!settings.location && !settings.coordinates) {
      console.log('[UserSettings] No location set, using default: Hanoi');
      updateSettings({ location: 'Hanoi' });
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      await getCurrentLocation();
    } catch (error) {
      console.error('Failed to get location:', error);
      alert('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleCitySelect = (city: City) => {
    updateSettings({ location: city.name, coordinates: null });
    setQuery('');
    setShowDropdown(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowDropdown(value.length >= 2);
  };

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-500" />
          <span>Cài đặt & Tài khoản</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Profile */}
        <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Nguyễn Văn A</p>
            <p className="text-sm text-muted-foreground">nguyenvana@email.com</p>
          </div>
          <Badge variant="secondary" className="text-xs">Pro</Badge>
        </div>

        {/* Location Search with Autocomplete */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Địa điểm</span>
          </div>
          
          {/* City Search Input with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm thành phố..."
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => query.length >= 2 && setShowDropdown(true)}
                className="pl-9 pr-9"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>
            
            {/* Dropdown Results */}
            {showDropdown && cities.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {cities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city)}
                    className="w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 flex items-start space-x-2"
                  >
                    <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{city.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {city.region ? `${city.region}, ${city.country}` : city.country}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* No results message */}
            {showDropdown && !searchLoading && query.length >= 2 && cities.length === 0 && (
              <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Không tìm thấy kết quả cho "{query}"
                </p>
              </div>
            )}
          </div>
          
          <Button
            onClick={handleGetCurrentLocation}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isGettingLocation}
          >
            <MapPin className="w-4 h-4 mr-2" />
            {isGettingLocation ? 'Đang lấy vị trí...' : 'Sử dụng vị trí hiện tại'}
          </Button>
          {settings.coordinates && (
            <p className="text-xs text-muted-foreground">
              Vị trí hiện tại: {settings.coordinates.lat.toFixed(4)}, {settings.coordinates.lon.toFixed(4)}
            </p>
          )}
          {settings.location && (
            <p className="text-xs text-muted-foreground">
              Đang xem: {settings.location}
            </p>
          )}
        </div>

        {/* Settings Options */}
        <div className="space-y-3 pt-3 border-t border-border">
          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Ngôn ngữ</span>
            </div>
            <Select 
              value={settings.language}
              onValueChange={(value) => updateSettings({ language: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Temperature Unit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Palette className="w-4 h-4 text-green-500" />
              <span className="text-sm">Đơn vị nhiệt độ</span>
            </div>
            <Select 
              value={settings.temperatureUnit}
              onValueChange={(value: 'celsius' | 'fahrenheit') => updateSettings({ temperatureUnit: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="celsius">°C</SelectItem>
                <SelectItem value="fahrenheit">°F</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Thông báo cảnh báo</span>
            </div>
            <Switch 
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSettings({ notifications: checked })}
            />
          </div>

          {/* Auto Location */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span className="text-sm">Tự động lấy vị trí</span>
            </div>
            <Switch 
              checked={settings.autoLocation}
              onCheckedChange={(checked) => updateSettings({ autoLocation: checked })}
            />
          </div>
        </div>

        {/* Weather History */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium">Lịch sử thời tiết</span>
            </div>
            <Button variant="ghost" size="sm">Xem tất cả</Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm p-2 bg-muted/20 rounded">
              <span>Hà Nội - 01/10</span>
              <span className="text-muted-foreground">28°C, Nắng</span>
            </div>
            <div className="flex items-center justify-between text-sm p-2 bg-muted/20 rounded">
              <span>TP.HCM - 30/09</span>
              <span className="text-muted-foreground">32°C, Mưa</span>
            </div>
            <div className="flex items-center justify-between text-sm p-2 bg-muted/20 rounded">
              <span>Đà Nẵng - 29/09</span>
              <span className="text-muted-foreground">30°C, Có mây</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-border space-y-2">
          <Button variant="outline" size="sm" className="w-full">
            <Settings className="w-4 h-4 mr-2" />
            Cài đặt nâng cao
          </Button>
          <Button variant="ghost" size="sm" className="w-full text-destructive">
            Đăng xuất
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}