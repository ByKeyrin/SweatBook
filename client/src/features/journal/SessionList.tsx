import type { Session } from '../../types'

import { SessionCard } from './SessionCard'

/* ============================================================
 * SessionList — liste des séances du journal, de la plus
 * récente à la plus ancienne (tri par date décroissante).
 * ============================================================ */

/** Props du composant SessionList. */
export interface SessionListProps {
  /** Toutes les séances du journal (l'ordre n'a pas d'importance). */
  sessions: Session[]
  /** Callback appelé quand l'utilisateur veut créer une séance. */
  onCreate: () => void
  /** Callback appelé quand l'utilisateur veut modifier une séance. */
  onEdit: (session: Session) => void
  /** Callback appelé quand l'utilisateur supprime une séance. */
  onDelete: (id: number) => void
}

/**
 * Composant SessionList - Affiche la liste des séances du journal
 * @param {SessionListProps} props - Les props du composant
 * @param {Session[]} props.sessions - Les séances à afficher
 * @param {() => void} props.onCreate - Callback de création
 * @param {(session: Session) => void} props.onEdit - Callback de modification
 * @param {(id: number) => void} props.onDelete - Callback de suppression
 * @returns {JSX.Element} Composant SessionList
 */
export function SessionList({ sessions, onCreate, onEdit, onDelete }: SessionListProps) {
  // Tri par date décroissante (la plus récente d'abord), puis par id.
  const sorted = [...sessions].sort(
    (a, b) => b.date.localeCompare(a.date) || b.id - a.id,
  )

  return (
    <section className="flex flex-col gap-4">
      {/* ---------- En-tête + bouton d'ajout ---------- */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">
          Mes séances
          {sessions.length > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({sessions.length})
            </span>
          )}
        </h2>
        {/* Le bouton vit dans l'état vide quand la liste est vide :
            un seul bouton « + Nouvelle séance » visible à la fois. */}
        {sessions.length > 0 && (
          <button
            type="button"
            onClick={onCreate}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none active:scale-95"
          >
            + Nouvelle séance
          </button>
        )}
      </div>

      {/* ---------- État vide ---------- */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-4xl" aria-hidden="true">
            🗒️
          </span>
          <h3 className="text-xl font-semibold text-slate-800">
            Aucune séance pour l'instant
          </h3>
          <p className="text-sm leading-relaxed text-slate-600">
            Ajoute ta première sortie pour commencer à suivre tes progrès !
          </p>
          <button
            type="button"
            onClick={onCreate}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none active:scale-95"
          >
            + Nouvelle séance
          </button>
        </div>
      ) : (
        /* ---------- Liste des séances ---------- */
        <ul className="flex flex-col gap-3">
          {sorted.map((session) => (
            <li key={session.id}>
              <SessionCard session={session} onEdit={onEdit} onDelete={onDelete} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
