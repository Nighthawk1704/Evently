/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f7f7f8',
          100: '#efeff1',
          200: '#d9d9de',
          300: '#b7b7c0',
          400: '#8b8b96',
          500: '#63636e',
          600: '#47474f',
          700: '#35353b',
          800: '#202026',
          900: '#0f0f12',
        },
        accent: {
          50:  '#f0f7ff',
          100: '#dceaff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        pop:  '0 10px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.06)',
      },
      maxWidth: {
        container: '1180px',
      },
    },
  },
  plugins: [],
};
