import { addDays, format } from 'date-fns'
import { fr } from 'date-fns/locale'

/* ============================================================
 * WeekNav — navigation entre les semaines du planning.
 *
 * 💡 date-fns calcule les dates pour nous (lundi de la semaine,
 * numéro de semaine, libellé « 20 au 26 octobre ») : moins
 * d'erreurs de calendrier que du calcul maison.
 * ============================================================ */

/** Props du composant WeekNav. */
export interface WeekNavProps {
  /** Date du lundi de la semaine affichée. */
  weekStart: Date
  /** Callback appelé quand on demande la semaine précédente. */
  onPrevious: () => void
  /** Callback appelé quand on demande la semaine suivante. */
  onNext: () => void
  /** Callback appelé quand on veut revenir à la semaine en cours. */
  onToday: () => void
}

/**
 * Formate le libellé de la semaine (ex. « Semaine 43 — 20 au 26 octobre »).
 * @param {Date} weekStart - Le lundi de la semaine affichée
 * @returns {string} Le libellé de la semaine
 */
function formatWeekLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6)
  const weekNumber = Number(format(weekStart, 'I', { locale: fr }))

  // Si les deux dates sont dans le même mois, on n'écrit le mois qu'une fois.
  const sameMonth =
    format(weekStart, 'yyyy-MM', { locale: fr }) ===
    format(weekEnd, 'yyyy-MM', { locale: fr })
  const range = sameMonth
    ? `${format(weekStart, 'd', { locale: fr })} au ${format(weekEnd, 'd MMMM', { locale: fr })}`
    : `${format(weekStart, 'd MMMM', { locale: fr })} au ${format(weekEnd, 'd MMMM', { locale: fr })}`

  return `Semaine ${weekNumber} — ${range}`
}

/**
 * Composant WeekNav - Affiche la semaine courante et permet d'en changer
 * @param {WeekNavProps} props - Les props du composant
 * @param {Date} props.weekStart - Le lundi de la semaine affichée
 * @param {() => void} props.onPrevious - Callback semaine précédente
 * @param {() => void} props.onNext - Callback semaine suivante
 * @param {() => void} props.onToday - Callback retour à la semaine en cours
 * @returns {JSX.Element} Composant WeekNav
 */
export function WeekNav({ weekStart, onPrevious, onNext, onToday }: WeekNavProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        onClick={onPrevious}
        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:ring-2 focus:ring-slate-200 focus:outline-none active:scale-95 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
      >
        ◀ Précédente
      </button>

      <div className="flex flex-col items-center gap-1">
        <p className="text-center text-sm font-semibold text-slate-800 sm:text-base dark:text-slate-100">
          {formatWeekLabel(weekStart)}
        </p>
        <button
          type="button"
          onClick={onToday}
          className="text-xs font-medium text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          Revenir à la semaine en cours
        </button>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:ring-2 focus:ring-slate-200 focus:outline-none active:scale-95 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
      >
        Suivante ▶
      </button>
    </div>
  )
}
