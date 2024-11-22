/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/index.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      'corporate',
      'business',
      'synthwave',
    ],
  },
}
