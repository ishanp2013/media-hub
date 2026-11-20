import { useEffect, useMemo, useState } from 'react';
import type { MediaItem, ModerationResult, Submission, User } from '@/types';
import { actions, useStore } from '@/store';
import { MediaUploader } from '@/components/MediaUploader';
import { StarRating } from '@/components/StarRating';
import { Timeline } from '@/components/Timeline';
import { StatusBadge, CheckRow } from '@/components/Common';
import { useToasts } from '@/components/Toast';
import { moderateStory } from '@/lib/moderation';
import { formatDay, isListed } from '@/lib/eventListing';
import {
  Send,
  Image as ImageIcon,
  FileText,
  Calendar,
  ChevronDown,
  Check,
  ShieldCheck,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

const roleHeadline: Record<string, string> = {
  parent: 'Share your family\u2019s school story',
};

export function SubmitFeedback({ user }: { user: User }) {
  const allEvents = useStore((s) => s.events);
  // Only events the admin has currently opened for feedback.
  const events = useMemo(() => allEvents.filter((e) => isListed(e)), [allEvents]);
  const { push } = useToasts();

  const [eventId, setEventId] = useState('');
  const [rating, setRating] = useState(0);
  const [storyTitle, setStoryTitle] = useState('');
  const [textFeedback, setTextFeedback] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [checking, setChecking] = useState(false);
  const [moderation, setModeration] = useState<ModerationResult | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedEvent = events.find((e) => e.id === eventId);
  const canRunCheck =
    !!eventId && rating > 0 && (media.some((m) => m.type === 'video') || textFeedback.trim().length > 0);

  const addMedia = (items: MediaItem[]) => setMedia((prev) => [...prev, ...items]);
  const removeMedia = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
    setModeration(null);
  };

  const runAiCheck = async () => {
    if (!canRunCheck) return;
    setChecking(true);
    setModeration(null);
    try {
      const result = await moderateStory({
        title: storyTitle.trim(),
        text: textFeedback.trim(),
        transcript: '',
        hasVideo: media.some((m) => m.type === 'video'),
      });
      setModeration(result);
      push(result.status === 'pass' ? 'success' : 'warning', result.status === 'pass'
        ? 'AI check passed — your story is ready to submit.'
        : 'AI flagged some wording — cleaned text is shown below.');
    } catch {
      push('error', 'AI check could not run. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const submit = () => {
    if (!canRunCheck || !selectedEvent || !moderation) return;
    const sub: Submission = {
      id: 'sub-' + Math.random().toString(36).slice(2),
      parentId: user.id,
      parentName: user.name,
      childName: user.childName || '',
      childGrade: user.childGrade || '',
      eventId: selectedEvent.id,
      eventName: selectedEvent.name,
      rating,
      textFeedback: moderation.cleanedText,
      media,
      status: 'pending',
      createdAt: new Date().toISOString(),
      history: [{ status: 'pending', label: 'Submitted', date: new Date().toISOString() }],
      storyTitle: (moderation.cleanedTitle ?? storyTitle).trim(),
      submitterRole: user.role,
      moderation,
    };
    actions.addSubmission(sub);
    setSuccess(true);
    push('success', 'Story submitted with the AI check attached — the admin team will review it.');
    setTimeout(() => {
      setEventId('');
      setRating(0);
      setStoryTitle('');
      setTextFeedback('');
      setMedia([]);
      setModeration(null);
      setSuccess(false);
    }, 2200);
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-10 text-center animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-giisGreen-100 text-giisGreen-600 flex items-center justify-center mx-auto mb-4">
          <Check size={32} />
        </div>
        <h3 className="font-display text-xl font-bold text-slate-900">Story sent!</h3>
        <p className="text-slate-500 mt-1">
          The AI check result is attached. Track progress under "My Submissions".
        </p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-slate-900">
          {roleHeadline[user.role] ?? 'Share your school story'}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Every submission runs through an automatic AI safety check before reaching the admin team.
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">School Event</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition text-sm appearance-none"
              >
                <option value="">{events.length ? 'Select an event…' : 'No events are open for feedback right now'}</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {selectedEvent && (
              <div className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg px-3 py-2 animate-fade-in">
                {selectedEvent.description && <p>{selectedEvent.description}</p>}
                {selectedEvent.listUntil && (
                  <p className={`font-medium text-brand-700 ${selectedEvent.description ? 'mt-1' : ''}`}>
                    Feedback open until {formatDay(selectedEvent.listUntil, true)}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Your Rating</label>
            <div className="flex items-center gap-4">
              <StarRating value={rating} onChange={setRating} />
              {rating > 0 && <span className="text-sm text-slate-500 font-medium">{rating} of 5</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Story Title <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={storyTitle}
              onChange={(e) => {
                setStoryTitle(e.target.value);
                setModeration(null);
              }}
              placeholder="e.g. The day I spoke on stage"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Photos & Videos</label>
            <MediaUploader media={media} onAdd={addMedia} onRemove={removeMedia} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
              <FileText size={15} className="text-slate-400" /> Your Story <span className="text-slate-400 font-normal">(text, optional if video attached)</span>
            </label>
            <textarea
              value={textFeedback}
              onChange={(e) => {
                setTextFeedback(e.target.value);
                setModeration(null);
              }}
              rows={5}
              placeholder="Tell us about your favorite moment from the event…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition text-sm resize-none"
            />
          </div>

          {moderation && <ModerationResultCard result={moderation} />}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={runAiCheck}
              disabled={!canRunCheck || checking}
              className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-2.5 px-6 rounded-xl transition shadow-soft disabled:shadow-none"
            >
              {checking ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              {checking ? 'AI check running…' : moderation ? 'Re-run AI Check' : 'Run AI Safety Check'}
            </button>
            <button
              onClick={submit}
              disabled={!moderation}
              className="inline-flex items-center justify-center gap-2 bg-giisGreen-600 hover:bg-giisGreen-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-2.5 px-6 rounded-xl transition shadow-soft disabled:shadow-none"
            >
              <Send size={18} /> Submit Story
            </button>
          </div>
          {!moderation && (
            <p className="text-xs text-slate-400">
              Submit Story unlocks after the AI safety check runs on your text or video.
            </p>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-600" /> How the AI check works
          </h3>
          <div className="mt-3 space-y-2">
            <CheckRow>Unsuitable or hurtful words are replaced with "[removed]"</CheckRow>
            <CheckRow>Your authentic voice and meaning stay intact</CheckRow>
            <CheckRow>Videos are screened via their transcript</CheckRow>
            <CheckRow>The check result travels with your story to the admin</CheckRow>
          </div>
        </div>
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 giis-accent-bar" />
          <p className="font-display font-bold text-sm">How it works</p>
          <ol className="mt-3 space-y-2 text-sm text-brand-100">
            <li>1. You submit media + your story</li>
            <li>2. AI safety check runs automatically</li>
            <li>3. Coordinator reviews &amp; approves</li>
            <li>4. Marketing publishes — words untouched</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}

export function ModerationResultCard({ result }: { result: ModerationResult }) {
  const pass = result.status === 'pass';
  return (
    <div
      className={`rounded-2xl border p-4 animate-fade-in ${
        pass ? 'bg-giisGreen-50 border-giisGreen-100' : 'bg-accent-50 border-accent-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            pass ? 'bg-giisGreen-100 text-giisGreen-600' : 'bg-accent-100 text-accent-600'
          }`}
        >
          {pass ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`font-semibold text-sm ${pass ? 'text-giisGreen-700' : 'text-accent-800'}`}>
              AI Safety Check: {pass ? 'Passed' : 'Flagged'}
            </p>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
              {result.provider === 'ai' ? 'AI model' : 'Built-in filter'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Text: {result.textStatus} · Video: {result.videoStatus}
          </p>

          {result.issues.length > 0 && (
            <ul className="mt-2 space-y-1">
              {result.issues.map((issue, i) => (
                <li key={i} className="text-xs text-accent-800 flex items-start gap-1.5">
                  <span className="mt-1 w-1 h-1 rounded-full bg-accent-500 flex-shrink-0" /> {issue}
                </li>
              ))}
            </ul>
          )}
          {result.notes.map((note, i) => (
            <p key={i} className="text-xs text-slate-500 mt-1.5 italic">
              {note}
            </p>
          ))}

          {result.cleanedTitle && /\[removed\]/.test(result.cleanedTitle) && (
            <div className="mt-3 bg-white rounded-xl border border-slate-200 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Cleaned title
              </p>
              <p className="text-sm text-slate-700 font-semibold">{result.cleanedTitle}</p>
            </div>
          )}
          {result.cleanedText && (
            <div className="mt-3 bg-white rounded-xl border border-slate-200 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Cleaned story text
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">{result.cleanedText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MySubmissions({ user, focus }: { user: User; focus?: { id: string; nonce: number } | null }) {
  const allSubmissions = useStore((s) => s.submissions);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // When opened from a notification, scroll to that submission and briefly highlight it.
  useEffect(() => {
    if (!focus) return;
    const el = document.getElementById(`submission-${focus.id}`);
    if (!el) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Land the card just below the sticky header.
    const target = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 96);
    const startY = window.scrollY;
    window.scrollTo({ top: target, behavior: reduceMotion ? 'auto' : 'smooth' });
    // Some browsers ignore smooth scrolling; jump there only if it never started.
    const fallback = window.setTimeout(() => {
      if (Math.abs(window.scrollY - startY) < 2 && Math.abs(target - startY) > 2) window.scrollTo({ top: target });
    }, 400);
    setHighlightId(focus.id);
    const t = window.setTimeout(() => setHighlightId(null), 2600);
    return () => {
      window.clearTimeout(fallback);
      window.clearTimeout(t);
    };
  }, [focus]);
  const submissions = useMemo(
    () =>
      allSubmissions
        .filter((sub) => sub.parentId === user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [allSubmissions, user.id]
  );

  if (!submissions.length) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <ImageIcon size={26} />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-900">No submissions yet</h3>
        <p className="text-slate-500 text-sm mt-1">Head to the "Submit Story" tab to share your first story.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((sub) => (
        <SubmissionCard key={sub.id} sub={sub} highlighted={highlightId === sub.id} />
      ))}
    </div>
  );
}

function SubmissionCard({ sub, highlighted = false }: { sub: Submission; highlighted?: boolean }) {
  return (
    <div
      id={`submission-${sub.id}`}
      className={`bg-white rounded-2xl shadow-soft border overflow-hidden animate-fade-in scroll-mt-28 transition-all duration-500 ${
        highlighted ? 'border-brand-400 ring-4 ring-brand-500/25 shadow-card' : 'border-slate-100 ring-0 ring-transparent'
      }`}
    >
      <div className="grid md:grid-cols-[280px_1fr]">
        <div className="bg-slate-100 md:bg-transparent p-4 md:p-5">
          <MediaPreviewBlock sub={sub} />
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-slate-900">
                {sub.storyTitle || sub.eventName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {sub.eventName} · Submitted {formatDate(sub.createdAt)}
                {sub.childName ? ` · ${sub.childName} (${sub.childGrade})` : ''}
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

          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Status Timeline</p>
            <Timeline history={sub.history} rejectionReason={sub.rejectionReason} socialLink={sub.socialLink} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaPreviewBlock({ sub }: { sub: Submission }) {
  if (!sub.media.length)
    return <div className="aspect-video bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm">Text story</div>;
  const m = sub.media[0];
  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
      {m.type === 'image' ? (
        <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
      ) : (
        <video src={m.url} controls className="w-full h-full object-cover" preload="metadata" />
      )}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
