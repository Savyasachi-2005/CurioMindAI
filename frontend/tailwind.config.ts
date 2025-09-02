import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Poppins', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #1e3a8a 0%, #6d28d9 50%, #0ea5e9 100%)'
      }
    },
  },
  plugins: [],
} satisfies Config
