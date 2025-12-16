/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midas: {
          gold: '#FFD700',
          darkGold: '#DAA520',
          lightGold: '#FFF4B3',
          bronze: '#CD7F32',
          dark: '#0F0F0F',
          darkGray: '#1A1A1A',
          mediumGray: '#2D2D2D',
          lightGray: '#404040',
        },
        metro: {
          blue: '#00A8E8',
          green: '#00CC6A',
          orange: '#FF8C00',
          purple: '#8B5CF6',
          red: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
        display: ['Segoe UI Light', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'metro': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'gold': '0 4px 12px rgba(255, 215, 0, 0.3)',
        'glow': '0 0 20px rgba(255, 215, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
