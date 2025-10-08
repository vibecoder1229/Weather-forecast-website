"""
Weather Insights Module
Provides weather trends, comparisons, and intelligent insights
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta
import math

class WeatherInsights:
    """Generate intelligent weather insights and comparisons"""
    
    @staticmethod
    def analyze_temperature_trend(current_temp: float, previous_temps: List[float] = None) -> Dict[str, Any]:
        """
        Analyze temperature trends and changes
        
        Args:
            current_temp: Current temperature in Celsius
            previous_temps: List of previous temperatures (optional)
            
        Returns:
            Temperature trend analysis
        """
        if not previous_temps:
            # Simulate trend analysis without historical data
            # In a real implementation, you'd fetch this from a database
            yesterday_temp = current_temp - 2.1  # Example difference
            trend = "warming" if current_temp > yesterday_temp else "cooling"
            change_24h = round(current_temp - yesterday_temp, 1)
            
            return {
                'trend': trend,
                'trend_vi': 'tăng' if trend == 'warming' else 'giảm',
                'change_24h': f"{'+' if change_24h > 0 else ''}{change_24h}°C",
                'comparison_yesterday': f"{abs(change_24h)}°C {'warmer' if change_24h > 0 else 'cooler'} than yesterday",
                'comparison_yesterday_vi': f"{'Ấm' if change_24h > 0 else 'Lạnh'} hơn hôm qua {abs(change_24h)}°C",
                'trend_strength': 'moderate' if abs(change_24h) < 5 else 'strong'
            }
        
        # If historical data is available
        if len(previous_temps) > 0:
            yesterday_temp = previous_temps[-1]
            change_24h = round(current_temp - yesterday_temp, 1)
            
            # Calculate trend over multiple days
            if len(previous_temps) >= 3:
                recent_avg = sum(previous_temps[-3:]) / 3
                trend_strength = abs(current_temp - recent_avg)
                if trend_strength > 5:
                    strength = 'strong'
                elif trend_strength > 2:
                    strength = 'moderate'
                else:
                    strength = 'weak'
            else:
                strength = 'moderate'
            
            trend = "warming" if change_24h > 0 else "cooling" if change_24h < 0 else "stable"
            
            return {
                'trend': trend,
                'trend_vi': 'tăng' if trend == 'warming' else 'giảm' if trend == 'cooling' else 'ổn định',
                'change_24h': f"{'+' if change_24h > 0 else ''}{change_24h}°C",
                'comparison_yesterday': f"{abs(change_24h)}°C {'warmer' if change_24h > 0 else 'cooler'} than yesterday",
                'comparison_yesterday_vi': f"{'Ấm' if change_24h > 0 else 'Lạnh'} hơn hôm qua {abs(change_24h)}°C",
                'trend_strength': strength
            }
    
    @staticmethod
    def get_seasonal_comparison(current_temp: float, location: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compare current temperature with seasonal averages
        
        Args:
            current_temp: Current temperature in Celsius
            location: Location information
            
        Returns:
            Seasonal comparison data
        """
        # Get current month and latitude for seasonal calculations
        current_month = datetime.now().month
        lat = location.get('lat', 21.0)  # Default to Hanoi latitude
        
        # Estimate seasonal averages based on location (simplified)
        # In a real implementation, you'd use historical climate data
        seasonal_temps = {
            'tropical': {  # For latitudes < 25 (Vietnam, Thailand, etc.)
                1: 20, 2: 22, 3: 25, 4: 28, 5: 30, 6: 30,
                7: 29, 8: 29, 9: 28, 10: 26, 11: 23, 12: 21
            },
            'subtropical': {  # For latitudes 25-35
                1: 15, 2: 18, 3: 22, 4: 26, 5: 30, 6: 33,
                7: 35, 8: 34, 9: 30, 10: 25, 11: 20, 12: 16
            },
            'temperate': {  # For latitudes > 35
                1: 5, 2: 8, 3: 13, 4: 18, 5: 23, 6: 28,
                7: 30, 8: 29, 9: 24, 10: 18, 11: 12, 12: 7
            }
        }
        
        if abs(lat) < 25:
            climate_type = 'tropical'
        elif abs(lat) < 35:
            climate_type = 'subtropical'
        else:
            climate_type = 'temperate'
        
        seasonal_avg = seasonal_temps[climate_type][current_month]
        difference = round(current_temp - seasonal_avg, 1)
        
        # Calculate percentile (simplified)
        percentile = 50 + (difference * 10)  # Rough estimation
        percentile = max(0, min(100, percentile))
        
        return {
            'vs_average': f"{'+' if difference > 0 else ''}{difference}°C {'above' if difference > 0 else 'below'} average",
            'vs_average_vi': f"{'Cao' if difference > 0 else 'Thấp'} hơn trung bình {abs(difference)}°C",
            'seasonal_average': seasonal_avg,
            'percentile': round(percentile),
            'climate_type': climate_type,
            'season': WeatherInsights._get_season(current_month, lat)
        }
    
    @staticmethod
    def _get_season(month: int, latitude: float) -> Dict[str, str]:
        """Get season information based on month and latitude"""
        if latitude >= 0:  # Northern hemisphere
            if month in [12, 1, 2]:
                return {'name': 'Winter', 'name_vi': 'Mùa đông'}
            elif month in [3, 4, 5]:
                return {'name': 'Spring', 'name_vi': 'Mùa xuân'}
            elif month in [6, 7, 8]:
                return {'name': 'Summer', 'name_vi': 'Mùa hè'}
            else:
                return {'name': 'Autumn', 'name_vi': 'Mùa thu'}
        else:  # Southern hemisphere
            if month in [6, 7, 8]:
                return {'name': 'Winter', 'name_vi': 'Mùa đông'}
            elif month in [9, 10, 11]:
                return {'name': 'Spring', 'name_vi': 'Mùa xuân'}
            elif month in [12, 1, 2]:
                return {'name': 'Summer', 'name_vi': 'Mùa hè'}
            else:
                return {'name': 'Autumn', 'name_vi': 'Mùa thu'}
    
    @staticmethod
    def detect_notable_conditions(weather_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Detect and describe notable weather conditions
        
        Args:
            weather_data: Current weather data
            
        Returns:
            List of notable conditions with explanations
        """
        notable_conditions = []
        current = weather_data.get('current', {})
        
        temp_c = current.get('temp_c', 20)
        humidity = current.get('humidity', 50)
        uv = current.get('uv', 0)
        wind_kph = current.get('wind_kph', 0)
        vis_km = current.get('vis_km', 10)
        pressure_mb = current.get('pressure_mb', 1013)
        
        # High UV detection
        if uv > 8:
            notable_conditions.append({
                'type': 'high_uv',
                'severity': 'warning',
                'message': f"UV index is extremely high ({uv}) - take extra sun protection",
                'message_vi': f"Chỉ số UV cực cao ({uv}) - cần bảo vệ chống nắng tối đa",
                'icon': '☀️'
            })
        elif uv > 6:
            notable_conditions.append({
                'type': 'moderate_uv',
                'severity': 'caution',
                'message': f"UV index is high ({uv}) - use sun protection",
                'message_vi': f"Chỉ số UV cao ({uv}) - cần bảo vệ chống nắng",
                'icon': '🌞'
            })
        
        # High humidity detection
        if humidity > 85:
            notable_conditions.append({
                'type': 'high_humidity',
                'severity': 'info',
                'message': f"Very high humidity ({humidity}%) - may feel uncomfortable",
                'message_vi': f"Độ ẩm rất cao ({humidity}%) - có thể cảm thấy khó chịu",
                'icon': '💧'
            })
        
        # Strong wind detection
        if wind_kph > 40:
            notable_conditions.append({
                'type': 'strong_wind',
                'severity': 'warning',
                'message': f"Strong winds ({wind_kph} km/h) - be cautious outdoors",
                'message_vi': f"Gió mạnh ({wind_kph} km/h) - cẩn thận khi ra ngoài",
                'icon': '💨'
            })
        elif wind_kph > 25:
            notable_conditions.append({
                'type': 'moderate_wind',
                'severity': 'caution',
                'message': f"Moderate winds ({wind_kph} km/h) - secure loose objects",
                'message_vi': f"Gió vừa ({wind_kph} km/h) - cố định đồ vật nhẹ",
                'icon': '🌬️'
            })
        
        # Low visibility detection
        if vis_km < 2:
            notable_conditions.append({
                'type': 'low_visibility',
                'severity': 'warning',
                'message': f"Very low visibility ({vis_km} km) - drive carefully",
                'message_vi': f"Tầm nhìn rất hạn chế ({vis_km} km) - lái xe cẩn thận",
                'icon': '🌫️'
            })
        elif vis_km < 5:
            notable_conditions.append({
                'type': 'reduced_visibility',
                'severity': 'caution',
                'message': f"Reduced visibility ({vis_km} km) - exercise caution",
                'message_vi': f"Tầm nhìn hạn chế ({vis_km} km) - cần thận trọng",
                'icon': '🌁'
            })
        
        # Extreme temperature detection
        if temp_c > 35:
            notable_conditions.append({
                'type': 'extreme_heat',
                'severity': 'warning',
                'message': f"Extreme heat ({temp_c}°C) - avoid prolonged sun exposure",
                'message_vi': f"Nắng nóng cực độ ({temp_c}°C) - tránh phơi nắng lâu",
                'icon': '🔥'
            })
        elif temp_c < 5:
            notable_conditions.append({
                'type': 'extreme_cold',
                'severity': 'warning',
                'message': f"Very cold temperature ({temp_c}°C) - dress warmly",
                'message_vi': f"Nhiệt độ rất lạnh ({temp_c}°C) - mặc ấm",
                'icon': '🥶'
            })
        
        # Pressure changes (simplified - would need historical data)
        if pressure_mb < 1000:
            notable_conditions.append({
                'type': 'low_pressure',
                'severity': 'info',
                'message': f"Low atmospheric pressure ({pressure_mb} mb) - weather may change",
                'message_vi': f"Áp suất thấp ({pressure_mb} mb) - thời tiết có thể thay đổi",
                'icon': '📉'
            })
        elif pressure_mb > 1025:
            notable_conditions.append({
                'type': 'high_pressure',
                'severity': 'info',
                'message': f"High atmospheric pressure ({pressure_mb} mb) - stable weather expected",
                'message_vi': f"Áp suất cao ({pressure_mb} mb) - thời tiết ổn định",
                'icon': '📈'
            })
        
        return notable_conditions
    
    @staticmethod
    def generate_weather_insights(weather_data: Dict[str, Any], forecast_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate comprehensive weather insights
        
        Args:
            weather_data: Current weather data
            forecast_data: Optional forecast data for additional insights
            
        Returns:
            Comprehensive weather insights
        """
        current = weather_data.get('current', {})
        location = weather_data.get('location', {})
        
        temp_c = current.get('temp_c', 20)
        
        # Temperature trend analysis
        temp_trend = WeatherInsights.analyze_temperature_trend(temp_c)
        
        # Seasonal comparison
        seasonal_comparison = WeatherInsights.get_seasonal_comparison(temp_c, location)
        
        # Notable conditions
        notable_conditions = WeatherInsights.detect_notable_conditions(weather_data)
        
        # Forecast insights if available
        forecast_insights = {}
        if forecast_data:
            forecast_days = forecast_data.get('forecast', {}).get('forecastday', [])
            if len(forecast_days) > 1:
                tomorrow = forecast_days[1]
                tomorrow_max = tomorrow.get('day', {}).get('maxtemp_c', temp_c)
                temp_change = round(tomorrow_max - temp_c, 1)
                
                forecast_insights = {
                    'tomorrow_outlook': {
                        'temp_change': f"{'+' if temp_change > 0 else ''}{temp_change}°C",
                        'comparison': f"{'Warmer' if temp_change > 0 else 'Cooler' if temp_change < 0 else 'Similar'} than today",
                        'comparison_vi': f"{'Ấm' if temp_change > 0 else 'Lạnh' if temp_change < 0 else 'Tương tự'} hơn hôm nay"
                    }
                }
        
        return {
            'temperature_trend': temp_trend,
            'seasonal_comparison': seasonal_comparison,
            'notable_conditions': notable_conditions,
            'forecast_insights': forecast_insights,
            'summary': WeatherInsights._generate_summary(temp_trend, seasonal_comparison, notable_conditions),
            'generated_at': datetime.now().isoformat()
        }
    
    @staticmethod
    def _generate_summary(temp_trend: Dict[str, Any], seasonal_comparison: Dict[str, Any], 
                         notable_conditions: List[Dict[str, Any]]) -> Dict[str, str]:
        """Generate a text summary of the weather insights"""
        
        # Build summary based on trends and conditions
        summary_parts = []
        summary_parts_vi = []
        
        # Temperature trend
        trend = temp_trend.get('trend', 'stable')
        if trend != 'stable':
            summary_parts.append(f"Temperature is {trend}")
            summary_parts_vi.append(f"Nhiệt độ đang {temp_trend.get('trend_vi', trend)}")
        
        # Seasonal context
        vs_avg = seasonal_comparison.get('vs_average', '')
        if vs_avg:
            summary_parts.append(vs_avg.replace('+', '').replace('-', ''))
            summary_parts_vi.append(seasonal_comparison.get('vs_average_vi', ''))
        
        # Notable conditions
        high_severity_conditions = [c for c in notable_conditions if c.get('severity') == 'warning']
        if high_severity_conditions:
            summary_parts.append("Weather advisory conditions present")
            summary_parts_vi.append("Có điều kiện thời tiết cần lưu ý")
        
        summary = '. '.join(summary_parts) if summary_parts else "Weather conditions are normal"
        summary_vi = '. '.join(summary_parts_vi) if summary_parts_vi else "Điều kiện thời tiết bình thường"
        
        return {
            'text': summary,
            'text_vi': summary_vi
        }