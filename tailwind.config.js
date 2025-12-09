export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0f172a',
          glass: 'rgba(30, 41, 59, 0.6)'
        }
      },
      boxShadow: {
        glass: '0 8px 32px rgba(2, 6, 23, 0.6)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
}
