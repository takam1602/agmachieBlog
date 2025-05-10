module.exports = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#166534', // 深緑
          light: '#4caf50',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
