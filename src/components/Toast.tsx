import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const config = {
  success: { icon: CheckCircle2, bg: 'bg-giisGreen-50', border: 'border-giisGreen-100', text: 'text-giisGreen-700', iconColor: 'text-giisGreen-600' },
  error: { icon: AlertTriangle, bg: 'bg-giisRed-50', border: 'border-giisRed-100', text: 'text-giisRed-700', iconColor: 'text-giisRed-600' },
  info: { icon: Info, bg: 'bg-brand-50', border: 'border-brand-200', text: 'text-brand-800', iconColor: 'text-brand-600' },
  warning: { icon: AlertTriangle, bg: 'bg-accent-50', border: 'border-accent-200', text: 'text-accent-800', iconColor: 'text-accent-600' },
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return createPortal(
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 items-end max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const c = config[t.type];
        const Icon = c.icon;
        return <ToastItem key={t.id} toast={t} onDismiss={onDismiss} c={c} Icon={Icon} />;
      })}
    </div>,
    document.body
  );
}

function ToastItem({
  toast,
  onDismiss,
  c,
  Icon,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
  c: (typeof config)[ToastType];
  Icon: (typeof config)[ToastType]['icon'];
}) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2600);
    const t2 = setTimeout(() => onDismiss(toast.id), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 ${c.bg} ${c.border} border rounded-xl shadow-card px-4 py-3 transition-all duration-300 ${
        leaving ? 'opacity-0 translate-y-2' : 'animate-slide-in'
      }`}
    >
      <Icon size={18} className={`${c.iconColor} mt-0.5 flex-shrink-0`} />
      <p className={`text-sm font-medium ${c.text} flex-1`}>{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`${c.iconColor} hover:opacity-70 flex-shrink-0`}
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
}

// One shared toast list, so a toast pushed from any component shows in App's ToastContainer.
let toastList: Toast[] = [];
const toastListeners = new Set<() => void>();
function setToastList(next: Toast[]) {
  toastList = next;
  toastListeners.forEach((l) => l());
}
function pushToast(type: ToastType, message: string) {
  const id = 't-' + Math.random().toString(36).slice(2);
  setToastList([...toastList, { id, type, message }]);
}
function dismissToast(id: string) {
  setToastList(toastList.filter((t) => t.id !== id));
}

export function useToasts() {
  const toasts = useSyncExternalStore(
    (l) => {
      toastListeners.add(l);
      return () => toastListeners.delete(l);
    },
    () => toastList
  );
  return { toasts, push: pushToast, dismiss: dismissToast };
}
