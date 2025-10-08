import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { useState, useEffect, useRef } from "react";
import { useCitySearch } from "../hooks/useCitySearch";
import type { City } from "../hooks/useCitySearch";

interface CitySearchInputProps {
  placeholder?: string;
  onCitySelect: (city: City) => void;
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  showIcon?: boolean;
  size?: 'default' | 'sm';
}

export function CitySearchInput({
  placeholder = "Tìm kiếm địa điểm...",
  onCitySelect,
  className = "",
  inputClassName = "",
  dropdownClassName = "",
  showIcon = true,
  size = 'default'
}: CitySearchInputProps) {
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

  const handleCitySelect = (city: City) => {
    onCitySelect(city);
    setQuery('');
    setShowDropdown(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowDropdown(value.length >= 2);
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4';
  const paddingLeft = showIcon ? (size === 'sm' ? 'pl-9' : 'pl-10') : '';
  const paddingRight = size === 'sm' ? 'pr-9' : 'pr-10';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        {showIcon && (
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground ${iconSize}`} />
        )}
        <Input 
          placeholder={placeholder}
          className={`${paddingLeft} ${paddingRight} ${inputClassName}`}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
        />
        {searchLoading ? (
          <Loader2 className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${iconSize} animate-spin text-muted-foreground`} />
        ) : (
          showIcon && <MapPin className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground ${iconSize}`} />
        )}
      </div>
      
      {/* Dropdown Results */}
      {showDropdown && cities.length > 0 && (
        <div className={`absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto ${dropdownClassName}`}>
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
        <div className={`absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-4 ${dropdownClassName}`}>
          <p className="text-sm text-muted-foreground text-center">
            Không tìm thấy kết quả cho "{query}"
          </p>
        </div>
      )}
    </div>
  );
}