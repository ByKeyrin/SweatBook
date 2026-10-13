import { Card } from '../../components/ui/Card'

/**
 * ProgressionScreen — page « Graphiques de progression » (features/progression/).
 *
 * Sprint 1 : les 3 emplacements de graphiques sont prévus (docs/FUNCTIONAL.md §4.2).
 * Les vrais graphiques (Recharts) arriveront quand l'API /api/stats existera.
 */
const CHARTS = [
  {
    emoji: '📈',
    title: 'Volume hebdomadaire',
    description: 'Kilomètres parcourus chaque semaine.',
  },
  {
    emoji: '⏱️',
    title: 'Allure moyenne',
    description: "Évolution de ton allure (min/km) dans le temps.",
  },
  {
    emoji: '🔥',
    title: 'Régularité',
    description: 'Nombre de séances par semaine.',
  },
]

/**
 * Composant ProgressionScreen - Affiche les graphiques de progression
 * @returns {JSX.Element} Écran de suivi des progrès (statistiques hebdomadaires)
 */
export function ProgressionScreen() {
  return (
    <div className="flex flex-col gap-4">
      {CHARTS.map((chart) => (
        <Card key={chart.title}>
          <div className="flex items-start gap-3">
            <span className="text-3xl" aria-hidden="true">
              {chart.emoji}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {chart.title}
              </h2>
              <p className="text-sm text-slate-600">{chart.description}</p>
              <div className="mt-3 h-24 animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
