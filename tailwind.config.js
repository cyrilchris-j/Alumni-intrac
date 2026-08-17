/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pure Light Blue & White Palette (No Dark Blue)
        primary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0284C7',
          600: '#2563EB',
          700: '#2563EB',
          800: '#2563EB',
          900: '#2563EB',
          950: '#1D4ED8',
        },
        // WAVE Cyan / Sky Gradient Accent
        gold: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4', // WAVE Gradient Cyan Accent
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
          950: '#083344',
        },
        // Emerald / Success
        emerald: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
        },
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#16A34A',
          600: '#15803D',
          700: '#166534',
        },
        bg: {
          DEFAULT: '#F4F8FF', // Light Blue & White Theme Background
          surface: '#FFFFFF',
          card: '#FFFFFF',
          dark: '#FFFFFF',
          sidebar: '#FFFFFF',
          subtle: '#EFF6FF',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
          gold: '#0284C7',
        },
        border: {
          DEFAULT: '#E2E8F0',
          subtle: '#EFF6FF',
          dark: '#CBD5E1',
          gold: '#BFDBFE',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace'],
        serif: ['Geist', 'Inter', 'sans-serif'],
        heading: ['Geist', 'Inter', 'sans-serif'],
        crest: ['Geist', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'page': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'section': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'card': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 2px 8px -1px rgba(11, 21, 40, 0.04), 0 1px 3px -1px rgba(11, 21, 40, 0.03)',
        'card-hover': '0 12px 28px -4px rgba(11, 21, 40, 0.08), 0 4px 12px -2px rgba(11, 21, 40, 0.04)',
        'luxury': '0 20px 40px -15px rgba(11, 21, 40, 0.12), 0 0 1px 1px rgba(11, 21, 40, 0.04)',
        'gold-glow': '0 0 20px -3px rgba(201, 162, 62, 0.25)',
        'navy-glow': '0 10px 25px -5px rgba(30, 76, 154, 0.25)',
        'sidebar': '1px 0 0 0 rgba(255, 255, 255, 0.06)',
        'topbar': '0 1px 0 0 rgba(226, 232, 240, 0.8)',
        'modal': '0 25px 60px -10px rgba(11, 21, 40, 0.25)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionDuration: {
        '250': '250ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
