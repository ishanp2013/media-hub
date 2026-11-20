import { useRef, useState } from 'react';
import type { MediaItem } from '@/types';
import { UploadCloud, FileVideo, FileImage, X, AlertCircle } from 'lucide-react';

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

interface MediaUploaderProps {
  media: MediaItem[];
  onAdd: (items: MediaItem[]) => void;
  onRemove: (id: string) => void;
}

export function MediaUploader({ media, onAdd, onRemove }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setError('');
    const accepted: MediaItem[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setError('Only image or video files are allowed.');
        continue;
      }
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" exceeds the 50MB limit and was skipped.`);
        continue;
      }
      accepted.push({
        id: 'm-' + Math.random().toString(36).slice(2),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        isObjectUrl: true,
      });
    }
    if (accepted.length) onAdd(accepted);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`dropzone-active cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
          dragging ? 'dropzone-active' : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/40'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-3">
          <UploadCloud size={26} />
        </div>
        <p className="font-semibold text-slate-800">Drag & drop photos or videos</p>
        <p className="text-sm text-slate-500 mt-1">or click to browse from your device</p>
        <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
          <AlertCircle size={13} /> Max 50MB per file · JPG, PNG, MP4, MOV
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 flex items-start gap-2 animate-fade-in">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {media.length > 0 && (
        <div className="mt-4 space-y-2">
          {media.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2.5 animate-fade-in"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                {m.type === 'image' ? (
                  <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <video src={m.url} className="w-full h-full object-cover" preload="metadata" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {m.type === 'video' ? <FileVideo size={14} className="text-brand-600" /> : <FileImage size={14} className="text-emerald-600" />}
                  <p className="text-sm font-medium text-slate-800 truncate">{m.name}</p>
                </div>
                <p className="text-xs text-slate-400">{formatSize(m.size)} · {m.type}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (m.isObjectUrl) URL.revokeObjectURL(m.url);
                  onRemove(m.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
