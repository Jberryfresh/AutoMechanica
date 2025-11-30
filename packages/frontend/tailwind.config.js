/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'electric-teal': {
          50: '#edfffa',
          100: '#d1fff5',
          200: '#a4f7e7',
          300: '#70efd5',
          400: '#3fe6c6',
          500: '#2ee8c9',
          600: '#23b8a0',
          700: '#198877',
          800: '#0f594f',
          900: '#063a35'
        },
        'deep-navy': {
          50: '#e7edf6',
          100: '#c7d3e6',
          200: '#9eb4d0',
          300: '#7595ba',
          400: '#4c759f',
          500: '#2f597f',
          600: '#204367',
          700: '#152f4d',
          800: '#0f233d',
          900: '#0d1b2a'
        },
        'gunmetal': {
          50: '#eef1f4',
          100: '#d5dbe2',
          200: '#aeb9c7',
          300: '#7c8ca2',
          400: '#566a83',
          500: '#3f4f64',
          600: '#303e51',
          700: '#262f3d',
          800: '#1f2933',
          900: '#161d26'
        },
        'steel-blue': '#3A6EA5',
        'charcoal-black': '#0A0A0A',
        'soft-graphite': '#4A5568',
        'mint-green': '#98F6C3',
        'signal-yellow': '#FFBE0B',
        'infra-red': '#FF3B30'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        brand: '0 10px 30px rgba(15, 35, 61, 0.25)'
      },
      borderRadius: {
        xl: '1rem'
      }
    }
  },
  plugins: []
};
