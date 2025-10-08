import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Trophy, Calendar, MapPin, Clock } from 'lucide-react';
import { weatherApi } from '../../services/weatherApi';

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

interface SportsEventsCardProps {
  className?: string;
}

export function SportsEventsCard({ className }: SportsEventsCardProps) {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [sportsData, setSportsData] = useState<SportsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetSportsEvents = async () => {
    if (!location.trim()) {
      setError('Vui lòng nhập địa điểm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await weatherApi.getSportsEvents({
        location: location.trim()
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
    const icons: { [key: string]: string } = {
      football: '⚽',
      cricket: '🏏',
      golf: '⛳',
    };
    return icons[sport] || '🏆';
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
        <h4 className="font-medium text-sm flex items-center gap-2 capitalize">
          <span className="text-lg">{getSportIcon(sport)}</span>
          {sport === 'football' ? 'Bóng đá' : sport === 'cricket' ? 'Cricket' : 'Golf'}
          <span className="text-xs text-gray-500">({events.length} trận)</span>
        </h4>
        
        <div className="space-y-2">
          {events.slice(0, 5).map((event, index) => {
            const { date, time } = formatDateTime(event.start);
            return (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 line-clamp-2">
                      {event.match}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {event.tournament}
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {date}
                    </div>
                    {time && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {time}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">
                    {event.stadium}
                    {event.country && `, ${event.country}`}
                  </span>
                </div>
              </div>
            );
          })}
          
          {events.length > 5 && (
            <div className="text-xs text-gray-500 text-center py-2">
              Và {events.length - 5} sự kiện khác...
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Sự kiện thể thao
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="flex gap-2">
          <Input
            placeholder="Nhập tên thành phố..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGetSportsEvents()}
            className="flex-1"
          />
          <Button 
            onClick={handleGetSportsEvents} 
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? 'Đang tải...' : 'Tìm kiếm'}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Sports Events Display */}
        {sportsData && (
          <div className="space-y-6">
            {/* Check if any events exist */}
            {!sportsData.football?.length && !sportsData.cricket?.length && !sportsData.golf?.length ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Không có sự kiện thể thao nào được tìm thấy cho khu vực này.</p>
              </div>
            ) : (
              <>
                {renderSportEvents('football', sportsData.football)}
                {renderSportEvents('cricket', sportsData.cricket)}
                {renderSportEvents('golf', sportsData.golf)}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}