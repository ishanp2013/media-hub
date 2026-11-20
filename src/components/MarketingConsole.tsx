import { useMemo, useState } from 'react';
import type { Submission } from '@/types';
import { actions, useStore } from '@/store';
import { StarRating } from '@/components/StarRating';
import { StatusBadge, MediaPreview } from '@/components/Common';
import { useToasts } from '@/components/Toast';
import {
  Download,
  Copy,
  Send,
  Check,
  Megaphone,
  Link as LinkIcon,
  CheckCircle2,
} from 'lucide-react';

export function MarketingConsole() {
  const allSubmissions = useStore((s) => s.submissions);
  const events = useStore((s) => s.events);

  const submissions = useMemo(
    () => allSubmissions.filter((sub) => sub.status === 'approved' || sub.status === 'published'),
    [allSubmissions]
  );
  const byEvent = useMemo(
    () =>
      events
        .map((e) => ({ event: e, items: submissions.filter((s) => s.eventId === e.id) }))
        .filter((g) => g.items.length > 0),
    [events, submissions]
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Publishing feed</h2>
          <p className="text-slate-500 text-sm mt-1">Approved submissions ready for the school social channels.</p>
        </div>
        <div className="flex gap-2">
          <StatChip label="Approved" value={submissions.filter((s) => s.status === 'approved').length} tone="brand" />
          <StatChip label="Published" value={submissions.filter((s) => s.status === 'published').length} tone="emerald" />
        </div>
      </div>

      {byEvent.length === 0 && (
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-12 text-center">
          <Megaphone size={28} className="mx-auto text-slate-300" />
          <p className="text-slate-500 mt-2">No approved submissions yet. They'll appear here once admins approve.</p>
        </div>
      )}

      <div className="space-y-8">
        {byEvent.map(({ event, items }) => (
          <section key={event.id}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-display font-bold text-slate-900">{event.name}</h3>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{items.length}</span>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              {items.map((sub) => (
                <MarketingCard key={sub.id} sub={sub} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function StatChip({ label, value, tone }: { label: string; value: number; tone: 'brand' | 'emerald' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    emerald: 'bg-giisGreen-50 text-giisGreen-700 border-giisGreen-100',
  };
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold ${tones[tone]}`}>
      {label}: <span>{value}</span>
    </div>
  );
}

function MarketingCard({ sub }: { sub: Submission }) {
  const { push } = useToasts();
  const [link, setLink] = useState(sub.socialLink || '');
  const [copied, setCopied] = useState(false);

  const downloadMedia = async () => {
    const m = sub.media[0];
    if (!m) {
      push('info', 'No media file attached to this submission.');
      return;
    }
    try {
      if (m.isObjectUrl) {
        // object URL — open in new tab to let user save
        const a = document.createElement('a');
        a.href = m.url;
        a.download = m.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // remote URL — fetch then download
        const res = await fetch(m.url, { mode: 'cors' });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = m.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
      push('success', `Downloading "${m.name}"…`);
    } catch {
      // fallback: open in new tab
      window.open(m.url, '_blank');
      push('info', 'Opened media in a new tab — right-click to save.');
    }
  };

  const copyCaption = async () => {
    const caption = sub.textFeedback || `${sub.parentName} · ${sub.eventName} — ${sub.rating}★`;
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      push('success', 'Caption copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      push('error', 'Could not copy — clipboard permission denied.');
    }
  };

  const publish = () => {
    if (!link.trim()) return;
    actions.publishSubmission(sub.id, link.trim());
    push('success', 'Published! The parent has been notified with the link.');
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden animate-fade-in flex flex-col">
      <div className="relative">
        <MediaPreview media={sub.media} className="aspect-video" />
        <div className="absolute top-3 left-3">
          <StatusBadge status={sub.status} />
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-900">{sub.parentName}</p>
            <p className="text-xs text-slate-500">{sub.childName} · {sub.childGrade}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <StarRating value={sub.rating} readOnly size={14} />
            <span className="text-xs text-slate-500">{sub.rating}.0</span>
          </div>
        </div>

        {sub.textFeedback ? (
          <p className="text-sm text-slate-600 mt-3 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">
            "{sub.textFeedback}"
          </p>
        ) : (
          <p className="text-sm text-slate-400 mt-3 italic">No written feedback — video/photo only.</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={downloadMedia}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg transition"
          >
            <Download size={15} /> Download Media
          </button>
          <button
            onClick={copyCaption}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg transition ${
              copied ? 'bg-giisGreen-100 text-giisGreen-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied!' : 'Copy Caption'}
          </button>
        </div>

        {sub.status === 'published' && sub.socialLink ? (
          <div className="mt-4 bg-giisGreen-50 border border-giisGreen-100 rounded-xl p-3 flex items-start gap-2">
            <CheckCircle2 size={16} className="text-giisGreen-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-giisGreen-700 uppercase tracking-wide">Published</p>
              <a
                href={sub.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-giisGreen-700 hover:underline break-all"
              >
                {sub.socialLink}
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Social Media Post Link</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://instagram.com/p/…"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition text-sm"
                />
              </div>
              <button
                onClick={publish}
                disabled={!link.trim()}
                className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold px-3 py-2 rounded-lg transition whitespace-nowrap"
              >
                <Send size={15} /> Publish & Notify
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
