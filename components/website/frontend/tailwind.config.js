import { createThemes } from "tw-colors";
import { buildCatppuccinThemes } from "./lib/tailwind/buildCatppuccinThemes.js";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      backgroundImage: {
        'placeholder-pattern': 'url("https://app.revolt.chat/assets/background.a19b5c96.jpg")',
      },
      fontFamily: {
        title: ['Urbanist Variable', ...require('tailwindcss/defaultTheme.js').fontFamily.sans],
      },
    },
    colors: {

    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require("tailwindcss-animate"),
    require('tailwindcss-opentype'),
    createThemes({
      ...buildCatppuccinThemes('catppuccin-'),
	}
	,{
      produceThemeClass: (themeName) => `theme-${themeName}`,
      strict: true,
      defaultTheme: {
        light: 'catppuccin-latte',
        dark: 'catppuccin-mocha',
      }
    }
	),
  ],
};
// vim: set ts=2 sw=2 et:
