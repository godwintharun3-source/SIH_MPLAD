/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          300: '#95bedc',
          400: '#619ecb',
          500: '#3d82b7',
          600: '#2c6799',
          700: '#24537c',
          800: '#1b3a57', // Primary MoSPI Deep Navy
          900: '#0f2338',
          950: '#0a1726',
        },
        accent: {
          500: '#ea580c', // Saffron / Warm Amber accent
          600: '#c2410c',
        },
        risk: {
          low: '#16a34a',
          medium: '#ca8a04',
          high: '#ea580c',
          critical: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
