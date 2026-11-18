/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        app: {
          bg: '#f8f7f4',
          card: '#ffffff',
          border: '#e2dfd9',
        },
      },
    },
  },
  plugins: [],
};
