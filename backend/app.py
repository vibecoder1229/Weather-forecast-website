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
		
		# Format response
		formatted_data = ResponseFormatter.format_current_weather(weather_data)
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
			search_url = 'http://api.weatherapi.com/v1/search.json'
			params = {
				'key': WEATHER_API_KEY,
				'q': search_query
			}
			
			resp = requests.get(search_url, params=params, timeout=10)
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
