/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,md,mdx}',
    './content/**/*.{md,mdx}',
  ],
  darkMode: 'class',

  theme: {
    extend: {
      keyframes: {
        zoomIn: { '0%': { transform: 'scale(.95)' }, '100%': { transform: 'scale(1)' } },
      },
      animation: { zoomIn: 'zoomIn .15s ease-out' },
    },
  },

  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],

  /* ------- ここが重要 ------- */
    safelist: [
      /* 固定値クラス */
      'fixed','inset-0','bg-black/80',
      'flex','items-center','justify-center','p-4',
      'relative','w-full','h-full','animate-zoomIn',
      'object-contain','rounded',
      /* すべての z-[xxxx] を残す */
      { pattern: /^z-\[.*\]$/ },
    ],
}
