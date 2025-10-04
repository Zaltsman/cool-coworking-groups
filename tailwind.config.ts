import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tan: '#f9f6f2',
        primary: '#1d1d1d',
        border: '#d4d4d4',
      },
    },
  },
  plugins: [],
} satisfies Config;