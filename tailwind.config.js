export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          300: '#a5b4fc',
          500: '#6366f1',
          700: '#4f46e5'
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial']
      },
      boxShadow: {
        card: '0 6px 18px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
}