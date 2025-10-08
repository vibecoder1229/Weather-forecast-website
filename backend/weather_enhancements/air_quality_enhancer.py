"""
Air Quality Enhancement Module
Provides enhanced air quality analysis and health recommendations
"""

from typing import Dict, Any, List

class AirQualityEnhancer:
    """Enhanced air quality data processing and health recommendations"""
    
    @staticmethod
    def get_aqi_category_info(aqi_us: float) -> Dict[str, Any]:
        """
        Get comprehensive AQI category information with health advice
        
        Args:
            aqi_us: US EPA AQI value
            
        Returns:
            Dictionary with category, color, and health recommendations
        """
        if aqi_us <= 50:
            return {
                'category': 'Good',
                'category_vi': 'Tốt',
                'color': '#00e400',
                'description': 'Air quality is satisfactory',
                'description_vi': 'Chất lượng không khí tốt',
                'health_advice': 'No health implications',
                'health_advice_vi': 'Không có tác động xấu đến sức khỏe',
                'sensitive_groups': 'None',
                'activities': ['all_outdoor_activities'],
                'mask_recommended': False
            }
        elif aqi_us <= 100:
            return {
                'category': 'Moderate',
                'category_vi': 'Trung bình',
                'color': '#ffff00',
                'description': 'Air quality is acceptable for most people',
                'description_vi': 'Chất lượng không khí chấp nhận được cho hầu hết mọi người',
                'health_advice': 'Unusually sensitive people should consider reducing outdoor activities',
                'health_advice_vi': 'Người nhạy cảm nên hạn chế hoạt động ngoài trời',
                'sensitive_groups': 'People with respiratory conditions',
                'activities': ['light_outdoor_exercise', 'normal_commuting'],
                'mask_recommended': False
            }
        elif aqi_us <= 150:
            return {
                'category': 'Unhealthy for Sensitive Groups',
                'category_vi': 'Có hại cho nhóm nhạy cảm',
                'color': '#ff7e00',
                'description': 'Members of sensitive groups may experience health effects',
                'description_vi': 'Nhóm người nhạy cảm có thể gặp vấn đề sức khỏe',
                'health_advice': 'Sensitive groups should reduce outdoor activities',
                'health_advice_vi': 'Nhóm nhạy cảm nên hạn chế hoạt động ngoài trời',
                'sensitive_groups': 'Children, elderly, people with heart/lung disease',
                'activities': ['indoor_activities', 'light_indoor_exercise'],
                'mask_recommended': True
            }
        elif aqi_us <= 200:
            return {
                'category': 'Unhealthy',
                'category_vi': 'Có hại',
                'color': '#ff0000',
                'description': 'Everyone may begin to experience health effects',
                'description_vi': 'Mọi người có thể bị ảnh hưởng sức khỏe',
                'health_advice': 'Everyone should reduce outdoor activities',
                'health_advice_vi': 'Mọi người nên hạn chế hoạt động ngoài trời',
                'sensitive_groups': 'Everyone, especially sensitive groups',
                'activities': ['indoor_activities_only'],
                'mask_recommended': True
            }
        elif aqi_us <= 300:
            return {
                'category': 'Very Unhealthy',
                'category_vi': 'Rất có hại',
                'color': '#8f3f97',
                'description': 'Health warnings of emergency conditions',
                'description_vi': 'Cảnh báo sức khỏe khẩn cấp',
                'health_advice': 'Everyone should avoid outdoor activities',
                'health_advice_vi': 'Mọi người nên tránh hoạt động ngoài trời',
                'sensitive_groups': 'Everyone',
                'activities': ['stay_indoors'],
                'mask_recommended': True
            }
        else:
            return {
                'category': 'Hazardous',
                'category_vi': 'Nguy hiểm',
                'color': '#7e0023',
                'description': 'Emergency conditions affecting entire population',
                'description_vi': 'Tình trạng khẩn cấp ảnh hưởng toàn dân',
                'health_advice': 'Everyone must avoid outdoor activities',
                'health_advice_vi': 'Mọi người phải tránh hoạt động ngoài trời',
                'sensitive_groups': 'Everyone',
                'activities': ['stay_indoors_sealed'],
                'mask_recommended': True
            }
    
    @staticmethod
    def analyze_pollutants(air_quality_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze individual pollutant levels and provide specific recommendations
        
        Args:
            air_quality_data: Air quality data from WeatherAPI
            
        Returns:
            Analysis of individual pollutants with recommendations
        """
        pollutants = {}
        
        # PM2.5 Analysis
        pm2_5 = air_quality_data.get('pm2_5', 0)
        if pm2_5 <= 12:
            pm2_5_level = 'Good'
            pm2_5_level_vi = 'Tốt'
        elif pm2_5 <= 35:
            pm2_5_level = 'Moderate'
            pm2_5_level_vi = 'Trung bình'
        elif pm2_5 <= 55:
            pm2_5_level = 'Unhealthy for Sensitive Groups'
            pm2_5_level_vi = 'Có hại cho nhóm nhạy cảm'
        elif pm2_5 <= 150:
            pm2_5_level = 'Unhealthy'
            pm2_5_level_vi = 'Có hại'
        elif pm2_5 <= 250:
            pm2_5_level = 'Very Unhealthy'
            pm2_5_level_vi = 'Rất có hại'
        else:
            pm2_5_level = 'Hazardous'
            pm2_5_level_vi = 'Nguy hiểm'
        
        pollutants['pm2_5'] = {
            'value': pm2_5,
            'level': pm2_5_level,
            'level_vi': pm2_5_level_vi,
            'unit': 'μg/m³',
            'description': 'Fine particulate matter',
            'description_vi': 'Hạt bụi mịn'
        }
        
        # PM10 Analysis
        pm10 = air_quality_data.get('pm10', 0)
        if pm10 <= 54:
            pm10_level = 'Good'
            pm10_level_vi = 'Tốt'
        elif pm10 <= 154:
            pm10_level = 'Moderate'
            pm10_level_vi = 'Trung bình'
        elif pm10 <= 254:
            pm10_level = 'Unhealthy for Sensitive Groups'
            pm10_level_vi = 'Có hại cho nhóm nhạy cảm'
        elif pm10 <= 354:
            pm10_level = 'Unhealthy'
            pm10_level_vi = 'Có hại'
        elif pm10 <= 424:
            pm10_level = 'Very Unhealthy'
            pm10_level_vi = 'Rất có hại'
        else:
            pm10_level = 'Hazardous'
            pm10_level_vi = 'Nguy hiểm'
        
        pollutants['pm10'] = {
            'value': pm10,
            'level': pm10_level,
            'level_vi': pm10_level_vi,
            'unit': 'μg/m³',
            'description': 'Coarse particulate matter',
            'description_vi': 'Hạt bụi thô'
        }
        
        # Ozone Analysis
        o3 = air_quality_data.get('o3', 0)
        if o3 <= 54:
            o3_level = 'Good'
            o3_level_vi = 'Tốt'
        elif o3 <= 70:
            o3_level = 'Moderate'
            o3_level_vi = 'Trung bình'
        elif o3 <= 85:
            o3_level = 'Unhealthy for Sensitive Groups'
            o3_level_vi = 'Có hại cho nhóm nhạy cảm'
        elif o3 <= 105:
            o3_level = 'Unhealthy'
            o3_level_vi = 'Có hại'
        else:
            o3_level = 'Very Unhealthy'
            o3_level_vi = 'Rất có hại'
        
        pollutants['ozone'] = {
            'value': o3,
            'level': o3_level,
            'level_vi': o3_level_vi,
            'unit': 'μg/m³',
            'description': 'Ground-level ozone',
            'description_vi': 'Ozone tầng thấp'
        }
        
        return pollutants
    
    @staticmethod
    def get_health_recommendations(aqi_us: float, pollutants: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Get specific health recommendations based on AQI and pollutant levels
        
        Args:
            aqi_us: US EPA AQI value
            pollutants: Individual pollutant analysis
            
        Returns:
            List of health recommendations
        """
        recommendations = []
        
        if aqi_us > 100:
            recommendations.append({
                'type': 'general',
                'message': 'Consider wearing a mask when going outside',
                'message_vi': 'Nên đeo khẩu trang khi ra ngoài',
                'priority': 'high'
            })
        
        if aqi_us > 150:
            recommendations.append({
                'type': 'exercise',
                'message': 'Avoid outdoor exercise, exercise indoors instead',
                'message_vi': 'Tránh tập thể dục ngoài trời, tập trong nhà',
                'priority': 'high'
            })
        
        if aqi_us > 200:
            recommendations.append({
                'type': 'windows',
                'message': 'Keep windows closed and use air purifier if available',
                'message_vi': 'Đóng cửa sổ và dùng máy lọc không khí nếu có',
                'priority': 'very_high'
            })
        
        # PM2.5 specific recommendations
        pm2_5_level = pollutants.get('pm2_5', {}).get('level', 'Good')
        if pm2_5_level in ['Unhealthy', 'Very Unhealthy', 'Hazardous']:
            recommendations.append({
                'type': 'pm2_5',
                'message': 'High PM2.5 levels - use N95 mask outdoors',
                'message_vi': 'Nồng độ PM2.5 cao - dùng khẩu trang N95 khi ra ngoài',
                'priority': 'very_high'
            })
        
        # Ozone specific recommendations
        o3_level = pollutants.get('ozone', {}).get('level', 'Good')
        if o3_level in ['Unhealthy for Sensitive Groups', 'Unhealthy']:
            recommendations.append({
                'type': 'ozone',
                'message': 'High ozone levels - avoid outdoor activities during peak sun hours',
                'message_vi': 'Nồng độ ozone cao - tránh hoạt động ngoài trời vào giờ nắng gay gắt',
                'priority': 'medium'
            })
        
        if not recommendations:
            recommendations.append({
                'type': 'general',
                'message': 'Air quality is good - enjoy outdoor activities',
                'message_vi': 'Chất lượng không khí tốt - thoải mái hoạt động ngoài trời',
                'priority': 'low'
            })
        
        return recommendations
    
    @staticmethod
    def enhance_air_quality_data(air_quality_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhance basic air quality data with comprehensive analysis
        
        Args:
            air_quality_data: Basic air quality data from WeatherAPI
            
        Returns:
            Enhanced air quality data with analysis and recommendations
        """
        if not air_quality_data:
            return {}
        
        aqi_us = air_quality_data.get('us-epa-index', 0)
        
        # Get category information
        category_info = AirQualityEnhancer.get_aqi_category_info(aqi_us)
        
        # Analyze individual pollutants
        pollutants = AirQualityEnhancer.analyze_pollutants(air_quality_data)
        
        # Get health recommendations
        health_recommendations = AirQualityEnhancer.get_health_recommendations(aqi_us, pollutants)
        
        return {
            'aqi_us': aqi_us,
            'aqi_category': category_info['category'],
            'aqi_category_vi': category_info['category_vi'],
            'aqi_color': category_info['color'],
            'description': category_info['description'],
            'description_vi': category_info['description_vi'],
            'health_advice': category_info['health_advice'],
            'health_advice_vi': category_info['health_advice_vi'],
            'mask_recommended': category_info['mask_recommended'],
            'recommended_activities': category_info['activities'],
            'pollutants': pollutants,
            'health_recommendations': health_recommendations,
            'last_updated': air_quality_data.get('last_updated', '')
        }