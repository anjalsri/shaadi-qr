/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#F0D080',
          dark: '#8B6914',
        },
        maroon: {
          DEFAULT: '#7B1B2A',
          light: '#A62339',
          dark: '#4A0D18',
        },
        cream: {
          DEFAULT: '#FBF6EE',
          dark: '#F0E6D0',
        },
        ink: {
          DEFAULT: '#1A0A00',
          muted: '#5C3D2E',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        'radius-lg': '20px',
        'radius': '12px',
        'radius-sm': '8px',
      }
    },
  },
  plugins: [],
}
