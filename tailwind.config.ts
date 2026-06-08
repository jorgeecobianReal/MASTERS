import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#dceeff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          900: '#0f2147',
        },
        mint: {
          50: '#effdf7',
          100: '#d8faec',
          500: '#19b981',
          600: '#0f9f70',
        },
      },
      boxShadow: {
        soft: '0 20px 45px rgba(15, 33, 71, 0.12)',
      },
      animation: {
        'fade-up': 'fadeUp 0.55s ease both',
        'pulse-soft': 'pulseSoft 2.6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.035)', opacity: '0.82' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
