import React from 'react';
import type { Recommendations } from '../../types/api';
import { WeatherIcons, AnimatedIcon } from '../../utils/animatedIcons';

interface ActivityRecommendationsProps {
  recommendations: Recommendations;
  className?: string;
}

export const ActivityRecommendations: React.FC<ActivityRecommendationsProps> = ({
  recommendations,
  className = ''
}) => {
  const { clothing, activities, travel } = recommendations;

  const getActivityRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600 bg-green-100';
    if (rating >= 6) return 'text-yellow-600 bg-yellow-100';
    if (rating >= 4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'outdoor_fitness':
        return <WeatherIcons.Wind className="text-2xl" />;
      case 'beach_activities':
        return <AnimatedIcon iconName="clear-day" className="text-2xl" alt="Beach activities" />;
      case 'gardening':
        return <AnimatedIcon iconName="partly-cloudy-day" className="text-2xl" alt="Gardening" />;
      default:
        return <AnimatedIcon iconName="star" className="text-2xl" alt="Activity" />;
    }
  };

  const getDrivingConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'good':
      case 'tốt':
        return 'text-green-600 bg-green-100';
      case 'fair':
      case 'khá':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
      case 'kém':
        return 'text-orange-600 bg-orange-100';
      case 'dangerous':
      case 'nguy hiểm':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Clothing Recommendations */}
      <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
          <AnimatedIcon iconName="umbrella" className="h-6 w-6 mr-2" alt="Clothing" />
          Gợi ý trang phục
        </h3>
        
        <div className="mb-4">
          <p className="text-foreground mb-2">{clothing.suggestion_vi}</p>
          <p className="text-sm text-muted-foreground">{clothing.suggestion}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {clothing.items.map((item, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {item.replace(/_/g, ' ')}
            </span>
          ))}
        </div>

        <div className="flex gap-4">
          {clothing.umbrella_needed && (
            <div className="flex items-center text-blue-600">
              <WeatherIcons.Umbrella className="mr-1 h-4 w-4" />
              <span className="text-sm">Mang ô</span>
            </div>
          )}
          {clothing.sunglasses_needed && (
            <div className="flex items-center text-yellow-600">
              <AnimatedIcon iconName="clear-day" className="mr-1 h-4 w-4" alt="Sunglasses" />
              <span className="text-sm">Mang kính râm</span>
            </div>
          )}
          {clothing.sun_protection_level === 'high' && (
            <div className="flex items-center text-red-600">
              <WeatherIcons.UVIndex className="mr-1 h-4 w-4" />
              <span className="text-sm">Kem chống nắng</span>
            </div>
          )}
        </div>
      </div>

      {/* Activity Recommendations */}
      <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
          <WeatherIcons.Wind className="h-6 w-6 mr-2" />
          Hoạt động phù hợp
        </h3>

        <div className="space-y-4">
          {Object.entries(activities).map(([activityType, activity]) => (
            <div
              key={activityType}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50"
            >
              <div className="flex items-center">
                <div className="text-2xl mr-3">
                  {getActivityIcon(activityType)}
                </div>
                <div>
                  <h4 className="font-medium text-foreground capitalize">
                    {activityType.replace(/_/g, ' ')}
                  </h4>
                  {activity.best_times && (
                    <p className="text-sm text-muted-foreground">
                      Thời gian tốt nhất: {activity.best_times.join(', ')}
                    </p>
                  )}
                  {activity.reason && (
                    <p className="text-sm text-muted-foreground">{activity.reason}</p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getActivityRatingColor(activity.rating)}`}
                >
                  {activity.rating}/10
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {activity.recommended ? 'Nên làm' : 'Hạn chế'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Conditions */}
      <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
          <AnimatedIcon iconName="wind" className="h-6 w-6 mr-2" alt="Travel" />
          Điều kiện di chuyển
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Điều kiện lái xe:</span>
              <div className={`inline-block ml-2 px-3 py-1 rounded-full text-sm font-medium ${getDrivingConditionColor(travel.driving_conditions)}`}>
                {travel.driving_conditions_vi}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-muted-foreground">Tình trạng đường:</span>
              <span className="ml-2 font-medium text-foreground">
                {travel.road_conditions}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Tầm nhìn:</span>
              <div className="ml-2">
                <span className="font-medium text-foreground">
                  {travel.visibility_km} km
                </span>
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((travel.visibility_rating || 0) * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};