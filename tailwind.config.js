module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Professional color palette
        'surface-primary': '#000000',
        'surface-secondary': '#1A1A1A',
        'surface-tertiary': '#2D2D2D',
        'text-primary': '#FFFFFF',
        'text-secondary': '#999999',
        'text-tertiary': '#666666',
        'accent-blue': '#0066FF',
        'accent-green': '#34C759',
        'accent-red': '#FF3B30',
        'accent-orange': '#FF9500',
        'accent-purple': '#A855F7',
        'accent-pink': '#FF2D55',
      },
      fontFamily: {
        sans: ['PT Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // Professional typography scale
        xs: ['12px', { lineHeight: '16px', letterSpacing: '0.2px' }],
        sm: ['14px', { lineHeight: '20px', letterSpacing: '0px' }],
        base: ['16px', { lineHeight: '24px', letterSpacing: '0px' }],
        lg: ['18px', { lineHeight: '28px', letterSpacing: '0px' }],
        xl: ['20px', { lineHeight: '30px', letterSpacing: '-0.3px' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.4px' }],
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.5px' }],
        '4xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.6px' }],
        '5xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.8px' }],
      },
      fontWeight: {
        // Professional weight scale
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      spacing: {
        // 8px baseline grid
        0: '0px',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
        28: '112px',
        32: '128px',
        36: '144px',
        40: '160px',
        44: '176px',
        48: '192px',
        52: '208px',
        56: '224px',
        60: '240px',
        64: '256px',
      },
      borderRadius: {
        none: '0px',
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        // Professional shadow scale
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        none: 'none',
        // Elevation shadows
        elevation1: '0 2px 8px rgba(0, 0, 0, 0.12)',
        elevation2: '0 4px 16px rgba(0, 0, 0, 0.15)',
        elevation3: '0 8px 24px rgba(0, 0, 0, 0.18)',
      },
      backdropFilter: {
        none: 'none',
        blur: 'blur(10px)',
        'blur-md': 'blur(12px)',
        'blur-lg': 'blur(16px)',
      },
      animation: {
        // Smooth animations
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'scale-up': 'scaleUp 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      transitionDuration: {
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
      },
      transitionTimingFunction: {
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [
    require('tailwindcss/plugin')(({ addBase, addComponents, theme }) => {
      // Professional base styles
      addBase({
        '*': {
          '@apply transition-colors duration-200': {},
        },
        'button, [role="button"]': {
          '@apply focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2': {},
        },
        'input, textarea, select': {
          '@apply focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2': {},
        },
      });

      // Professional component styles
      addComponents({
        // Button variants
        '.btn-primary': {
          '@apply px-4 py-2 bg-accent-blue text-white rounded-lg font-semibold transition-all duration-200 hover:bg-blue-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-secondary': {
          '@apply px-4 py-2 bg-surface-secondary text-text-primary rounded-lg font-semibold border border-surface-tertiary transition-all duration-200 hover:bg-surface-tertiary active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-ghost': {
          '@apply px-4 py-2 text-text-primary rounded-lg font-semibold transition-all duration-200 hover:bg-surface-secondary active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-success': {
          '@apply px-4 py-2 bg-accent-green text-white rounded-lg font-semibold transition-all duration-200 hover:bg-green-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-danger': {
          '@apply px-4 py-2 bg-accent-red text-white rounded-lg font-semibold transition-all duration-200 hover:bg-red-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed': {},
        },

        // Card variants
        '.card-base': {
          '@apply bg-surface-secondary border border-surface-tertiary rounded-xl p-6 transition-all duration-200': {},
        },
        '.card-elevated': {
          '@apply bg-surface-secondary border border-surface-tertiary rounded-xl p-6 shadow-elevation2 transition-all duration-200 hover:shadow-elevation3': {},
        },
        '.card-gradient': {
          '@apply bg-gradient-to-br from-surface-secondary to-surface-tertiary border border-surface-tertiary rounded-xl p-6 transition-all duration-200': {},
        },

        // Input variants
        '.input-base': {
          '@apply w-full bg-surface-secondary border border-surface-tertiary rounded-lg px-4 py-2 text-text-primary placeholder-text-tertiary transition-all duration-200 hover:border-surface-tertiary focus:border-accent-blue focus:ring-1 focus:ring-accent-blue': {},
        },

        // Text variants
        '.text-headline': {
          '@apply text-4xl md:text-5xl font-bold text-text-primary': {},
        },
        '.text-title': {
          '@apply text-2xl md:text-3xl font-bold text-text-primary': {},
        },
        '.text-subtitle': {
          '@apply text-lg md:text-xl font-semibold text-text-secondary': {},
        },
        '.text-body': {
          '@apply text-base text-text-secondary': {},
        },
        '.text-caption': {
          '@apply text-sm text-text-tertiary': {},
        },
      });
    }),
  ],
}

