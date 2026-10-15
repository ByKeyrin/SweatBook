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
 * DistanceChart — graphique « Évolution de la distance »
 * (features/progression/). Recharts trace une ligne reliant la
 * distance totale parcourue chaque jour sur la période choisie.
 * ============================================================ */

/** Un point du graphique : la distance cumulée d'une journée. */
interface DistancePoint {
  /** Date ISO 'YYYY-MM-DD' (clé de tri et d'agrégation). */
  date: string
  /** Date formatée affichée sur l'axe X (ex. '14/10'). */
  label: string
  /** Distance totale du jour, en kilomètres. */
  distance: number
  /** Nombre de séances réalisées ce jour-là. */
  sessionCount: number
}

/** Props du composant DistanceChart. */
export interface DistanceChartProps {
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
 * Agrège les séances par jour (distance cumulée + nombre de séances).
 * @param {Session[]} sessions - Les séances de la période
 * @returns {DistancePoint[]} Les points triés du plus ancien au plus récent
 */
function buildPoints(sessions: Session[]): DistancePoint[] {
  const byDay = new Map<string, DistancePoint>()

  for (const session of sessions) {
    const existing = byDay.get(session.date)
    if (existing) {
      existing.distance += session.distance_km
      existing.sessionCount += 1
    } else {
      byDay.set(session.date, {
        date: session.date,
        label: formatDay(session.date),
        distance: session.distance_km,
        sessionCount: 1,
      })
    }
  }

  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date))
}

/** Props du tooltip personnalisé (valeurs fournies par Recharts). */
interface DistanceTooltipProps {
  active?: boolean
  payload?: Array<{ payload: DistancePoint }>
}

/**
 * Composant DistanceTooltip - Bulle d'information du graphique de distance
 * @param {DistanceTooltipProps} props - État du survol fourni par Recharts
 * @returns {JSX.Element | null} Le détail du jour survolé, ou rien
 */
function DistanceTooltip({ active, payload }: DistanceTooltipProps) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-md">
      <p className="text-sm font-semibold text-slate-800">{point.label}</p>
      <p className="text-sm text-slate-600">
        Distance : <strong>{point.distance.toFixed(1)} km</strong>
      </p>
      <p className="text-sm text-slate-600">
        {point.sessionCount} séance{point.sessionCount > 1 ? 's' : ''}
      </p>
    </div>
  )
}

/**
 * Composant DistanceChart - Affiche l'évolution de la distance
 * @param {DistanceChartProps} props - Les séances filtrées et la période
 * @returns {JSX.Element} Graphique en ligne de la distance par jour
 */
export function DistanceChart({ sessions, days }: DistanceChartProps) {
  const points = buildPoints(sessions)

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-slate-800">
        📈 Distance — {days} derniers jours
      </h2>
      {points.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Aucune séance sur cette période.
        </p>
      ) : (
        <div className="h-64" role="img" aria-label="Graphique de la distance par jour">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis
                unit=" km"
                tick={{ fontSize: 12, fill: '#475569' }}
                width={70}
              />
              <Tooltip content={<DistanceTooltip />} />
              <Line
                type="monotone"
                dataKey="distance"
                stroke="#2563eb"
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
