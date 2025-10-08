"""
Astronomy Calculator Module
Calculates astronomical data like golden hour, blue hour, and enhanced moon information
"""

from typing import Dict, Any
import math
from datetime import datetime, timedelta

class AstronomyCalculator:
    """Calculate enhanced astronomical data"""
    
    @staticmethod
    def calculate_golden_blue_hours(sunrise: str, sunset: str) -> Dict[str, Any]:
        """
        Calculate golden hour and blue hour times
        
        Args:
            sunrise: Sunrise time in HH:MM format
            sunset: Sunset time in HH:MM format
            
        Returns:
            Dictionary with golden hour and blue hour times
        """
        try:
            sunrise_time = datetime.strptime(sunrise, "%H:%M")
            sunset_time = datetime.strptime(sunset, "%H:%M")
        except ValueError:
            # If parsing fails, return default values
            return {
                'golden_hour': {
                    'morning_start': '05:45',
                    'morning_end': '06:45',
                    'evening_start': '17:30',
                    'evening_end': '18:30'
                },
                'blue_hour': {
                    'morning_start': '05:15',
                    'morning_end': '05:45',
                    'evening_start': '18:30',
                    'evening_end': '19:00'
                }
            }
        
        # Golden hour is approximately 1 hour before sunrise and 1 hour after sunset
        golden_morning_start = sunrise_time - timedelta(hours=1)
        golden_morning_end = sunrise_time + timedelta(minutes=30)
        golden_evening_start = sunset_time - timedelta(minutes=30)
        golden_evening_end = sunset_time + timedelta(hours=1)
        
        # Blue hour is approximately 30 minutes before/after golden hour
        blue_morning_start = golden_morning_start - timedelta(minutes=30)
        blue_morning_end = golden_morning_start
        blue_evening_start = golden_evening_end
        blue_evening_end = golden_evening_end + timedelta(minutes=30)
        
        return {
            'golden_hour': {
                'morning_start': golden_morning_start.strftime("%H:%M"),
                'morning_end': golden_morning_end.strftime("%H:%M"),
                'evening_start': golden_evening_start.strftime("%H:%M"),
                'evening_end': golden_evening_end.strftime("%H:%M")
            },
            'blue_hour': {
                'morning_start': blue_morning_start.strftime("%H:%M"),
                'morning_end': blue_morning_end.strftime("%H:%M"),
                'evening_start': blue_evening_start.strftime("%H:%M"),
                'evening_end': blue_evening_end.strftime("%H:%M")
            }
        }
    
    @staticmethod
    def get_moon_phase_vietnamese(moon_phase: str) -> str:
        """
        Translate moon phases to Vietnamese
        
        Args:
            moon_phase: English moon phase name
            
        Returns:
            Vietnamese translation of moon phase
        """
        translations = {
            'New Moon': 'Trăng mới',
            'Waxing Crescent': 'Lưỡi liềm tăng',
            'First Quarter': 'Trăng bán nguyệt đầu',
            'Waxing Gibbous': 'Trăng phình tăng',
            'Full Moon': 'Trăng tròn',
            'Waning Gibbous': 'Trăng phình giảm',
            'Last Quarter': 'Trăng bán nguyệt cuối',
            'Waning Crescent': 'Lưỡi liềm giảm'
        }
        return translations.get(moon_phase, moon_phase)
    
    @staticmethod
    def calculate_comfort_index(temp_c: float, humidity: int, wind_kph: float) -> Dict[str, Any]:
        """
        Calculate comfort index based on temperature, humidity, and wind
        
        Args:
            temp_c: Temperature in Celsius
            humidity: Humidity percentage
            wind_kph: Wind speed in km/h
            
        Returns:
            Comfort index with level and score
        """
        # Base comfort score (0-10 scale)
        comfort_score = 10
        
        # Temperature comfort (optimal range: 20-25°C)
        if temp_c < 15:
            comfort_score -= min(4, (15 - temp_c) * 0.3)
        elif temp_c > 30:
            comfort_score -= min(4, (temp_c - 30) * 0.2)
        elif temp_c < 18 or temp_c > 27:
            comfort_score -= 1
        
        # Humidity comfort (optimal range: 40-60%)
        if humidity < 30:
            comfort_score -= 2  # Too dry
        elif humidity > 80:
            comfort_score -= min(3, (humidity - 80) * 0.1)  # Too humid
        elif humidity > 70:
            comfort_score -= 1
        
        # Wind comfort (light breeze is good, strong wind is uncomfortable)
        if wind_kph > 30:
            comfort_score -= min(3, (wind_kph - 30) * 0.1)
        elif wind_kph > 20:
            comfort_score -= 1
        elif 5 <= wind_kph <= 15:
            comfort_score += 0.5  # Light breeze bonus
        
        # Ensure score is within bounds
        comfort_score = max(0, min(10, comfort_score))
        
        # Determine comfort level
        if comfort_score >= 8:
            level = "Very Comfortable"
            level_vi = "Rất thoải mái"
        elif comfort_score >= 6:
            level = "Comfortable"
            level_vi = "Thoải mái"
        elif comfort_score >= 4:
            level = "Moderate"
            level_vi = "Bình thường"
        elif comfort_score >= 2:
            level = "Uncomfortable"
            level_vi = "Khó chịu"
        else:
            level = "Very Uncomfortable"
            level_vi = "Rất khó chịu"
        
        return {
            'level': level,
            'level_vi': level_vi,
            'score': round(comfort_score, 1)
        }
    
    @staticmethod
    def calculate_heat_index(temp_c: float, humidity: int) -> float:
        """
        Calculate heat index (feels like temperature in hot conditions)
        
        Args:
            temp_c: Temperature in Celsius
            humidity: Relative humidity percentage
            
        Returns:
            Heat index in Celsius
        """
        # Convert to Fahrenheit for calculation
        temp_f = temp_c * 9/5 + 32
        
        # Heat index only relevant for temperatures above 80°F (26.7°C)
        if temp_f < 80:
            return temp_c
        
        # Simplified heat index formula
        hi = -42.379 + 2.04901523 * temp_f + 10.14333127 * humidity
        hi += -0.22475541 * temp_f * humidity - 6.83783e-3 * temp_f**2
        hi += -5.481717e-2 * humidity**2 + 1.22874e-3 * temp_f**2 * humidity
        hi += 8.5282e-4 * temp_f * humidity**2 - 1.99e-6 * temp_f**2 * humidity**2
        
        # Convert back to Celsius
        return round((hi - 32) * 5/9, 1)
    
    @staticmethod
    def calculate_wind_chill(temp_c: float, wind_kph: float) -> float:
        """
        Calculate wind chill (feels like temperature in cold, windy conditions)
        
        Args:
            temp_c: Temperature in Celsius
            wind_kph: Wind speed in km/h
            
        Returns:
            Wind chill in Celsius
        """
        # Wind chill only relevant for temperatures below 10°C and wind above 4.8 km/h
        if temp_c > 10 or wind_kph < 4.8:
            return temp_c
        
        # Convert wind speed to mph for calculation
        wind_mph = wind_kph * 0.621371
        
        # Wind chill formula (in Fahrenheit)
        temp_f = temp_c * 9/5 + 32
        wc_f = 35.74 + 0.6215 * temp_f - 35.75 * (wind_mph**0.16) + 0.4275 * temp_f * (wind_mph**0.16)
        
        # Convert back to Celsius
        return round((wc_f - 32) * 5/9, 1)
    
    @staticmethod
    def get_uv_recommendations(uv_index: float) -> Dict[str, Any]:
        """
        Get UV protection recommendations based on UV index
        
        Args:
            uv_index: UV index value
            
        Returns:
            UV category and recommendations
        """
        if uv_index <= 2:
            category = "Low"
            category_vi = "Thấp"
            recommendations = "No protection needed"
            recommendations_vi = "Không cần bảo vệ"
        elif uv_index <= 5:
            category = "Moderate"
            category_vi = "Trung bình"
            recommendations = "Wear sunglasses, use sunscreen"
            recommendations_vi = "Đeo kính râm, dùng kem chống nắng"
        elif uv_index <= 7:
            category = "High"
            category_vi = "Cao"
            recommendations = "Use SPF 30+ sunscreen, wear hat"
            recommendations_vi = "Dùng kem chống nắng SPF 30+, đội mũ"
        elif uv_index <= 10:
            category = "Very High"
            category_vi = "Rất cao"
            recommendations = "Use SPF 50+ sunscreen, avoid midday sun"
            recommendations_vi = "Dùng kem chống nắng SPF 50+, tránh nắng trưa"
        else:
            category = "Extreme"
            category_vi = "Cực cao"
            recommendations = "Stay indoors, full sun protection required"
            recommendations_vi = "Ở trong nhà, cần bảo vệ toàn diện"
        
        return {
            'category': category,
            'category_vi': category_vi,
            'recommendations': recommendations,
            'recommendations_vi': recommendations_vi
        }