import type { TimelineStep, Status } from '@/types';
import { Check, X, Upload, Eye, Send } from 'lucide-react';

const stepConfig: { status: Status; label: string; icon: typeof Check; description: string }[] = [
  { status: 'pending', label: 'Submitted', icon: Upload, description: 'Feedback received by the school' },
  { status: 'approved', label: 'Under Admin Review', icon: Eye, description: 'Coordinator is reviewing your media' },
  { status: 'approved', label: 'Approved for Marketing', icon: Check, description: 'Ready for the marketing team' },
  { status: 'published', label: 'Published', icon: Send, description: 'Live on school social media' },
];

export function Timeline({ history, rejectionReason, socialLink }: {
  history: TimelineStep[];
  rejectionReason?: string;
  socialLink?: string;
}) {
  // determine the furthest reached "stage"
  const reachedStatus = history[history.length - 1]?.status ?? 'pending';
  const isRejected = reachedStatus === 'rejected';

  // Build display steps
  interface DisplayStep {
    status: Status;
    label: string;
    icon: typeof Check;
    description: string;
    done: boolean;
    date?: string;
    active?: boolean;
  }

  const displaySteps: DisplayStep[] = isRejected
    ? [
        { ...stepConfig[0], done: true, date: history[0]?.date },
        { ...stepConfig[1], done: true, date: history[0]?.date, active: false },
        {
          status: 'rejected' as Status,
          label: 'Rejected',
          icon: X,
          description: rejectionReason || 'Submission was not approved',
          done: true,
          date: history.find((h) => h.status === 'rejected')?.date,
        },
      ]
    : stepConfig.map((s, i) => {
        const matched = history.find((h) => h.label === s.label);
        const order = statusOrder(reachedStatus);
        const reached = i < order;
        const active = i === order - 1 || (i === order && reached);
        return { ...s, done: reached, date: matched?.date, active };
      });

  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200" />
      <div className="space-y-5">
        {displaySteps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="relative flex items-start gap-4">
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  step.done
                    ? step.status === 'rejected'
                      ? 'bg-giisRed-600 text-white'
                      : step.status === 'published'
                      ? 'bg-giisGreen-600 text-white'
                      : 'bg-brand-600 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                <Icon size={15} />
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex items-center gap-2">
                  <p className={`font-semibold text-sm ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  {step.active && step.done && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                {step.date && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(step.date)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isRejected && rejectionReason && (
        <div className="mt-4 ml-12 bg-giisRed-50 border border-giisRed-100 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
          <X size={16} className="text-giisRed-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-giisRed-700 uppercase tracking-wide">Rejection Reason</p>
            <p className="text-sm text-giisRed-700 mt-0.5">{rejectionReason}</p>
          </div>
        </div>
      )}

      {reachedStatus === 'published' && socialLink && (
        <div className="mt-4 ml-12">
          <a
            href={socialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-giisSky-600 to-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:shadow-card transition shadow-soft"
          >
            <Send size={16} /> Watch on GIIS Social Media
          </a>
        </div>
      )}
    </div>
  );
}

function statusOrder(s: Status): number {
  switch (s) {
    case 'pending':
      return 1;
    case 'approved':
      return 3;
    case 'published':
      return 4;
    default:
      return 4;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
