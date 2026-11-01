/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cine: {
          dark: '#070913',
          card: '#0D1122',
          surface: '#13192F',
          border: 'rgba(255, 255, 255, 0.08)',
          cyan: '#00F0FF',
          blue: '#3B82F6',
          violet: '#8B5CF6',
          gold: '#F59E0B',
          neon: '#00F0FF',
        },
        seat: {
          silver: '#94A3B8',
          gold: '#F59E0B',
          platinum: '#38BDF8',
          recliner: '#A855F7',
          vip: '#EC4899',
          available: '#10B981',
          booked: '#EF4444',
          selected: '#F59E0B',
          locked: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        display: ['Cinzel', 'Outfit', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.4)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'screen-glow': '0 20px 80px rgba(0, 240, 255, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
