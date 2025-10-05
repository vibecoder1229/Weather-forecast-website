"""
Response Formatter Module
Formats API responses to ensure frontend compatibility and error-free display
"""

from typing import Dict, Any, Optional
from datetime import datetime


class ResponseFormatter:
    """Formats backend responses for frontend consumption"""
    
    @staticmethod
    def format_success(data: Any, message: Optional[str] = None) -> Dict[str, Any]:
        """
        Format successful response
        
        Args:
            data: Response data
            message: Optional success message
            
        Returns:
            Formatted response dictionary
        """
        response = {
            'success': True,
            'data': data,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if message:
            response['message'] = message
        
        return response
    
    @staticmethod
    def format_error(error_message: str, error_code: Optional[str] = None, 
                    status_code: int = 400) -> Dict[str, Any]:
        """
        Format error response
        
        Args:
            error_message: Error message in Vietnamese
            error_code: Optional error code
            status_code: HTTP status code
            
        Returns:
            Formatted error response
        """
        response = {
            'success': False,
            'error': {
                'message': error_message,
                'code': error_code or 'VALIDATION_ERROR',
                'status': status_code
            },
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return response
    
    @staticmethod
    def format_current_weather(weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format current weather data for frontend
        
        Args:
            weather_data: Weather data from API
            
        Returns:
            Formatted weather data
        """
        if not weather_data:
            return {}
        
        formatted = {
            'location': ResponseFormatter._format_location(weather_data.get('location', {})),
            'current': ResponseFormatter._format_current(weather_data.get('current', {})),
        }
        
        return formatted
    
    @staticmethod
    def format_forecast(forecast_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format forecast data for frontend
        
        Args:
            forecast_data: Forecast data from API
            
        Returns:
            Formatted forecast data
        """
        if not forecast_data:
            return {}
        
        formatted = {
            'location': ResponseFormatter._format_location(forecast_data.get('location', {})),
            'forecast': ResponseFormatter._format_forecast_days(forecast_data.get('forecast', {})),
        }
        
        return formatted
    
    @staticmethod
    def format_alerts(alerts_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format alerts and AQI data for frontend
        
        Args:
            alerts_data: Alerts data from API
            
        Returns:
            Formatted alerts data
        """
        if not alerts_data:
            return {}
        
        formatted = {
            'alerts': ResponseFormatter._format_alerts_list(alerts_data.get('alerts', {})),
            'air_quality': ResponseFormatter._format_air_quality(
                alerts_data.get('current', {}).get('air_quality', {})
            ),
        }
        
        return formatted
    
    @staticmethod
    def _format_location(location: Dict[str, Any]) -> Dict[str, Any]:
        """Format location data"""
        return {
            'name': location.get('name', 'Unknown'),
            'name_vi': location.get('name_vi', location.get('name', 'Unknown')),
            'region': location.get('region', ''),
            'country': location.get('country', ''),
            'country_vi': location.get('country_vi', location.get('country', '')),
            'lat': location.get('lat', 0),
            'lon': location.get('lon', 0),
            'localtime': location.get('localtime', ''),
        }
    
    @staticmethod
    def _format_current(current: Dict[str, Any]) -> Dict[str, Any]:
        """Format current weather data"""
        condition = current.get('condition', {})
        
        return {
            'temp_c': current.get('temp_c', 0),
            'temp_f': current.get('temp_f', 0),
            'feels_like_c': current.get('feelslike_c', 0),
            'feels_like_f': current.get('feelslike_f', 0),
            'condition': {
                'text': condition.get('text', 'Unknown'),
                'text_vi': condition.get('text_vi', condition.get('text', 'Unknown')),
                'icon': condition.get('icon', ''),
                'code': condition.get('code', 0),
            },
            'wind_kph': current.get('wind_kph', 0),
            'wind_mph': current.get('wind_mph', 0),
            'wind_dir': current.get('wind_dir', 'N'),
            'wind_dir_vi': current.get('wind_dir_vi', current.get('wind_dir', 'N')),
            'pressure_mb': current.get('pressure_mb', 0),
            'pressure_in': current.get('pressure_in', 0),
            'precip_mm': current.get('precip_mm', 0),
            'precip_in': current.get('precip_in', 0),
            'humidity': current.get('humidity', 0),
            'cloud': current.get('cloud', 0),
            'vis_km': current.get('vis_km', 0),
            'vis_miles': current.get('vis_miles', 0),
            'uv': current.get('uv', 0),
            'gust_kph': current.get('gust_kph', 0),
            'gust_mph': current.get('gust_mph', 0),
            'last_updated': current.get('last_updated', ''),
            'last_updated_epoch': current.get('last_updated_epoch', 0),
        }
    
    @staticmethod
    def _format_forecast_days(forecast: Dict[str, Any]) -> Dict[str, Any]:
        """Format forecast days"""
        forecastday = forecast.get('forecastday', [])
        
        formatted_days = []
        for day in forecastday:
            day_data = day.get('day', {})
            day_condition = day_data.get('condition', {})
            
            formatted_day = {
                'date': day.get('date', ''),
                'date_epoch': day.get('date_epoch', 0),
                'day': {
                    'maxtemp_c': day_data.get('maxtemp_c', 0),
                    'maxtemp_f': day_data.get('maxtemp_f', 0),
                    'mintemp_c': day_data.get('mintemp_c', 0),
                    'mintemp_f': day_data.get('mintemp_f', 0),
                    'avgtemp_c': day_data.get('avgtemp_c', 0),
                    'avgtemp_f': day_data.get('avgtemp_f', 0),
                    'condition': {
                        'text': day_condition.get('text', 'Unknown'),
                        'text_vi': day_condition.get('text_vi', day_condition.get('text', 'Unknown')),
                        'icon': day_condition.get('icon', ''),
                        'code': day_condition.get('code', 0),
                    },
                    'maxwind_kph': day_data.get('maxwind_kph', 0),
                    'maxwind_mph': day_data.get('maxwind_mph', 0),
                    'totalprecip_mm': day_data.get('totalprecip_mm', 0),
                    'totalprecip_in': day_data.get('totalprecip_in', 0),
                    'avgvis_km': day_data.get('avgvis_km', 0),
                    'avgvis_miles': day_data.get('avgvis_miles', 0),
                    'avghumidity': day_data.get('avghumidity', 0),
                    'daily_chance_of_rain': day_data.get('daily_chance_of_rain', 0),
                    'daily_chance_of_snow': day_data.get('daily_chance_of_snow', 0),
                    'uv': day_data.get('uv', 0),
                },
                'astro': day.get('astro', {}),
            }
            
            formatted_days.append(formatted_day)
        
        return {
            'forecastday': formatted_days
        }
    
    @staticmethod
    def _format_alerts_list(alerts: Dict[str, Any]) -> Dict[str, Any]:
        """Format alerts list"""
        alert_list = alerts.get('alert', [])
        
        formatted_alerts = []
        for alert in alert_list:
            formatted_alert = {
                'headline': alert.get('headline', 'Cảnh báo thời tiết'),
                'msgtype': alert.get('msgtype', 'Alert'),
                'severity': alert.get('severity', 'Unknown'),
                'severity_vi': alert.get('severity_vi', alert.get('severity', 'Unknown')),
                'urgency': alert.get('urgency', 'Unknown'),
                'areas': alert.get('areas', ''),
                'category': alert.get('category', 'Met'),
                'certainty': alert.get('certainty', 'Unknown'),
                'event': alert.get('event', 'Weather Alert'),
                'event_vi': alert.get('event_vi', alert.get('event', 'Weather Alert')),
                'note': alert.get('note', ''),
                'effective': alert.get('effective', ''),
                'expires': alert.get('expires', ''),
                'desc': alert.get('desc', ''),
                'instruction': alert.get('instruction', ''),
            }
            formatted_alerts.append(formatted_alert)
        
        return {
            'alert': formatted_alerts
        }
    
    @staticmethod
    def _format_air_quality(air_quality: Dict[str, Any]) -> Dict[str, Any]:
        """Format air quality data"""
        if not air_quality:
            return {}
        
        return {
            'co': air_quality.get('co', 0),
            'no2': air_quality.get('no2', 0),
            'o3': air_quality.get('o3', 0),
            'so2': air_quality.get('so2', 0),
            'pm2_5': air_quality.get('pm2_5', 0),
            'pm10': air_quality.get('pm10', 0),
            'us-epa-index': air_quality.get('us-epa-index', 0),
            'gb-defra-index': air_quality.get('gb-defra-index', 0),
            'aqi_us': air_quality.get('aqi_us', 0),
            'aqi_category': air_quality.get('aqi_category', 'Unknown'),
            'aqi_category_vi': air_quality.get('aqi_category_vi', air_quality.get('aqi_category', 'Unknown')),
            'aqi_recommendation': air_quality.get('aqi_recommendation', ''),
            'aqi_recommendation_vi': air_quality.get('aqi_recommendation_vi', air_quality.get('aqi_recommendation', '')),
        }
    
    @staticmethod
    def safe_get(data: Dict[str, Any], key_path: str, default: Any = None) -> Any:
        """
        Safely get nested dictionary values
        
        Args:
            data: Dictionary to get value from
            key_path: Dot-separated path to value (e.g., 'location.name')
            default: Default value if key not found
            
        Returns:
            Value at key path or default
        """
        keys = key_path.split('.')
        value = data
        
        for key in keys:
            if isinstance(value, dict):
                value = value.get(key)
                if value is None:
                    return default
            else:
                return default
        
        return value if value is not None else default
