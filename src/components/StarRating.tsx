import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
}

export function StarRating({ value, onChange, size = 28, readOnly = false }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            className={`relative ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              className={filled ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-300'}
            />
          </button>
        );
      })}
    </div>
  );
}
