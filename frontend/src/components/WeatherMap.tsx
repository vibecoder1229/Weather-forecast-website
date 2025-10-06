import { Map, Layers, Satellite, Radar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState } from "react";

export function WeatherMap() {
  const [selectedLayer, setSelectedLayer] = useState("temperature");

  const mapLayers = [
    { id: "temperature", name: "Nhiệt độ", icon: Layers, color: "orange" },
    { id: "precipitation", name: "Lượng mưa", icon: Radar, color: "blue" },
    { id: "satellite", name: "Vệ tinh", icon: Satellite, color: "green" },
    { id: "wind", name: "Gió", icon: Map, color: "gray" }
  ];

  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Map className="w-5 h-5 text-green-500" />
            <span>Bản đồ thời tiết</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Cập nhật 5 phút trước
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Map Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          {mapLayers.map((layer) => {
            const IconComponent = layer.icon;
            return (
              <Button
                key={layer.id}
                variant={selectedLayer === layer.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLayer(layer.id)}
                className="flex items-center space-x-2"
              >
                <IconComponent className="w-4 h-4" />
                <span>{layer.name}</span>
              </Button>
            );
          })}
        </div>

        {/* Map Container */}
        <div className="relative h-64 lg:h-80 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg overflow-hidden border border-border">
          {/* Mock Map Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Map className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-medium">Bản đồ tương tác</p>
                <p className="text-sm text-muted-foreground">
                  Layer: {mapLayers.find(l => l.id === selectedLayer)?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
            <p className="text-xs font-medium mb-2">Chú thích</p>
            <div className="flex items-center space-x-4 text-xs">
              {selectedLayer === "temperature" && (
                <>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Lạnh</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Ấm</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Nóng</span>
                  </div>
                </>
              )}
              {selectedLayer === "precipitation" && (
                <>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-200 rounded"></div>
                    <span>Nhẹ</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Vừa</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-800 rounded"></div>
                    <span>Nặng</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Location Marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          </div>
        </div>

        {/* Map Info */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Vị trí</p>
              <p className="font-medium">Hà Nội</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tọa độ</p>
              <p className="font-medium">21.0285°N, 105.8542°E</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phóng to</p>
              <p className="font-medium">Cấp 10</p>
            </div>
            <div>
              <p className="text-muted-foreground">Cập nhật</p>
              <p className="font-medium">14:25</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}