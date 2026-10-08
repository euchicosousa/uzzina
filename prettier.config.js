// Prettier only sorts/formats; prettier-plugin-tailwindcss must be the last
// plugin for the JS/TS parsers, so no other parser plugin is combined here.
export default {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./app/tailwind.css",
};
