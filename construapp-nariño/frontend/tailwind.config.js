import forms from '@tailwindcss/forms';

/**
 * Color respaldado por una variable CSS (canales RGB, ver `src/index.css`).
 * Así cada token cambia solo entre tema claro y oscuro y admite opacidad: `bg-brand/15`.
 */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Planos
        canvas: token('canvas'),
        surface: {
          DEFAULT: token('surface'),
          muted: token('surface-muted'),
          strong: token('surface-strong'),
        },
        line: {
          DEFAULT: token('line'),
          strong: token('line-strong'),
          control: token('line-control'),
        },
        // Texto
        ink: {
          DEFAULT: token('ink'),
          muted: token('ink-muted'),
          subtle: token('ink-subtle'),
        },
        // Marca: naranja ladrillo para acciones; `accent` es el naranja vivo decorativo
        brand: {
          DEFAULT: token('brand'),
          hover: token('brand-hover'),
          soft: token('brand-soft'),
          text: token('brand-text'),
          fg: token('brand-fg'),
        },
        accent: token('accent'),
        ring: token('ring'),
        // Estados: `DEFAULT` para marcas (medidores, puntos), `soft` + `text` para etiquetas
        info: { DEFAULT: token('info'), soft: token('info-soft'), text: token('info-text') },
        success: {
          DEFAULT: token('success'),
          soft: token('success-soft'),
          text: token('success-text'),
        },
        warning: {
          DEFAULT: token('warning'),
          soft: token('warning-soft'),
          text: token('warning-text'),
        },
        danger: {
          DEFAULT: token('danger'),
          soft: token('danger-soft'),
          text: token('danger-text'),
          solid: token('danger-solid'),
        },
        // Barra lateral y paneles oscuros (oscuros en ambos temas)
        shell: {
          DEFAULT: token('shell'),
          raised: token('shell-raised'),
          active: token('shell-active'),
          line: token('shell-line'),
          fg: token('shell-fg'),
          muted: token('shell-muted'),
        },
      },
      fontFamily: {
        sans: ['Barlow', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Barlow', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        md: '0.375rem',
        lg: '0.625rem',
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgb(var(--shadow) / 0.06), 0 1px 1px rgb(var(--shadow) / 0.04)',
        raised:
          '0 8px 20px -8px rgb(var(--shadow) / 0.18), 0 2px 6px -2px rgb(var(--shadow) / 0.08)',
        overlay:
          '0 28px 56px -16px rgb(var(--shadow) / 0.32), 0 6px 16px -6px rgb(var(--shadow) / 0.14)',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        // `backwards` (no `both`): al terminar no queda un `transform` residual, que
        // convertiría al contenedor en referencia de los `position: fixed` que tenga dentro.
        rise: 'rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) backwards',
      },
    },
  },
  plugins: [forms],
};
