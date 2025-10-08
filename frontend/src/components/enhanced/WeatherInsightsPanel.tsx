import React from 'react';
import type { WeatherInsights } from '../../types/api';
import { AnimatedIcon, WeatherIcons } from '../../utils/animatedIcons';

interface WeatherInsightsProps {
  insights: WeatherInsights;
  className?: string;
}

export const WeatherInsightsPanel: React.FC<WeatherInsightsProps> = ({
  insights,
  className = ''
}) => {
  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'increasing':
      case 'tăng':
        return <AnimatedIcon iconName="direction-up" size={20} />;
      case 'decreasing':
      case 'giảm':
        return <AnimatedIcon iconName="direction-down" size={20} />;
      case 'stable':
      case 'ổn định':
        return <AnimatedIcon iconName="thermometer" size={20} />;
      case 'fluctuating':
      case 'dao động':
        return <WeatherIcons.Wind />;
      default:
        return <AnimatedIcon iconName="barometer" size={20} />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'increasing':
      case 'tăng':
        return 'text-red-600 bg-red-100';
      case 'decreasing':
      case 'giảm':
        return 'text-blue-600 bg-blue-100';
      case 'stable':
      case 'ổn định':
        return 'text-green-600 bg-green-100';
      case 'fluctuating':
      case 'dao động':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getNotableIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'extreme_temperature':
        return '🌡️';
      case 'high_wind':
        return '💨';
      case 'heavy_rain':
        return '🌧️';
      case 'low_visibility':
        return '🌫️';
      case 'high_humidity':
        return '💧';
      case 'storm':
        return '⛈️';
      case 'heat_wave':
        return '🔥';
      case 'cold_snap':
        return '🧊';
      default:
        return '⚠️';
    }
  };

  const getConditionTypeVietnamese = (type: string) => {
    switch (type.toLowerCase()) {
      case 'extreme_temperature':
        return 'Nhiệt độ cực đoan';
      case 'high_wind':
        return 'Gió mạnh';
      case 'heavy_rain':
        return 'Mưa lớn';
      case 'low_visibility':
        return 'Tầm nhìn thấp';
      case 'high_humidity':
        return 'Độ ẩm cao';
      case 'storm':
        return 'Bão';
      case 'heat_wave':
        return 'Sóng nhiệt';
      case 'cold_snap':
        return 'Lạnh đột ngột';
      default:
        return type;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low':
      case 'thấp':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'moderate':
      case 'trung bình':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'high':
      case 'cao':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'extreme':
      case 'cực cao':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getSeverityVietnamese = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return 'Thấp';
      case 'moderate':
        return 'Trung bình';
      case 'high':
        return 'Cao';
      case 'extreme':
        return 'Cực cao';
      default:
        return severity;
    }
  };

  return (
    <div className={`space-y-6 ${className}`} role="region" aria-labelledby="weather-insights-heading">
      <h2 id="weather-insights-heading" className="sr-only">Thông tin chi tiết thời tiết</h2>
      
      {/* Weather Trends */}
      <section className="bg-card rounded-xl shadow-lg p-6" aria-labelledby="weather-trends-heading">
        <h3 id="weather-trends-heading" className="text-xl font-bold text-foreground mb-4 flex items-center">
          <AnimatedIcon iconName="barometer" size={24} className="mr-2" aria-hidden="true" />
          Xu hướng thời tiết
        </h3>

        <div className="space-y-4">
          <div className="p-4 border-2 border-border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-2xl mr-3">
                  {getTrendIcon(insights.temperature_trend.trend_vi)}
                </span>
                <span className="font-bold text-foreground">Nhiệt độ</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(insights.temperature_trend.trend_vi)}`}>
                {insights.temperature_trend.trend_vi}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{insights.temperature_trend.comparison_yesterday_vi}</p>
            <p className="text-xs text-muted-foreground mt-1">Thay đổi 24h: {insights.temperature_trend.change_24h}</p>
          </div>
        </div>
      </section>

      {/* Notable Conditions */}
      {insights.notable_conditions.length > 0 && (
        <section className="bg-card rounded-xl shadow-lg p-6" aria-labelledby="notable-conditions-heading">
          <h3 id="notable-conditions-heading" className="text-xl font-bold text-foreground mb-4 flex items-center">
            <span role="img" aria-label="Warning">⚠️</span> Điều kiện đặc biệt
          </h3>

          <div className="space-y-3" role="list" aria-label="Danh sách điều kiện thời tiết đặc biệt">{insights.notable_conditions.map((condition, index) => (
              <div
                key={index}
                role="listitem"
                className={`p-4 rounded-lg border-2 ${getSeverityColor(condition.severity)}`}
                aria-label={`Điều kiện ${getConditionTypeVietnamese(condition.type)} với mức độ ${getSeverityVietnamese(condition.severity)}`}
              >
                <div className="flex items-start">
                  <span className="text-2xl mr-3 mt-1">
                    {getNotableIcon(condition.type)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-foreground">{getConditionTypeVietnamese(condition.type)}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(condition.severity)}`}>
                        {getSeverityVietnamese(condition.severity)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{condition.message_vi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Seasonal Comparison */}
      {insights.seasonal_comparison && (
        <section className="bg-card rounded-xl shadow-lg p-6" aria-labelledby="seasonal-comparison-heading">
          <h3 id="seasonal-comparison-heading" className="text-xl font-bold text-foreground mb-4 flex items-center">
            <AnimatedIcon iconName="day-cloudy" size={24} className="mr-2" aria-hidden="true" />
            So sánh theo mùa
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">So với mùa này</div>
              <div className="font-bold text-blue-700">
                {insights.seasonal_comparison.vs_average_vi}
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Mùa hiện tại</div>
              <div className="font-bold text-green-700">
                {insights.seasonal_comparison.season.name_vi}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Thông tin khí hậu:</div>
            <div className="font-medium text-foreground">
              {insights.seasonal_comparison.climate_type} - Phần trăm: {insights.seasonal_comparison.percentile}%
            </div>
          </div>
        </section>
      )}

      {/* Summary */}
      <section className="bg-card rounded-xl shadow-lg p-6" aria-labelledby="weather-summary-heading">
        <h3 id="weather-summary-heading" className="text-xl font-bold text-foreground mb-4 flex items-center">
          <AnimatedIcon iconName="cloud" size={24} className="mr-2" aria-hidden="true" />
          Tóm tắt
        </h3>
        
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <p className="text-foreground leading-relaxed" aria-live="polite">
            {insights.summary.text_vi}
          </p>
          <div className="mt-2 text-xs text-muted-foreground" aria-label={`Thời gian cập nhật: ${new Date(insights.generated_at).toLocaleString('vi-VN')}`}>
            Cập nhật: {new Date(insights.generated_at).toLocaleString('vi-VN')}
          </div>
        </div>
      </section>
    </div>
  );
};