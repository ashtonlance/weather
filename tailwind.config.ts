import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(240 10% 3.9%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
