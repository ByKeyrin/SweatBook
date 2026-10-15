import { useMemo } from 'react'

import type { Session } from '../../types'

/* ============================================================
 * StatsCards — 4 cartes de statistiques (features/progression/).
 * Distance totale et nombre de séances sur le mois en cours,
 * allure moyenne (km/h) et fréquence cardiaque moyenne.
 * ============================================================ */

/** Une carte de statistique affichée. */
interface StatCard {
  /** Emoji décoratif en tête de carte. */
  emoji: string
  /** Titre de la carte. */
  title: string
  /** Valeur principale, déjà formatée. */
  value: string
  /** Unité affichée à côté de la valeur. */
  unit: string
  /** Couleur Tailwind du texte de la valeur. */
  accent: string
}

/** Props du composant StatsCards. */
export interface StatsCardsProps {
  /** Toutes les séances du journal (le mois en cours est extrait). */
  sessions: Session[]
}

/**
 * Calcule les 4 cartes de statistiques à partir des séances.
 * @param {Session[]} sessions - Toutes les séances du journal
 * @returns {StatCard[]} Les 4 cartes, valeurs déjà formatées
 */
function buildCards(sessions: Session[]): StatCard[] {
  // Mois en cours au format 'YYYY-MM' pour filtrer avec les dates ISO.
  const now = new Date()
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthSessions = sessions.filter((s) => s.date.startsWith(monthPrefix))

  // Totaux du mois en cours.
  const totalKm = monthSessions.reduce((sum, s) => sum + s.distance_km, 0)
  const totalMin = monthSessions.reduce((sum, s) => sum + s.duration_min, 0)

  // Allure moyenne : km parcourus / heures écoulées = km/h (0 si aucune donnée).
  const avgSpeed = totalMin > 0 ? totalKm / (totalMin / 60) : 0

  // FC moyenne : moyenne des avg_hr renseignés (0 si aucune donnée).
  const withHr = sessions.filter((s) => s.avg_hr != null)
  const avgHr =
    withHr.length > 0
      ? withHr.reduce((sum, s) => sum + (s.avg_hr ?? 0), 0) / withHr.length
      : 0

  return [
    {
      emoji: '📏',
      title: 'Distance totale',
      value: totalKm.toFixed(1),
      unit: 'km (mois en cours)',
      accent: 'text-blue-600',
    },
    {
      emoji: '🏃',
      title: 'Séances',
      value: String(monthSessions.length),
      unit: 'séances (mois en cours)',
      accent: 'text-indigo-600',
    },
    {
      emoji: '⚡',
      title: 'Allure moyenne',
      value: avgSpeed > 0 ? avgSpeed.toFixed(1) : '—',
      unit: 'km/h',
      accent: 'text-emerald-600',
    },
    {
      emoji: '❤️',
      title: 'FC moyenne',
      value: avgHr > 0 ? String(Math.round(avgHr)) : '—',
      unit: 'bpm',
      accent: 'text-rose-600',
    },
  ]
}

/**
 * Composant StatsCards - Affiche les statistiques du mois en cours
 * @param {StatsCardsProps} props - Les séances du journal
 * @returns {JSX.Element} Rangée de 4 cartes de statistiques
 */
export function StatsCards({ sessions }: StatsCardsProps) {
  // Calculs mémorisés : recalculés uniquement quand les séances changent.
  const cards = useMemo(() => buildCards(sessions), [sessions])

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          data-testid="stat-card"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              {card.emoji}
            </span>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">{card.title}</h3>
          </div>
          <p className={`mt-2 text-2xl font-bold ${card.accent}`}>{card.value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{card.unit}</p>
        </div>
      ))}
    </div>
  )
}
