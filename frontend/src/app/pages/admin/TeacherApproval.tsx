import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "../../components/ui/States";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { adminApi } from "../../services/adminApi";
import { assetUrl } from "../../services/api";
import { Check, Download, Eye, UserCheck, X } from "lucide-react";
import { toast } from "sonner";

type PendingTeacherProfile = {
  id: number;
  user_id: number;
  phone?: string | null;
  expertise?: string | null;
  experience?: string | null;
  bio?: string | null;
  status?: string | null;
  cv_file_url?: string | null;
  rejection_reason?: string | null;

  user?: {
    id: number;
    full_name: string;
    email: string;
    role?: string;
  } | null;

  teacher?: {
    id: number;
    full_name: string;
    email: string;
    role?: string;
  } | null;
};

export function TeacherApproval() {
  const [profiles, setProfiles] = useState<PendingTeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject";
    id: number;
  } | null>(null);

  const [rejectReason, setRejectReason] = useState("");
  const [selectedProfile, setSelectedProfile] =
    useState<PendingTeacherProfile | null>(null);

  const load = () => {
    setLoading(true);
    setError("");

    adminApi
      .pendingTeachers()
      .then((data) => {
        setProfiles(data as PendingTeacherProfile[]);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const getTeacherName = (profile: PendingTeacherProfile) => {
    return (
      profile.user?.full_name ||
      profile.teacher?.full_name ||
      `Giảng viên #${profile.user_id}` ||
      "—"
    );
  };

  const getTeacherEmail = (profile: PendingTeacherProfile) => {
    return profile.user?.email || profile.teacher?.email || "—";
  };

  const openConfirm = (type: "approve" | "reject", id: number) => {
    setConfirmAction({
      type,
      id,
    });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === "reject" && !rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      if (confirmAction.type === "approve") {
        await adminApi.approveTeacher(confirmAction.id);
        toast.success("Đã duyệt giảng viên!");
      } else {
        await adminApi.rejectTeacher(confirmAction.id, rejectReason.trim());
        toast.success("Đã từ chối hồ sơ!");
      }

      setProfiles((prev) =>
        prev.filter((profile) => profile.id !== confirmAction.id),
      );

      if (selectedProfile?.id === confirmAction.id) {
        setSelectedProfile(null);
      }
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setConfirmOpen(false);
      setConfirmAction(null);
      setRejectReason("");
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2>Duyệt giảng viên</h2>

        <p className="text-sm text-muted-foreground mt-1">
          Danh sách hồ sơ giảng viên chờ phê duyệt
        </p>
      </div>

      {selectedProfile ? (
        <div className="max-w-2xl">
          <button
            onClick={() => setSelectedProfile(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4"
          >
            ← Quay lại danh sách
          </button>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3>{getTeacherName(selectedProfile)}</h3>

                <p className="text-sm text-muted-foreground">
                  {getTeacherEmail(selectedProfile)}
                </p>

                {selectedProfile.phone && (
                  <p className="text-xs text-muted-foreground mt-1">
                    SĐT: {selectedProfile.phone}
                  </p>
                )}
              </div>

              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                Chờ duyệt
              </span>
            </div>

            <div className="space-y-3 mb-6">
              {selectedProfile.expertise && (
                <div>
                  <p className="text-xs text-muted-foreground">Chuyên môn</p>
                  <p className="text-sm">{selectedProfile.expertise}</p>
                </div>
              )}

              {selectedProfile.experience && (
                <div>
                  <p className="text-xs text-muted-foreground">Kinh nghiệm</p>
                  <p className="text-sm">{selectedProfile.experience}</p>
                </div>
              )}

              {selectedProfile.bio && (
                <div>
                  <p className="text-xs text-muted-foreground">Giới thiệu</p>
                  <p className="text-sm">{selectedProfile.bio}</p>
                </div>
              )}

              {selectedProfile.cv_file_url && (
                <a
                  href={assetUrl(selectedProfile.cv_file_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-primary text-sm hover:underline"
                >
                  <Download className="w-4 h-4" />
                  Tải CV
                </a>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => openConfirm("approve", selectedProfile.id)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
                Duyệt
              </button>

              <button
                onClick={() => openConfirm("reject", selectedProfile.id)}
                className="flex items-center gap-2 px-4 py-2 bg-destructive text-white rounded-xl text-sm hover:bg-destructive/90"
              >
                <X className="w-4 h-4" />
                Từ chối
              </button>
            </div>
          </div>
        </div>
      ) : loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={load} />
      ) : profiles.length === 0 ? (
        <EmptyState title="Không có hồ sơ chờ duyệt" icon={UserCheck} />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Giảng viên</th>
                <th className="px-4 py-3 font-medium">Chuyên môn</th>
                <th className="px-4 py-3 font-medium">CV</th>
                <th className="px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {profiles.map((profile) => (
                <tr
                  key={profile.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{getTeacherName(profile)}</p>

                    <p className="text-xs text-muted-foreground">
                      {getTeacherEmail(profile)}
                    </p>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {profile.expertise || "—"}
                  </td>

                  <td className="px-4 py-3">
                    {profile.cv_file_url ? (
                      <a
                        href={assetUrl(profile.cv_file_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary text-xs hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        CV
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProfile(profile)}
                        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary"
                        title="Chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openConfirm("approve", profile.id)}
                        className="p-1.5 rounded-lg hover:bg-green-50 text-muted-foreground hover:text-green-600"
                        title="Duyệt"
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openConfirm("reject", profile.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-destructive"
                        title="Từ chối"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title={
          confirmAction?.type === "approve"
            ? "Duyệt giảng viên"
            : "Từ chối hồ sơ"
        }
        message={
          confirmAction?.type === "approve"
            ? "Bạn xác nhận duyệt hồ sơ giảng viên này?"
            : "Nhập lý do từ chối:"
        }
        confirmLabel={confirmAction?.type === "approve" ? "Duyệt" : "Từ chối"}
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmAction(null);
          setRejectReason("");
        }}
        danger={confirmAction?.type === "reject"}
      >
        {confirmAction?.type === "reject" && (
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Lý do từ chối..."
            className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:border-primary resize-none mt-2"
          />
        )}
      </ConfirmModal>
    </AdminLayout>
  );
}
