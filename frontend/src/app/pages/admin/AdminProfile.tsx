import { AdminLayout } from './AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Shield, User } from 'lucide-react';

export function AdminProfile() {
  const { user } = useAuth();
  return (
    <AdminLayout>
      <div className="mb-6"><h2>Hồ sơ Admin</h2></div>
      <div className="max-w-md bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div>
            <p className="font-bold text-lg">{user?.full_name}</p>
            <span className="text-xs bg-red-100 text-destructive px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
              <Shield className="w-3 h-3" /> Admin
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <User className="w-4 h-4 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground">Họ tên</p><p className="text-sm font-medium">{user?.full_name}</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{user?.email}</p></div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
