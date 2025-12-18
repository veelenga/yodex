import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

const TOAST_STYLES = {
  error: 'bg-destructive/90 text-destructive-foreground border-destructive',
  success: 'bg-green-600/90 text-white border-green-700',
  info: 'bg-primary/90 text-primary-foreground border-primary',
};

const TOAST_ICONS = {
  error: AlertCircle,
  success: CheckCircle,
  info: Info,
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = TOAST_ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm pointer-events-auto animate-in slide-in-from-right ${TOAST_STYLES[toast.type]}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
