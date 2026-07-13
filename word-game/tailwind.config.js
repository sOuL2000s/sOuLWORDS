/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          primary: '#3b82f6',
          secondary: '#1d4ed8',
          accent: '#fbbf24'
        }
      }
    },
  },
  plugins: [],
}
