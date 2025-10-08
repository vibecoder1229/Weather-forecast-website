# Unified Weather API Backend
# Tích hợp tất cả các chức năng thời tiết trong một Flask app duy nhất
# Có validation, translation, và formatting

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
from weather_enhancements import (
    ActivityRecommender,
    AstronomyCalculator,
    AirQualityEnhancer,
    WeatherInsights
)

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# ============================================================================
# GLOBAL ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
	"""Handle 404 errors with JSON response"""
	error_response = ResponseFormatter.format_error(
		'Endpoint không tồn tại',
		'NOT_FOUND',
		404
	)
	return jsonify(error_response), 404

@app.errorhandler(405)
def method_not_allowed(error):
	"""Handle 405 errors with JSON response"""
	error_response = ResponseFormatter.format_error(
		'Phương thức HTTP không được hỗ trợ',
		'METHOD_NOT_ALLOWED',
		405
	)
	return jsonify(error_response), 405

@app.errorhandler(500)
def internal_error(error):
	"""Handle 500 errors with JSON response"""
	print(f"[ERROR] Internal server error: {str(error)}")
	error_response = ResponseFormatter.format_error(
		'Lỗi máy chủ nội bộ',
		'INTERNAL_SERVER_ERROR',
		500
	)
	return jsonify(error_response), 500

@app.errorhandler(Exception)
def handle_exception(error):
	"""Handle all uncaught exceptions with JSON response"""
	print(f"[ERROR] Unhandled exception: {str(error)}")
	
	# Get status code if available
	status_code = getattr(error, 'code', 500)
	
	error_response = ResponseFormatter.format_error(
		'Đã xảy ra lỗi không mong muốn',
		'UNHANDLED_EXCEPTION',
		status_code
	)
	return jsonify(error_response), status_code

# ============================================================================
# CONFIGURATION - All values loaded from .env file
# ============================================================================

# WeatherAPI Configuration
WEATHER_API_KEY = os.getenv('WEATHERAPI_KEY', 'YOUR_WEATHERAPI_KEY')
WEATHERAPI_BASE_URL = os.getenv('WEATHERAPI_BASE_URL', 'http://api.weatherapi.com/v1')
WEATHER_API_CURRENT_URL = f'{WEATHERAPI_BASE_URL}/current.json'
WEATHER_API_FORECAST_URL = f'{WEATHERAPI_BASE_URL}/forecast.json'
WEATHER_API_ASTRONOMY_URL = f'{WEATHERAPI_BASE_URL}/astronomy.json'
WEATHER_API_HISTORY_URL = f'{WEATHERAPI_BASE_URL}/history.json'
WEATHER_API_MARINE_URL = f'{WEATHERAPI_BASE_URL}/marine.json'
WEATHER_API_FUTURE_URL = f'{WEATHERAPI_BASE_URL}/future.json'
WEATHER_API_TIMEZONE_URL = f'{WEATHERAPI_BASE_URL}/timezone.json'
WEATHER_API_SPORTS_URL = f'{WEATHERAPI_BASE_URL}/sports.json'
WEATHER_API_SEARCH_URL = f'{WEATHERAPI_BASE_URL}/search.json'

# Server Configuration
FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')

# ============================================================================
# STARTUP LOGGING
# ============================================================================

print(f"[INFO] Flask server starting...")
print(f"[INFO] CORS enabled for all origins")
print(f"[INFO] Validation & Translation modules loaded")
print(f"[INFO] WeatherAPI Key configured: {'Yes' if WEATHER_API_KEY != 'YOUR_WEATHERAPI_KEY' else 'No (using default placeholder)'}")
# DO NOT log the actual API key - security risk
print(f"[INFO] Server will run on {FLASK_HOST}:{FLASK_PORT} (Debug: {FLASK_DEBUG})")

# Helper function to add AQI category to air quality data
def add_aqi_category(air_quality):
	"""Add AQI category and health recommendation to air quality data"""
	if not air_quality:
		return None
	
	aqi_us = air_quality.get('us-epa-index', 0)
	
	# Determine category
	if aqi_us <= 50:
		category = 'Good'
	elif aqi_us <= 100:
		category = 'Moderate'
	elif aqi_us <= 150:
		category = 'Unhealthy for Sensitive Groups'
	elif aqi_us <= 200:
		category = 'Unhealthy'
	elif aqi_us <= 300:
		category = 'Very Unhealthy'
	else:
		category = 'Hazardous'
	
	# Add category information
	air_quality['aqi_us'] = aqi_us
	air_quality['aqi_category'] = category
	air_quality['aqi_recommendation'] = get_english_recommendation(category)
	
	return air_quality

def get_english_recommendation(category):
	"""Get English health recommendation for AQI category"""
	recommendations = {
		'Good': 'Air quality is satisfactory, and air pollution poses little or no risk.',
		'Moderate': 'Air quality is acceptable. However, there may be a risk for some people.',
		'Unhealthy for Sensitive Groups': 'Members of sensitive groups may experience health effects.',
		'Unhealthy': 'Some members of the general public may experience health effects.',
		'Very Unhealthy': 'Health alert: The risk of health effects is increased for everyone.',
		'Hazardous': 'Health warning of emergency conditions: everyone is more likely to be affected.',
	}
	return recommendations.get(category, 'No recommendation available.')

# ============================================================================
# ENHANCEMENT HELPER FUNCTIONS
# ============================================================================

def _enhance_current_weather_basic(weather_data):
	"""
	Add basic enhancements to current weather data without breaking existing structure
	
	Args:
		weather_data: Basic weather data from WeatherAPI
		
	Returns:
		Enhanced weather data with additional insights
	"""
	try:
		current = weather_data.get('current', {})
		
		# Add enhanced air quality if available
		if current.get('air_quality'):
			enhanced_air_quality = AirQualityEnhancer.enhance_air_quality_data(current['air_quality'])
			weather_data['current']['air_quality_enhanced'] = enhanced_air_quality
		
		# Add basic activity recommendations
		clothing_recs = ActivityRecommender.get_clothing_recommendations(weather_data)
		weather_data['basic_recommendations'] = {
			'clothing': clothing_recs
		}
		
		# Add comfort index
		temp_c = current.get('temp_c', 20)
		humidity = current.get('humidity', 50)
		wind_kph = current.get('wind_kph', 0)
		comfort_index = AstronomyCalculator.calculate_comfort_index(temp_c, humidity, wind_kph)
		weather_data['current']['comfort_index'] = comfort_index
		
		return weather_data
		
	except Exception as e:
		print(f"[WARNING] Enhancement failed, returning basic data: {str(e)}")
		return weather_data

def _enhance_current_weather_full(weather_data):
	"""
	Add comprehensive enhancements to current weather data
	
	Args:
		weather_data: Basic weather data from WeatherAPI with forecast
		
	Returns:
		Fully enhanced weather data with all insights
	"""
	try:
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
		
		# Enhanced air quality analysis
		enhanced_air_quality = {}
		if current.get('air_quality'):
			enhanced_air_quality = AirQualityEnhancer.enhance_air_quality_data(current['air_quality'])
		
		# Weather insights
		weather_insights = WeatherInsights.generate_weather_insights(weather_data)
		
		# Build enhanced data structure
		enhanced_data = {
			# Original data
			**weather_data,
			
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
				'dew_point': current.get('dewpoint_c', temp_c - 5),
				'heat_index': heat_index,
				'wind_chill': wind_chill if wind_chill != temp_c else None,
				'comfort_index': comfort_index
			},
			
			# Activity and clothing recommendations
			'recommendations': {
				'clothing': clothing_recs,
				'activities': activity_recs,
				'travel': travel_conditions
			},
			
			# Enhanced air quality
			'air_quality_enhanced': enhanced_air_quality,
			
			# Weather insights
			'insights': weather_insights
		}
		
		return enhanced_data
		
	except Exception as e:
		print(f"[WARNING] Full enhancement failed, returning basic data: {str(e)}")
		return weather_data

# API Routes


@app.route('/api/weather/current', methods=['POST'])
def get_current_weather():
	"""
	Get current weather by location or GPS coordinates
	Request body: { location: string } OR { lat: number, lon: number }
	Returns Vietnamese-translated weather data
	"""
	print(f"[DEBUG] Received request to /api/weather/current")
	
	if not request.is_json:
		print(f"[ERROR] Request is not JSON")
		error_response = ResponseFormatter.format_error(
			'Content-Type phải là application/json',
			'INVALID_CONTENT_TYPE'
		)
		return jsonify(error_response), 400
	
	data = request.get_json()
	print(f"[DEBUG] Request data: {data}")
	
	# Sanitize input
	data = InputValidator.sanitize_input(data)
	
	# Validate location request
	is_valid, error_msg, cleaned_data = InputValidator.validate_location_request(data)
	if not is_valid:
		error_response = ResponseFormatter.format_error(error_msg, 'VALIDATION_ERROR')
		return jsonify(error_response), 400
	
	# Build query
	if 'location' in cleaned_data:
		query = cleaned_data['location']
		print(f"[DEBUG] Query by location: {query}")
	else:
		query = f"{cleaned_data['lat']},{cleaned_data['lon']}"
		print(f"[DEBUG] Query by coordinates: {query}")
	
	params = {
		'key': WEATHER_API_KEY,
		'q': query,
		'aqi': 'yes'
	}
	
	try:
		print(f"[DEBUG] Calling WeatherAPI with params: {params}")
		resp = requests.get(WEATHER_API_CURRENT_URL, params=params, timeout=10)
		resp.raise_for_status()
		print(f"[DEBUG] WeatherAPI response successful")
		
		weather_data = resp.json()
		
		# Translate to Vietnamese
		weather_data = WeatherTranslator.translate_current_weather(weather_data)
		
		# Add basic enhancements to current weather
		enhanced_data = _enhance_current_weather_basic(weather_data)
		
		# Format response
		formatted_data = ResponseFormatter.format_current_weather(enhanced_data)
		success_response = ResponseFormatter.format_success(
			formatted_data,
			'Lấy dữ liệu thời tiết hiện tại thành công'
		)
		
		return jsonify(success_response), 200
		
	except requests.exceptions.HTTPError as e:
		print(f"[ERROR] WeatherAPI HTTP error: {e}, Status: {resp.status_code}")
		if resp.status_code == 400:
			error_response = ResponseFormatter.format_error(
				'Địa điểm hoặc tọa độ không hợp lệ',
				'INVALID_LOCATION',
				400
			)
		elif resp.status_code == 401 or resp.status_code == 403:
			error_response = ResponseFormatter.format_error(
				'API key không hợp lệ hoặc đã hết hạn',
				'API_KEY_ERROR',
				500
			)
		else:
			error_response = ResponseFormatter.format_error(
				f'Lỗi API: {str(e)}',
				'API_ERROR',
				500
			)
		return jsonify(error_response), error_response['error']['status']
		
	except Exception as e:
		print(f"[ERROR] Unexpected error: {str(e)}")
		error_response = ResponseFormatter.format_error(
			f'Lỗi không mong muốn: {str(e)}',
			'INTERNAL_ERROR',
			500
		)
		return jsonify(error_response), 500


@app.route('/api/weather/forecast', methods=['POST'])
def get_forecast_weather():
	"""
	Get 7-day forecast by location or GPS coordinates
	Request body: { location: string, days: number } OR { lat: number, lon: number, days: number }
	Returns Vietnamese-translated forecast data
	"""
	print(f"[DEBUG] Received request to /api/weather/forecast")
	
	if not request.is_json:
		error_response = ResponseFormatter.format_error(
			'Content-Type phải là application/json',
			'INVALID_CONTENT_TYPE'
		)
		return jsonify(error_response), 400
	
	data = request.get_json()
	print(f"[DEBUG] Request data: {data}")
	
	# Sanitize input
	data = InputValidator.sanitize_input(data)
	
	# Validate location request
	is_valid, error_msg, cleaned_data = InputValidator.validate_location_request(data)
	if not is_valid:
		error_response = ResponseFormatter.format_error(error_msg, 'VALIDATION_ERROR')
		return jsonify(error_response), 400
	
	# Get days parameter (default to 7)
	days = cleaned_data.get('days', 7)
	
	# Build query
	if 'location' in cleaned_data:
		query = cleaned_data['location']
		print(f"[DEBUG] Query by location: {query}")
	else:
		query = f"{cleaned_data['lat']},{cleaned_data['lon']}"
		print(f"[DEBUG] Query by coordinates: {query}")
	
	params = {
		'key': WEATHER_API_KEY,
		'q': query,
		'days': days,
		'aqi': 'yes',
		'alerts': 'yes'
	}
	
	try:
		print(f"[DEBUG] Calling WeatherAPI forecast with params: {params}")
		resp = requests.get(WEATHER_API_FORECAST_URL, params=params, timeout=10)
		resp.raise_for_status()
		print(f"[DEBUG] WeatherAPI forecast response successful")
		
		weather_data = resp.json()
		
		# Add AQI category if air quality data exists
		if weather_data.get('current', {}).get('air_quality'):
			air_quality = weather_data['current']['air_quality']
			weather_data['current']['air_quality'] = add_aqi_category(air_quality)
		
		# Translate to Vietnamese
		weather_data = WeatherTranslator.translate_forecast(weather_data)
		weather_data = WeatherTranslator.translate_alerts(weather_data)
		
		# Format response
		formatted_data = ResponseFormatter.format_forecast(weather_data)
		success_response = ResponseFormatter.format_success(
			formatted_data,
			f'Lấy dự báo {days} ngày thành công'
		)
		
		return jsonify(success_response), 200
		
	except requests.exceptions.HTTPError as e:
		print(f"[ERROR] WeatherAPI HTTP error: {e}, Status: {resp.status_code}")
		if resp.status_code == 400:
			error_response = ResponseFormatter.format_error(
				'Địa điểm hoặc tọa độ không hợp lệ',
				'INVALID_LOCATION',
				400
			)
		elif resp.status_code == 401 or resp.status_code == 403:
			error_response = ResponseFormatter.format_error(
				'API key không hợp lệ hoặc đã hết hạn',
				'API_KEY_ERROR',
				500
			)
		else:
			error_response = ResponseFormatter.format_error(
				f'Lỗi API: {str(e)}',
				'API_ERROR',
				500
			)
		return jsonify(error_response), error_response['error']['status']
		
	except Exception as e:
		print(f"[ERROR] Unexpected error: {str(e)}")
		error_response = ResponseFormatter.format_error(
			f'Lỗi không mong muốn: {str(e)}',
			'INTERNAL_ERROR',
			500
		)
		return jsonify(error_response), 500


@app.route('/api/weather/alerts', methods=['POST'])
def get_weather_alerts():
	"""
	Get weather alerts and air quality warnings
	Request body: { location: string } OR { lat: number, lon: number }
	Returns Vietnamese-translated alerts and AQI data
	"""
	print(f"[DEBUG] Received request to /api/weather/alerts")
	
	if not request.is_json:
		error_response = ResponseFormatter.format_error(
			'Content-Type phải là application/json',
			'INVALID_CONTENT_TYPE'
		)
		return jsonify(error_response), 400
	
	data = request.get_json()
	print(f"[DEBUG] Request data: {data}")
	
	# Sanitize input
	data = InputValidator.sanitize_input(data)
	
	# Validate location request
	is_valid, error_msg, cleaned_data = InputValidator.validate_location_request(data)
	if not is_valid:
		error_response = ResponseFormatter.format_error(error_msg, 'VALIDATION_ERROR')
		return jsonify(error_response), 400
	
	# Build query
	if 'location' in cleaned_data:
		query = cleaned_data['location']
		print(f"[DEBUG] Query by location: {query}")
	else:
		query = f"{cleaned_data['lat']},{cleaned_data['lon']}"
		print(f"[DEBUG] Query by coordinates: {query}")
	
	params = {
		'key': WEATHER_API_KEY,
		'q': query,
		'days': 1,
		'aqi': 'yes',
		'alerts': 'yes'
	}
	
	try:
		print(f"[DEBUG] Calling WeatherAPI alerts with params: {params}")
		resp = requests.get(WEATHER_API_FORECAST_URL, params=params, timeout=10)
		resp.raise_for_status()
		print(f"[DEBUG] WeatherAPI alerts response successful")
		
		weather_data = resp.json()
		
		# Add AQI category if air quality data exists
		if weather_data.get('current', {}).get('air_quality'):
			air_quality = weather_data['current']['air_quality']
			weather_data['current']['air_quality'] = add_aqi_category(air_quality)
		
		# Translate to Vietnamese
		weather_data = WeatherTranslator.translate_alerts(weather_data)
		
		# Format response
		formatted_data = ResponseFormatter.format_alerts(weather_data)
		
		# Check if there are any warnings
		has_warnings = bool(formatted_data.get('alerts', {}).get('alert', []))
		aqi_us = formatted_data.get('air_quality', {}).get('aqi_us', 0)
		if aqi_us > 100:
			has_warnings = True
		
		formatted_data['has_warnings'] = has_warnings
		
		success_response = ResponseFormatter.format_success(
			formatted_data,
			'Lấy cảnh báo thời tiết thành công'
		)
		
		return jsonify(success_response), 200
		
	except requests.exceptions.HTTPError as e:
		print(f"[ERROR] WeatherAPI HTTP error: {e}, Status: {resp.status_code}")
		if resp.status_code == 400:
			error_response = ResponseFormatter.format_error(
				'Địa điểm hoặc tọa độ không hợp lệ',
				'INVALID_LOCATION',
				400
			)
		elif resp.status_code == 401 or resp.status_code == 403:
			error_response = ResponseFormatter.format_error(
				'API key không hợp lệ hoặc đã hết hạn',
				'API_KEY_ERROR',
				500
			)
		else:
			error_response = ResponseFormatter.format_error(
				f'Lỗi API: {str(e)}',
				'API_ERROR',
				500
			)
		return jsonify(error_response), error_response['error']['status']
		
	except Exception as e:
		print(f"[ERROR] Unexpected error: {str(e)}")
		error_response = ResponseFormatter.format_error(
			f'Lỗi không mong muốn: {str(e)}',
			'INTERNAL_ERROR',
			500
		)
		return jsonify(error_response), 500

@app.route('/api/weather/search', methods=['GET'])
def search_cities():
	"""
	Search for cities (autocomplete) using WeatherAPI
	Query parameter: q (search query)
	Returns list of matching cities with country and region info
	"""
	print(f"[DEBUG] Received request to /api/weather/search")
	
	query = request.args.get('q', '').strip()
	
	if not query:
		error_response = ResponseFormatter.format_error(
			'Cần cung cấp tham số tìm kiếm "q"',
			'MISSING_QUERY',
			400
		)
		return jsonify(error_response), 400
	
	if len(query) < 2:
		error_response = ResponseFormatter.format_error(
			'Truy vấn tìm kiếm phải có ít nhất 2 ký tự',
			'QUERY_TOO_SHORT',
			400
		)
		return jsonify(error_response), 400
	
	# Sanitize input
	query = InputValidator.sanitize_input(query)
	
	try:
		print(f"[DEBUG] Original query: {query}")
		
		# Check if Vietnamese city query and normalize
		search_queries = []
		if VietnameseCityNormalizer.is_vietnamese_city_query(query):
			print(f"[DEBUG] Detected Vietnamese city query")
			normalized_queries = VietnameseCityNormalizer.normalize_city_name(query)
			search_queries = normalized_queries
			print(f"[DEBUG] Normalized queries: {search_queries}")
		else:
			search_queries = [query]
		
		all_results = []
		seen_ids = set()
		
		# Try each normalized query
		for search_query in search_queries:
			print(f"[DEBUG] Searching with query: {search_query}")
			
			# Use WeatherAPI search endpoint
			params = {
				'key': WEATHER_API_KEY,
				'q': search_query
			}
			
			resp = requests.get(WEATHER_API_SEARCH_URL, params=params, timeout=10)
			resp.raise_for_status()
			
			search_results = resp.json()
			print(f"[DEBUG] WeatherAPI found {len(search_results)} results for '{search_query}'")
			
			# Add unique results
			for result in search_results:
				result_id = result.get('id')
				if result_id not in seen_ids:
					seen_ids.add(result_id)
					all_results.append(result)
			
			# Stop if we have enough results
			if len(all_results) >= 10:
				break
		
		# Format results for frontend
		formatted_results = []
		for result in all_results[:10]:  # Limit to 10 results
			formatted_results.append({
				'id': result.get('id'),
				'name': result.get('name'),
				'region': result.get('region'),
				'country': result.get('country'),
				'lat': result.get('lat'),
				'lon': result.get('lon'),
				'url': result.get('url'),
				# Create display label
				'label': f"{result.get('name')}, {result.get('region')}, {result.get('country')}" if result.get('region') else f"{result.get('name')}, {result.get('country')}"
			})
		
		success_response = ResponseFormatter.format_success(
			formatted_results,
			f'Tìm thấy {len(formatted_results)} kết quả'
		)
		
		return jsonify(success_response), 200
		
	except requests.exceptions.HTTPError as e:
		print(f"[ERROR] HTTP error during city search: {e}")
		error_response = ResponseFormatter.format_error(
			'Không thể tìm kiếm thành phố. Vui lòng thử lại sau.',
			'SEARCH_ERROR',
			500
		)
		return jsonify(error_response), 500
		
	except requests.exceptions.Timeout:
		print(f"[ERROR] Request timeout during city search")
		error_response = ResponseFormatter.format_error(
			'Yêu cầu tìm kiếm quá thời gian. Vui lòng thử lại.',
			'TIMEOUT_ERROR',
			504
		)
		return jsonify(error_response), 504
		
	except Exception as e:
		print(f"[ERROR] Unexpected error: {str(e)}")
		error_response = ResponseFormatter.format_error(
			f'Lỗi không mong muốn: {str(e)}',
			'INTERNAL_ERROR',
			500
		)
		return jsonify(error_response), 500

# ============================================================================
# ENHANCED API ENDPOINTS
# ============================================================================

@app.route('/api/weather/enhanced-current', methods=['POST'])
def get_enhanced_current_weather():
	"""
	Get enhanced current weather with comprehensive recommendations and insights
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
		'key': WEATHER_API_KEY,
		'q': query,
		'days': 1,  # Need forecast for astronomy data
		'aqi': 'yes',
		'alerts': 'yes'
	}
	
	try:
		resp = requests.get(WEATHER_API_FORECAST_URL, params=params, timeout=10)
		resp.raise_for_status()
		
		weather_data = resp.json()
		
		# Translate to Vietnamese
		weather_data = WeatherTranslator.translate_current_weather(weather_data)
		weather_data = WeatherTranslator.translate_forecast(weather_data)
		
		# Enhance the data
		enhanced_data = _enhance_current_weather_full(weather_data)
		
		# Format the enhanced response
		current_weather = enhanced_data.get('current', {})
		
		# Ensure condition data is properly formatted
		if 'condition' in current_weather and current_weather['condition']:
			condition = current_weather['condition']
			if isinstance(condition, dict) and 'code' not in condition:
				# If condition doesn't have code, try to extract from original data
				original_condition = weather_data.get('current', {}).get('condition', {})
				condition['code'] = original_condition.get('code', 1000)
				current_weather['condition'] = condition
		
		formatted_data = {
			'location': ResponseFormatter._format_location(enhanced_data.get('location', {})),
			'current': ResponseFormatter._format_current(current_weather),
			'astronomy': enhanced_data.get('astronomy', {}),
			'environmental': enhanced_data.get('environmental', {}),
			'recommendations': enhanced_data.get('recommendations', {}),
			'air_quality_enhanced': enhanced_data.get('air_quality_enhanced', {}),
			'insights': enhanced_data.get('insights', {})
		}
		
		success_response = ResponseFormatter.format_success(
			formatted_data,
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
	Get enhanced forecast with hourly data and comprehensive recommendations
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
		'key': WEATHER_API_KEY,
		'q': query,
		'days': days,
		'aqi': 'yes',
		'alerts': 'yes'
	}
	
	try:
		resp = requests.get(WEATHER_API_FORECAST_URL, params=params, timeout=10)
		resp.raise_for_status()
		
		weather_data = resp.json()
		
		# Translate to Vietnamese
		weather_data = WeatherTranslator.translate_forecast(weather_data)
		weather_data = WeatherTranslator.translate_alerts(weather_data)
		
		# Enhance current weather data
		enhanced_current = _enhance_current_weather_full(weather_data)
		
		# Format basic forecast data
		formatted_forecast = ResponseFormatter.format_forecast(weather_data)
		
		# Add hourly data if available
		forecast_days = weather_data.get('forecast', {}).get('forecastday', [])
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
						'text_vi': hour.get('condition', {}).get('text_vi', ''),
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
			'current_enhanced': {
				'location': ResponseFormatter._format_location(enhanced_current.get('location', {})),
				'current': ResponseFormatter._format_current(enhanced_current.get('current', {})),
				'astronomy': enhanced_current.get('astronomy', {}),
				'environmental': enhanced_current.get('environmental', {}),
				'recommendations': enhanced_current.get('recommendations', {}),
				'air_quality_enhanced': enhanced_current.get('air_quality_enhanced', {}),
				'insights': enhanced_current.get('insights', {})
			}
		}
		
		success_response = ResponseFormatter.format_success(
			enhanced_forecast,
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

# ============================================================================
# ADDITIONAL WEATHERAPI ENDPOINTS
# ============================================================================

@app.route('/api/weather/astronomy', methods=['POST'])
def get_astronomy():
	"""
	Get astronomy data (sunrise, sunset, moon phases) for a specific location and date
	"""
	print(f"[DEBUG] Received request to /api/weather/astronomy")
	
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

	# Get date parameter (optional, defaults to today)
	date = data.get('date', '')  # Format: YYYY-MM-DD

	params = {
		'key': WEATHER_API_KEY,
		'q': query
	}
	
	if date:
		params['dt'] = date

	try:
		print(f"[DEBUG] Calling WeatherAPI astronomy with params: {params}")
		resp = requests.get(WEATHER_API_ASTRONOMY_URL, params=params, timeout=10)
		resp.raise_for_status()
		print(f"[DEBUG] WeatherAPI astronomy response successful")

		astronomy_data = resp.json()
		
		# Translate and format response
		formatted_data = {
			'location': ResponseFormatter._format_location(astronomy_data.get('location', {})),
			'astronomy': ResponseFormatter._format_astronomy(astronomy_data.get('astronomy', {}))
		}

		success_response = ResponseFormatter.format_success(
			formatted_data,
			'Dữ liệu thiên văn học lấy thành công'
		)
		
		return jsonify(success_response), 200

	except requests.exceptions.HTTPError as e:
		print(f"[ERROR] WeatherAPI astronomy HTTP error: {e}")
		if resp.status_code == 400:
			error_response = ResponseFormatter.format_error(
				'Địa điểm hoặc tọa độ không hợp lệ',
				'INVALID_LOCATION',
				400
			)
			return jsonify(error_response), 400
		elif resp.status_code == 401:
			error_response = ResponseFormatter.format_error(
				'API key không hợp lệ',
				'INVALID_API_KEY',
				401
			)
			return jsonify(error_response), 401
		elif resp.status_code == 403:
			error_response = ResponseFormatter.format_error(
				'API key đã vượt quá giới hạn',
				'API_LIMIT_EXCEEDED',
				403
			)
			return jsonify(error_response), 403
		else:
			error_response = ResponseFormatter.format_error(
				f'Lỗi WeatherAPI: {str(e)}',
				'WEATHER_API_ERROR',
				resp.status_code
			)
			return jsonify(error_response), resp.status_code

	except requests.exceptions.Timeout:
		print(f"[ERROR] WeatherAPI astronomy timeout")
		error_response = ResponseFormatter.format_error(
			'Request timeout. Vui lòng thử lại',
			'REQUEST_TIMEOUT',
			504
		)
		return jsonify(error_response), 504

	except Exception as e:
		print(f"[ERROR] Error in astronomy: {str(e)}")
		error_response = ResponseFormatter.format_error(
			f'Lỗi không mong muốn: {str(e)}',
			'INTERNAL_ERROR',
			500
		)
		return jsonify(error_response), 500

@app.route('/api/weather/history', methods=['POST'])
def get_weather_history():
	"""
	Get historical weather data for a specific location and date range
	"""
	print(f"[DEBUG] Received request to /api/weather/history")
	
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

	# Get date parameter (required for history)
	date = data.get('date')
	if not date:
		error_response = ResponseFormatter.format_error(
			'Thiếu tham số date (YYYY-MM-DD)',
			'MISSING_DATE_PARAMETER'
		)
		return jsonify(error_response), 400

	params = {
		'key': WEATHER_API_KEY,
		'q': query,
		'dt': date,
		'aqi': 'yes'
	}

	# Optional end date for date range
	end_date = data.get('end_date')
	if end_date:
		params['end_dt'] = end_date

	try:
		print(f"[DEBUG] Calling WeatherAPI history with params: {params}")
		resp = requests.get(WEATHER_API_HISTORY_URL, params=params, timeout=10)
		resp.raise_for_status()
		print(f"[DEBUG] WeatherAPI history response successful")

		history_data = resp.json()
		
		# Translate to Vietnamese
		history_data = WeatherTranslator.translate_forecast(history_data)
		
		# Format response
		formatted_data = {
			'location': ResponseFormatter._format_location(history_data.get('location', {})),
			'forecast': ResponseFormatter._format_forecast(history_data.get('forecast', {}))
		}

		success_response = ResponseFormatter.format_success(
			formatted_data,
			'Dữ liệu lịch sử thời tiết lấy thành công'
		)
		
		return jsonify(success_response), 200

	except requests.exceptions.HTTPError as e:
		print(f"[ERROR] WeatherAPI history HTTP error: {e}")
		if resp.status_code == 400:
			error_response = ResponseFormatter.format_error(
				'Địa điểm, tọa độ hoặc ngày không hợp lệ',
				'INVALID_LOCATION_OR_DATE',
				400
			)
			return jsonify(error_response), 400
		elif resp.status_code == 401:
			error_response = ResponseFormatter.format_error(
				'API key không hợp lệ',
				'INVALID_API_KEY',
				401
			)
			return jsonify(error_response), 401
		elif resp.status_code == 403:
			error_response = ResponseFormatter.format_error(
				'API key đã vượt quá giới hạn hoặc không có quyền truy cập dữ liệu lịch sử',
				'API_LIMIT_EXCEEDED',
				403
			)
			return jsonify(error_response), 403
		else:
			error_response = ResponseFormatter.format_error(
				f'Lỗi WeatherAPI: {str(e)}',
				'WEATHER_API_ERROR',
				resp.status_code
			)
			return jsonify(error_response), resp.status_code

	except requests.exceptions.Timeout:
		print(f"[ERROR] WeatherAPI history timeout")
		error_response = ResponseFormatter.format_error(
			'Request timeout. Vui lòng thử lại',
			'REQUEST_TIMEOUT',
			504
		)
		return jsonify(error_response), 504

	except Exception as e:
		print(f"[ERROR] Error in history: {str(e)}")
		error_response = ResponseFormatter.format_error(
			f'Lỗi không mong muốn: {str(e)}',
			'INTERNAL_ERROR',
			500
		)
		return jsonify(error_response), 500

@app.route('/api/weather/marine', methods=['POST'])
def get_marine_weather():
	"""
	Get marine/ocean weather data for coastal and maritime activities
	"""
	print(f"[DEBUG] Received request to /api/weather/marine")
	
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

	# Get days parameter for marine forecast (default 3 days, max 7)
	days = min(int(data.get('days', 3)), 7)

	params = {
		'key': WEATHER_API_KEY,
		'q': query,
		'days': days
	}

	try:
		print(f"[DEBUG] Calling WeatherAPI marine with params: {params}")
		resp = requests.get(WEATHER_API_MARINE_URL, params=params, timeout=10)
		resp.raise_for_status()
		print(f"[DEBUG] WeatherAPI marine response successful")

		marine_data = resp.json()
		
		# Translate to Vietnamese if needed
		marine_data = WeatherTranslator.translate_forecast(marine_data)
		
		# Format response using forecast formatter (marine data has similar structure)
		formatted_data = ResponseFormatter.format_forecast(marine_data)

		success_response = ResponseFormatter.format_success(
			formatted_data,
			'Dữ liệu thời tiết biển lấy thành công'
		)
		
		return jsonify(success_response), 200

	except requests.exceptions.HTTPError as e:
		print(f"[ERROR] WeatherAPI marine HTTP error: {e}")
		if resp.status_code == 400:
			error_response = ResponseFormatter.format_error(
				'Địa điểm hoặc tọa độ không hợp lệ cho dữ liệu thời tiết biển',
				'INVALID_LOCATION',
				400
			)
			return jsonify(error_response), 400
		elif resp.status_code == 401:
			error_response = ResponseFormatter.format_error(
				'API key không hợp lệ',
				'INVALID_API_KEY',
				401
			)
			return jsonify(error_response), 401
		elif resp.status_code == 403:
			error_response = ResponseFormatter.format_error(
				'API key đã vượt quá giới hạn hoặc không có quyền truy cập dữ liệu thời tiết biển',
				'API_LIMIT_EXCEEDED',
				403
			)
			return jsonify(error_response), 403
		else:
			error_response = ResponseFormatter.format_error(
				f'Lỗi WeatherAPI: {str(e)}',
				'WEATHER_API_ERROR',
				resp.status_code
			)
			return jsonify(error_response), resp.status_code

	except requests.exceptions.Timeout:
		print(f"[ERROR] WeatherAPI marine timeout")
		error_response = ResponseFormatter.format_error(
			'Request timeout. Vui lòng thử lại',
			'REQUEST_TIMEOUT',
			504
		)
		return jsonify(error_response), 504

	except Exception as e:
		print(f"[ERROR] Error in marine weather: {str(e)}")
		error_response = ResponseFormatter.format_error(
			f'Lỗi không mong muốn: {str(e)}',
			'INTERNAL_ERROR',
			500
		)
		return jsonify(error_response), 500

# Sports Events endpoint
@app.route('/api/weather/sports', methods=['POST'])
def get_sports_events():
	"""Get upcoming sports events data"""
	try:
		request_data = request.get_json() or {}
		location = request_data.get('location', '').strip()
		language = request_data.get('language', 'vi')
		
		if not location:
			print(f"[ERROR] No location provided for sports events request")
			error_response = ResponseFormatter.format_error(
				'Vui lòng cung cấp thông tin địa điểm',
				'MISSING_LOCATION',
				400
			)
			return jsonify(error_response), 400
		
		# Validate location
		is_valid, error_msg = InputValidator.validate_location_string(location)
		if not is_valid:
			print(f"[ERROR] Invalid location for sports events: {location} - {error_msg}")
			error_response = ResponseFormatter.format_error(
				error_msg or 'Địa điểm không hợp lệ',
				'INVALID_LOCATION',
				400
			)
			return jsonify(error_response), 400
		
		print(f"[INFO] Getting sports events for location: {location}")
		
		response = requests.get(
			WEATHER_API_SPORTS_URL,
			params={'key': WEATHER_API_KEY, 'q': location},
			timeout=10
		)
		
		if response.status_code == 400:
			print(f"[ERROR] Bad request for sports events: {response.text}")
			error_response = ResponseFormatter.format_error(
				'Địa điểm hoặc thông số không hợp lệ',
				'INVALID_LOCATION',
				400
			)
			return jsonify(error_response), 400
		
		if response.status_code == 401:
			print(f"[ERROR] Unauthorized API request for sports events")
			error_response = ResponseFormatter.format_error(
				'Lỗi xác thực API',
				'API_AUTH_ERROR',
				401
			)
			return jsonify(error_response), 401
		
		if response.status_code == 403:
			print(f"[ERROR] Forbidden API request for sports events")
			error_response = ResponseFormatter.format_error(
				'Không có quyền truy cập API',
				'API_ACCESS_DENIED',
				403
			)
			return jsonify(error_response), 403
		
		if response.status_code != 200:
			print(f"[ERROR] API request failed for sports events: {response.status_code}")
			error_response = ResponseFormatter.format_error(
				'Không thể lấy dữ liệu sự kiện thể thao',
				'SPORTS_EVENTS_FAILED',
				response.status_code
			)
			return jsonify(error_response), response.status_code
		
		sports_data = response.json()
		print(f"[INFO] Sports events data retrieved successfully")
		
		# Sports API returns a different structure - array of events
		# Format the sports events data directly (no need for forecast formatting)
		formatted_data = sports_data
		
		success_response = ResponseFormatter.format_success(
			formatted_data,
			'Dữ liệu sự kiện thể thao lấy thành công'
		)
		return jsonify(success_response), 200
		
	except requests.Timeout:
		print(f"[ERROR] API request timeout for sports events")
		error_response = ResponseFormatter.format_error(
			'Yêu cầu API bị timeout',
			'API_TIMEOUT',
			504
		)
		return jsonify(error_response), 504

	except Exception as e:
		print(f"[ERROR] Error in sports events: {str(e)}")
		error_response = ResponseFormatter.format_error(
			f'Lỗi không mong muốn: {str(e)}',
			'INTERNAL_ERROR',
			500
		)
		return jsonify(error_response), 500

# Time Zone endpoint
@app.route('/api/weather/timezone', methods=['POST'])
def get_timezone():
	"""Get timezone information for a location"""
	try:
		request_data = request.get_json() or {}
		location = request_data.get('location', '').strip()
		language = request_data.get('language', 'vi')
		
		if not location:
			print(f"[ERROR] No location provided for timezone request")
			error_response = ResponseFormatter.format_error(
				'Vui lòng cung cấp thông tin địa điểm',
				'MISSING_LOCATION',
				400
			)
			return jsonify(error_response), 400
		
		# Validate location
		is_valid, error_msg = InputValidator.validate_location_string(location)
		if not is_valid:
			print(f"[ERROR] Invalid location for timezone: {location} - {error_msg}")
			error_response = ResponseFormatter.format_error(
				error_msg or 'Địa điểm không hợp lệ',
				'INVALID_LOCATION',
				400
			)
			return jsonify(error_response), 400
		
		print(f"[INFO] Getting timezone for location: {location}")
		
		response = requests.get(
			WEATHER_API_TIMEZONE_URL,
			params={'key': WEATHER_API_KEY, 'q': location},
			timeout=10
		)
		
		if response.status_code == 400:
			print(f"[ERROR] Bad request for timezone: {response.text}")
			error_response = ResponseFormatter.format_error(
				'Địa điểm hoặc thông số không hợp lệ',
				'INVALID_LOCATION',
				400
			)
			return jsonify(error_response), 400
		
		if response.status_code == 401:
			print(f"[ERROR] Unauthorized API request for timezone")
			error_response = ResponseFormatter.format_error(
				'Lỗi xác thực API',
				'API_AUTH_ERROR',
				401
			)
			return jsonify(error_response), 401
		
		if response.status_code == 403:
			print(f"[ERROR] Forbidden API request for timezone")
			error_response = ResponseFormatter.format_error(
				'Không có quyền truy cập API',
				'API_ACCESS_DENIED',
				403
			)
			return jsonify(error_response), 403
		
		if response.status_code != 200:
			print(f"[ERROR] API request failed for timezone: {response.status_code}")
			error_response = ResponseFormatter.format_error(
				'Không thể lấy thông tin múi giờ',
				'TIMEZONE_FAILED',
				response.status_code
			)
			return jsonify(error_response), response.status_code
		
		timezone_data = response.json()
		print(f"[INFO] Timezone data retrieved successfully")
		
		# Format the timezone data (use location formatting)
		formatted_data = ResponseFormatter._format_location(timezone_data.get('location', {}))
		
		success_response = ResponseFormatter.format_success(
			formatted_data,
			'Thông tin múi giờ lấy thành công'
		)
		return jsonify(success_response), 200
		
	except requests.Timeout:
		print(f"[ERROR] API request timeout for timezone")
		error_response = ResponseFormatter.format_error(
			'Yêu cầu API bị timeout',
			'API_TIMEOUT',
			504
		)
		return jsonify(error_response), 504

	except Exception as e:
		print(f"[ERROR] Error in timezone: {str(e)}")
		error_response = ResponseFormatter.format_error(
			f'Lỗi không mong muốn: {str(e)}',
			'INTERNAL_ERROR',
			500
		)
		return jsonify(error_response), 500

# Future Weather endpoint  
@app.route('/api/weather/future', methods=['POST'])
def get_future_weather():
	"""Get future weather forecast data (beyond 14 days)"""
	try:
		request_data = request.get_json() or {}
		location = request_data.get('location', '').strip()
		date = request_data.get('date', '').strip()
		language = request_data.get('language', 'vi')
		
		if not location:
			print(f"[ERROR] No location provided for future weather request")
			error_response = ResponseFormatter.format_error(
				'Vui lòng cung cấp thông tin địa điểm',
				'MISSING_LOCATION',
				400
			)
			return jsonify(error_response), 400
			
		if not date:
			print(f"[ERROR] No date provided for future weather request")
			error_response = ResponseFormatter.format_error(
				'Vui lòng cung cấp ngày cần dự báo',
				'MISSING_DATE',
				400
			)
			return jsonify(error_response), 400
		
		# Validate location
		is_valid, error_msg = InputValidator.validate_location_string(location)
		if not is_valid:
			print(f"[ERROR] Invalid location for future weather: {location} - {error_msg}")
			error_response = ResponseFormatter.format_error(
				error_msg or 'Địa điểm không hợp lệ',
				'INVALID_LOCATION',
				400
			)
			return jsonify(error_response), 400
		
		print(f"[INFO] Getting future weather for location: {location}, date: {date}")
		
		response = requests.get(
			WEATHER_API_FUTURE_URL,
			params={'key': WEATHER_API_KEY, 'q': location, 'dt': date},
			timeout=10
		)
		
		if response.status_code == 400:
			print(f"[ERROR] Bad request for future weather: {response.text}")
			error_response = ResponseFormatter.format_error(
				'Địa điểm, ngày hoặc thông số không hợp lệ',
				'INVALID_LOCATION_OR_DATE',
				400
			)
			return jsonify(error_response), 400
		
		if response.status_code == 401:
			print(f"[ERROR] Unauthorized API request for future weather")
			error_response = ResponseFormatter.format_error(
				'Lỗi xác thực API',
				'API_AUTH_ERROR',
				401
			)
			return jsonify(error_response), 401
		
		if response.status_code == 403:
			print(f"[ERROR] Forbidden API request for future weather")
			error_response = ResponseFormatter.format_error(
				'Không có quyền truy cập API',
				'API_ACCESS_DENIED',
				403
			)
			return jsonify(error_response), 403
		
		if response.status_code != 200:
			print(f"[ERROR] API request failed for future weather: {response.status_code}")
			error_response = ResponseFormatter.format_error(
				'Không thể lấy dữ liệu thời tiết tương lai',
				'FUTURE_WEATHER_FAILED',
				response.status_code
			)
			return jsonify(error_response), response.status_code
		
		future_data = response.json()
		print(f"[INFO] Future weather data retrieved successfully")
		
		# Format the future data using ResponseFormatter
		formatted_data = ResponseFormatter.format_forecast(future_data)
		
		# Translate Vietnamese if needed
		if language == 'vi':
			formatted_data = WeatherTranslator.translate_forecast(formatted_data)
		
		success_response = ResponseFormatter.format_success(
			formatted_data,
			'Dữ liệu thời tiết tương lai lấy thành công'
		)
		return jsonify(success_response), 200
		
	except requests.Timeout:
		print(f"[ERROR] API request timeout for future weather")
		error_response = ResponseFormatter.format_error(
			'Yêu cầu API bị timeout',
			'API_TIMEOUT',
			504
		)
		return jsonify(error_response), 504

	except Exception as e:
		print(f"[ERROR] Error in future weather: {str(e)}")
		error_response = ResponseFormatter.format_error(
			f'Lỗi không mong muốn: {str(e)}',
			'INTERNAL_ERROR',
			500
		)
		return jsonify(error_response), 500

@app.route('/api/health', methods=['GET'])
def health_check():
	"""Health check endpoint"""
	return jsonify({
		'status': 'ok', 
		'message': 'Weather API is running',
		'weatherapi_configured': WEATHER_API_KEY != 'YOUR_WEATHERAPI_KEY'
	}), 200

if __name__ == '__main__':
	# Use environment variables for server configuration
	print(f"\n{'='*60}")
	print(f"Starting Flask server...")
	print(f"Host: {FLASK_HOST}:{FLASK_PORT}")
	print(f"Debug Mode: {FLASK_DEBUG}")
	print(f"{'='*60}\n")
	
	app.run(host=FLASK_HOST, port=FLASK_PORT, debug=FLASK_DEBUG)
