import { Search, Menu, Settings, User, Sun, Moon, MapPin, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect, useRef } from "react";
import { useWeather } from "../contexts/WeatherContext";
import { useCitySearch } from "../hooks/useCitySearch";
import type { City } from "../hooks/useCitySearch";

export function WeatherNavbar() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { updateSettings } = useWeather();
  const { query, setQuery, cities, loading: searchLoading } = useCitySearch();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
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
            <div className="relative" ref={dropdownRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Tìm kiếm địa điểm..." 
                className="pl-10 pr-10"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => query.length >= 2 && setShowDropdown(true)}
              />
              {searchLoading ? (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              )}
              
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
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
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
          <div className="relative" ref={dropdownRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Tìm kiếm địa điểm..." 
              className="pl-10 pr-10"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => query.length >= 2 && setShowDropdown(true)}
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
            
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