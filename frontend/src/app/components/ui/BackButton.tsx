import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function BackButton({ to, label = 'Quay lại' }: { to?: string; label?: string }) {
  const navigate = useNavigate();
  const handleClick = () => (to ? navigate(to) : navigate(-1));
  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  );
}
