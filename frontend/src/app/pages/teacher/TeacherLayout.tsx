import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  BookOpen, ClipboardList, FileText,
  LayoutDashboard, MessageSquare, TrendingUp, User, Users, Video
} from 'lucide-react';

const navItems = [
  { label: 'Tổng quan', to: '/lecturer/dashboard', icon: LayoutDashboard },
  { label: 'Hồ sơ giảng viên', to: '/lecturer/profile', icon: User },
  { label: 'Khóa học của tôi', to: '/lecturer/courses', icon: BookOpen },
  { label: 'Quản lý bài giảng', to: '/lecturer/lessons', icon: Video },
  { label: 'Quản lý tài liệu', to: '/lecturer/documents', icon: FileText },
  { label: 'Quản lý bài kiểm tra', to: '/lecturer/exams', icon: ClipboardList },
  { label: 'Danh sách học sinh', to: '/lecturer/students', icon: Users },
  { label: 'Kết quả học tập', to: '/lecturer/results', icon: TrendingUp },
  { label: 'Bình luận / Phản hồi', to: '/lecturer/comments', icon: MessageSquare },
];

export function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} title="Giảng viên">
      {children}
    </DashboardLayout>
  );
}
