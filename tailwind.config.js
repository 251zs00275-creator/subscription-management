/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Anime design system — Blue Archive × Arknights × Genshin synthesis
        anime: {
          navy:    '#1A2332',  // Arknights dark bg
          surface: '#2A3F5F',  // Arknights card surface
          border:  '#3D5078',  // subtle border
          blue:    '#1455B4',  // Genshin royal blue (CTA)
          'blue-light': '#4A7FD4',
          'blue-dark':  '#0E3A7D',
          sky:     '#9CBFD1',  // Genshin sky blue
          cyan:    '#0DCAF0',  // info accent
          pink:    '#FF92A8',  // Blue Archive sakura pink
          'pink-light': '#FFB8CC',
          gold:    '#D4A574',  // Arknights accent gold
          'gold-light': '#E8C88A',
          purple:  '#D9A2E3',  // premium lavender
          text:    '#E8EAFF',  // slightly blue-white text
          muted:   '#7B8DC8',  // subdued text
          success: '#198754',
          warning: '#FFC107',
          danger:  '#DC3545',
        },
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        noto: ['"Noto Sans JP"', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '12px',
        '2xl': '16px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'float-slow': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'shimmer-blue': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%,100%': { boxShadow: '0 0 0px rgba(59,130,246,0)' },
          '50%': { boxShadow: '0 0 16px rgba(59,130,246,0.4)' },
        },
        'border-glow': {
          '0%,100%': { boxShadow: '0 0 4px rgba(20,85,180,0.3), inset 0 0 4px rgba(20,85,180,0.1)' },
          '50%': { boxShadow: '0 0 12px rgba(20,85,180,0.6), inset 0 0 8px rgba(20,85,180,0.2)' },
        },
        'border-glow-gold': {
          '0%,100%': { boxShadow: '0 0 4px rgba(212,165,116,0.3)' },
          '50%': { boxShadow: '0 0 12px rgba(212,165,116,0.6)' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        float: 'float 3s ease-in-out infinite',
        'float-slow': 'float-slow 4s ease-in-out infinite',
        pop: 'pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        shimmer: 'shimmer 2s linear infinite',
        'shimmer-blue': 'shimmer-blue 1.5s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'border-glow': 'border-glow 2s ease-in-out infinite',
        'border-glow-gold': 'border-glow-gold 2s ease-in-out infinite',
        'count-up': 'count-up 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1)',
        'slide-in-left': 'slide-in-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        scanline: 'scanline 3s linear infinite',
        shake: 'shake 0.5s ease-in-out',
        'bounce-in': 'bounce-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      boxShadow: {
        'glow-blue': '0 0 8px rgba(20,85,180,0.5)',
        'glow-blue-lg': '0 0 20px rgba(20,85,180,0.4)',
        'glow-pink': '0 0 8px rgba(255,146,168,0.5)',
        'glow-gold': '0 0 8px rgba(212,165,116,0.5)',
        'glow-gold-lg': '0 0 20px rgba(212,165,116,0.4)',
        'card-anime': '0 4px 12px rgba(0,0,0,0.08)',
        'card-anime-hover': '0 8px 24px rgba(0,0,0,0.15)',
        'card-dark': '0 2px 8px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
