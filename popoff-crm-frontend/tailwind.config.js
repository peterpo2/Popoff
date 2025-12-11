/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        body: '#1a1a2e',
        card: '#252542',
        primary: '#b8b8d1',
        accent: {
          1: '#e8a87c',
          2: '#7ec8c8',
          3: '#c9a7b0',
        },
        text: '#f0ede5',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 25px rgba(126, 200, 200, 0.25)',
        soft: '0 10px 40px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'grid-lines': 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      animation: {
        float: 'float 10s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 6px rgba(232, 168, 124, 0.45))' },
          '50%': { opacity: 0.6, filter: 'drop-shadow(0 0 12px rgba(126, 200, 200, 0.35))' },
        },
      },
    },
  },
  plugins: [],
};
