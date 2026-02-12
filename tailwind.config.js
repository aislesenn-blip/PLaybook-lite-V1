/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC', // Slate-50
        'text-main': '#0F172A', // Slate-900
        brand: '#D97706', // Amber-600
        'velvet-rope': '#0F172A', // Midnight Blue (Slate-900) - Updated per 2nd prompt
        success: '#059669', // Emerald-600
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
