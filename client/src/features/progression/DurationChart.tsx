import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { Session } from '../../types'

/* ============================================================
 * DurationChart — graphique « Évolution de la durée »
 * (features/progression/). Même logique que DistanceChart, mais
 * en minutes de course par jour.
 * ============================================================ */

/** Un point du graphique : la durée cumulée d'une journée. */
interface DurationPoint {
  /** Date ISO 'YYYY-MM-DD' (clé de tri et d'agrégation). */
  date: string
  /** Date formatée affichée sur l'axe X (ex. '14/10'). */
  label: string
  /** Durée totale du jour, en minutes. */
  duration: number
  /** Nombre de séances réalisées ce jour-là. */
  sessionCount: number
}

/** Props du composant DurationChart. */
export interface DurationChartProps {
  /** Les séances à afficher (déjà filtrées par période). */
  sessions: Session[]
  /** Nombre de jours couverts, pour le titre (ex. 30). */
  days: number
}

/**
 * Formate une date ISO 'YYYY-MM-DD' en 'JJ/MM'.
 * @param {string} date - Date ISO à formater
 * @returns {string} Date au format 'JJ/MM'
 */
function formatDay(date: string): string {
  const [, month, day] = date.split('-')
  return `${day}/${month}`
}

/**
 * Agrège les séances par jour (durée cumulée + nombre de séances).
 * @param {Session[]} sessions - Les séances de la période
 * @returns {DurationPoint[]} Les points triés du plus ancien au plus récent
 */
function buildPoints(sessions: Session[]): DurationPoint[] {
  const byDay = new Map<string, DurationPoint>()

  for (const session of sessions) {
    const existing = byDay.get(session.date)
    if (existing) {
      existing.duration += session.duration_min
      existing.sessionCount += 1
    } else {
      byDay.set(session.date, {
        date: session.date,
        label: formatDay(session.date),
        duration: session.duration_min,
        sessionCount: 1,
      })
    }
  }

  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date))
}

/** Props du tooltip personnalisé (valeurs fournies par Recharts). */
interface DurationTooltipProps {
  active?: boolean
  payload?: Array<{ payload: DurationPoint }>
}

/**
 * Composant DurationTooltip - Bulle d'information du graphique de durée
 * @param {DurationTooltipProps} props - État du survol fourni par Recharts
 * @returns {JSX.Element | null} Le détail du jour survolé, ou rien
 */
function DurationTooltip({ active, payload }: DurationTooltipProps) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-md dark:border-slate-700 dark:bg-slate-800">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{point.label}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Durée : <strong>{Math.round(point.duration)} min</strong>
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {point.sessionCount} séance{point.sessionCount > 1 ? 's' : ''}
      </p>
    </div>
  )
}

/**
 * Composant DurationChart - Affiche l'évolution de la durée
 * @param {DurationChartProps} props - Les séances filtrées et la période
 * @returns {JSX.Element} Graphique en ligne de la durée par jour
 */
export function DurationChart({ sessions, days }: DurationChartProps) {
  const points = buildPoints(sessions)

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">
        ⏱️ Durée — {days} derniers jours
      </h2>
      {points.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Aucune séance sur cette période.
        </p>
      ) : (
        <div className="h-64" role="img" aria-label="Graphique de la durée par jour">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--chart-tick)' }} />
              <YAxis
                unit=" min"
                tick={{ fontSize: 12, fill: 'var(--chart-tick)' }}
                width={70}
              />
              <Tooltip content={<DurationTooltip />} />
              <Line
                type="monotone"
                dataKey="duration"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
