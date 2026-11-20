import { LOGO_PATHS, LOGO_VIEWBOX } from '@/components/giisShapes';

export const GIIS_COLORS = {
  red: '#ED1C24',
  sky: '#00AEEF',
  blue: '#0D57A6',
  green: '#A6CE39',
  orange: '#F7941D',
} as const;

const ORDER = ['green', 'orange', 'blue', 'sky', 'red'] as const;

interface GiisLogoProps {
  size?: number;
  className?: string;
  /** Sweep the colour bands in one after another on mount. */
  animated?: boolean;
}

/** The GIIS swirl logo, traced from the official artwork. Place it on a light background. */
export function GiisLogo({ size = 40, className = '', animated = false }: GiisLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={LOGO_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="GIIS logo"
    >
      {ORDER.map((k, i) => (
        <path
          key={k}
          d={LOGO_PATHS[k]}
          fill={GIIS_COLORS[k]}
          stroke={GIIS_COLORS[k]}
          strokeWidth={5}
          strokeLinejoin="round"
          className={animated ? 'motion-safe:animate-petal-in' : undefined}
          style={animated ? { animationDelay: `${i * 90}ms`, transformBox: 'view-box', transformOrigin: 'center' } : undefined}
        />
      ))}
    </svg>
  );
}
