# Chức năng: Lấy cảnh báo thời tiết, AQI (Air Quality Index), và các thông báo
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
	"""Validate latitude and longitude values"""
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

def get_aqi_category(aqi_us):
	"""Get AQI category and health recommendation"""
	if aqi_us <= 50:
		return {
			'category': 'Good',
			'color': 'green',
			'description': 'Chất lượng không khí tốt',
			'health_advice': 'An toàn cho sức khỏe'
		}
	elif aqi_us <= 100:
		return {
			'category': 'Moderate',
			'color': 'yellow',
			'description': 'Chất lượng không khí trung bình',
			'health_advice': 'Chấp nhận được cho hầu hết mọi người'
		}
	elif aqi_us <= 150:
		return {
			'category': 'Unhealthy for Sensitive Groups',
			'color': 'orange',
			'description': 'Không lành mạnh cho nhóm nhạy cảm',
			'health_advice': 'Người nhạy cảm nên hạn chế hoạt động ngoài trời'
		}
	elif aqi_us <= 200:
		return {
			'category': 'Unhealthy',
			'color': 'red',
			'description': 'Không lành mạnh',
			'health_advice': 'Mọi người nên hạn chế hoạt động ngoài trời'
		}
	elif aqi_us <= 300:
		return {
			'category': 'Very Unhealthy',
			'color': 'purple',
			'description': 'Rất không lành mạnh',
			'health_advice': 'Tránh hoạt động ngoài trời'
		}
	else:
		return {
			'category': 'Hazardous',
			'color': 'maroon',
			'description': 'Nguy hiểm',
			'health_advice': 'Ở trong nhà và đóng cửa sổ'
		}

@app.route('/api/weather_warnings', methods=['POST'])
def get_weather_warnings():
	"""
	Lấy cảnh báo thời tiết, AQI và các thông báo dựa trên:
	1. GPS browser người dùng (lat, lon)
	2. Tên địa điểm (thành phố, quốc gia, v.v.)
	
	Request body:
	- location: tên địa điểm (string)
	- lat: vĩ độ (number)
	- lon: kinh độ (number)
	- days: số ngày dự báo (1-3 cho alerts, mặc định 1)
	"""
	# Validate request has JSON data
	if not request.is_json:
		return jsonify({'error': 'Content-Type phải là application/json'}), 400
	
	data = request.get_json()
	
	# Validate input data
	if not data:
		return jsonify({'error': 'Dữ liệu request không hợp lệ'}), 400
	
	# Get days parameter (default to 1 for alerts)
	days = data.get('days', 1)
	try:
		days = int(days)
		if not (1 <= days <= 3):
			days = 1
	except (ValueError, TypeError):
		days = 1
	
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
	
	# Prepare API request with AQI and alerts enabled
	params = {
		'key': WEATHER_API_KEY,
		'q': query,
		'days': days,
		'aqi': 'yes',  # Enable Air Quality Index
		'alerts': 'yes'  # Enable weather alerts
	}
	
	try:
		resp = requests.get(WEATHER_API_FORECAST_URL, params=params, timeout=10)
		resp.raise_for_status()
		
		weather_data = resp.json()
		
		# Extract location info
		location_info = weather_data.get('location', {})
		
		# Extract current air quality data
		current = weather_data.get('current', {})
		air_quality = current.get('air_quality', {})
		
		# Process AQI data
		aqi_data = None
		if air_quality:
			aqi_us = air_quality.get('us-epa-index', 0)
			aqi_category = get_aqi_category(aqi_us)
			
			aqi_data = {
				'us_epa_index': aqi_us,
				'gb_defra_index': air_quality.get('gb-defra-index'),
				'category': aqi_category,
				'pollutants': {
					'co': air_quality.get('co'),  # Carbon Monoxide (μg/m3)
					'no2': air_quality.get('no2'),  # Nitrogen dioxide (μg/m3)
					'o3': air_quality.get('o3'),  # Ozone (μg/m3)
					'so2': air_quality.get('so2'),  # Sulphur dioxide (μg/m3)
					'pm2_5': air_quality.get('pm2_5'),  # PM2.5 (μg/m3)
					'pm10': air_quality.get('pm10')  # PM10 (μg/m3)
				}
			}
		
		# Extract weather alerts
		alerts_data = weather_data.get('alerts', {}).get('alert', [])
		
		# Process alerts
		processed_alerts = []
		for alert in alerts_data:
			processed_alerts.append({
				'headline': alert.get('headline'),
				'severity': alert.get('severity'),
				'urgency': alert.get('urgency'),
				'areas': alert.get('areas'),
				'category': alert.get('category'),
				'certainty': alert.get('certainty'),
				'event': alert.get('event'),
				'note': alert.get('note'),
				'effective': alert.get('effective'),
				'expires': alert.get('expires'),
				'description': alert.get('desc'),
				'instruction': alert.get('instruction')
			})
		
		# Build response
		response_data = {
			'success': True,
			'location': {
				'name': location_info.get('name'),
				'region': location_info.get('region'),
				'country': location_info.get('country'),
				'lat': location_info.get('lat'),
				'lon': location_info.get('lon'),
				'localtime': location_info.get('localtime')
			},
			'air_quality': aqi_data,
			'alerts': processed_alerts,
			'alert_count': len(processed_alerts),
			'has_warnings': bool(processed_alerts) or (aqi_data and aqi_data['us_epa_index'] > 100)
		}
		
		return jsonify(response_data), 200
		
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
	app.run(host='0.0.0.0', port=5002, debug=True)
