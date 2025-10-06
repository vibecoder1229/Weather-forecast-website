"""
Input Validation Schemas
Validates data coming from frontend to backend
"""

from typing import Optional, Dict, Any, Tuple
import re


class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass


class InputValidator:
    """Validates incoming requests from frontend"""
    
    @staticmethod
    def validate_location_request(data: Dict[str, Any]) -> Tuple[bool, Optional[str], Dict[str, Any]]:
        """
        Validate location-based weather request
        
        Args:
            data: Request data from frontend
            
        Returns:
            Tuple of (is_valid, error_message, cleaned_data)
        """
        if not data:
            return False, "Dữ liệu request trống", {}
        
        cleaned_data = {}
        
        # Check if location or coordinates provided
        location = data.get('location')
        lat = data.get('lat')
        lon = data.get('lon')
        
        if location:
            # Validate location string
            is_valid, error = InputValidator.validate_location_string(location)
            if not is_valid:
                return False, error, {}
            cleaned_data['location'] = location.strip()
            
        elif lat is not None and lon is not None:
            # Validate coordinates
            is_valid, error = InputValidator.validate_coordinates(lat, lon)
            if not is_valid:
                return False, error, {}
            cleaned_data['lat'] = float(lat)
            cleaned_data['lon'] = float(lon)
            
        else:
            return False, "Cần cung cấp 'location' hoặc cả 'lat' và 'lon'", {}
        
        # Validate optional days parameter
        if 'days' in data:
            is_valid, error, days = InputValidator.validate_days(data.get('days'))
            if not is_valid:
                return False, error, {}
            cleaned_data['days'] = days
        
        return True, None, cleaned_data
    
    @staticmethod
    def validate_location_string(location: str) -> Tuple[bool, Optional[str]]:
        """
        Validate location string
        
        Args:
            location: Location string to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not location or not isinstance(location, str):
            return False, "Địa điểm phải là chuỗi văn bản"
        
        location = location.strip()
        
        if len(location) < 2:
            return False, "Địa điểm phải có ít nhất 2 ký tự"
        
        if len(location) > 100:
            return False, "Địa điểm không được quá 100 ký tự"
        
        # Check for valid characters (letters, numbers, spaces, commas, hyphens)
        if not re.match(r'^[a-zA-ZÀ-ỹ0-9\s,.-]+$', location):
            return False, "Địa điểm chứa ký tự không hợp lệ"
        
        return True, None
    
    @staticmethod
    def validate_coordinates(lat: Any, lon: Any) -> Tuple[bool, Optional[str]]:
        """
        Validate latitude and longitude
        
        Args:
            lat: Latitude value
            lon: Longitude value
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            lat_float = float(lat)
            lon_float = float(lon)
        except (ValueError, TypeError):
            return False, "Tọa độ phải là số"
        
        if not (-90 <= lat_float <= 90):
            return False, f"Vĩ độ phải nằm trong khoảng -90 đến 90 (nhận: {lat_float})"
        
        if not (-180 <= lon_float <= 180):
            return False, f"Kinh độ phải nằm trong khoảng -180 đến 180 (nhận: {lon_float})"
        
        return True, None
    
    @staticmethod
    def validate_days(days: Any) -> Tuple[bool, Optional[str], int]:
        """
        Validate number of forecast days
        
        Args:
            days: Number of days to forecast
            
        Returns:
            Tuple of (is_valid, error_message, cleaned_days)
        """
        if days is None:
            return True, None, 7  # Default
        
        try:
            days_int = int(days)
        except (ValueError, TypeError):
            return False, "Số ngày dự báo phải là số nguyên", 7
        
        if not (1 <= days_int <= 10):
            return False, f"Số ngày dự báo phải từ 1 đến 10 (nhận: {days_int})", 7
        
        return True, None, days_int
    
    @staticmethod
    def validate_temperature_unit(unit: str) -> Tuple[bool, Optional[str]]:
        """
        Validate temperature unit
        
        Args:
            unit: Temperature unit (celsius or fahrenheit)
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        valid_units = ['celsius', 'fahrenheit', 'c', 'f']
        
        if not unit or not isinstance(unit, str):
            return False, "Đơn vị nhiệt độ không hợp lệ"
        
        if unit.lower() not in valid_units:
            return False, f"Đơn vị nhiệt độ phải là 'celsius' hoặc 'fahrenheit' (nhận: {unit})"
        
        return True, None
    
    @staticmethod
    def validate_language(language: str) -> Tuple[bool, Optional[str]]:
        """
        Validate language code
        
        Args:
            language: Language code
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        valid_languages = ['vi', 'en', 'zh']
        
        if not language or not isinstance(language, str):
            return False, "Mã ngôn ngữ không hợp lệ"
        
        if language.lower() not in valid_languages:
            return False, f"Ngôn ngữ phải là 'vi', 'en', hoặc 'zh' (nhận: {language})"
        
        return True, None
    
    @staticmethod
    def sanitize_input(data: Any) -> Any:
        """
        Sanitize input data to prevent injection attacks
        
        Args:
            data: Data to sanitize
            
        Returns:
            Sanitized data
        """
        if isinstance(data, str):
            # Remove potentially dangerous characters
            data = re.sub(r'[<>\"\'`]', '', data)
            return data.strip()
        
        elif isinstance(data, dict):
            return {k: InputValidator.sanitize_input(v) for k, v in data.items()}
        
        elif isinstance(data, list):
            return [InputValidator.sanitize_input(item) for item in data]
        
        return data
