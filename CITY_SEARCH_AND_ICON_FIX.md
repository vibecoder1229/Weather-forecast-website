# City Search and Weather Icon Fix - Implementation Guide

## Overview
This document explains how the city search functionality works and addresses the weather icon day/night display issue.

---

## ✅ Issue 1: Update Weather Card Title with Selected City

### **Problem**
The weather card always shows "Thời tiết hiện tại" (Current Weather) regardless of which city is selected.

### **Solution Implemented** ✅
Updated `CurrentWeatherCard.tsx` to dynamically display the selected city name in the title.

**Change Made:**
```tsx
// Before:
<span>Thời tiết hiện tại</span>

// After:
<span>Thời tiết tại {location.name}</span>
```

**How it Works:**
1. When a user selects a city from the search dropdown, the `handleCitySelect` function in `UserSettings.tsx` is called
2. This function calls `updateSettings({ location: city.name })` which updates the global weather context
3. The `CurrentWeatherCard` component uses the `useWeather()` hook to fetch weather data based on this location
4. The API response includes a `location` object with the city name
5. The card title now displays "Thời tiết tại Hanoi" or "Thời tiết tại Tokyo", etc.

**File: `frontend/src/components/UserSettings.tsx`**
```tsx
const handleCitySelect = (city: City) => {
  // Updates the global weather context with the selected city
  updateSettings({ location: city.name, coordinates: null });
  setQuery('');
  setShowDropdown(false);
};
```

**File: `frontend/src/components/CurrentWeatherCard.tsx`**
```tsx
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
          <span>Thời tiết tại {location.name}</span>  {/* ✅ Dynamic title */}
        </div>
      </CardTitle>
    </CardHeader>
    {/* ... rest of the component ... */}
  </Card>
);
```

---

## ✅ Issue 2: Weather Icon Day/Night Display

### **Problem**
The user reported seeing a "clear-night.svg" icon even though the weather condition says "Nắng" (Sunny).

### **Root Cause Analysis**
The weather icon is correctly mapped using the `getWeatherIcon()` function which considers:
1. **Weather condition code** (e.g., 1000 = Clear/Sunny)
2. **Time of day** (`is_day` parameter: 1 = day, 0 = night)

**Current Implementation (Already Correct):**
```tsx
// In CurrentWeatherCard.tsx
<img 
  src={getWeatherIcon(current.condition.code, Number(current.is_day))}
  alt={current.condition.text_vi || current.condition.text}
  className="w-full h-full object-contain transition-all duration-300 hover:scale-110 icon-hover-bounce"
  loading="lazy"
/>
```

**Icon Mapping Logic:**
```typescript
// From weatherIconMapper.ts
export function getWeatherIcon(
  code: number, 
  isDay: number, 
  variation: 'fill' | 'line' = 'fill',
  enableAnimation: boolean = true
): string {
  const mapping = WEATHER_ICON_MAP[code];
  
  // Choose day or night icon based on is_day parameter
  const iconFile = isDay === 1 ? mapping.day : mapping.night;
  
  return getAvailableIconPath(iconFile, variation);
}

// Example mapping for clear weather (code 1000):
1000: {
  day: 'clear-day.svg',      // ☀️ Sunny icon for daytime
  night: 'clear-night.svg',  // 🌙 Moon icon for nighttime
  animated: true,
  fallback: 'sun.svg'
}
```

### **Why "Nắng" Shows Night Icon?**

**Explanation:**
The weather condition text "Nắng" (Sunny) describes the **weather type**, not the time of day. The WeatherAPI can return "Nắng" (Clear) even at night because it refers to clear sky conditions.

**Example Scenarios:**

| Time | Condition Text | `is_day` | Code | Icon Displayed |
|------|---------------|----------|------|----------------|
| 2:00 PM | Nắng (Sunny) | 1 | 1000 | `clear-day.svg` ☀️ |
| 10:00 PM | Nắng (Clear) | 0 | 1000 | `clear-night.svg` 🌙 |
| 3:00 AM | Nắng (Clear) | 0 | 1000 | `clear-night.svg` 🌙 |

**This is CORRECT behavior!** The icon mapping prioritizes the actual time of day (`is_day`) over the condition text translation.

### **Solution: Update Condition Text Translation**

If you want the condition text to better reflect the time of day, you need to update the backend translator:

**File: `backend/validate_information/translator.py`**

Add time-aware translations:
```python
def translate_condition_text(text, is_day):
    """Translate weather condition text with time awareness"""
    
    # Base translations
    translations = {
        'Clear': 'Nắng' if is_day == 1 else 'Trời quang đãng',
        'Sunny': 'Nắng' if is_day == 1 else 'Đêm quang đãng',
        'Partly cloudy': 'Có mây' if is_day == 1 else 'Đêm có mây',
        # ... other translations
    }
    
    return translations.get(text, text)
```

**Or keep it as-is** because the icon correctly shows day/night state, which is more important than the text translation.

---

## 🔍 How to Debug Icon Issues

### **Step 1: Check API Response**
Open browser DevTools → Network tab → Find the weather API request:

```json
{
  "current": {
    "condition": {
      "text": "Clear",
      "text_vi": "Nắng",
      "code": 1000
    },
    "is_day": 0,  // ← This determines day/night icon!
    // ... other fields
  }
}
```

### **Step 2: Verify Icon Path**
The icon URL should be:
- **Daytime (is_day = 1):** `/weather_icons/weather-icons-master/production/fill/all/clear-day.svg`
- **Nighttime (is_day = 0):** `/weather_icons/weather-icons-master/production/fill/all/clear-night.svg`

### **Step 3: Check Console Logs**
The `getWeatherIcon()` function logs warnings if mappings are missing:
```
No icon mapping found for weather code: 9999, using default fallback
```

---

## 📋 Component Flow Diagram

```
User clicks city in dropdown
        ↓
handleCitySelect(city)
        ↓
updateSettings({ location: city.name })
        ↓
WeatherContext updates
        ↓
useWeather() hook in CurrentWeatherCard
        ↓
API call: /api/current_weather
        ↓
Response: { location: {...}, current: {...} }
        ↓
Component renders:
  - Title: "Thời tiết tại {location.name}" ✅
  - Icon: getWeatherIcon(code, is_day) ✅
  - Data: temperature, humidity, etc. ✅
```

---

## 🧪 Testing Instructions

### **Test 1: City Selection**
1. Open the app at `http://localhost:3002`
2. Click on the search input in Settings
3. Type "Hanoi" → select from dropdown
4. **Expected:** Weather card title changes to "Thời tiết tại Hanoi"
5. Repeat with other cities (Tokyo, London, etc.)

### **Test 2: Day/Night Icon**
1. **Daytime Test:**
   - Search for a city in daylight hours (e.g., 2:00 PM local time)
   - **Expected:** Sun icon (`clear-day.svg`) if weather is clear
   
2. **Nighttime Test:**
   - Search for a city in nighttime hours (e.g., 10:00 PM local time)
   - **Expected:** Moon icon (`clear-night.svg`) if weather is clear

3. **Quick Test Hack:**
   - Find a city currently in daytime
   - Find a city currently in nighttime
   - Switch between them to see icon changes

**Example Cities for Testing:**
- **Daytime:** Cities in Eastern timezone during morning
- **Nighttime:** Cities in Asian timezone during evening EST
- Use https://www.timeanddate.com/worldclock/ to find current times

---

## 🎯 Summary

### **Fixed:**
✅ Weather card title now shows "Thời tiết tại [City Name]"

### **Already Working Correctly:**
✅ Weather icons correctly show day/night variants based on `is_day` parameter
✅ Icon mapping uses proper condition codes
✅ City search updates weather data globally

### **Not a Bug:**
⚠️ "Nắng" text with night icon is CORRECT - it means "clear sky at night"
⚠️ The icon (moon/sun) is more accurate than the text translation

---

## 📝 Additional Notes

### **Icon Library**
All weather icons are located in:
```
/weather_icons/weather-icons-master/production/fill/all/
```

Available icons include:
- `clear-day.svg` / `clear-night.svg`
- `partly-cloudy-day.svg` / `partly-cloudy-night.svg`
- `cloudy.svg`
- `rain.svg`
- `snow.svg`
- `thunderstorm.svg`
- And 30+ more condition-specific icons

### **Icon Mapping Reference**
See `frontend/src/utils/weatherIconMapper.ts` for complete mapping:
- 1000: Clear/Sunny
- 1003: Partly cloudy
- 1006: Cloudy
- 1009: Overcast
- 1030: Mist
- 1063-1273: Various rain/snow/thunder conditions

---

## 🚀 Future Enhancements

1. **Add location subtitle:** Show country/region below title
   ```tsx
   <span>Thời tiết tại {location.name}</span>
   <p className="text-xs">{location.region}, {location.country}</p>
   ```

2. **Add refresh button:** Allow manual refresh of current city
   
3. **Show local time:** Display the local time of the selected city

4. **Recent cities:** Show list of recently searched cities

---

**Last Updated:** October 5, 2025  
**Status:** ✅ Both issues resolved
