import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import {
  PLANNED_TYPE_ICONS,
  PLANNED_TYPE_LABELS,
  type DayOfWeek,
  type PlannedSession,
} from '../../types'

/* ============================================================
 * DayCard — une journée du planning hebdomadaire.
 * Affiche le jour, ses séances planifiées et un bouton pour en
 * ajouter une nouvelle.
 * ============================================================ */

/** Noms courts des jours (0 = lundi … 6 = dimanche). */
const DAY_SHORT_LABELS: readonly string[] = [
  'Lun',
  'Mar',
  'Mer',
  'Jeu',
  'Ven',
  'Sam',
  'Dim',
]

/** Props du composant DayCard. */
export interface DayCardProps {
  /** Le jour représenté (0 = lundi … 6 = dimanche). */
  dayOfWeek: DayOfWeek
  /** La date exacte de ce jour. */
  date: Date
  /** Les séances planifiées pour ce jour. */
  plans: PlannedSession[]
  /** Callback appelé quand on veut planifier une séance ce jour-là. */
  onAdd: (dayOfWeek: DayOfWeek) => void
  /** Callback appelé pour supprimer une séance planifiée. */
  onDelete: (id: number) => void
}

/**
 * Composant DayCard - Affiche un jour de la semaine et ses séances planifiées
 * @param {DayCardProps} props - Les props du composant
 * @param {DayOfWeek} props.dayOfWeek - Le jour représenté (0 = lundi … 6 = dimanche)
 * @param {Date} props.date - La date exacte de ce jour
 * @param {PlannedSession[]} props.plans - Les séances planifiées pour ce jour
 * @param {(dayOfWeek: DayOfWeek) => void} props.onAdd - Callback d'ajout
 * @param {(id: number) => void} props.onDelete - Callback de suppression
 * @returns {JSX.Element} Composant DayCard
 */
export function DayCard({ dayOfWeek, date, plans, onAdd, onDelete }: DayCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      {/* ---------- En-tête : nom du jour + date ---------- */}
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-slate-800">
          {DAY_SHORT_LABELS[dayOfWeek]}
        </p>
        <p className="text-xs text-slate-400">
          {format(date, 'd MMM', { locale: fr })}
        </p>
      </div>

      {/* ---------- Séances planifiées ---------- */}
      {plans.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-2 text-center text-xs text-slate-400">
          Repos
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className="group rounded-xl border border-slate-200 bg-slate-50 p-2"
            >
              <div className="flex items-start justify-between gap-1">
                <p className="text-xs font-semibold text-slate-700">
                  <span aria-hidden="true">{PLANNED_TYPE_ICONS[plan.planned_type]}</span>{' '}
                  {PLANNED_TYPE_LABELS[plan.planned_type]}
                </p>
                <button
                  type="button"
                  onClick={() => onDelete(plan.id)}
                  aria-label={`Supprimer la séance ${PLANNED_TYPE_LABELS[plan.planned_type]}`}
                  className="rounded-md px-1.5 text-xs text-slate-400 transition hover:bg-slate-200 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-500">{plan.planned_duration_min} min</p>
              {plan.notes && (
                <p className="mt-1 text-xs break-words text-slate-500 italic">
                  {plan.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* ---------- Bouton d'ajout ---------- */}
      <button
        type="button"
        onClick={() => onAdd(dayOfWeek)}
        className="mt-auto rounded-xl border border-dashed border-blue-300 px-2 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 focus:outline-none active:scale-95"
      >
        + Ajouter
      </button>
    </div>
  )
}
