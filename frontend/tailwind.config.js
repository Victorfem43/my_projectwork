/** @type {import('tailwindcss').Config} */
const path = require('path');

// Get the directory where this config file is located
const configDir = __dirname;

module.exports = {
  content: [
    path.join(configDir, 'app/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(configDir, 'components/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(configDir, 'pages/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(configDir, 'lib/**/*.{js,ts,jsx,tsx}'),
  ],
  safelist: [
    // Critical utility classes
    'bg-gradient-to-b', 'bg-gradient-to-r', 'bg-gradient-to-br',
    'from-[#0a0a0f]', 'via-[#0f0f1a]', 'to-[#0a0a0f]',
    'text-white', 'text-gray-400', 'text-blue-400',
    'min-h-screen', 'container-custom', 'section',
    'animate-fade-in', 'animate-slide-in',
    // Common patterns
    {
      pattern: /^(bg|text|border|rounded|p|m|w|h|flex|grid|gap|space|overflow|z|opacity|shadow|backdrop|hover|focus|active|transition|duration|scale|transform|translate|rotate|animate)-.+/,
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
