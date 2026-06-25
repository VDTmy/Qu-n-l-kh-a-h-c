import { useEffect, useState } from "react";
import { StudentLayout } from "./StudentLayout";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "../../components/ui/States";
import { certificateApi } from "../../services/studentApi";
import { Award, Copy, Download } from "lucide-react";
import { toast } from "sonner";

type CertificateItem = {
  id: number;
  student_id: number;
  course_id: number;
  certificate_code: string;
  issued_at?: string | null;
  course?: {
    id: number;
    title: string;
    teacher?: {
      id: number;
      full_name: string;
      email: string;
    } | null;
  } | null;
};

export function StudentCertificates() {
  const [certs, setCerts] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    setError("");

    certificateApi
      .mine()
      .then((data) => {
        setCerts(data as CertificateItem[]);
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

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Đã sao chép mã chứng chỉ");
    } catch {
      toast.error("Không thể sao chép mã chứng chỉ");
    }
  };

  const downloadCertificate = async (cert: CertificateItem) => {
    try {
      setDownloadingId(cert.id);

      const blob = await certificateApi.download(cert.id);

      const url = window.URL.createObjectURL(blob as Blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `certificate_${cert.id}.pdf`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Đã tải chứng chỉ");
    } catch {
      toast.error("Không thể tải chứng chỉ");
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "Đã cấp";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Đã cấp";
    }

    return `Cấp ngày: ${date.toLocaleDateString("vi-VN")}`;
  };

  return (
    <StudentLayout>
      <div className="mb-6">
        <h2>Chứng chỉ của tôi</h2>

        <p className="text-sm text-muted-foreground mt-1">
          Các chứng chỉ bạn đã đạt được
        </p>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={load} />
      ) : certs.length === 0 ? (
        <EmptyState
          title="Chưa có chứng chỉ"
          description="Hoàn thành khóa học để nhận chứng chỉ"
          icon={Award}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certs.map((cert) => {
            const courseTitle =
              cert.course?.title || `Khóa học #${cert.course_id}`;

            const teacherName = cert.course?.teacher?.full_name;

            return (
              <div
                key={cert.id}
                className="bg-card rounded-xl border-2 border-primary/20 p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full -translate-y-6 translate-x-6" />

                <Award className="w-10 h-10 text-accent mb-3" />

                <p className="font-semibold text-foreground">{courseTitle}</p>

                {teacherName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Giảng viên: {teacherName}
                  </p>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(cert.issued_at)}
                </p>

                <p className="text-xs text-muted-foreground mt-3 break-all">
                  Mã chứng chỉ:{" "}
                  <span className="font-medium text-foreground">
                    {cert.certificate_code}
                  </span>
                </p>

                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={() => downloadCertificate(cert)}
                    disabled={downloadingId === cert.id}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {downloadingId === cert.id
                      ? "Đang tải..."
                      : "Tải chứng chỉ PDF"}
                  </button>

                  <button
                    onClick={() => copyCode(cert.certificate_code)}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Sao chép mã
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
}
