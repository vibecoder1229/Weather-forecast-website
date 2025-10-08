import { Menu, Settings, User, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useWeather } from "../contexts/WeatherContext";
import { CitySearchInput } from "./CitySearchInput";
import { UserSettingsDropdown } from "./UserSettingsDropdown";
import type { City } from "../hooks/useCitySearch";

export function WeatherNavbar() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { updateSettings } = useWeather();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleCitySelect = (city: City) => {
    updateSettings({ location: city.name, coordinates: null });
  };

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50 nav-slide-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-medium hidden sm:block">WeatherVN</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <CitySearchInput
              placeholder="Tìm kiếm địa điểm..."
              onCitySelect={handleCitySelect}
              className="w-full"
            />
          </div>

          {/* Navigation Items */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button variant="ghost" size="sm">Trang chủ</Button>
            <Button variant="ghost" size="sm">Bản đồ</Button>
            <Button variant="ghost" size="sm">Dự báo</Button>
            <Button variant="ghost" size="sm">Hành trình</Button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <UserSettingsDropdown>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </UserSettingsDropdown>
            <Button variant="ghost" size="icon">
              <User className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <CitySearchInput
            placeholder="Tìm kiếm địa điểm..."
            onCitySelect={handleCitySelect}
            className="w-full"
          />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border pt-4 pb-4">
            <div className="flex flex-col space-y-2">
              <Button variant="ghost" size="sm" className="justify-start">Trang chủ</Button>
              <Button variant="ghost" size="sm" className="justify-start">Bản đồ</Button>
              <Button variant="ghost" size="sm" className="justify-start">Dự báo</Button>
              <Button variant="ghost" size="sm" className="justify-start">Hành trình</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}