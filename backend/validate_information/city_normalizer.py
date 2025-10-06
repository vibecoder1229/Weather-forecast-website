"""
Vietnamese City Name Normalizer
Converts Vietnamese city names with diacritics to normalized search queries
"""

import re
from typing import Dict, List, Tuple
import unicodedata


class VietnameseCityNormalizer:
    """Normalizes Vietnamese city names for WeatherAPI search"""
    
    # Common Vietnamese city name mappings
    # Format: Vietnamese name -> English/search term
    CITY_MAPPINGS = {
        # Major cities
        'hà nội': 'hanoi',
        'thành phố hồ chí minh': 'ho chi minh city',
        'tp hồ chí minh': 'ho chi minh city',
        'tp.hcm': 'ho chi minh city',
        'hcm': 'ho chi minh city',
        'sài gòn': 'saigon',
        'đà nẵng': 'da nang',
        'hải phòng': 'hai phong',
        'cần thơ': 'can tho',
        'biên hòa': 'bien hoa',
        'nha trang': 'nha trang',
        'huế': 'hue',
        'buôn ma thuột': 'buon ma thuot',
        'pleiku': 'pleiku',
        'quy nhơn': 'quy nhon',
        'thủ đức': 'thu duc',
        'long xuyên': 'long xuyen',
        'mỹ tho': 'my tho',
        'cà mau': 'ca mau',
        'bạc liêu': 'bac lieu',
        'vũng tàu': 'vung tau',
        'phan thiết': 'phan thiet',
        'đà lạt': 'da lat',
        'vĩnh long': 'vinh long',
        'rạch giá': 'rach gia',
        'hạ long': 'ha long',
        'việt trì': 'viet tri',
        'nam định': 'nam dinh',
        'thái nguyên': 'thai nguyen',
        'thái bình': 'thai binh',
        'ninh bình': 'ninh binh',
        'thanh hóa': 'thanh hoa',
        'vinh': 'vinh',
        'đồng hới': 'dong hoi',
        'tam kỳ': 'tam ky',
        'quảng ngãi': 'quang ngai',
        'tuy hòa': 'tuy hoa',
        'phan rang': 'phan rang',
        'bảo lộc': 'bao loc',
        'trà vinh': 'tra vinh',
        'sóc trăng': 'soc trang',
        'châu đốc': 'chau doc',
        'hà tĩnh': 'ha tinh',
        'hòa bình': 'hoa binh',
        'sơn la': 'son la',
        'lào cai': 'lao cai',
        'điện biên phủ': 'dien bien phu',
        'lai châu': 'lai chau',
        'yên bái': 'yen bai',
        'tuyên quang': 'tuyen quang',
        'hà giang': 'ha giang',
        'cao bằng': 'cao bang',
        'bắc kạn': 'bac kan',
        'lạng sơn': 'lang son',
        'móng cái': 'mong cai',
        'bắc ninh': 'bac ninh',
        'bắc giang': 'bac giang',
        'phú thọ': 'phu tho',
        'vĩnh phúc': 'vinh phuc',
        'hưng yên': 'hung yen',
        'hải dương': 'hai duong',
        'hà nam': 'ha nam',
        'phủ lý': 'phu ly',
        'nghệ an': 'nghe an',
        'quảng bình': 'quang binh',
        'quảng trị': 'quang tri',
        'kon tum': 'kon tum',
        'gia lai': 'gia lai',
        'đắk lắk': 'dak lak',
        'đắk nông': 'dak nong',
        'lâm đồng': 'lam dong',
        'bình phước': 'binh phuoc',
        'tây ninh': 'tay ninh',
        'bình dương': 'binh duong',
        'đồng nai': 'dong nai',
        'bà rịa': 'ba ria',
        'long an': 'long an',
        'tiền giang': 'tien giang',
        'bến tre': 'ben tre',
        'đồng tháp': 'dong thap',
        'an giang': 'an giang',
        'kiên giang': 'kien giang',
        'hậu giang': 'hau giang',
        'vĩnh châu': 'vinh chau',
    }
    
    # Diacritic removal mapping
    @staticmethod
    def remove_vietnamese_diacritics(text: str) -> str:
        """
        Remove Vietnamese diacritics from text
        
        Args:
            text: Vietnamese text with diacritics
            
        Returns:
            Text without diacritics
        """
        # Vietnamese character mapping
        vietnamese_map = {
            'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
            'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
            'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
            'đ': 'd',
            'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
            'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
            'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
            'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
            'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
            'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
            'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
            'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
            'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
        }
        
        result = text.lower()
        for viet_char, latin_char in vietnamese_map.items():
            result = result.replace(viet_char, latin_char)
        
        return result
    
    @staticmethod
    def normalize_city_name(city_name: str) -> List[str]:
        """
        Normalize Vietnamese city name to searchable terms
        
        Args:
            city_name: Vietnamese city name (e.g., "Hà Nội", "TP.HCM")
            
        Returns:
            List of normalized search terms to try
        """
        if not city_name or not isinstance(city_name, str):
            return [city_name]
        
        original = city_name.strip()
        normalized_queries = []
        
        # Convert to lowercase for comparison
        city_lower = original.lower()
        
        # Check if exact match exists in mappings
        if city_lower in VietnameseCityNormalizer.CITY_MAPPINGS:
            normalized_queries.append(VietnameseCityNormalizer.CITY_MAPPINGS[city_lower])
        
        # Remove common prefixes
        city_no_prefix = city_lower
        prefixes = ['thành phố', 'tp.', 'tp ', 'tỉnh', 'huyện', 'quận', 'thị xã', 'thị trấn']
        for prefix in prefixes:
            if city_no_prefix.startswith(prefix):
                city_no_prefix = city_no_prefix[len(prefix):].strip()
        
        # Check without prefix
        if city_no_prefix in VietnameseCityNormalizer.CITY_MAPPINGS:
            normalized_queries.append(VietnameseCityNormalizer.CITY_MAPPINGS[city_no_prefix])
        
        # Remove diacritics (fallback)
        without_diacritics = VietnameseCityNormalizer.remove_vietnamese_diacritics(city_no_prefix)
        if without_diacritics not in normalized_queries:
            normalized_queries.append(without_diacritics)
        
        # Add original query as fallback
        if original not in normalized_queries:
            normalized_queries.append(original)
        
        return normalized_queries
    
    @staticmethod
    def get_search_suggestions(query: str) -> List[Tuple[str, str]]:
        """
        Get city name suggestions based on partial Vietnamese input
        
        Args:
            query: Partial city name query
            
        Returns:
            List of tuples (vietnamese_name, english_name)
        """
        if not query or len(query) < 2:
            return []
        
        query_lower = query.lower()
        query_no_diacritics = VietnameseCityNormalizer.remove_vietnamese_diacritics(query_lower)
        
        suggestions = []
        
        for viet_name, eng_name in VietnameseCityNormalizer.CITY_MAPPINGS.items():
            # Check if query matches Vietnamese name
            if query_lower in viet_name:
                suggestions.append((viet_name.title(), eng_name))
            # Check if query matches Vietnamese name without diacritics
            elif query_no_diacritics in VietnameseCityNormalizer.remove_vietnamese_diacritics(viet_name):
                suggestions.append((viet_name.title(), eng_name))
            # Check if query matches English name
            elif query_lower in eng_name.lower():
                suggestions.append((viet_name.title(), eng_name))
        
        return suggestions[:10]  # Return top 10 suggestions
    
    @staticmethod
    def is_vietnamese_city_query(query: str) -> bool:
        """
        Check if query contains Vietnamese diacritics or known Vietnamese city patterns
        
        Args:
            query: Search query
            
        Returns:
            True if likely a Vietnamese query
        """
        if not query:
            return False
        
        # Check for Vietnamese diacritics
        vietnamese_chars = 'àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ'
        has_diacritics = any(char in query.lower() for char in vietnamese_chars)
        
        # Check for common Vietnamese prefixes
        query_lower = query.lower()
        vietnamese_prefixes = ['thành phố', 'tp.', 'tp ', 'tỉnh', 'huyện', 'quận']
        has_prefix = any(query_lower.startswith(prefix) for prefix in vietnamese_prefixes)
        
        # Check if in known mappings
        in_mappings = query_lower in VietnameseCityNormalizer.CITY_MAPPINGS
        
        return has_diacritics or has_prefix or in_mappings
