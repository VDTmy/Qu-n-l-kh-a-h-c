import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, BookOpen, ChevronDown, LogOut, Menu, User, X } from 'lucide-react';
import { notificationApi } from '../../services/studentApi';
import { useEffect } from 'react';

export function PublicHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user?.role === 'student') {
      notificationApi.unreadCount().then(r => setUnread(r.unread_count)).catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Trang chủ', to: '/' },
    { label: 'Khóa học', to: '/courses' },
    { label: 'Luyện thi', to: '/exam-prep' },
    { label: 'Giảng viên', to: '/instructors' },
    { label: 'Tin tức', to: '/news' },
    { label: 'Liên hệ', to: '/contact' },
  ];

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-primary">Edu<span className="text-accent">Master</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary hover:text-primary transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'student' && (
                <Link to="/student/notifications" className="relative p-2 rounded-lg hover:bg-secondary">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-white text-[10px] flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </Link>
              )}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium max-w-24 truncate">{user.full_name}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-border py-1 z-50">
                    {user.role === 'student' && (
                      <>
                        <Link to="/student/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                          <User className="w-4 h-4" /> Hồ sơ cá nhân
                        </Link>
                        <Link to="/student/courses" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                          <BookOpen className="w-4 h-4" /> Khóa học của tôi
                        </Link>
                        <Link to="/student/scores" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                          Điểm số
                        </Link>
                        <Link to="/student/progress" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                          Tiến độ học
                        </Link>
                      </>
                    )}
                    {user.role === 'teacher' && (
                      <Link to="/lecturer/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                        Dashboard giảng viên
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                        Dashboard admin
                      </Link>
                    )}
                    <hr className="my-1 border-border" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-secondary transition-colors">
                Đăng nhập
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors">
                Đăng ký
              </Link>
            </>
          )}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 py-3 flex flex-col gap-1">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm hover:bg-secondary">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
