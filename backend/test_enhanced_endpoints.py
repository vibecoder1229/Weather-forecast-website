"""
Test script for enhanced weather endpoints
"""

import requests
import json
import sys

def test_enhanced_endpoints():
    """Test the new enhanced endpoints"""
    
    # Start the server in background first
    print("Testing Enhanced Weather Endpoints")
    print("=" * 50)
    
    base_url = "http://localhost:5000"
    
    # Test data
    test_location = {
        "location": "Hanoi"
    }
    
    try:
        # Test health endpoint first
        print("1. Testing health endpoint...")
        response = requests.get(f"{base_url}/api/health", timeout=5)
        if response.status_code == 200:
            print("✓ Health endpoint working")
        else:
            print("✗ Health endpoint failed")
            return False
            
    except requests.exceptions.ConnectionError:
        print("✗ Server not running. Please start the server first with:")
        print("python app.py")
        return False
    
    try:
        # Test enhanced current weather
        print("\n2. Testing enhanced current weather endpoint...")
        response = requests.post(
            f"{base_url}/api/weather/enhanced-current",
            json=test_location,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Enhanced current weather endpoint working")
            
            # Check for enhanced features
            if 'data' in data:
                enhanced_data = data['data']
                features_found = []
                
                if 'astronomy' in enhanced_data:
                    features_found.append("Astronomy data (golden hour, moon phase)")
                
                if 'environmental' in enhanced_data:
                    features_found.append("Environmental data (comfort index, UV recommendations)")
                
                if 'recommendations' in enhanced_data:
                    features_found.append("Activity & clothing recommendations")
                
                if 'air_quality_enhanced' in enhanced_data:
                    features_found.append("Enhanced air quality analysis")
                
                if 'insights' in enhanced_data:
                    features_found.append("Weather insights & trends")
                
                print(f"  Enhanced features found: {len(features_found)}")
                for feature in features_found:
                    print(f"    • {feature}")
            
        else:
            print(f"✗ Enhanced current weather failed: {response.status_code}")
            print(f"Response: {response.text}")
    
    except Exception as e:
        print(f"✗ Error testing enhanced current weather: {e}")
    
    try:
        # Test enhanced forecast
        print("\n3. Testing enhanced forecast endpoint...")
        forecast_data = {
            "location": "Ho Chi Minh City",
            "days": 3
        }
        
        response = requests.post(
            f"{base_url}/api/weather/enhanced-forecast",
            json=forecast_data,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Enhanced forecast endpoint working")
            
            # Check for enhanced features
            if 'data' in data:
                enhanced_data = data['data']
                features_found = []
                
                if 'hourly_forecast' in enhanced_data:
                    hourly_count = len(enhanced_data['hourly_forecast'].get('hours', []))
                    features_found.append(f"Hourly forecast ({hourly_count} hours)")
                
                if 'current_enhanced' in enhanced_data:
                    features_found.append("Enhanced current weather data")
                
                print(f"  Enhanced forecast features: {len(features_found)}")
                for feature in features_found:
                    print(f"    • {feature}")
        
        else:
            print(f"✗ Enhanced forecast failed: {response.status_code}")
            print(f"Response: {response.text}")
    
    except Exception as e:
        print(f"✗ Error testing enhanced forecast: {e}")
    
    print("\n" + "=" * 50)
    print("Test completed!")
    print("\nTo test manually, start the server with:")
    print("python app.py")
    print("\nThen test with curl:")
    print('curl -X POST http://localhost:5000/api/weather/enhanced-current \\')
    print('  -H "Content-Type: application/json" \\')
    print('  -d \'{"location": "Hanoi"}\'')

if __name__ == "__main__":
    test_enhanced_endpoints()