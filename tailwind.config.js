const PrimeUI = require('tailwindcss-primeui');

module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: '#1e63c4',      // primario en modo claro
          dark: '#66d9ef',         // Monokai cyan/azul — antes era verde por error
          soft: '#e8f0fc',
          'soft-dark': '#16323a',  // fondo tenue cyan-oscuro para badges (antes verdoso)
        },
        green: {
          DEFAULT: '#1fa463',      // éxito en modo claro
          dark: '#a6e22e',         // Monokai verde lima real (antes #167a49/#81ae21, inconsistentes)
          soft: '#e5f7ee',
          'soft-dark': '#1e2c14',  // fondo tenue verde-oscuro para badges
        },
        surface: {
          white: '#ffffff',
          alt: '#f2f4f7',
          'white-dark': '#272822', // Monokai bg base (antes gris VSCode #1a2333/#252526)
          'alt-dark': '#3e3d32',   // Monokai "line highlight" para filas/hover
        },
        border: { DEFAULT: '#dce3ea', dark: '#49483e' },   // Monokai selección, tono cálido
        muted: { DEFAULT: '#64748b', dark: '#75715e' },     // Monokai comment (antes gris azulado frío)
        main: { DEFAULT: '#1a2333', dark: '#f8f8f2' },      // Monokai foreground exacto
        danger: { DEFAULT: '#c4401e', dark: '#f92672' },    // Monokai rosa/rojo exacto
      },
    },
  },
  plugins: [PrimeUI],
}