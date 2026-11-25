/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#172554', // deep navy blue
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
          950: '#0f172a',
        },
        secondary: {
          DEFAULT: '#2563EB', // royal blue
          light: '#3b82f6',
          dark: '#1d4ed8',
        },
        accent: {
          DEFAULT: '#7C3AED', // violet
          light: '#8b5cf6',
          dark: '#6d28d9',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
