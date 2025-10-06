import { Mail, Phone, Facebook, Twitter, Instagram, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export function WeatherFooter() {
  return (
    <footer className="bg-card border-t border-border mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-medium">WeatherVN</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Cung cấp thông tin thời tiết chính xác và đáng tin cậy cho người dân Việt Nam.
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Instagram className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium mb-4">Liên kết nhanh</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Trang chủ
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dự báo thời tiết
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Bản đồ thời tiết
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cảnh báo thời tiết
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-medium mb-4">Dịch vụ</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                API thời tiết
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dự báo nông nghiệp
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cảnh báo thiên tai
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Tư vấn khí hậu
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-4">Liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">info@weathervn.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">1900 1234</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Tầng 10, Tòa nhà ABC</p>
                <p>123 Đường XYZ, Hà Nội</p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2025 WeatherVN. Tất cả quyền được bảo lưu.
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Chính sách bảo mật
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Điều khoản sử dụng
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Hỗ trợ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}