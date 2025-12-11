/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        body: '#050510',
        card: '#11111f',
        primary: '#b3a4ff',
        accent: {
          1: '#ff9f76',
          2: '#5cd4d4',
          3: '#b3a4ff',
        },
        text: '#f5f3ff',
        border: '#22223a',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 32px rgba(92, 212, 212, 0.2), 0 0 36px rgba(179, 164, 255, 0.15)',
        soft: '0 14px 60px rgba(5, 5, 16, 0.65)',
      },
      backgroundImage: {
        'grid-lines':
          'linear-gradient(rgba(245,243,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,243,255,0.03) 1px, transparent 1px)',
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
