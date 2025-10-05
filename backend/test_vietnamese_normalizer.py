"""
Test Vietnamese City Normalizer
"""

import sys
sys.path.insert(0, '.')

from validate_information import VietnameseCityNormalizer

def test_city_normalization():
    """Test Vietnamese city name normalization"""
    
    test_cases = [
        ('Hà Nội', ['hanoi', 'ha noi']),
        ('hà nội', ['hanoi', 'ha noi']),
        ('TP.HCM', ['ho chi minh city', 'tp.hcm']),
        ('Sài Gòn', ['saigon', 'sai gon']),
        ('Đà Nẵng', ['da nang', 'da nang']),
        ('Thành phố Hồ Chí Minh', ['ho chi minh city', 'thanh pho ho chi minh']),
        ('Nha Trang', ['nha trang']),
        ('Huế', ['hue', 'hue']),
        ('Cần Thơ', ['can tho', 'can tho']),
        ('Đà Lạt', ['da lat', 'da lat']),
        ('Vũng Tàu', ['vung tau', 'vung tau']),
        ('Hải Phòng', ['hai phong', 'hai phong']),
    ]
    
    print("Testing Vietnamese City Name Normalization")
    print("=" * 60)
    
    for city_input, expected_keywords in test_cases:
        normalized = VietnameseCityNormalizer.normalize_city_name(city_input)
        print(f"\nInput: '{city_input}'")
        print(f"Normalized: {normalized}")
        
        # Check if at least one expected keyword is in the normalized results
        has_match = any(
            any(keyword.lower() in norm.lower() for norm in normalized)
            for keyword in expected_keywords
        )
        
        if has_match:
            print("✓ PASS")
        else:
            print(f"✗ FAIL - Expected to find one of {expected_keywords}")
    
    print("\n" + "=" * 60)

def test_vietnamese_detection():
    """Test Vietnamese query detection"""
    
    test_cases = [
        ('Hà Nội', True),
        ('Hanoi', False),
        ('TP.HCM', True),
        ('Ho Chi Minh', False),
        ('Đà Nẵng', True),
        ('Da Nang', False),
        ('Thành phố Cần Thơ', True),
        ('Can Tho', False),
    ]
    
    print("\nTesting Vietnamese Query Detection")
    print("=" * 60)
    
    for query, expected in test_cases:
        is_vietnamese = VietnameseCityNormalizer.is_vietnamese_city_query(query)
        status = "✓ PASS" if is_vietnamese == expected else "✗ FAIL"
        print(f"{status} - '{query}' -> {is_vietnamese} (expected: {expected})")
    
    print("=" * 60)

def test_diacritic_removal():
    """Test diacritic removal"""
    
    test_cases = [
        ('Hà Nội', 'ha noi'),
        ('Đà Nẵng', 'da nang'),
        ('Cần Thơ', 'can tho'),
        ('Huế', 'hue'),
        ('Đà Lạt', 'da lat'),
        ('Vũng Tàu', 'vung tau'),
        ('Phú Quốc', 'phu quoc'),
        ('Quy Nhơn', 'quy nhon'),
    ]
    
    print("\nTesting Diacritic Removal")
    print("=" * 60)
    
    for input_text, expected in test_cases:
        result = VietnameseCityNormalizer.remove_vietnamese_diacritics(input_text)
        status = "✓ PASS" if result == expected else "✗ FAIL"
        print(f"{status} - '{input_text}' -> '{result}' (expected: '{expected}')")
    
    print("=" * 60)

def test_search_suggestions():
    """Test search suggestions"""
    
    test_queries = ['ha', 'hồ', 'da', 'can', 'nha']
    
    print("\nTesting Search Suggestions")
    print("=" * 60)
    
    for query in test_queries:
        suggestions = VietnameseCityNormalizer.get_search_suggestions(query)
        print(f"\nQuery: '{query}'")
        print(f"Found {len(suggestions)} suggestions:")
        for viet_name, eng_name in suggestions[:5]:  # Show top 5
            print(f"  - {viet_name} ({eng_name})")
    
    print("=" * 60)

if __name__ == '__main__':
    test_city_normalization()
    test_vietnamese_detection()
    test_diacritic_removal()
    test_search_suggestions()
    
    print("\n✅ All tests completed!")
