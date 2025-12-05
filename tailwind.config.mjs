/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        background: "var(--background)",
        "background-soft": "var(--background-soft)",
        "background-hover": "var(--background-hover)",
        primary: "var(--primary)",
        "primary-light": "var(--primary-light)",
        "primary-dark": "var(--primary-dark)",
        secondary: "var(--secondary)",
        "secondary-light": "var(--secondary-light)",
        accent: "var(--accent)",
        success: "var(--success)",
        error: "var(--error)",
        "dropdown-border": "var(--dropdown-border)",
        "dropdown-hover": "var(--dropdown-hover)",
        "card-bg": "var(--card-bg)",
        "card-border": "var(--card-border)",
        "input-bg": "var(--input-bg)",
        "input-border": "var(--input-border)",
        "star-gold": "var(--star-gold)",
        "star-white": "var(--star-white)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
