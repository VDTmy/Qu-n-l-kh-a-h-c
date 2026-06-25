import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { teacherApi } from "../../services/teacherApi";

const DEMO_ACCOUNTS = [
  {
    label: "Học sinh",
    email: "student@edumaster.vn",
    password: "123456",
    color: "bg-blue-50 text-primary border-primary/20",
  },
  {
    label: "Giảng viên",
    email: "teacher@edumaster.vn",
    password: "123456",
    color: "bg-orange-50 text-accent border-accent/20",
  },
  {
    label: "Admin",
    email: "admin@edumaster.vn",
    password: "123456",
    color: "bg-red-50 text-destructive border-destructive/20",
  },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const doLogin = async (
    e?: React.FormEvent,
    overrideEmail?: string,
    overridePw?: string,
  ) => {
    e?.preventDefault();
    const loginEmail = overrideEmail ?? email;
    const loginPassword = overridePw ?? password;
    setLoading(true);
    try {
      const user = await login(loginEmail, loginPassword);
      toast.success("Đăng nhập thành công!");
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "teacher") {
        // Check teacher profile status
        try {
          const profile = await teacherApi.myProfile();
          if (!profile || profile.status === null) {
            navigate("/teacher-complete-profile");
          } else if (profile.status === "pending") {
            navigate("/teacher-pending");
          } else if (profile.status === "rejected") {
            navigate("/teacher-rejected");
          } else {
            navigate("/lecturer/dashboard");
          }
        } catch {
          // No profile yet
          navigate("/teacher-complete-profile");
        }
      } else {
        // student → home
        navigate("/");
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPw: string) => {
    setEmail(demoEmail);
    setPassword(demoPw);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-blue-800 flex-col items-center justify-center p-12 text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 text-center">
          EduMaster
        </h1>
        <p className="text-blue-100 text-center max-w-sm leading-relaxed">
          Nền tảng học trực tuyến hàng đầu dành cho học sinh THCS, THPT và luyện
          thi đại học Việt Nam.
        </p>
        <img
          src="https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=300&fit=crop&auto=format"
          alt="Học sinh học"
          className="rounded-2xl mt-8 shadow-xl opacity-80 w-full max-w-sm"
        />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <div className="w-full max-w-sm py-6">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-primary">EduMaster</span>
          </div>

          <h2 className="mb-2">Đăng nhập</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Chào mừng bạn quay lại!
          </p>

          <form onSubmit={doLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-border bg-input-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Đăng nhập
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-6 border border-border rounded-xl p-4 bg-card">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Tài khoản demo
            </p>
            <div className="space-y-2 mb-4">
              {DEMO_ACCOUNTS.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between text-xs bg-muted rounded-lg px-3 py-2"
                >
                  <div>
                    <span className="font-medium">{d.label}:</span>
                    <span className="text-muted-foreground ml-1">
                      {d.email}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      / {d.password}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {DEMO_ACCOUNTS.map((d) => (
                <button
                  key={d.label}
                  disabled={loading}
                  onClick={() => {
                    fillDemo(d.email, d.password);
                    doLogin(undefined, d.email, d.password);
                  }}
                  className={`flex-1 min-w-0 px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:opacity-90 disabled:opacity-50 ${d.color}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Tài khoản demo chỉ dùng để kiểm thử giao diện. Khi kết nối backend
              thật, hệ thống sẽ lấy role từ API đăng nhập.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
