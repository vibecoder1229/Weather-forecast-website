import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Loader2, Calendar, MapPin, Clock } from 'lucide-react';
import { weatherApi } from '../../services/weatherApi';
import { useWeather } from '../../contexts/WeatherContext';
import { AnimatedIcon } from '../../utils/animatedIcons';

interface SportsEvent {
  stadium: string;
  country: string;
  region: string;
  tournament: string;
  start: string;
  match: string;
}

interface SportsData {
  football: SportsEvent[];
  cricket: SportsEvent[];
  golf: SportsEvent[];
}

interface IntegratedSportsPanelProps {
  className?: string;
}

export function IntegratedSportsPanel({ className }: IntegratedSportsPanelProps) {
  const { settings } = useWeather();
  const [loading, setLoading] = useState(false);
  const [sportsData, setSportsData] = useState<SportsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.location) {
      fetchSportsData();
    }
  }, [settings.location]);

  const fetchSportsData = async () => {
    if (!settings.location) return;

    setLoading(true);
    setError(null);

    try {
      const response = await weatherApi.getSportsEvents({
        location: settings.location
      });

      if (response.success) {
        setSportsData(response.data);
      } else {
        setError(response.error?.message || 'Không thể lấy dữ liệu sự kiện thể thao');
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getSportIcon = (sport: string) => {
    const sportIcons: { [key: string]: string } = {
      football: 'cycling',
      cricket: 'strategy-board',
      golf: 'running',
    };
    return sportIcons[sport] || 'cycling';
  };

  const getSportName = (sport: string) => {
    const sportNames: { [key: string]: string } = {
      football: 'Bóng đá',
      cricket: 'Cricket',
      golf: 'Golf',
    };
    return sportNames[sport] || sport;
  };

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      return {
        date: date.toLocaleDateString('vi-VN'),
        time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
    } catch {
      return { date: dateTime, time: '' };
    }
  };

  const renderSportEvents = (sport: string, events: SportsEvent[]) => {
    if (!events || events.length === 0) return null;

    return (
      <div key={sport} className="space-y-3">
        <h4 className="font-medium text-sm flex items-center gap-2">
          <AnimatedIcon iconName={getSportIcon(sport)} className="h-5 w-5" alt={sport} />
          {getSportName(sport)}
          <Badge variant="secondary" className="text-xs">
            {events.length} trận
          </Badge>
        </h4>
        
        <div className="space-y-2">
          {events.slice(0, 3).map((event, index) => {
            const { date, time } = formatDateTime(event.start);
            return (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                      {event.match}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.stadium}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{date}</span>
                        </div>
                        {time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{time}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {event.tournament} • {event.region}, {event.country}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {events.length > 3 && (
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                +{events.length - 3} sự kiện khác
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Đang tải dữ liệu sự kiện thể thao...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AnimatedIcon iconName="caution" className="h-8 w-8 mx-auto mb-2" alt="Error" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sportsData) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <AnimatedIcon iconName="cycling" className="h-8 w-8 mx-auto mb-2" alt="No data" />
            <p>Không có dữ liệu sự kiện thể thao cho khu vực này</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalEvents = Object.values(sportsData).reduce((total, events) => total + (events?.length || 0), 0);

  if (totalEvents === 0) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <AnimatedIcon iconName="cycling" className="h-8 w-8 mx-auto mb-2" alt="No events" />
            <p>Không có sự kiện thể thao nào trong thời gian tới</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AnimatedIcon iconName="cycling" className="h-5 w-5" alt="Sports events" />
          Sự kiện thể thao
          <Badge variant="secondary">{totalEvents} sự kiện</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(sportsData).map(([sport, events]) => 
          renderSportEvents(sport, events)
        )}
        
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-sm text-blue-800 mb-2 flex items-center gap-2">
            <AnimatedIcon iconName="strategy-board" className="h-4 w-4" alt="Sports tips" />
            Lưu ý xem thể thao
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Kiểm tra thời tiết trước khi đến sân vận động</li>
            <li>• Chuẩn bị quần áo phù hợp với điều kiện thời tiết</li>
            <li>• Theo dõi cập nhật lịch thi đấu có thể thay đổi do thời tiết</li>
            <li>• Mang theo đồ che mưa nếu có khả năng mưa</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}