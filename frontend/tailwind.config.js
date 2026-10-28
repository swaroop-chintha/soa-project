/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#30264A',         // Primary deep purple
          action: '#5B4886',       // Primary action purple
          'action-hover': '#4E3C75',
          secondary: '#8B7CE8',    // Secondary lavender
          surface: '#F0EDFF',      // Pale lavender surface
          page: '#F7F6FA',         // Main page background
          card: '#FFFFFF',         // Card background
          text: '#211D2B',         // Main text
          secondaryText: '#777181',// Secondary text
          border: '#EAE6F2',       // Shared border color
          borderDark: '#D8D1E6',
        },
        // Semantic restrained colors
        status: {
          success: '#15803D',
          'success-bg': '#F0FDF4',
          'success-border': '#BBF7D0',
          warning: '#B45309',
          'warning-bg': '#FFFBEB',
          'warning-border': '#FDE68A',
          error: '#B91C1C',
          'error-bg': '#FEF2F2',
          'error-border': '#FECACA',
          info: '#5B4886',
          'info-bg': '#F0EDFF',
          'info-border': '#D4C7F5',
        },
        aegis: {
          bg: '#F7F6FA',
          text: '#211D2B',
          muted: '#777181',
          border: '#EAE6F2',
          accent: '#5B4886',
          navy: '#30264A',
          darkcard: '#30264A',
          card: '#FFFFFF',
        },
        lavender: {
          light: '#F7F5FC',
          surface: '#F0EDFF',
          border: '#EAE6F2',
          hover: '#E4DCFB',
          card: '#FFFFFF',
        },
        darkpurple: '#30264A',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(48, 38, 74, 0.04), 0 1px 2px -1px rgba(48, 38, 74, 0.04)',
        'card': '0 2px 8px -2px rgba(48, 38, 74, 0.06), 0 1px 4px -1px rgba(48, 38, 74, 0.04)',
        'elevated': '0 10px 25px -5px rgba(48, 38, 74, 0.08), 0 8px 10px -6px rgba(48, 38, 74, 0.04)',
      },
      fontFamily: {
        sans: ['"TT Norms Pro"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
      },
      animation: {
        'marquee-hero': 'marquee 22s linear infinite',
        'marquee-backed': 'marquee 30s linear infinite',
        'marquee-reviews': 'marquee 40s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
};
