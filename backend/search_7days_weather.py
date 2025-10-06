# Chức năng: Dự báo thời tiết 7 ngày
# Hỗ trợ 2 cách tìm kiếm:
# 1. Tìm kiếm theo tọa độ GPS (lat, lon) từ browser
# 2. Tìm kiếm theo tên địa điểm (thành phố, quốc gia, v.v.)

import os
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

# Định nghĩa API keys
WEATHER_API_KEY = os.getenv('WEATHERAPI_KEY', 'YOUR_WEATHERAPI_KEY')
WEATHER_API_FORECAST_URL = 'http://api.weatherapi.com/v1/forecast.json'

def validate_coordinates(lat, lon):
	"""Validate vĩ độ and kinh độ values"""
	try:
		lat_float = float(lat)
		lon_float = float(lon)
		
		if not (-90 <= lat_float <= 90):
			return False, "Latitude phải nằm trong khoảng -90 đến 90"
		if not (-180 <= lon_float <= 180):
			return False, "Longitude phải nằm trong khoảng -180 đến 180"
		
		return True, None
	except (ValueError, TypeError):
		return False, "Latitude và longitude phải là số"

def validate_location(location):
	"""Validate location string"""
	if not location or not isinstance(location, str):
		return False, "Tên địa điểm không hợp lệ"
	
	if len(location.strip()) < 2:
		return False, "Tên địa điểm phải có ít nhất 2 ký tự"
	
	if len(location) > 100:
		return False, "Tên địa điểm quá dài (tối đa 100 ký tự)"
	
	return True, None

def validate_days(days):
	"""Validate number of forecast days"""
	if days is None:
		return 7, None  # Default to 7 days
	
	try:
		days_int = int(days)
		if not (1 <= days_int <= 10):
			return None, "Số ngày dự báo phải từ 1 đến 10"
		return days_int, None
	except (ValueError, TypeError):
		return None, "Số ngày dự báo phải là số nguyên"

@app.route('/api/forecast_weather', methods=['POST'])
def get_forecast_weather():
	"""
	Lấy thông tin dự báo thời tiết 7 ngày dựa trên:
	1. GPS browser người dùng (lat, lon)
	2. Tên địa điểm (thành phố, quốc gia, v.v.)
	
	Request body:
	- location: tên địa điểm (string)
	- lat: vĩ độ (number)
	- lon: kinh độ (number)
	- days: số ngày dự báo (1-10, mặc định 7)
	"""
	# Validate request has JSON data
	if not request.is_json:
		return jsonify({'error': 'Content-Type phải là application/json'}), 400
	
	data = request.get_json()
	
	# Validate input data
	if not data:
		return jsonify({'error': 'Dữ liệu request không hợp lệ'}), 400
	
	# Get and validate days parameter
	days, error = validate_days(data.get('days'))
	if error:
		return jsonify({'error': error}), 400
	
	# Định nghĩa địa điểm
	location = data.get('location')
	
	# Định nghĩa tọa độ GPS
	lat = data.get('lat')
	lon = data.get('lon')
	
	# Determine query parameter and validate
	query = None
	
	if location:
		# Validate location name
		is_valid, error = validate_location(location)
		if not is_valid:
			return jsonify({'error': error}), 400
		query = location.strip()
		
	elif lat is not None and lon is not None:
		# Validate GPS coordinates
		is_valid, error = validate_coordinates(lat, lon)
		if not is_valid:
			return jsonify({'error': error}), 400
		query = f"{lat},{lon}"
		
	else:
		return jsonify({
			'error': 'Kiểm tra lại dữ liệu gửi lên. Cần cung cấp location hoặc (lat và lon).'
		}), 400
	
	# Prepare API request
	params = {
		'key': WEATHER_API_KEY,
		'q': query,
		'days': days,
		'aqi': 'no',
		'alerts': 'yes'
	}
	
	try:
		resp = requests.get(WEATHER_API_FORECAST_URL, params=params, timeout=10)
		resp.raise_for_status()
		
		weather_data = resp.json()
		
		# Return formatted response
		return jsonify({
			'success': True,
			'location': weather_data.get('location'),
			'current': weather_data.get('current'),
			'forecast': weather_data.get('forecast'),
			'alerts': weather_data.get('alerts')
		}), 200
		
	except requests.exceptions.HTTPError as e:
		if resp.status_code == 400:
			return jsonify({'error': 'Địa điểm hoặc tọa độ không hợp lệ'}), 400
		elif resp.status_code == 401:
			return jsonify({'error': 'API key không hợp lệ'}), 500
		elif resp.status_code == 403:
			return jsonify({'error': 'API key đã vượt quá giới hạn'}), 500
		return jsonify({'error': f'Lỗi API: {str(e)}'}), 500
		
	except requests.exceptions.Timeout:
		return jsonify({'error': 'Request timeout. Vui lòng thử lại'}), 504
		
	except requests.exceptions.RequestException as e:
		return jsonify({'error': f'Lỗi kết nối: {str(e)}'}), 503
		
	except Exception as e:
		return jsonify({'error': f'Lỗi server: {str(e)}'}), 500

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5001, debug=True)

# Chức năng: Dự báo thời tiết 7 ngày
# Hỗ trợ 2 cách tìm kiếm:
# 1. Tìm kiếm theo tọa độ GPS (lat, lon) từ browser
# 2. Tìm kiếm theo tên địa điểm (thành phố, quốc gia, v.v.)

import os
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

# Định nghĩa API keys
WEATHER_API_KEY = os.getenv('WEATHERAPI_KEY', 'YOUR_WEATHERAPI_KEY')
WEATHER_API_FORECAST_URL = 'http://api.weatherapi.com/v1/forecast.json'

def validate_coordinates(lat, lon):
	"""Validate vĩ độ and kinh độ values"""
	try:
		lat_float = float(lat)
		lon_float = float(lon)
		
		if not (-90 <= lat_float <= 90):
			return False, "Latitude phải nằm trong khoảng -90 đến 90"
		if not (-180 <= lon_float <= 180):
			return False, "Longitude phải nằm trong khoảng -180 đến 180"
		
		return True, None
	except (ValueError, TypeError):
		return False, "Latitude và longitude phải là số"

def validate_location(location):
	"""Validate location string"""
	if not location or not isinstance(location, str):
		return False, "Tên địa điểm không hợp lệ"
	
	if len(location.strip()) < 2:
		return False, "Tên địa điểm phải có ít nhất 2 ký tự"
	
	if len(location) > 100:
		return False, "Tên địa điểm quá dài (tối đa 100 ký tự)"
	
	return True, None

def validate_days(days):
	"""Validate number of forecast days"""
	if days is None:
		return 7, None  # Default to 7 days
	
	try:
		days_int = int(days)
		if not (1 <= days_int <= 10):
			return None, "Số ngày dự báo phải từ 1 đến 10"
		return days_int, None
	except (ValueError, TypeError):
		return None, "Số ngày dự báo phải là số nguyên"

@app.route('/api/forecast_weather', methods=['POST'])
def get_forecast_weather():
	"""
	Lấy thông tin dự báo thời tiết 7 ngày dựa trên:
	1. GPS browser người dùng (lat, lon)
	2. Tên địa điểm (thành phố, quốc gia, v.v.)
	
	Request body:
	- location: tên địa điểm (string)
	- lat: vĩ độ (number)
	- lon: kinh độ (number)
	- days: số ngày dự báo (1-10, mặc định 7)
	"""
	# Validate request has JSON data
	if not request.is_json:
		return jsonify({'error': 'Content-Type phải là application/json'}), 400
	
	data = request.get_json()
	
	# Validate input data
	if not data:
		return jsonify({'error': 'Dữ liệu request không hợp lệ'}), 400
	
	# Get and validate days parameter
	days, error = validate_days(data.get('days'))
	if error:
		return jsonify({'error': error}), 400
	
	# Định nghĩa địa điểm
	location = data.get('location')
	
	# Định nghĩa tọa độ GPS
	lat = data.get('lat')
	lon = data.get('lon')
	
	# Determine query parameter and validate
	query = None
	
	if location:
		# Validate location name
		is_valid, error = validate_location(location)
		if not is_valid:
			return jsonify({'error': error}), 400
		query = location.strip()
		
	elif lat is not None and lon is not None:
		# Validate GPS coordinates
		is_valid, error = validate_coordinates(lat, lon)
		if not is_valid:
			return jsonify({'error': error}), 400
		query = f"{lat},{lon}"
		
	else:
		return jsonify({
			'error': 'Kiểm tra lại dữ liệu gửi lên. Cần cung cấp location hoặc (lat và lon).'
		}), 400
	
	# Prepare API request
	params = {
		'key': WEATHER_API_KEY,
		'q': query,
		'days': days,
		'aqi': 'no',
		'alerts': 'yes'
	}
	
	try:
		resp = requests.get(WEATHER_API_FORECAST_URL, params=params, timeout=10)
		resp.raise_for_status()
		
		weather_data = resp.json()
		
		# Return formatted response
		return jsonify({
			'success': True,
			'location': weather_data.get('location'),
			'current': weather_data.get('current'),
			'forecast': weather_data.get('forecast'),
			'alerts': weather_data.get('alerts')
		}), 200
		
	except requests.exceptions.HTTPError as e:
		if resp.status_code == 400:
			return jsonify({'error': 'Địa điểm hoặc tọa độ không hợp lệ'}), 400
		elif resp.status_code == 401:
			return jsonify({'error': 'API key không hợp lệ'}), 500
		elif resp.status_code == 403:
			return jsonify({'error': 'API key đã vượt quá giới hạn'}), 500
		return jsonify({'error': f'Lỗi API: {str(e)}'}), 500
		
	except requests.exceptions.Timeout:
		return jsonify({'error': 'Request timeout. Vui lòng thử lại'}), 504
		
	except requests.exceptions.RequestException as e:
		return jsonify({'error': f'Lỗi kết nối: {str(e)}'}), 503
		
	except Exception as e:
		return jsonify({'error': f'Lỗi server: {str(e)}'}), 500

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5001, debug=True)
