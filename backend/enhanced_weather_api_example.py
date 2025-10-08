"""
Enhanced Weather API Endpoint
Demonstrates how to integrate all enhancement modules for richer weather data
"""

import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Import validation and translation modules
from validate_information import (
    InputValidator,
    ValidationError,
    WeatherTranslator,
    ResponseFormatter,
    VietnameseCityNormalizer
)

# Import enhancement modules
from weather_enhancements.activity_recommender import ActivityRecommender
from weather_enhancements.astronomy_calculator import AstronomyCalculator

# Load environment variables
load_dotenv()

def enhance_current_weather_data(weather_data):
    """
    Enhance basic weather data with additional insights and recommendations
    
    Args:
        weather_data: Basic weather data from WeatherAPI
        
    Returns:
        Enhanced weather data with recommendations and insights
    """
    current = weather_data.get('current', {})
    location = weather_data.get('location', {})
    astro = weather_data.get('forecast', {}).get('forecastday', [{}])[0].get('astro', {})
    
    # Get basic weather values
    temp_c = current.get('temp_c', 20)
    humidity = current.get('humidity', 50)
    wind_kph = current.get('wind_kph', 0)
    uv = current.get('uv', 0)
    
    # Calculate enhanced astronomy data
    sunrise = astro.get('sunrise', '06:00')
    sunset = astro.get('sunset', '18:00')
    moon_phase = astro.get('moon_phase', 'Unknown')
    moon_illumination = astro.get('moon_illumination', 0)
    
    golden_blue_hours = AstronomyCalculator.calculate_golden_blue_hours(sunrise, sunset)
    comfort_index = AstronomyCalculator.calculate_comfort_index(temp_c, humidity, wind_kph)
    heat_index = AstronomyCalculator.calculate_heat_index(temp_c, humidity)
    wind_chill = AstronomyCalculator.calculate_wind_chill(temp_c, wind_kph)
    uv_recommendations = AstronomyCalculator.get_uv_recommendations(uv)
    
    # Get activity and clothing recommendations
    clothing_recs = ActivityRecommender.get_clothing_recommendations(weather_data)
    activity_recs = ActivityRecommender.get_activity_recommendations(weather_data)
    travel_conditions = ActivityRecommender.get_travel_conditions(weather_data)
    
    # Build enhanced data structure
    enhanced_data = {
        # Original data (formatted)
        'location': ResponseFormatter._format_location(location),
        'current': ResponseFormatter._format_current(current),
        
        # Enhanced astronomy data
        'astronomy': {
            'sunrise': sunrise,
            'sunset': sunset,
            'moonrise': astro.get('moonrise', ''),
            'moonset': astro.get('moonset', ''),
            'moon_phase': moon_phase,
            'moon_phase_vi': AstronomyCalculator.get_moon_phase_vietnamese(moon_phase),
            'moon_illumination': moon_illumination,
            **golden_blue_hours
        },
        
        # Enhanced environmental data
        'environmental': {
            'uv_index': uv,
            **uv_recommendations,
            'dew_point': current.get('dewpoint_c', temp_c - 5),  # Estimate if not available
            'heat_index': heat_index,
            'wind_chill': wind_chill if wind_chill != temp_c else None,
            'comfort_index': comfort_index
        },
        
        # Activity and clothing recommendations
        'recommendations': {
            'clothing': clothing_recs,
            'activities': activity_recs,
            'travel': travel_conditions
        }
    }
    
    return enhanced_data

def enhance_forecast_data(forecast_data):
    """
    Enhance forecast data with hourly information and extended insights
    
    Args:
        forecast_data: Basic forecast data from WeatherAPI
        
    Returns:
        Enhanced forecast data with hourly details and insights
    """
    # Get current weather for recommendations
    enhanced_current = enhance_current_weather_data(forecast_data)
    
    # Format basic forecast data
    formatted_forecast = ResponseFormatter.format_forecast(forecast_data)
    
    # Add hourly data if available
    forecast_days = forecast_data.get('forecast', {}).get('forecastday', [])
    
    enhanced_hourly = []
    for day in forecast_days[:2]:  # Only process first 2 days for hourly data
        hours = day.get('hour', [])
        for hour in hours:
            enhanced_hourly.append({
                'time': hour.get('time', ''),
                'time_epoch': hour.get('time_epoch', 0),
                'temp_c': hour.get('temp_c', 0),
                'feelslike_c': hour.get('feelslike_c', 0),
                'condition': {
                    'text': hour.get('condition', {}).get('text', ''),
                    'icon': hour.get('condition', {}).get('icon', ''),
                    'code': hour.get('condition', {}).get('code', 0)
                },
                'wind_kph': hour.get('wind_kph', 0),
                'wind_dir': hour.get('wind_dir', ''),
                'pressure_mb': hour.get('pressure_mb', 0),
                'humidity': hour.get('humidity', 0),
                'cloud': hour.get('cloud', 0),
                'chance_of_rain': hour.get('chance_of_rain', 0),
                'chance_of_snow': hour.get('chance_of_snow', 0),
                'uv': hour.get('uv', 0),
                'vis_km': hour.get('vis_km', 0)
            })
    
    # Build enhanced forecast structure
    enhanced_forecast = {
        # Basic forecast data
        **formatted_forecast,
        
        # Enhanced hourly data
        'hourly_forecast': {
            'hours': enhanced_hourly
        },
        
        # Current weather with all enhancements
        'current_enhanced': enhanced_current
    }
    
    return enhanced_forecast


# Example of enhanced endpoint (you can add this to your main app.py)
def create_enhanced_weather_routes(app):
    """
    Add enhanced weather routes to the Flask app
    """
    
    @app.route('/api/weather/enhanced-current', methods=['POST'])
    def get_enhanced_current_weather():
        """
        Get enhanced current weather with recommendations and insights
        """
        print(f"[DEBUG] Received request to /api/weather/enhanced-current")
        
        if not request.is_json:
            error_response = ResponseFormatter.format_error(
                'Content-Type phải là application/json',
                'INVALID_CONTENT_TYPE'
            )
            return jsonify(error_response), 400
        
        data = request.get_json()
        print(f"[DEBUG] Request data: {data}")
        
        # Sanitize and validate input
        data = InputValidator.sanitize_input(data)
        is_valid, error_msg, cleaned_data = InputValidator.validate_location_request(data)
        if not is_valid:
            error_response = ResponseFormatter.format_error(error_msg, 'VALIDATION_ERROR')
            return jsonify(error_response), 400
        
        # Build query
        if 'location' in cleaned_data:
            query = cleaned_data['location']
        else:
            query = f"{cleaned_data['lat']},{cleaned_data['lon']}"
        
        # Get weather data with forecast for astronomy info
        params = {
            'key': os.getenv('WEATHERAPI_KEY', 'YOUR_WEATHERAPI_KEY'),
            'q': query,
            'days': 1,  # Need forecast for astronomy data
            'aqi': 'yes',
            'alerts': 'yes'
        }
        
        try:
            resp = requests.get(f"{os.getenv('WEATHERAPI_BASE_URL', 'http://api.weatherapi.com/v1')}/forecast.json", 
                              params=params, timeout=10)
            resp.raise_for_status()
            
            weather_data = resp.json()
            
            # Translate to Vietnamese
            weather_data = WeatherTranslator.translate_current_weather(weather_data)
            weather_data = WeatherTranslator.translate_forecast(weather_data)
            
            # Enhance the data
            enhanced_data = enhance_current_weather_data(weather_data)
            
            success_response = ResponseFormatter.format_success(
                enhanced_data,
                'Lấy dữ liệu thời tiết nâng cao thành công'
            )
            
            return jsonify(success_response), 200
            
        except requests.exceptions.HTTPError as e:
            print(f"[ERROR] WeatherAPI HTTP error: {e}")
            error_response = ResponseFormatter.format_error(
                'Không thể lấy dữ liệu thời tiết',
                'API_ERROR',
                500
            )
            return jsonify(error_response), 500
            
        except Exception as e:
            print(f"[ERROR] Unexpected error: {str(e)}")
            error_response = ResponseFormatter.format_error(
                f'Lỗi không mong muốn: {str(e)}',
                'INTERNAL_ERROR',
                500
            )
            return jsonify(error_response), 500
    
    @app.route('/api/weather/enhanced-forecast', methods=['POST'])
    def get_enhanced_forecast():
        """
        Get enhanced forecast with hourly data and recommendations
        """
        print(f"[DEBUG] Received request to /api/weather/enhanced-forecast")
        
        if not request.is_json:
            error_response = ResponseFormatter.format_error(
                'Content-Type phải là application/json',
                'INVALID_CONTENT_TYPE'
            )
            return jsonify(error_response), 400
        
        data = request.get_json()
        data = InputValidator.sanitize_input(data)
        is_valid, error_msg, cleaned_data = InputValidator.validate_location_request(data)
        
        if not is_valid:
            error_response = ResponseFormatter.format_error(error_msg, 'VALIDATION_ERROR')
            return jsonify(error_response), 400
        
        # Build query
        if 'location' in cleaned_data:
            query = cleaned_data['location']
        else:
            query = f"{cleaned_data['lat']},{cleaned_data['lon']}"
        
        days = cleaned_data.get('days', 7)
        
        params = {
            'key': os.getenv('WEATHERAPI_KEY', 'YOUR_WEATHERAPI_KEY'),
            'q': query,
            'days': days,
            'aqi': 'yes',
            'alerts': 'yes'
        }
        
        try:
            resp = requests.get(f"{os.getenv('WEATHERAPI_BASE_URL', 'http://api.weatherapi.com/v1')}/forecast.json", 
                              params=params, timeout=10)
            resp.raise_for_status()
            
            weather_data = resp.json()
            
            # Translate to Vietnamese
            weather_data = WeatherTranslator.translate_forecast(weather_data)
            weather_data = WeatherTranslator.translate_alerts(weather_data)
            
            # Enhance the data
            enhanced_data = enhance_forecast_data(weather_data)
            
            success_response = ResponseFormatter.format_success(
                enhanced_data,
                f'Lấy dự báo nâng cao {days} ngày thành công'
            )
            
            return jsonify(success_response), 200
            
        except Exception as e:
            print(f"[ERROR] Error in enhanced forecast: {str(e)}")
            error_response = ResponseFormatter.format_error(
                f'Lỗi không mong muốn: {str(e)}',
                'INTERNAL_ERROR',
                500
            )
            return jsonify(error_response), 500


# Usage example:
if __name__ == '__main__':
    app = Flask(__name__)
    CORS(app)
    
    # Add enhanced routes
    create_enhanced_weather_routes(app)
    
    app.run(host='0.0.0.0', port=5000, debug=True)