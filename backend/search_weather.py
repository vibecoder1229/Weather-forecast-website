# Có 2 chức năng:
# 1. Tìm kiếm thời tiết hiện tại theo tọa độ GPS (lat, lon), lấy từ browser của người dùng khi gửi request
# 2. Tìm kiếm thời tiết hiện tại theo tên địa điểm (thành phố, quốc gia, v.v.)

import os
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

# Định nghĩa API keys
WEATHER_API_KEY = os.getenv('WEATHERAPI_KEY', 'YOUR_WEATHERAPI_KEY')
WEATHER_API_URL = 'http://api.weatherapi.com/v1/current.json'

@app.route('/api/current_weather', methods=['POST'])
def get_current_weather():
	"""
	Lấy thông tin thời tiết hiện tại dựa trên:
	1. GPS browser người dùng (lat, lon)
	2. Tên địa điểm (thành phố, quốc gia, v.v.)
	"""
	data = request.get_json()
	
	# Định nghĩa địa điểm
	location = data.get('location')
	
	# Định nghĩa tọa độ GPS
	lat = data.get('lat')
	lon = data.get('lon')
	
	# Determine query parameter
	if location:
		# Search by location name (city, country, etc.)
		query = location
	elif lat is not None and lon is not None:
		# Search by GPS coordinates
		query = f"{lat},{lon}"
	else:
		return jsonify({
			'error': 'Kiểm tra lại dữ liệu gửi lên. Cần cung cấp location hoặc lat và lon.'
		}), 400
	
	params = {
		'key': WEATHER_API_KEY,
		'q': query,
		'aqi': 'no'
	}
	
	try:
		resp = requests.get(WEATHER_API_URL, params=params, timeout=5)
		resp.raise_for_status()
		return jsonify(resp.json())
	except requests.exceptions.HTTPError as e:
		if resp.status_code == 400:
			return jsonify({'error': 'Địa điểm hoặc tọa độ không hợp lệ'}), 400
		return jsonify({'error': f'Lỗi API: {str(e)}'}), 500
	except Exception as e:
		return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5000, debug=True)
