import { useEffect, useMemo, useState } from 'react';
import { actions, useStore } from '@/store';
import { LoginScreen } from '@/components/LoginScreen';
import type { Role } from '@/types';
import { GiisLogo } from '@/components/GiisLogo';
import { SubmitFeedback as ParentSubmit, MySubmissions as ParentMySubmissions } from '@/components/ParentConsole';
import { AdminConsole } from '@/components/AdminConsole';
import { MarketingConsole } from '@/components/MarketingConsole';
import { ToastContainer, useToasts } from '@/components/Toast';
import { Modal } from '@/components/Modal';
import {
  LogOut,
  Bell,
  RotateCcw,
  Users,
  ShieldCheck,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  Send,
  Folder,
  ChevronRight,
} from 'lucide-react';

const roleMeta: Record<Role, { label: string; icon: typeof Users; color: string }> = {
  parent: { label: 'Parent Console', icon: Users, color: 'bg-brand-600' },
  admin: { label: 'Admin Console', icon: ShieldCheck, color: 'bg-slate-700' },
  marketing: { label: 'Marketing Console', icon: Megaphone, color: 'bg-accent-500' },
};

const parentTabs = [
  { id: 'submit', label: 'Submit Feedback', icon: Send },
  { id: 'submissions', label: 'My Submissions', icon: Folder },
] as const;

export default function App() {
  const currentUserId = useStore((s) => s.currentUserId);
  const user = useStore((s) => s.users.find((u) => u.id === s.currentUserId) || null);
  const notifications = useStore((s) => s.notifications);
  const { toasts, push, dismiss } = useToasts();

  const [tab, setTab] = useState<'submit' | 'submissions'>('submit');
  const [notifOpen, setNotifOpen] = useState(false);
  const [focus, setFocus] = useState<{ id: string; nonce: number } | null>(null);

  const openNotification = (submissionId: string) => {
    setNotifOpen(false);
    setTab('submissions');
    // New nonce each click so the same notification can be opened again.
    setFocus({ id: submissionId, nonce: Date.now() });
  };
  const [resetOpen, setResetOpen] = useState(false);

  const userNotifications = useMemo(
    () => (user ? notifications.filter((n) => n.userId === user.id) : []),
    [notifications, user]
  );
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (notifOpen && user && unreadCount > 0) {
      actions.markNotificationsRead(user.id);
    }
  }, [notifOpen, user, unreadCount]);

  if (!currentUserId || !user) {
    return (
      <>
        <LoginScreen />
        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </>
    );
  }

  const meta = roleMeta[user.role];

  return (
    <div className="min-h-screen bg-slate-50 bg-grid">
      {/* 5-continent accent bar on top */}
      <div className="giis-accent-bar h-1 sticky top-0 z-50" />

      {/* Top bar */}
      <header className="sticky top-1 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-slate-100 p-1">
              <GiisLogo size={32} />
            </div>
            <div className="min-w-0">
              <p className="font-display font-extrabold text-slate-900 leading-tight truncate">GIIS Abu Dhabi</p>
              <p className="text-[11px] text-slate-500 leading-tight truncate">Campus Media Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user.role === 'parent' && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen((o) => !o)}
                  className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-giisRed-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <NotificationsPanel
                    items={userNotifications}
                    onClose={() => setNotifOpen(false)}
                    onOpen={openNotification}
                  />
                )}
              </div>
            )}

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100">
              <div className={`w-7 h-7 rounded-lg ${meta.color} text-white flex items-center justify-center text-xs font-bold`}>
                {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{user.name}</p>
                <p className="text-[11px] text-slate-500 leading-tight">{meta.label}</p>
              </div>
            </div>

            <button
              onClick={() => actions.logout()}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Role banner */}
        <div className={`rounded-2xl ${meta.color} text-white p-5 sm:p-6 mb-6 flex items-center justify-between gap-4 shadow-soft relative overflow-hidden`}>
          <div className="absolute top-0 left-0 right-0 h-1 giis-accent-bar" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
              {(() => { const Icon = meta.icon; return <Icon size={22} />; })()}
            </div>
            <div>
              <p className="font-display font-bold text-lg leading-tight">Welcome, {user.name.replace(/^(Mr|Mrs|Ms|Dr)\.?\s+/i, '').split(' ')[0]}</p>
              <p className="text-white/80 text-sm">
                {user.role === 'parent' && `${user.childName} · ${user.childGrade}`}
                {user.role === 'admin' && 'Event Coordinator'}
                {user.role === 'marketing' && 'Social Media Lead'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs (parent) */}
        {user.role === 'parent' && (
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-full sm:w-auto sm:inline-flex">
            {parentTabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    setFocus(null);
                  }}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    active ? 'bg-brand-600 text-white shadow-soft' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={16} /> {t.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Consoles */}
        <div className="animate-fade-in">
          {user.role === 'parent' && tab === 'submit' && <ParentSubmit user={user} />}
          {user.role === 'parent' && tab === 'submissions' && <ParentMySubmissions user={user} focus={focus} />}
          {user.role === 'admin' && <AdminConsole />}
          {user.role === 'marketing' && <MarketingConsole />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © 2026 Global Indian International School, Abu Dhabi · Campus Media Hub
          </p>
          <button
            onClick={() => setResetOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-700 bg-slate-100 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition"
          >
            <RotateCcw size={13} /> Reset Demo Data
          </button>
        </div>
      </footer>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset demo data?" maxWidth="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            This will restore all submissions, notifications, and statuses to their original demo state. Any new
            submissions you've added will be removed. You'll stay logged in.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setResetOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                actions.resetDemoData();
                setResetOpen(false);
                push('success', 'Demo data has been reset.');
              }}
              className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              <RotateCcw size={15} /> Reset
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function NotificationsPanel({
  items,
  onClose,
  onOpen,
}: {
  items: import('@/types').AppNotification[];
  onClose: () => void;
  onOpen: (submissionId: string) => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-12 z-50 w-80 bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden animate-scale-in">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="font-semibold text-slate-900 text-sm">Notifications</p>
          <span className="text-xs text-slate-400">{items.length}</span>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No notifications yet.</div>
          ) : (
            items.map((n) => {
              const Icon = n.type === 'published' ? CheckCircle2 : AlertTriangle;
              const color = n.type === 'published' ? 'text-giisGreen-600 bg-giisGreen-50' : 'text-giisRed-600 bg-giisRed-50';
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onOpen(n.submissionId)}
                  className="group block w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 focus-visible:bg-slate-50 outline-none transition"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-[11px] text-slate-400">{new Date(n.date).toLocaleString()}</p>
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-brand-600 opacity-70 group-hover:opacity-100 transition">
                          View submission <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
