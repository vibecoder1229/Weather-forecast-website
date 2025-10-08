import { useState } from 'react';
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useEnhancedCurrentWeather } from "../hooks/useWeatherData";
import { getValidatedWeatherIcon } from "../utils/weatherIconMapper";
import { AnimatedIcon } from "../utils/animatedIcons";
import {
  ActivityRecommendations,
  AirQualityDisplay,
  WeatherInsightsPanel,
  IntegratedAstronomyPanel,
  IntegratedMarinePanel,
  IntegratedSportsPanel,
  EnhancementEmptyState
} from './enhanced';
import type { EnhancedCurrentWeatherResponse } from '../types/api';

export function EnhancedCurrentWeatherCard() {
  const { data, loading, error, refetch }: { data: EnhancedCurrentWeatherResponse | null, loading: boolean, error: string | null, refetch: () => void } = useEnhancedCurrentWeather();
  
  const [activeEnhancement, setActiveEnhancement] = useState<string | null>(null);

  // Sanitize error message for user display
  const getSanitizedErrorMessage = (errorMessage: string | null): string => {
    if (!errorMessage) return 'Đã có lỗi không xác định xảy ra';
    
    // Common error patterns to sanitize
    const patterns = [
      { regex: /network|fetch|connection/i, message: 'Lỗi kết nối mạng' },
      { regex: /timeout/i, message: 'Hết thời gian chờ' },
      { regex: /401|unauthorized/i, message: 'Lỗi xác thực' },
      { regex: /404|not found/i, message: 'Không tìm thấy dữ liệu' },
      { regex: /500|server|internal/i, message: 'Lỗi máy chủ' }
    ];
    
    for (const pattern of patterns) {
      if (pattern.regex.test(errorMessage)) {
        return pattern.message;
      }
    }
    
    // If no pattern matches, return a generic user-friendly message
    return 'Không thể tải dữ liệu thời tiết';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Đang tải dữ liệu thời tiết nâng cao...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    const sanitizedError = getSanitizedErrorMessage(error);
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <AnimatedIcon iconName="no-data" className="h-16 w-16 mx-auto mb-4 text-gray-400" alt="" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Đã có lỗi xảy ra</h3>
            <p className="text-gray-500 mb-4">
              {sanitizedError}. Vui lòng thử lại sau.
            </p>
            <div className="flex justify-center space-x-3">
              <Button 
                onClick={refetch} 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
                aria-label="Thử lại tải dữ liệu"
              >
                <AnimatedIcon iconName="refresh" className="h-4 w-4" alt="" />
                <span>Thử lại</span>
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-gray-400 cursor-pointer">Chi tiết lỗi (chỉ hiển thị ở chế độ phát triển)</summary>
                <p className="text-xs text-gray-400 mt-2 font-mono bg-gray-50 p-2 rounded">{error}</p>
              </details>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <AnimatedIcon iconName="no-data" className="h-16 w-16 mx-auto mb-4 text-gray-400" alt="No data" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Không có dữ liệu</h3>
            <p className="text-gray-500">
              Xin lỗi, chúng tôi hiện tại không có dữ liệu thời tiết cho khu vực này.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { location, current, recommendations, air_quality_enhanced, insights } = data;

  // Add safe fallbacks for missing data
  if (!current || !location) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <AnimatedIcon iconName="no-data" className="h-16 w-16 mx-auto mb-4 text-gray-400" alt="No data" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Dữ liệu không hoàn chỉnh</h3>
            <p className="text-gray-500">
              Xin lỗi, dữ liệu thời tiết hiện tại không đầy đủ. Vui lòng thử lại sau.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const toggleEnhancement = (enhancement: string) => {
    setActiveEnhancement(activeEnhancement === enhancement ? null : enhancement);
  };

  return (
    <div className="space-y-6">
      {/* Main Current Weather Card */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center">
              <AnimatedIcon iconName="thermometer" className="h-5 w-5 mr-2" alt="Current Weather" />
              Thời tiết hiện tại
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <AnimatedIcon iconName="wind" className="h-3 w-3 mr-1" alt="Auto refresh" />
                Tự động cập nhật
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Location and Temperature */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {location?.name || 'Không xác định'}, {location?.country || 'Không xác định'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {location?.localtime || 'Không có thời gian'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-foreground">
                {current.temp_c ? Math.round(current.temp_c) : '--'}°C
              </div>
              <div className="text-sm text-muted-foreground">
                Cảm giác như {current.feelslike_c ? Math.round(current.feelslike_c) : '--'}°C
              </div>
            </div>
          </div>

          {/* Weather Condition */}
          <div className="flex items-center space-x-4">
            {(() => {
              const { iconPath, isDefault, description } = getValidatedWeatherIcon(
                current.condition?.code, 
                current.is_day
              );
              return (
                <ImageWithFallback
                  src={iconPath}
                  alt={description}
                  className={`h-16 w-16 ${isDefault ? 'opacity-50' : ''}`}
                />
              );
            })()}
            <div>
              <p className="text-lg font-medium text-foreground">
                {current.condition?.text_vi || current.condition?.text || 'Không có dữ liệu'}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  Độ ẩm: {current.humidity ?? '--'}%
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Gió: {current.wind_kph ?? '--'} km/h
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Khí áp: {current.pressure_mb ?? '--'} mb
                </Badge>
              </div>
            </div>
          </div>

          {/* Enhancement Toggle Buttons */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Thông tin chi tiết:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <Button
                variant={activeEnhancement === 'recommendations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleEnhancement('recommendations')}
                className="text-xs h-auto py-2 flex-col space-y-1"
                aria-label="Xem gợi ý hoạt động"
              >
                <AnimatedIcon iconName="picnic" className="h-4 w-4" alt="" />
                <span>Gợi ý</span>
              </Button>
              
              <Button
                variant={activeEnhancement === 'astronomy' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleEnhancement('astronomy')}
                className="text-xs h-auto py-2 flex-col space-y-1"
                aria-label="Xem thông tin thiên văn"
              >
                <AnimatedIcon iconName="sunrise" className="h-4 w-4" alt="" />
                <span>Thiên văn</span>
              </Button>
              
              <Button
                variant={activeEnhancement === 'marine' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleEnhancement('marine')}
                className="text-xs h-auto py-2 flex-col space-y-1"
                aria-label="Xem thời tiết biển"
              >
                <AnimatedIcon iconName="ship" className="h-4 w-4" alt="" />
                <span>Thời tiết biển</span>
              </Button>
              
              <Button
                variant={activeEnhancement === 'sports' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleEnhancement('sports')}
                className="text-xs h-auto py-2 flex-col space-y-1"
                aria-label="Xem sự kiện thể thao"
              >
                <AnimatedIcon iconName="cycling" className="h-4 w-4" alt="" />
                <span>Thể thao</span>
              </Button>
              
              <Button
                variant={activeEnhancement === 'air_quality' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleEnhancement('air_quality')}
                className="text-xs h-auto py-2 flex-col space-y-1"
                aria-label="Xem chất lượng không khí"
              >
                <AnimatedIcon iconName="windy" className="h-4 w-4" alt="" />
                <span>Không khí</span>
              </Button>
              
              <Button
                variant={activeEnhancement === 'insights' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleEnhancement('insights')}
                className="text-xs h-auto py-2 flex-col space-y-1"
                aria-label="Xem phân tích thời tiết"
              >
                <AnimatedIcon iconName="barometer" className="h-4 w-4" alt="" />
                <span>Phân tích</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Features */}
      {activeEnhancement === 'recommendations' && (
        <>
          {recommendations && Object.keys(recommendations).length > 0 ? (
            <ActivityRecommendations 
              recommendations={recommendations}
              className="animate-in slide-in-from-top-2 duration-300"
            />
          ) : (
            <EnhancementEmptyState
              title="Không có gợi ý"
              description="Hiện tại không có dữ liệu gợi ý hoạt động cho khu vực này."
              iconName="picnic"
              className="animate-in slide-in-from-top-2 duration-300"
            />
          )}
        </>
      )}

      {activeEnhancement === 'astronomy' && (
        <IntegratedAstronomyPanel 
          className="animate-in slide-in-from-top-2 duration-300"
        />
      )}

      {activeEnhancement === 'marine' && (
        <IntegratedMarinePanel 
          className="animate-in slide-in-from-top-2 duration-300"
        />
      )}

      {activeEnhancement === 'sports' && (
        <IntegratedSportsPanel 
          className="animate-in slide-in-from-top-2 duration-300"
        />
      )}

      {activeEnhancement === 'air_quality' && (
        <>
          {air_quality_enhanced && Object.keys(air_quality_enhanced).length > 0 ? (
            <AirQualityDisplay 
              airQuality={air_quality_enhanced}
              className="animate-in slide-in-from-top-2 duration-300"
            />
          ) : (
            <EnhancementEmptyState
              title="Không có dữ liệu chất lượng không khí"
              description="Hiện tại không có thông tin về chất lượng không khí cho khu vực này."
              iconName="windy"
              className="animate-in slide-in-from-top-2 duration-300"
            />
          )}
        </>
      )}

      {activeEnhancement === 'insights' && (
        <>
          {insights && Object.keys(insights).length > 0 ? (
            <WeatherInsightsPanel 
              insights={insights}
              className="animate-in slide-in-from-top-2 duration-300"
            />
          ) : (
            <EnhancementEmptyState
              title="Không có phân tích"
              description="Hiện tại không có dữ liệu phân tích thời tiết cho khu vực này."
              iconName="barometer"
              className="animate-in slide-in-from-top-2 duration-300"
            />
          )}
        </>
      )}
    </div>
  );
}