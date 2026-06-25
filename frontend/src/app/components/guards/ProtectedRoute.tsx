import React, { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { teacherApi } from "../../services/teacherApi";
import { TeacherProfile } from "../../services/api";

interface Props {
  children: React.ReactNode;
  role?: "student" | "teacher" | "admin";
  redirectTo?: string;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// MỤC ĐÍCH:
// Guard chung cho route cần đăng nhập và kiểm tra role.

function ProtectedRoute({ children, role, redirectTo = "/login" }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (role && user.role !== role) {
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (user.role === "teacher") {
      return <Navigate to="/lecturer/dashboard" replace />;
    }

    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
}

// MỤC ĐÍCH:
// Guard bảo vệ route giảng viên.

export function TeacherGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  const [profile, setProfile] = useState<TeacherProfile | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setProfile(null);
      return;
    }

    if (user.role !== "teacher") {
      setProfile(null);
      return;
    }

    teacherApi
      .myProfile()
      .then((p) => {
        setProfile(p);
      })
      .catch(() => {
        setProfile(null);
      });
  }, [loading, user]);

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === "student") {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (profile === undefined) {
    return <Spinner />;
  }

  if (profile === null) {
    return <Navigate to="/teacher-complete-profile" replace />;
  }

  if (profile.status === "pending") {
    return <Navigate to="/teacher-pending" replace />;
  }

  if (profile.status === "rejected") {
    return <Navigate to="/teacher-rejected" replace />;
  }

  if (profile.status === "approved") {
    return <>{children}</>;
  }

  return <Navigate to="/teacher-complete-profile" replace />;
}

// MỤC ĐÍCH:
// Guard bảo vệ route Admin.

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute role="admin">{children}</ProtectedRoute>;
}

// MỤC ĐÍCH:
// Guard bảo vệ route Student.

export function StudentGuard({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute role="student">{children}</ProtectedRoute>;
}
