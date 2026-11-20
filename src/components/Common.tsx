import type { MediaItem, Status } from '@/types';

const styles: Record<Status, { label: string; classes: string; dot: string }> = {
  pending: { label: 'Pending Review', classes: 'bg-giisOrange-100 text-giisOrange-700', dot: 'bg-giisOrange-600' },
  approved: { label: 'Approved', classes: 'bg-brand-100 text-brand-700', dot: 'bg-brand-600' },
  rejected: { label: 'Rejected', classes: 'bg-giisRed-100 text-giisRed-700', dot: 'bg-giisRed-600' },
  published: { label: 'Published', classes: 'bg-giisGreen-100 text-giisGreen-700', dot: 'bg-giisGreen-600' },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = styles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function MediaPreview({ media, className = '' }: { media: MediaItem[]; className?: string }) {
  if (!media.length)
    return (
      <div className={`bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm ${className}`}>
        No media
      </div>
    );
  const first = media[0];
  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-900 group ${className}`}>
      {first.type === 'image' ? (
        <img src={first.url} alt={first.name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <video src={first.url} controls className="w-full h-full object-cover" preload="metadata" />
      )}
      {media.length > 1 && (
        <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
          +{media.length - 1} more
        </span>
      )}
    </div>
  );
}

export function MediaGallery({ media }: { media: MediaItem[] }) {
  if (!media.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {media.map((m) => (
        <div key={m.id} className="relative overflow-hidden rounded-lg bg-slate-900 aspect-square">
          {m.type === 'image' ? (
            <img src={m.url} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <video src={m.url} controls className="w-full h-full object-cover" preload="metadata" />
          )}
        </div>
      ))}
    </div>
  );
}

export function CheckRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm text-slate-600">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-giisGreen-600 mt-0.5 flex-shrink-0">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{children}</span>
    </div>
  );
}
