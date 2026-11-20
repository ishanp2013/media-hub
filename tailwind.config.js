/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // GIIS Royal Blue — primary brand color (#0054A6)
        brand: {
          50: '#e6f0fa',
          100: '#cce0f5',
          200: '#99c2eb',
          300: '#66a3e0',
          400: '#3384d6',
          500: '#0065c0',
          600: '#0054a6',
          700: '#004488',
          800: '#003366',
          900: '#002244',
          950: '#001a33',
        },
        // GIIS Golden Yellow — warm accent (#FDB913)
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#fdb913',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // 5-Continent Palette
        giisRed: {
          DEFAULT: '#E31E24',
          50: '#fef2f2',
          100: '#fee2e2',
          600: '#dc2626',
          700: '#b91c1c',
        },
        giisOrange: {
          DEFAULT: '#F37021',
          50: '#fff7ed',
          100: '#ffedd5',
          600: '#ea580c',
          700: '#c2410c',
        },
        giisGreen: {
          DEFAULT: '#00A651',
          50: '#ecfdf5',
          100: '#d1fae5',
          600: '#059669',
          700: '#047857',
        },
        giisSky: {
          DEFAULT: '#00AEEF',
          50: '#ecfeff',
          100: '#cffafe',
          600: '#0891b2',
          700: '#0e7490',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)',
        card: '0 1px 3px rgba(15,23,42,0.05), 0 10px 30px -12px rgba(15,23,42,0.12)',
        glow: '0 0 0 4px rgba(0,84,166,0.15)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.6)' },
          '70%': { opacity: '1', transform: 'scale(1.06)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'petal-in': {
          '0%': { opacity: '0', transform: 'scale(0.2) rotate(-40deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 90s linear infinite',
        float: 'float 7s ease-in-out infinite',
        'pop-in': 'pop-in 0.45s cubic-bezier(.2,.8,.2,1) both',
        'petal-in': 'petal-in 0.8s cubic-bezier(.2,.8,.2,1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.2s ease-out both',
        'slide-in': 'slide-in 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};
