import { useCallback, useSyncExternalStore } from 'react'

/* ============================================================
 * useTheme — gestion du thème clair / sombre de SweatBook.
 *
 * Le thème courant est gardé en mémoire au niveau du module
 * (une seule source de vérité) : tous les composants qui
 * appellent useTheme() partagent donc la même valeur.
 * Le choix est persisté dans le localStorage (clé
 * « sweatbook_theme ») et appliqué via la classe « dark » sur
 * la balise <html> (stratégie « class » de Tailwind).
 * ============================================================ */

/** Les deux thèmes disponibles. */
export type Theme = 'light' | 'dark'

/** Clé de persistance du thème dans le localStorage. */
const STORAGE_KEY = 'sweatbook_theme'

/**
 * Lit le thème mémorisé dans le localStorage.
 * @returns {Theme} Le thème sauvegardé, ou 'light' par défaut
 */
function readStoredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'dark' ? 'dark' : 'light'
  } catch {
    // localStorage indisponible (navigation privée…) : thème clair.
    return 'light'
  }
}

/**
 * Applique le thème sur la balise <html> et le sauvegarde.
 * @param {Theme} theme - Le thème à appliquer
 */
function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Pas de persistance possible : on continue sans sauvegarder.
  }
}

// --- Petit store module-level (partagé par tous les useTheme) ---
let currentTheme: Theme = readStoredTheme()
const listeners = new Set<() => void>()

/** Préviens tous les composants abonnés d'un changement de thème. */
function emitChange(): void {
  for (const listener of listeners) listener()
}

/**
 * Définit le thème courant (état + DOM + localStorage).
 * @param {Theme} theme - Le nouveau thème
 */
function setTheme(theme: Theme): void {
  if (theme === currentTheme) return
  currentTheme = theme
  applyTheme(theme)
  emitChange()
}

/**
 * Hook useTheme — état du thème + bascule clair/sombre.
 * @returns {{ theme: Theme, isDark: boolean, toggleTheme: () => void, setTheme: (theme: Theme) => void }}
 *   Le thème courant, un booléen isDark, la fonction de bascule et un setter
 */
export function useTheme(): {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
} {
  const theme = useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange)
      return () => listeners.delete(onStoreChange)
    },
    () => currentTheme,
  )

  /** Bascule entre le mode clair et le mode sombre. */
  const toggleTheme = useCallback((): void => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }, [])

  return { theme, isDark: theme === 'dark', toggleTheme, setTheme }
}

// Le thème mémorisé est appliqué dès le chargement du module,
// avant même le premier rendu (évite un flash de mauvais thème).
applyTheme(currentTheme)
