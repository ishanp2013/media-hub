import { useEffect, useState } from 'react';
import {
  Users,
  Lightbulb,
  Palette,
  Music,
  Trophy,
  Scale,
  HeartHandshake,
  Smile,
  Rocket,
} from 'lucide-react';
import { WHEEL_PATHS, WHEEL_VIEWBOX } from '@/components/giisShapes';
import { GIIS_COLORS } from '@/components/GiisLogo';

type Blade = keyof typeof WHEEL_PATHS;

type Gem = {
  name: string;
  lines: [string, string];
  blurb: string;
  blade: Blade;
  icon: typeof Users;
  /** Label anchor in the artwork's coordinates. */
  x: number;
  y: number;
  anchor: 'start' | 'end';
};

// Clockwise from the top, matching the official Nine Gems artwork.
export const GEMS: Gem[] = [
  {
    name: 'Learning Communities',
    lines: ['Learning', 'Communities'],
    blurb: 'Collaborative classrooms where students, teachers and parents learn together.',
    blade: 'green',
    icon: Users,
    x: 382, y: 146, anchor: 'start',
  },
  {
    name: 'Creativity & Innovation',
    lines: ['Creativity &', 'Innovation'],
    blurb: 'Design thinking, robotics and bold ideas that solve real-world problems.',
    blade: 'blue',
    icon: Lightbulb,
    x: 433, y: 224, anchor: 'start',
  },
  {
    name: 'Visual & Digital Arts',
    lines: ['Visual &', 'Digital Arts'],
    blurb: 'Painting, photography, film and digital media that bring stories to life.',
    blade: 'blue',
    icon: Palette,
    x: 441, y: 297, anchor: 'start',
  },
  {
    name: 'Fine & Performing Arts',
    lines: ['Fine &', 'Performing Arts'],
    blurb: 'Music, dance and theatre that build confidence on every stage.',
    blade: 'sky',
    icon: Music,
    x: 429, y: 370, anchor: 'start',
  },
  {
    name: 'Sports Excellence, Health & Fitness',
    lines: ['Sports Excellence,', 'Health & Fitness'],
    blurb: 'Athletics, team sports and wellbeing for a strong body and a balanced mind.',
    blade: 'sky',
    icon: Trophy,
    x: 369, y: 441, anchor: 'start',
  },
  {
    name: 'Ethics & Discipline',
    lines: ['Ethics &', 'Discipline'],
    blurb: 'Integrity, respect and responsibility in everything we do.',
    blade: 'red',
    icon: Scale,
    x: 230, y: 370, anchor: 'end',
  },
  {
    name: 'Community Connection',
    lines: ['Community', 'Connection'],
    blurb: 'Service projects and outreach that give back to Abu Dhabi and beyond.',
    blade: 'red',
    icon: HeartHandshake,
    x: 132, y: 297, anchor: 'end',
  },
  {
    name: 'Personality Development',
    lines: ['Personality', 'Development'],
    blurb: 'Communication, presence and self-belief nurtured in every learner.',
    blade: 'orange',
    icon: Smile,
    x: 124, y: 224, anchor: 'end',
  },
  {
    name: 'Leadership & Entrepreneurship',
    lines: ['Leadership &', 'Entrepreneurship'],
    blurb: 'Student councils, start-ups and initiative that turn ideas into impact.',
    blade: 'orange',
    icon: Rocket,
    x: 153, y: 146, anchor: 'end',
  },
];

const BLADES: Blade[] = ['green', 'blue', 'sky', 'red', 'orange'];
const CYCLE_MS = 3200;

/* Where the wheel sits inside the artwork (the traced paths are at 4× scale). */
const WHEEL_BOX = { x: 134, y: 114, w: 293, h: 371 };
const WHEEL_CENTER = { x: 584, y: 584 }; // in traced (4×) units

/** Unit vector from the wheel centre to the middle of each blade — the direction it "pops" when active. */
const POP: Record<Blade, [number, number]> = Object.fromEntries(
  BLADES.map((b) => {
    const n = WHEEL_PATHS[b].match(/-?\d+(\.\d+)?/g)!.map(Number);
    let sx = 0, sy = 0, c = 0;
    for (let i = 0; i + 1 < n.length; i += 2) { sx += n[i]; sy += n[i + 1]; c++; }
    const dx = sx / c - WHEEL_CENTER.x, dy = sy / c - WHEEL_CENTER.y;
    const len = Math.hypot(dx, dy) || 1;
    return [b, [dx / len, dy / len]];
  })
) as Record<Blade, [number, number]>;

export function NineGemsTitle({ className = '' }: { className?: string }) {
  const gems = [GIIS_COLORS.red, GIIS_COLORS.orange, GIIS_COLORS.green, GIIS_COLORS.blue];
  return (
    <h2 className={`font-display font-black tracking-tight leading-[0.9] ${className}`}>
      <span className="block text-white pl-[0.9em]">Nine</span>
      <span className="block">
        {'Gems'.split('').map((c, i) => (
          <span
            key={i}
            className="inline-block animate-pop-in"
            style={{ color: gems[i], animationDelay: `${150 + i * 90}ms`, textShadow: '0 2px 12px rgba(0,0,0,.25)' }}
          >
            {c}
          </span>
        ))}
        <sup className="text-[0.3em] text-white/70 align-super ml-1">TM</sup>
      </span>
    </h2>
  );
}

export function NineGemsShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % GEMS.length), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [paused, active]);

  const gem = GEMS[active];
  const color = GIIS_COLORS[gem.blade];
  // The dark GIIS blue is too dark to read as text on the navy panel, so text uses a lighter tint.
  const textColor = gem.blade === 'blue' ? '#6AA8F0' : color;
  const ActiveIcon = gem.icon;

  const hoverBlade = (b: Blade) => {
    if (GEMS[active].blade !== b) setActive(GEMS.findIndex((g) => g.blade === b));
  };

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <svg
        viewBox="28 104 516 388"
        className="w-full max-h-[50vh] overflow-visible motion-safe:animate-float select-none"
        role="group"
        aria-label="GIIS Nine Gems"
      >
        <defs>
          <filter id="gem-halo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="38" />
          </filter>
        </defs>

        {/* Soft glow behind the wheel that takes the active gem's colour */}
        <circle
          cx={280}
          cy={262}
          r={120}
          fill={color}
          opacity={0.38}
          filter="url(#gem-halo)"
          style={{ transition: 'fill 700ms ease' }}
        />

        {/* The wheel — exact shapes traced from the artwork */}
        <svg x={WHEEL_BOX.x} y={WHEEL_BOX.y} width={WHEEL_BOX.w} height={WHEEL_BOX.h} viewBox={WHEEL_VIEWBOX} overflow="visible">
          {BLADES.map((b, i) => {
            const on = gem.blade === b;
            const [dx, dy] = POP[b];
            return (
              <g
                key={b}
                className="motion-safe:animate-petal-in"
                style={{
                  animationDelay: `${i * 110}ms`,
                  transformBox: 'view-box',
                  transformOrigin: `${WHEEL_CENTER.x}px ${WHEEL_CENTER.y}px`,
                }}
              >
                <path
                  d={WHEEL_PATHS[b]}
                  fill={GIIS_COLORS[b]}
                  stroke="#ffffff"
                  strokeOpacity={on ? 1 : 0.85}
                  strokeWidth={on ? 9 : 7}
                  strokeLinejoin="round"
                  paintOrder="stroke"
                  onMouseEnter={() => hoverBlade(b)}
                  onClick={() => hoverBlade(b)}
                  className="cursor-pointer"
                  style={{
                    transformBox: 'fill-box',
                    transformOrigin: 'center',
                    transform: on ? `translate(${dx * 20}px, ${dy * 20}px) scale(1.025)` : 'none',
                    filter: on
                      ? `drop-shadow(0 0 36px ${GIIS_COLORS[b]}) drop-shadow(0 10px 24px rgba(0,0,0,.35)) brightness(1.08)`
                      : 'drop-shadow(0 4px 10px rgba(0,0,0,.18))',
                    transition: 'transform 600ms cubic-bezier(.2,.8,.2,1), filter 450ms ease, stroke-width 450ms ease',
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Labels, placed as on the official artwork */}
        {GEMS.map((g, i) => {
          const on = i === active;
          const sameBlade = g.blade === gem.blade;
          const shift = on ? (g.anchor === 'start' ? 4 : -4) : 0;
          return (
            <g
              key={g.name}
              role="button"
              tabIndex={0}
              aria-label={g.name}
              aria-pressed={on}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className="cursor-pointer outline-none animate-fade-in"
              style={{ animationDelay: `${450 + i * 60}ms` }}
            >
              {/* larger invisible hit area */}
              <rect
                x={g.anchor === 'start' ? g.x - 6 : g.x - 112}
                y={g.y - 14}
                width={118}
                height={34}
                fill="transparent"
              />
              <text
                x={g.x}
                y={g.y}
                textAnchor={g.anchor}
                fontSize={12.5}
                fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
                fontWeight={on ? 700 : 500}
                fill={on ? '#ffffff' : sameBlade ? 'rgba(255,255,255,.85)' : 'rgba(219,234,254,.62)'}
                style={{ transition: 'fill 350ms ease, transform 450ms cubic-bezier(.2,.8,.2,1)', transform: `translateX(${shift}px)` }}
              >
                <tspan x={g.x}>{g.lines[0]}</tspan>
                <tspan x={g.x} dy={14.5}>
                  {g.lines[1]}
                </tspan>
              </text>
              {/* colour marker beside the active label */}
              <circle
                cx={g.anchor === 'start' ? g.x - 9 : g.x + 9}
                cy={g.y + 3}
                r={on ? 3.6 : 0}
                fill={GIIS_COLORS[g.blade]}
                style={{ transition: 'r 350ms cubic-bezier(.2,.8,.2,1)' }}
              />
            </g>
          );
        })}
      </svg>

      {/* Active gem detail */}
      <div className="mt-3 flex items-start gap-4 rounded-2xl bg-white/[0.07] backdrop-blur-sm border border-white/10 p-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500"
          style={{ backgroundColor: `${color}2e`, boxShadow: `inset 0 0 0 1.5px ${color}` }}
        >
          <ActiveIcon key={active} size={22} className="animate-pop-in" style={{ color: textColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-200">
            Gem {active + 1} of {GEMS.length}
          </p>
          <div key={active} className="animate-fade-in">
            <h3 className="font-display text-xl font-extrabold leading-tight" style={{ color: textColor }}>
              {gem.name}
            </h3>
            <p className="mt-1 text-sm text-brand-50/90 leading-relaxed">{gem.blurb}</p>
          </div>
          <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              key={`${active}-${paused}`}
              className="h-full origin-left rounded-full"
              style={{
                backgroundColor: color,
                animation: paused ? 'none' : `progress ${CYCLE_MS}ms linear both`,
                transform: paused ? 'scaleX(1)' : undefined,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Compact strip in the five Nine Gems colours for small screens. */
export function NineGemsStrip() {
  return (
    <div className="flex items-center gap-1.5">
      {GEMS.map((g, i) => (
        <span
          key={g.name}
          title={g.name}
          className="h-2 flex-1 rounded-full animate-pop-in"
          style={{ backgroundColor: GIIS_COLORS[g.blade], animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}
