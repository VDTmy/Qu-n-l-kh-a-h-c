import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Award, Bell, BookOpen, GraduationCap, LayoutDashboard, TrendingUp, User } from 'lucide-react';

const navItems = [
  { label: 'Tổng quan', to: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Khóa học của tôi', to: '/student/courses', icon: BookOpen },
  { label: 'Điểm số', to: '/student/scores', icon: TrendingUp },
  { label: 'Tiến độ học tập', to: '/student/progress', icon: TrendingUp },
  { label: 'Giảng viên của tôi', to: '/student/lecturers', icon: GraduationCap },
  { label: 'Chứng chỉ', to: '/student/certificates', icon: Award },
  { label: 'Thông báo', to: '/student/notifications', icon: Bell },
  { label: 'Hồ sơ cá nhân', to: '/student/profile', icon: User },
];

export function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} title="Học viên">
      {children}
    </DashboardLayout>
  );
}
