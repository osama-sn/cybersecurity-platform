import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          900: '#0a0a0b', // Background
          800: '#121214', // Card bg
          700: '#1c1c1f', // Hover
          600: '#27272a', // Border
          500: '#3f3f46', // Text secondary
          400: '#71717a',
          300: '#a1a1aa',
          200: '#e4e4e7', // Text primary
          100: '#f4f4f5',
          primary: '#10b981', // Emerald 500 (Main accent)
          secondary: '#3b82f6', // Blue 500
          accent: '#8b5cf6', // Violet 500
          danger: '#ef4444', // Red 500
          warning: '#f59e0b', // Amber 500
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [
    typography,
  ],
}
