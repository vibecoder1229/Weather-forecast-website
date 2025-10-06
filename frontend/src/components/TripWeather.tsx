import { Route, MapPin, Calendar, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useState } from "react";

export function TripWeather() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");

  const savedTrips = [
    {
      id: 1,
      from: "Hà Nội",
      to: "Hạ Long",
      date: "03/10/2025",
      weather: "Mưa nhẹ",
      temp: "24°C",
      status: "warning"
    },
    {
      id: 2,
      from: "TP.HCM",
      to: "Vũng Tàu", 
      date: "05/10/2025",
      weather: "Nắng đẹp",
      temp: "30°C",
      status: "good"
    }
  ];

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Route className="w-5 h-5 text-indigo-500" />
          <span>Thời tiết hành trình</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trip Planner */}
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Điểm đi</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Nhập điểm xuất phát..."
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Điểm đến</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Nhập điểm đến..."
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button className="w-full" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Lên kế hoạch hành trình
          </Button>
        </div>

        {/* Saved Trips */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Hành trình đã lưu</h4>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {savedTrips.map((trip) => (
              <div key={trip.id} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{trip.from}</span>
                    <Route className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{trip.to}</span>
                  </div>
                  <Badge 
                    variant={trip.status === "good" ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {trip.temp}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{trip.date}</span>
                  </div>
                  <span className="text-muted-foreground">{trip.weather}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trip Weather Summary */}
        <div className="pt-4 border-t border-border">
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Route className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium">Gợi ý hành trình</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tuần này phù hợp cho việc du lịch miền Nam. Miền Bắc có mưa rải rác từ thứ 5.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}