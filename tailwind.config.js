/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  darkMode: false,
  theme: {
    extend: {
      screens: {
        xs: '375px',
      },
      lineClamp: {
        2: '2',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        marquee: {
        "0%": { transform: "translateX(0%)" },
        "100%": { transform: "translateX(-50%)" },
      },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
}
