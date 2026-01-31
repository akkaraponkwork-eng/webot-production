/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        animation: {
            float: 'float 3s ease-in-out infinite',
            'float-slow': 'float 6s ease-in-out infinite',
        },
        keyframes: {
            float: {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-10px)' },
            }
        },
        colors: {
            orange: {
                50: '#fff7ed',
                100: '#ffedd5',
                500: '#f97316',
                600: '#ea580c',
            }
        }
    },
  },
  plugins: [],
}
