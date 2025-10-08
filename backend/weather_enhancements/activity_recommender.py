"""
Activity Recommender Module
Provides clothing and activity recommendations based on weather conditions
"""

from typing import Dict, Any, List
import math

class ActivityRecommender:
    """Generate activity and clothing recommendations based on weather data"""
    
    @staticmethod
    def get_clothing_recommendations(weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate clothing recommendations based on weather conditions
        
        Args:
            weather_data: Current weather data with temp_c, condition, wind_kph, etc.
            
        Returns:
            Clothing recommendations with Vietnamese translations
        """
        current = weather_data.get('current', {})
        temp_c = current.get('temp_c', 20)
        condition_text = current.get('condition', {}).get('text', '').lower()
        wind_kph = current.get('wind_kph', 0)
        humidity = current.get('humidity', 50)
        uv = current.get('uv', 0)
        
        # Base clothing recommendations
        clothing_items = []
        suggestion = ""
        suggestion_vi = ""
        
        # Temperature-based recommendations
        if temp_c < 0:
            clothing_items.extend(['heavy_coat', 'warm_hat', 'gloves', 'warm_boots'])
            suggestion = "Heavy winter clothing recommended"
            suggestion_vi = "Nên mặc quần áo mùa đông dày"
        elif temp_c < 10:
            clothing_items.extend(['heavy_jacket', 'long_pants', 'closed_shoes'])
            suggestion = "Warm jacket and long pants recommended"
            suggestion_vi = "Nên mặc áo khoác ấm và quần dài"
        elif temp_c < 20:
            clothing_items.extend(['light_jacket', 'long_pants', 'closed_shoes'])
            suggestion = "Light jacket recommended"
            suggestion_vi = "Nên mặc áo khoác nhẹ"
        elif temp_c < 25:
            clothing_items.extend(['long_sleeve_shirt', 'long_pants', 'comfortable_shoes'])
            suggestion = "Comfortable clothing, light layers"
            suggestion_vi = "Quần áo thoải mái, áo mỏng"
        elif temp_c < 30:
            clothing_items.extend(['t_shirt', 'light_pants', 'breathable_shoes'])
            suggestion = "Light, breathable clothing"
            suggestion_vi = "Quần áo nhẹ, thoáng mát"
        else:
            clothing_items.extend(['light_shirt', 'shorts', 'sandals'])
            suggestion = "Very light, loose clothing"
            suggestion_vi = "Quần áo rất nhẹ, thoáng"
        
        # Weather condition adjustments
        umbrella_needed = any(keyword in condition_text for keyword in 
                             ['rain', 'drizzle', 'shower', 'storm'])
        
        if umbrella_needed:
            clothing_items.append('umbrella')
            if 'waterproof' not in suggestion:
                suggestion += ", bring umbrella"
                suggestion_vi += ", mang theo ô"
        
        # UV protection
        sunglasses_needed = uv > 3
        if sunglasses_needed:
            clothing_items.append('sunglasses')
            if uv > 7:
                clothing_items.append('sun_hat')
                suggestion += ", strong sun protection needed"
                suggestion_vi += ", cần bảo vệ chống nắng mạnh"
        
        # Wind adjustments
        if wind_kph > 25:
            suggestion += ", expect windy conditions"
            suggestion_vi += ", trời có gió mạnh"
        
        return {
            'suggestion': suggestion.strip(', '),
            'suggestion_vi': suggestion_vi.strip(', '),
            'items': clothing_items,
            'umbrella_needed': umbrella_needed,
            'sunglasses_needed': sunglasses_needed,
            'sun_protection_level': 'high' if uv > 7 else 'medium' if uv > 3 else 'low'
        }
    
    @staticmethod
    def get_activity_recommendations(weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate activity recommendations based on weather conditions
        
        Args:
            weather_data: Current weather data
            
        Returns:
            Activity recommendations with ratings and best times
        """
        current = weather_data.get('current', {})
        temp_c = current.get('temp_c', 20)
        condition_text = current.get('condition', {}).get('text', '').lower()
        wind_kph = current.get('wind_kph', 0)
        humidity = current.get('humidity', 50)
        uv = current.get('uv', 0)
        vis_km = current.get('vis_km', 10)
        
        activities = {}
        
        # Outdoor fitness rating
        fitness_rating = 10
        fitness_precautions = []
        fitness_best_times = ["06:00-08:00", "17:00-19:00"]
        
        if temp_c < 5 or temp_c > 35:
            fitness_rating -= 3
        if 'rain' in condition_text or 'storm' in condition_text:
            fitness_rating -= 4
        if wind_kph > 30:
            fitness_rating -= 2
        if uv > 8:
            fitness_precautions.append("Wear sunscreen and hat")
            fitness_precautions.append("Mang kem chống nắng và mũ")
        if humidity > 80:
            fitness_precautions.append("Bring extra water")
            fitness_precautions.append("Mang thêm nước")
        
        activities['outdoor_fitness'] = {
            'recommended': fitness_rating >= 6,
            'rating': max(0, fitness_rating),
            'best_times': fitness_best_times,
            'precautions': fitness_precautions
        }
        
        # Beach activities
        beach_rating = 10
        beach_reason = ""
        
        if temp_c < 20:
            beach_rating -= 4
            beach_reason = "Temperature too low for beach activities"
        if 'rain' in condition_text:
            beach_rating -= 5
            beach_reason = "Rainy conditions"
        if wind_kph > 25:
            beach_rating -= 3
            beach_reason = "Very windy conditions"
        if uv > 9:
            beach_rating -= 2
            beach_reason = "Extremely high UV levels"
        
        activities['beach_activities'] = {
            'recommended': beach_rating >= 6,
            'rating': max(0, beach_rating),
            'reason': beach_reason if beach_rating < 6 else "Good conditions for beach"
        }
        
        # Gardening
        gardening_rating = 10
        gardening_best_times = ["07:00-09:00", "16:00-18:00"]
        
        if 'rain' in condition_text or 'storm' in condition_text:
            gardening_rating -= 6
        if temp_c < 5 or temp_c > 35:
            gardening_rating -= 3
        if wind_kph > 20:
            gardening_rating -= 2
        if uv > 8:
            gardening_best_times = ["07:00-08:00", "17:00-18:00"]
        
        activities['gardening'] = {
            'recommended': gardening_rating >= 6,
            'rating': max(0, gardening_rating),
            'best_times': gardening_best_times
        }
        
        return activities
    
    @staticmethod
    def get_travel_conditions(weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate travel and driving condition recommendations
        
        Args:
            weather_data: Current weather data
            
        Returns:
            Travel condition information
        """
        current = weather_data.get('current', {})
        condition_text = current.get('condition', {}).get('text', '').lower()
        vis_km = current.get('vis_km', 10)
        wind_kph = current.get('wind_kph', 0)
        
        # Driving conditions
        driving_conditions = "Good"
        driving_conditions_vi = "Tốt"
        visibility_rating = 10
        road_conditions = "Dry"
        
        if vis_km < 1:
            driving_conditions = "Poor"
            driving_conditions_vi = "Kém"
            visibility_rating = 2
        elif vis_km < 5:
            driving_conditions = "Fair"
            driving_conditions_vi = "Khá"
            visibility_rating = 5
        elif vis_km < 10:
            visibility_rating = 8
        
        if 'rain' in condition_text or 'drizzle' in condition_text:
            road_conditions = "Wet"
            if driving_conditions == "Good":
                driving_conditions = "Fair"
                driving_conditions_vi = "Khá"
                
        if 'snow' in condition_text or 'ice' in condition_text:
            road_conditions = "Icy"
            driving_conditions = "Poor"
            driving_conditions_vi = "Kém"
            
        if 'storm' in condition_text or wind_kph > 40:
            driving_conditions = "Dangerous"
            driving_conditions_vi = "Nguy hiểm"
        
        return {
            'driving_conditions': driving_conditions,
            'driving_conditions_vi': driving_conditions_vi,
            'visibility_rating': visibility_rating,
            'road_conditions': road_conditions,
            'visibility_km': vis_km
        }