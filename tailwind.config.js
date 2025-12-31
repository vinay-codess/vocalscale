/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* --------------  your existing colours / fonts -------------- */
      colors: {
        primary: {
          50: '#edeff3',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#fcfdfd',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        brand: {
          light: '#edeff3',
          DEFAULT: '#fcfdfd',
        },
        slate: {
          850: '#151f32',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      /* --------------  NEW : blob animations -------------- */
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',

        /* the four classes used in AuthLayout */
        'gradient-flow': 'gradientFlow 30s ease infinite',
        'voice-pulse': 'voicePulse 22s ease-in-out infinite',
        'drift-slow': 'driftSlow 35s ease-in-out infinite',
        'drift-fast': 'driftFast 26s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },

        /* blob keyframes */
        gradientFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        voicePulse: {
          '0%, 100%': { transform: 'scale(1) translate(0, 0)', opacity: '0.8' },
          '50%': { transform: 'scale(1.08) translate(30px, 20px)', opacity: '1' },
        },
        driftSlow: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-40px, 60px)' },
        },
        driftFast: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(50px, -40px)' },
        },
      },
    },
  },
  plugins: [],
};