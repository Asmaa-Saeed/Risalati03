import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // تأكد إن ده بيشمل كل ملفاتك
  ],
  theme: {
    extend: {
      animation: {
        'modal-enter': 'modalEnter 0.3s ease-out forwards',
        'modal-exit': 'modalExit 0.2s ease-in forwards',
        'backdrop-enter': 'backdropEnter 0.3s ease-out forwards',
        'backdrop-exit': 'backdropExit 0.2s ease-in forwards',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        modalEnter: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9) translateY(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          },
        },
        modalExit: {
          '0%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'scale(0.95) translateY(-10px)',
          },
        },
        backdropEnter: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        backdropExit: {
          '0%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
      boxShadow: {
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"), // هنا بنفعل Tailwind Forms Plugin
  ],
};

export default config;
