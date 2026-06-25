import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  BookCheck, BookOpen, ClipboardList, LayoutDashboard,
  MessageSquare, Newspaper, Phone, Tag, User, UserCheck
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Duyệt giảng viên', to: '/admin/teacher-approval', icon: UserCheck },
  { label: 'Duyệt khóa học', to: '/admin/course-approval', icon: BookCheck },
  { label: 'Quản lý tin tức', to: '/admin/news', icon: Newspaper },
  { label: 'Quản lý liên hệ', to: '/admin/contacts', icon: Phone },
  { label: 'Quản lý bình luận', to: '/admin/comments', icon: MessageSquare },
  { label: 'Danh mục môn học', to: '/admin/subjects', icon: BookOpen },
  { label: 'Loại khóa học', to: '/admin/course-types', icon: Tag },
  { label: 'Hồ sơ Admin', to: '/admin/profile', icon: User },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} title="Admin">
      {children}
    </DashboardLayout>
  );
}
