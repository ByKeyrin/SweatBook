import { useTheme } from '../../hooks/useTheme'

/* ============================================================
 * ThemeToggle — bouton de bascule clair / sombre.
 * ☀️ en mode clair, 🌙 en mode sombre. Le choix est persisté
 * par le hook useTheme (localStorage « sweatbook_theme »).
 * ============================================================ */

/**
 * Composant ThemeToggle - Bascule entre le mode clair et le mode sombre
 * @returns {JSX.Element} Bouton d'activation / désactivation du mode sombre
 */
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      aria-pressed={isDark}
      title={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-lg shadow-sm transition hover:bg-slate-100 focus:ring-2 focus:ring-blue-200 focus:outline-none active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:focus:ring-blue-900"
    >
      <span aria-hidden="true">{isDark ? '🌙' : '☀️'}</span>
    </button>
  )
}
