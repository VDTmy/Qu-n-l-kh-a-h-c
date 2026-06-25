import { StudentLayout } from './StudentLayout';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone } from 'lucide-react';

export function StudentProfile() {
  const { user } = useAuth();
  return (
    <StudentLayout>
      <div className="mb-6">
        <h2>Hồ sơ cá nhân</h2>
      </div>
      <div className="max-w-lg bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
            {user?.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <p className="font-bold text-lg">{user?.full_name}</p>
            <span className="text-xs bg-secondary text-primary px-2 py-0.5 rounded-full">Học viên</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Họ tên</p>
              <p className="text-sm font-medium">{user?.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
          </div>
          {user?.phone && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Điện thoại</p>
                <p className="text-sm font-medium">{user.phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
