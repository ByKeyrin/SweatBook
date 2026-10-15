import { useMemo, useState } from 'react'

import type { Session } from '../../types'

import { Card } from '../../components/ui/Card'
import { useSessions } from '../../hooks/useSessions'
import { DistanceChart } from './DistanceChart'
import { DurationChart } from './DurationChart'
import { StatsCards } from './StatsCards'

/* ============================================================
 * ProgressionScreen — page « Graphiques de progression »
 * (features/progression/). Elle assemble les cartes de stats et
 * les deux graphiques, avec un filtre de période (7j / 30j / 90j).
 * ============================================================ */

/** Périodes de filtrage proposées (en jours). */
const PERIODS = [7, 30, 90] as const

/** Une période sélectionnable du filtre. */
type PeriodDays = (typeof PERIODS)[number]

/**
 * Filtre les séances des N derniers jours (aujourd'hui inclus).
 * @param {Session[]} sessions - Toutes les séances du journal
 * @param {number} days - Nombre de jours à garder
 * @returns {Session[]} Les séances de la période, triées par date croissante
 */
function filterLastDays(sessions: Session[], days: number): Session[] {
  const since = new Date()
  since.setDate(since.getDate() - (days - 1))
  // Dates ISO 'YYYY-MM-DD' : on compare directement les chaînes ('<' fonctionne).
  // On utilise les composants locaux pour rester correct dans tous les fuseaux.
  const sinceIso = [
    since.getFullYear(),
    String(since.getMonth() + 1).padStart(2, '0'),
    String(since.getDate()).padStart(2, '0'),
  ].join('-')

  return sessions
    .filter((s) => s.date >= sinceIso)
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Composant ProgressionScreen - Affiche les graphiques de progression
 * @returns {JSX.Element} Écran de suivi des progrès (statistiques + graphiques)
 */
export function ProgressionScreen() {
  const { sessions } = useSessions()
  const [periodDays, setPeriodDays] = useState<PeriodDays>(30)

  // Filtrage mémorisé : recalculé uniquement si les données ou la période changent.
  const filteredSessions = useMemo(
    () => filterLastDays(sessions, periodDays),
    [sessions, periodDays],
  )

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">📈 Progression</h2>

      {/* ---------- Cartes de statistiques ---------- */}
      <StatsCards sessions={sessions} />

      {/* ---------- Filtre de période ---------- */}
      <div className="flex gap-2" role="group" aria-label="Filtrer par période">
        {PERIODS.map((days) => (
          <button
            key={days}
            type="button"
            data-testid="period-filter"
            onClick={() => setPeriodDays(days)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              periodDays === days
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {days} jours
          </button>
        ))}
      </div>

      {/* ---------- Graphiques ---------- */}
      <Card>
        <DistanceChart sessions={filteredSessions} days={periodDays} />
      </Card>
      <Card>
        <DurationChart sessions={filteredSessions} days={periodDays} />
      </Card>
    </div>
  )
}
