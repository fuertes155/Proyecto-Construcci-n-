import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';

/** Misma clave que lee el script de arranque de `index.html`. */
const STORAGE_KEY = 'construapp.theme';

/** Coincide con `--canvas` de cada tema (index.css): colorea la barra del navegador en móvil. */
const THEME_COLOR = { light: '#f5f2ec', dark: '#12100e' } as const;

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'system') return stored;
  } catch {
    /* almacenamiento bloqueado */
  }
  return 'light';
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

function applyTheme(preference: ThemePreference) {
  const dark = preference === 'dark' || (preference === 'system' && systemPrefersDark());
  document.documentElement.classList.toggle('dark', dark);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? THEME_COLOR.dark : THEME_COLOR.light);
}

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

/** Preferencia de tema (claro por defecto), persistida en el navegador. */
export const useTheme = create<ThemeState>((set) => ({
  preference: readPreference(),
  setPreference: (preference) => {
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* almacenamiento bloqueado: el tema solo dura esta sesión */
    }
    applyTheme(preference);
    set({ preference });
  },
}));

// Con la opción "sistema", seguir en vivo los cambios del sistema operativo.
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (useTheme.getState().preference === 'system') applyTheme('system');
  });
}
