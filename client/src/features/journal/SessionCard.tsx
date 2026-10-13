import { SESSION_TYPE_LABELS, type Session, type SessionType } from '../../types'

/* ============================================================
 * SessionCard — une carte par séance du journal.
 * Formats d'affichage : docs/FUNCTIONAL.md §5.4
 *   distance → 1 décimale · durée → H:MM · allure → M:SS /km
 *   date → JJ/MM/AAAA
 * ============================================================ */

/** Emoji d'illustration par type de sortie. */
const TYPE_ICONS: Record<SessionType, string> = {
  easy: '🏃',
  long: '🛤️',
  interval: '⚡',
  tempo: '🎯',
  recovery: '🧘',
}

/** Props du composant SessionCard. */
export interface SessionCardProps {
  /** Les données de la séance à afficher. */
  session: Session
  /** Callback appelé quand l'utilisateur veut modifier la séance. */
  onEdit?: (session: Session) => void
  /** Callback appelé quand l'utilisateur confirme la suppression. */
  onDelete?: (id: number) => void
}

/**
 * Formate une date ISO (YYYY-MM-DD) en JJ/MM/AAAA.
 * @param {string} iso - Date au format ISO
 * @returns {string} Date lisible (ex. 13/10/2026)
 */
function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

/**
 * Formate une durée en minutes vers le format H:MM.
 * @param {number} minutes - Durée en minutes
 * @returns {string} Durée lisible (ex. 1:22)
 */
function formatDuration(minutes: number): string {
  const total = Math.round(minutes)
  const hours = Math.floor(total / 60)
  const mins = total % 60
  return `${hours}:${String(mins).padStart(2, '0')}`
}

/**
 * Formate une distance en kilomètres (1 décimale, virgule française).
 * @param {number} km - Distance en kilomètres
 * @returns {string} Distance lisible (ex. 15,5 km)
 */
function formatDistance(km: number): string {
  return `${km.toFixed(1).replace('.', ',')} km`
}

/**
 * Formate une allure en M:SS /km (durée ÷ distance).
 * @param {number} durationMin - Durée en minutes
 * @param {number} distanceKm - Distance en kilomètres
 * @returns {string} Allure lisible (ex. 5:17 /km)
 */
function formatPace(durationMin: number, distanceKm: number): string {
  const pace = durationMin / distanceKm
  let minutes = Math.floor(pace)
  let seconds = Math.round((pace - minutes) * 60)

  // L'arrondi peut donner 60 s : on repasse alors à la minute supérieure.
  if (seconds === 60) {
    minutes += 1
    seconds = 0
  }
  return `${minutes}:${String(seconds).padStart(2, '0')} /km`
}

/**
 * Composant SessionCard - Affiche une séance en carte
 * @param {SessionCardProps} props - Les props du composant
 * @param {Session} props.session - Les données de la séance
 * @param {(session: Session) => void} [props.onEdit] - Callback de modification
 * @param {(id: number) => void} [props.onDelete] - Callback de suppression
 * @returns {JSX.Element} Composant SessionCard
 */
export function SessionCard({ session, onEdit, onDelete }: SessionCardProps) {
  /** Demande confirmation puis supprime la séance. */
  const handleDelete = (): void => {
    // La suppression demande toujours une confirmation (FUNCTIONAL.md §5.5).
    const confirmed = window.confirm(
      'Supprimer cette séance ? Cette action est irréversible.',
    )
    if (confirmed && onDelete) onDelete(session.id)
  }

  return (
    <article
      data-testid="session-card"
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between"
    >
      {/* ---------- Informations principales ---------- */}
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">
          {TYPE_ICONS[session.type]}
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-800">
            <time dateTime={session.date}>{formatDate(session.date)}</time>
            {' · '}
            {SESSION_TYPE_LABELS[session.type]}
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            {formatDistance(session.distance_km)} · {formatDuration(session.duration_min)} ·{' '}
            {formatPace(session.duration_min, session.distance_km)}
          </p>

          {(session.avg_hr !== undefined || session.feeling !== undefined) && (
            <p className="text-sm text-slate-500">
              {session.avg_hr !== undefined && <>FC {session.avg_hr} bpm</>}
              {session.avg_hr !== undefined && session.feeling !== undefined && ' · '}
              {session.feeling !== undefined && <>Ressenti {session.feeling}/5</>}
            </p>
          )}

          {session.notes && (
            <p className="mt-2 rounded-lg bg-slate-50 p-2 text-sm break-words text-slate-600">
              {session.notes}
            </p>
          )}
        </div>
      </div>

      {/* ---------- Actions ---------- */}
      <div className="flex shrink-0 gap-2">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(session)}
            className="rounded-xl border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          >
            Modifier
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-xl border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 focus:ring-2 focus:ring-red-200 focus:outline-none"
          >
            Supprimer
          </button>
        )}
      </div>
    </article>
  )
}
