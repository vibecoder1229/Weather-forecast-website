import { Bot, Sparkles, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export function AISummary() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-purple-500" />
            <span>Tóm tắt AI</span>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs">AI</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Summary */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-2">Dự báo thông minh</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hôm nay tại Hà Nội sẽ có thời tiết khá đẹp với nhiệt độ ổn định 28°C. 
                Tuy nhiên, từ ngày mai có khả năng mưa nhẹ do ảnh hưởng của áp thấp nhiệt đới. 
                Khuyến nghị mang theo áo mưa nếu ra ngoài và hạn chế các hoạt động ngoài trời vào cuối tuần.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span>Nhận định nhanh</span>
          </h4>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm">Thời tiết thuận lợi cho việc đi lại hôm nay</p>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm">Nên mang theo ô dù cho ngày mai</p>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm">Cuối tuần có thể có mưa lớn</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-border">
          <Button variant="outline" size="sm" className="w-full">
            <MessageSquare className="w-4 h-4 mr-2" />
            Hỏi AI về thời tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}