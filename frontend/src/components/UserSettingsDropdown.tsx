import { Settings, User, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useWeather } from "../contexts/WeatherContext";
import { CitySearchInput } from "./CitySearchInput";
import type { City } from "../hooks/useCitySearch";

interface UserSettingsDropdownProps {
  children: React.ReactNode;
}

export function UserSettingsDropdown({ children }: UserSettingsDropdownProps) {
  const { settings, updateSettings } = useWeather();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    console.log('[UserSettings] Current settings:', settings);
    if (!settings.location) {
      console.log('[UserSettings] No location set, using default: Hanoi');
      updateSettings({ location: 'Hanoi', coordinates: null });
    }
  }, [settings, updateSettings]);

  const handleCitySelect = (city: City) => {
    updateSettings({ location: city.name, coordinates: null });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end" sideOffset={8}>
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Cài đặt & Tài khoản</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Profile */}
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Nguyễn Văn A</p>
                <p className="text-xs text-muted-foreground">nguyenvana@email.com</p>
              </div>
              <Badge variant="secondary" className="text-xs">Pro</Badge>
            </div>

            {/* Location Search */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Địa điểm</span>
              </div>
              
              <CitySearchInput
                placeholder="Tìm kiếm thành phố..."
                onCitySelect={handleCitySelect}
                size="sm"
                dropdownClassName="mt-1"
              />
              
              <div className="text-xs text-muted-foreground">
                Hiện tại: <span className="font-medium">{settings.location || 'Hanoi'}</span>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Thông báo</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm">Email thông báo</p>
                  <p className="text-xs text-muted-foreground">Nhận cảnh báo thời tiết qua email</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm">Thông báo đẩy</p>
                  <p className="text-xs text-muted-foreground">Nhận thông báo trên thiết bị</p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </div>

            {/* Appearance */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Giao diện</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm">Chế độ tối</p>
                  <p className="text-xs text-muted-foreground">Chuyển sang giao diện tối</p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs">
                Xuất dữ liệu
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs">
                Đăng xuất
              </Button>
            </div>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}