import { useMemo, useState } from 'react';
import type { SchoolEvent, Submission } from '@/types';
import { actions, useStore } from '@/store';
import { Modal } from '@/components/Modal';
import { StarRating } from '@/components/StarRating';
import { StatusBadge, MediaPreview } from '@/components/Common';
import { ModerationResultCard } from '@/components/ParentConsole';
import { useToasts } from '@/components/Toast';
import { EventFormModal } from '@/components/EventFormModal';
import { listingLabel, listingState, formatDay } from '@/lib/eventListing';
import {
  Folder,
  Check,
  X,
  ArrowLeft,
  Inbox,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CalendarPlus,
  Pencil,
  CalendarDays,
} from 'lucide-react';

const LISTING_STYLE = {
  listed: 'text-giisGreen-700 bg-giisGreen-50 ring-giisGreen-100',
  scheduled: 'text-brand-700 bg-brand-50 ring-brand-100',
  closed: 'text-slate-500 bg-slate-100 ring-slate-200',
} as const;

export function AdminConsole() {
  const submissions = useStore((s) => s.submissions);
  const events = useStore((s) => s.events);
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolEvent | null>(null);

  const openForm = (e: SchoolEvent | null) => {
    setEditing(e);
    setFormOpen(true);
  };

  const folders = useMemo(() => {
    return events.map((e) => {
      const subs = submissions.filter((s) => s.eventId === e.id);
      const pending = subs.filter((s) => s.status === 'pending').length;
      return { event: e, count: subs.length, pending };
    });
  }, [events, submissions]);

  if (openEventId) {
    const evt = events.find((e) => e.id === openEventId);
    const subs = submissions.filter((s) => s.eventId === openEventId);
    return (
      <EventFolderView
        eventName={evt?.name || ''}
        onBack={() => setOpenEventId(null)}
        submissions={subs}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Review submissions</h2>
          <p className="text-slate-500 text-sm mt-1">
            Open an event folder to approve or reject parent submissions, or add an event for parents to give feedback on.
          </p>
        </div>
        <button
          onClick={() => openForm(null)}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-soft hover:shadow-card hover:-translate-y-px active:translate-y-0"
        >
          <CalendarPlus size={17} /> Add event
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map(({ event, count, pending }) => {
          const state = listingState(event);
          return (
            <div
              key={event.id}
              className={`group relative bg-white rounded-2xl shadow-soft border border-slate-100 hover:border-brand-300 hover:shadow-card transition animate-fade-in ${
                state === 'closed' ? 'opacity-80' : ''
              }`}
            >
              <button
                onClick={() => setOpenEventId(event.id)}
                className="block w-full h-full text-left p-5 rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
              >
                <div className="flex items-start justify-between pr-10">
                  <div className="w-11 h-11 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                    <Folder size={22} />
                  </div>
                  {pending > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                      <Clock size={12} /> {pending} pending
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-slate-900 mt-4">{event.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{event.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ring-1 ${LISTING_STYLE[state]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full bg-current ${state === 'listed' ? 'animate-pulse' : ''}`} />
                    {listingLabel(event)}
                  </span>
                  {event.date && (
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <CalendarDays size={12} /> {formatDay(event.date, true)}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-500">{count} submission{count !== 1 ? 's' : ''}</span>
                  <span className="text-brand-600 font-semibold group-hover:translate-x-0.5 transition">Open →</span>
                </div>
              </button>
              <button
                onClick={() => openForm(event)}
                className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-brand-700 hover:bg-brand-50 transition"
                aria-label={`Edit ${event.name}`}
                title="Edit event and listing dates"
              >
                <Pencil size={15} />
              </button>
            </div>
          );
        })}
      </div>

      <EventFormModal open={formOpen} onClose={() => setFormOpen(false)} event={editing} />
    </div>
  );
}

function EventFolderView({
  eventName,
  submissions,
  onBack,
}: {
  eventName: string;
  submissions: Submission[];
  onBack: () => void;
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-700 mb-4"
      >
        <ArrowLeft size={16} /> Back to events
      </button>
      <h2 className="font-display text-2xl font-bold text-slate-900">{eventName}</h2>
      <p className="text-slate-500 text-sm mt-1">{submissions.length} submission{submissions.length !== 1 ? 's' : ''} in this event.</p>

      <div className="mt-6 space-y-4">
        {submissions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-12 text-center">
            <Inbox size={28} className="mx-auto text-slate-300" />
            <p className="text-slate-500 mt-2">No submissions in this event yet.</p>
          </div>
        )}
        {submissions.map((sub) => (
          <AdminSubmissionRow key={sub.id} sub={sub} />
        ))}
      </div>
    </div>
  );
}

function AdminSubmissionRow({ sub }: { sub: Submission }) {
  const { push } = useToasts();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  const approve = () => {
    actions.approveSubmission(sub.id);
    push('success', `Approved "${sub.eventName}" — sent to Marketing.`);
  };

  const confirmReject = () => {
    if (!reason.trim()) return;
    actions.rejectSubmission(sub.id, reason.trim());
    setRejectOpen(false);
    setReason('');
    push('info', 'Submission rejected — the parent has been notified.');
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden animate-fade-in">
      <div className="grid md:grid-cols-[300px_1fr]">
        <div className="p-4">
          <MediaPreview media={sub.media} className="aspect-video" />
        </div>
        <div className="p-5 border-t md:border-t-0 md:border-l border-slate-100">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">{sub.storyTitle || sub.parentName}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {sub.parentName}
                {sub.childName ? ` · ${sub.childName} (${sub.childGrade})` : ''} · {formatDate(sub.createdAt)}
              </p>
            </div>
            <StatusBadge status={sub.status} />
          </div>

          <div className="flex items-center gap-2 mt-3">
            <StarRating value={sub.rating} readOnly size={16} />
            <span className="text-xs text-slate-500">{sub.rating}.0</span>
          </div>

          {sub.textFeedback && (
            <p className="text-sm text-slate-600 mt-3 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">
              "{sub.textFeedback}"
            </p>
          )}

          {sub.moderation && (
            <div className="mt-3">
              <ModerationResultCard result={sub.moderation} />
            </div>
          )}

          {sub.status === 'rejected' && sub.rejectionReason && (
            <div className="mt-3 bg-giisRed-50 border border-giisRed-100 rounded-lg px-3 py-2 text-sm text-giisRed-700 flex items-start gap-2">
              <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
              <span><span className="font-semibold">Rejected:</span> {sub.rejectionReason}</span>
            </div>
          )}
          {sub.status === 'published' && sub.socialLink && (
            <div className="mt-3 bg-giisGreen-50 border border-giisGreen-100 rounded-lg px-3 py-2 text-sm text-giisGreen-700 flex items-center gap-2">
              <CheckCircle2 size={15} /> Published to {sub.socialLink}
            </div>
          )}

          {sub.status === 'pending' && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={approve}
                className="inline-flex items-center gap-1.5 bg-giisGreen-600 hover:bg-giisGreen-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-soft"
              >
                <Check size={16} /> Approve
              </button>
              <button
                onClick={() => setRejectOpen(true)}
                className="inline-flex items-center gap-1.5 bg-white border border-giisRed-100 text-giisRed-700 hover:bg-giisRed-50 text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                <X size={16} /> Reject
              </button>
            </div>
          )}
          {sub.status === 'approved' && (
            <p className="mt-4 text-xs text-brand-700 bg-brand-50 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg">
              <Check size={14} /> Approved — now in the Marketing queue
            </p>
          )}
        </div>
      </div>

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject submission" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <ImageIcon size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              A rejection reason is required. The parent will see this message on their console.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Rejection Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              autoFocus
              placeholder="e.g. Video is too blurry — please re-upload a higher-quality clip."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-giisRed-600 focus:ring-4 focus:ring-giisRed-600/15 outline-none transition text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setRejectOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmReject}
              disabled={!reason.trim()}
              className="inline-flex items-center gap-1.5 bg-giisRed-600 hover:bg-giisRed-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              <X size={16} /> Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
