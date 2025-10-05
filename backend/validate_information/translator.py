"""
Vietnamese Translation Module
Translates weather data from English to Vietnamese
"""

from typing import Dict, Any, Optional


class WeatherTranslator:
    """Translates weather API responses to Vietnamese"""
    
    # Weather condition translations
    WEATHER_CONDITIONS = {
        # Clear/Sunny
        'Sunny': 'Nắng',
        'Clear': 'Quang đãng',
        
        # Cloudy
        'Partly cloudy': 'Có mây',
        'Cloudy': 'Nhiều mây',
        'Overcast': 'U ám',
        
        # Rain
        'Mist': 'Sương mù',
        'Patchy rain possible': 'Có thể có mưa rải rác',
        'Patchy snow possible': 'Có thể có tuyết rải rác',
        'Patchy sleet possible': 'Có thể có mưa tuyết rải rác',
        'Patchy freezing drizzle possible': 'Có thể có mưa phùn đóng băng',
        'Thundery outbreaks possible': 'Có thể có giông bão',
        'Blowing snow': 'Tuyết thổi',
        'Blizzard': 'Bão tuyết',
        'Fog': 'Sương mù',
        'Freezing fog': 'Sương mù đóng băng',
        'Patchy light drizzle': 'Mưa phùn nhẹ rải rác',
        'Light drizzle': 'Mưa phùn nhẹ',
        'Freezing drizzle': 'Mưa phùn đóng băng',
        'Heavy freezing drizzle': 'Mưa phùn đóng băng nặng',
        'Patchy light rain': 'Mưa nhẹ rải rác',
        'Light rain': 'Mưa nhẹ',
        'Moderate rain at times': 'Mưa vừa theo từng đợt',
        'Moderate rain': 'Mưa vừa',
        'Heavy rain at times': 'Mưa to theo từng đợt',
        'Heavy rain': 'Mưa to',
        'Light freezing rain': 'Mưa đóng băng nhẹ',
        'Moderate or heavy freezing rain': 'Mưa đóng băng vừa hoặc nặng',
        'Light sleet': 'Mưa tuyết nhẹ',
        'Moderate or heavy sleet': 'Mưa tuyết vừa hoặc nặng',
        'Patchy light snow': 'Tuyết nhẹ rải rác',
        'Light snow': 'Tuyết nhẹ',
        'Patchy moderate snow': 'Tuyết vừa rải rác',
        'Moderate snow': 'Tuyết vừa',
        'Patchy heavy snow': 'Tuyết nặng rải rác',
        'Heavy snow': 'Tuyết nặng',
        'Ice pellets': 'Mưa đá nhỏ',
        'Light rain shower': 'Mưa rào nhẹ',
        'Moderate or heavy rain shower': 'Mưa rào vừa hoặc to',
        'Torrential rain shower': 'Mưa rào xối xả',
        'Light sleet showers': 'Mưa tuyết rào nhẹ',
        'Moderate or heavy sleet showers': 'Mưa tuyết rào vừa hoặc nặng',
        'Light snow showers': 'Tuyết rào nhẹ',
        'Moderate or heavy snow showers': 'Tuyết rào vừa hoặc nặng',
        'Light showers of ice pellets': 'Mưa đá nhỏ rào nhẹ',
        'Moderate or heavy showers of ice pellets': 'Mưa đá nhỏ rào vừa hoặc nặng',
        'Patchy light rain with thunder': 'Mưa nhẹ có sấm sét rải rác',
        'Moderate or heavy rain with thunder': 'Mưa vừa hoặc to có sấm sét',
        'Patchy light snow with thunder': 'Tuyết nhẹ có sấm sét rải rác',
        'Moderate or heavy snow with thunder': 'Tuyết vừa hoặc nặng có sấm sét',
    }
    
    # Wind direction translations
    WIND_DIRECTIONS = {
        'N': 'Bắc',
        'NNE': 'Bắc-Đông Bắc',
        'NE': 'Đông Bắc',
        'ENE': 'Đông-Đông Bắc',
        'E': 'Đông',
        'ESE': 'Đông-Đông Nam',
        'SE': 'Đông Nam',
        'SSE': 'Nam-Đông Nam',
        'S': 'Nam',
        'SSW': 'Nam-Tây Nam',
        'SW': 'Tây Nam',
        'WSW': 'Tây-Tây Nam',
        'W': 'Tây',
        'WNW': 'Tây-Tây Bắc',
        'NW': 'Tây Bắc',
        'NNW': 'Bắc-Tây Bắc',
    }
    
    # AQI category translations
    AQI_CATEGORIES = {
        'Good': 'Tốt',
        'Moderate': 'Trung bình',
        'Unhealthy for Sensitive Groups': 'Không tốt cho nhóm nhạy cảm',
        'Unhealthy': 'Không tốt cho sức khỏe',
        'Very Unhealthy': 'Rất không tốt cho sức khỏe',
        'Hazardous': 'Nguy hại',
    }
    
    # AQI health recommendations
    AQI_RECOMMENDATIONS = {
        'Good': 'Chất lượng không khí tốt, an toàn cho mọi hoạt động ngoài trời.',
        'Moderate': 'Chất lượng không khí chấp nhận được. Một số người nhạy cảm nên hạn chế hoạt động ngoài trời kéo dài.',
        'Unhealthy for Sensitive Groups': 'Người có vấn đề về hô hấp, trẻ em và người cao tuổi nên hạn chế hoạt động ngoài trời.',
        'Unhealthy': 'Mọi người có thể gặp vấn đề về sức khỏe. Hạn chế hoạt động ngoài trời.',
        'Very Unhealthy': 'Cảnh báo sức khỏe nghiêm trọng. Tránh hoạt động ngoài trời.',
        'Hazardous': 'Cảnh báo khẩn cấp. Ở trong nhà và đóng cửa sổ.',
    }
    
    # Alert type translations
    ALERT_TYPES = {
        'Flood': 'Lũ lụt',
        'Storm': 'Bão',
        'Thunderstorm': 'Giông bão',
        'Heavy Rain': 'Mưa lớn',
        'Wind': 'Gió mạnh',
        'Snow': 'Tuyết rơi',
        'Ice': 'Băng giá',
        'Fog': 'Sương mù',
        'Heat': 'Nắng nóng',
        'Cold': 'Rét đậm',
        'Tornado': 'Lốc xoáy',
        'Hurricane': 'Bão nhiệt đới',
        'Typhoon': 'Bão',
    }
    
    # Alert severity translations
    ALERT_SEVERITY = {
        'Extreme': 'Cực kỳ nghiêm trọng',
        'Severe': 'Nghiêm trọng',
        'Moderate': 'Trung bình',
        'Minor': 'Nhẹ',
        'Unknown': 'Không xác định',
    }
    
    @staticmethod
    def translate_condition(condition: str) -> str:
        """
        Translate weather condition to Vietnamese
        
        Args:
            condition: Weather condition in English
            
        Returns:
            Vietnamese translation or original if not found
        """
        return WeatherTranslator.WEATHER_CONDITIONS.get(condition, condition)
    
    @staticmethod
    def translate_wind_direction(direction: str) -> str:
        """
        Translate wind direction to Vietnamese
        
        Args:
            direction: Wind direction abbreviation
            
        Returns:
            Vietnamese translation or original if not found
        """
        return WeatherTranslator.WIND_DIRECTIONS.get(direction, direction)
    
    @staticmethod
    def translate_aqi_category(category: str) -> str:
        """
        Translate AQI category to Vietnamese
        
        Args:
            category: AQI category in English
            
        Returns:
            Vietnamese translation or original if not found
        """
        return WeatherTranslator.AQI_CATEGORIES.get(category, category)
    
    @staticmethod
    def get_aqi_recommendation(category: str) -> str:
        """
        Get AQI health recommendation in Vietnamese
        
        Args:
            category: AQI category in English
            
        Returns:
            Vietnamese health recommendation
        """
        return WeatherTranslator.AQI_RECOMMENDATIONS.get(category, 'Không có khuyến nghị.')
    
    @staticmethod
    def translate_alert_type(alert_type: str) -> str:
        """
        Translate alert type to Vietnamese
        
        Args:
            alert_type: Alert type in English
            
        Returns:
            Vietnamese translation or original if not found
        """
        # Try to find matching keywords
        for eng, viet in WeatherTranslator.ALERT_TYPES.items():
            if eng.lower() in alert_type.lower():
                return viet
        return alert_type
    
    @staticmethod
    def translate_alert_severity(severity: str) -> str:
        """
        Translate alert severity to Vietnamese
        
        Args:
            severity: Severity level in English
            
        Returns:
            Vietnamese translation or original if not found
        """
        return WeatherTranslator.ALERT_SEVERITY.get(severity, severity)
    
    @staticmethod
    def translate_current_weather(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Translate current weather data to Vietnamese
        
        Args:
            data: Current weather data from API
            
        Returns:
            Translated data
        """
        if not data:
            return data
        
        translated = data.copy()
        
        # Translate location name (keep original)
        if 'location' in translated:
            location = translated['location']
            if 'name' in location:
                location['name_vi'] = location['name']  # Keep original for now
            if 'country' in location:
                location['country_vi'] = location['country']  # Keep original
        
        # Translate current conditions
        if 'current' in translated:
            current = translated['current']
            
            if 'condition' in current and 'text' in current['condition']:
                condition_text = current['condition']['text']
                current['condition']['text_vi'] = WeatherTranslator.translate_condition(condition_text)
            
            if 'wind_dir' in current:
                current['wind_dir_vi'] = WeatherTranslator.translate_wind_direction(current['wind_dir'])
        
        return translated
    
    @staticmethod
    def translate_forecast(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Translate forecast data to Vietnamese
        
        Args:
            data: Forecast data from API
            
        Returns:
            Translated data
        """
        if not data or 'forecast' not in data:
            return data
        
        translated = data.copy()
        
        # Translate each forecast day
        if 'forecastday' in translated['forecast']:
            for day in translated['forecast']['forecastday']:
                # Translate day condition
                if 'day' in day and 'condition' in day['day']:
                    condition_text = day['day']['condition']['text']
                    day['day']['condition']['text_vi'] = WeatherTranslator.translate_condition(condition_text)
                
                # Translate hourly conditions
                if 'hour' in day:
                    for hour in day['hour']:
                        if 'condition' in hour and 'text' in hour['condition']:
                            condition_text = hour['condition']['text']
                            hour['condition']['text_vi'] = WeatherTranslator.translate_condition(condition_text)
                        
                        if 'wind_dir' in hour:
                            hour['wind_dir_vi'] = WeatherTranslator.translate_wind_direction(hour['wind_dir'])
        
        return translated
    
    @staticmethod
    def translate_alerts(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Translate alerts and AQI data to Vietnamese
        
        Args:
            data: Alerts data from API
            
        Returns:
            Translated data
        """
        if not data:
            return data
        
        translated = data.copy()
        
        # Translate alerts
        if 'alerts' in translated and 'alert' in translated['alerts']:
            for alert in translated['alerts']['alert']:
                if 'event' in alert:
                    alert['event_vi'] = WeatherTranslator.translate_alert_type(alert['event'])
                
                if 'severity' in alert:
                    alert['severity_vi'] = WeatherTranslator.translate_alert_severity(alert['severity'])
                
                # Keep headline and description in original language
                # (translating free text would require external API)
        
        # Translate AQI
        if 'current' in translated and 'air_quality' in translated['current']:
            aqi_data = translated['current']['air_quality']
            
            if 'aqi_category' in aqi_data:
                category = aqi_data['aqi_category']
                aqi_data['aqi_category_vi'] = WeatherTranslator.translate_aqi_category(category)
                aqi_data['aqi_recommendation_vi'] = WeatherTranslator.get_aqi_recommendation(category)
        
        return translated
