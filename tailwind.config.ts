import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // 👈 rất quan trọng!
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {}, // Không cần extend custom color
  },
  plugins: [],
}

export default config
