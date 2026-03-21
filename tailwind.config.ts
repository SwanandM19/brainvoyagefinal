import type { Config } from 'tailwindcss';

// NOTE: Tailwind v4 reads theme from globals.css @theme block.
// This file is kept only for editor intellisense compatibility.
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'float-up': {
          '0%':   { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-40px)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-8px)' },
          '40%':      { transform: 'translateX(8px)' },
          '60%':      { transform: 'translateX(-5px)' },
          '80%':      { transform: 'translateX(5px)' },
        },
      },
      animation: {
        'float-up': 'float-up 0.9s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
      },
      
    },
  },
};

export default config;