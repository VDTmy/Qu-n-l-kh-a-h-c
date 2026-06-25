import { PublicHeader } from './PublicHeader';
import { Link } from 'react-router';
import { BookOpen, Facebook, Youtube, Mail, Phone } from 'lucide-react';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <footer className="bg-sidebar text-sidebar-foreground mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">EduMaster</span>
            </div>
            <p className="text-sm text-sidebar-foreground/70">Nền tảng học trực tuyến hàng đầu cho học sinh THCS, THPT và luyện thi đại học.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Khám phá</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/70">
              <li><Link to="/courses" className="hover:text-white transition-colors">Tất cả khóa học</Link></li>
              <li><Link to="/exam-prep" className="hover:text-white transition-colors">Luyện thi</Link></li>
              <li><Link to="/instructors" className="hover:text-white transition-colors">Giảng viên</Link></li>
              <li><Link to="/news" className="hover:text-white transition-colors">Tin tức</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/70">
              <li><Link to="/contact" className="hover:text-white transition-colors">Liên hệ</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Liên hệ</h4>
            <div className="space-y-2 text-sm text-sidebar-foreground/70">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@edumaster.vn</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> 1900 1234</div>
              <div className="flex items-center gap-4 mt-3">
                <a href="#" className="hover:text-white"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white"><Youtube className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-sidebar-border py-4 text-center text-xs text-sidebar-foreground/50">
          © 2024 EduMaster. Bản quyền thuộc về EduMaster Vietnam.
        </div>
      </footer>
    </div>
  );
}
