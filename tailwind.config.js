/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["views/**/*.templ", "views/*.html"],
  plugins: [require("daisyui")],
  corePlugins: {
    preflight: true,
  },
  daisyui: {
    themes: [
      "fantasy"
    ]
  }
};
