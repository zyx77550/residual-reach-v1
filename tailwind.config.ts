import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        bg: {
          primary:   '#06060F',
          secondary: '#0C0C1A',
          card:      '#0F0F1E',
          hover:     '#141428',
        },
        blue: {
          DEFAULT: '#018AC9',
          bright:  '#00B4FF',
          dim:     'rgba(1,138,201,0.08)',
          glow:    'rgba(1,138,201,0.15)',
          border:  'rgba(1,138,201,0.3)',
        },
        text: {
          primary:   '#F0F0F8',
          secondary: '#8888A8',
          muted:     '#44445A',
        },
        status: {
          green:  '#00C48C',
          orange: '#F59E0B',
          red:    '#EF4444',
          blue:   '#018AC9',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          blue:    'rgba(1,138,201,0.3)',
        },
      },
      boxShadow: {
        'blue-sm': '0 0 20px rgba(1,138,201,0.12)',
        'blue-md': '0 0 40px rgba(1,138,201,0.2)',
        'blue-lg': '0 0 80px rgba(1,138,201,0.25)',
        'card':    '0 4px 24px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(1,138,201,0.12) 0%, transparent 70%)',
        'card-glow': 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(1,138,201,0.08) 0%, transparent 70%)',
        'blue-gradient': 'linear-gradient(135deg, #018AC9 0%, #00B4FF 100%)',
      },
      animation: {
        'pulse-blue': 'pulse-blue 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-blue': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(1,138,201,0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(1,138,201,0.4)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
