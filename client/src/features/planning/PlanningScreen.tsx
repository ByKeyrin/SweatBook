import { Card } from '../../components/ui/Card'

/**
 * PlanningScreen — page « Planning hebdomadaire » (features/planning/).
 *
 * Sprint 1 : la grille 7 jours est en place, mais vide.
 * Le remplissage (type de séance prévue, distance, repos) arrivera plus tard
 * avec l'API /api/plan (docs/FUNCTIONAL.md §4.3).
 */
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

/**
 * Composant PlanningScreen - Affiche le planning hebdomadaire (7 jours)
 * @returns {JSX.Element} Écran de planification de la semaine
 */
export function PlanningScreen() {
  return (
    <div className="flex flex-col gap-4">
      <Card title="🗓️ Planning de la semaine">
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Prépare ta semaine : pour chaque jour, choisis un type de séance, une
          distance prévue… ou « Repos ».
        </p>

        {/* Grille responsive : 1 colonne sur mobile, 2 sur tablette, 7 sur desktop */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7">
          {DAYS.map((day) => (
            <div
              key={day}
              className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-center"
            >
              <p className="text-sm font-semibold text-slate-700">{day}</p>
              <p className="mt-1 text-xs text-slate-400">—</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
