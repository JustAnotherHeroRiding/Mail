/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ["./static/**/*.{html,js}", "./templates/**/*.{html,js}"],
  theme: {
    screens: {
      'xs': '475px',
      ...defaultTheme.screens,
    },
    extend: {
      minWidth: {
        '0': '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        'full': '100%',
        'min': 'min-content', // custom min-w style
      },
      colors: {
        spectrum: {
        h1: '#f5724c',
        h2: '#c65425',
        h3: '#ede479',
        h4: '#aade62',
        h5: '#3e6b2d',
        h6: '#54b2de',
        },
        gray: {
          900: '#202225',
          800: '#2f3136',
          700: '#36393f',
          600: '#4f545c',
          400: '#d4d7dc',
          300: '#e3e5e8',
          200: '#ebedef',
          100: '#f2f3f5',
        }
      }
    }
  },
  plugins: [],
}
