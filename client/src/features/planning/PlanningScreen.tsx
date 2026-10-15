import { useState } from 'react'
import { addDays } from 'date-fns'

import { Card } from '../../components/ui/Card'
import { usePlanning } from '../../hooks/usePlanning'
import type { DayOfWeek } from '../../types'
import { DayCard } from './DayCard'
import { PlanSessionForm } from './PlanSessionForm'
import { WeekNav } from './WeekNav'

/* ============================================================
 * PlanningScreen — page « Planning hebdomadaire » (features/planning/).
 *
 * Assemble la navigation entre les semaines (WeekNav), les 7 jours
 * de la semaine (DayCard) et le formulaire de planification
 * (PlanSessionForm). Les données sont gérées par usePlanning
 * (localStorage, clé « sweatbook_plan »).
 * ============================================================ */

/**
 * Composant PlanningScreen - Affiche le planning hebdomadaire (7 jours)
 * @returns {JSX.Element} Écran de planification de la semaine
 */
export function PlanningScreen() {
  const {
    weekStart,
    plansByDay,
    addPlan,
    deletePlan,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  } = usePlanning()

  // Jour sélectionné dans le formulaire (modifié par « + Ajouter »).
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(0)

  /** Prépare le formulaire pour planifier une séance le jour demandé. */
  const handleAdd = (dayOfWeek: DayOfWeek): void => {
    setSelectedDay(dayOfWeek)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ---------- Navigation entre les semaines ---------- */}
      <Card title="🗓️ Planning de la semaine">
        <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Prépare ta semaine : pour chaque jour, choisis un type de séance et une
          durée prévue… ou laisse « Repos ».
        </p>

        <WeekNav
          weekStart={weekStart}
          onPrevious={goToPreviousWeek}
          onNext={goToNextWeek}
          onToday={goToCurrentWeek}
        />

        {/* Grille responsive : 1 colonne sur mobile, 2 sur tablette, 7 sur desktop */}
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7">
          {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((dayOfWeek) => (
            <DayCard
              key={dayOfWeek}
              dayOfWeek={dayOfWeek}
              date={addDays(weekStart, dayOfWeek)}
              plans={plansByDay[dayOfWeek]}
              onAdd={handleAdd}
              onDelete={deletePlan}
            />
          ))}
        </div>
      </Card>

      {/* ---------- Formulaire de planification ---------- */}
      <Card title="➕ Planifier une séance">
        <PlanSessionForm
          weekStart={weekStart}
          defaultDay={selectedDay}
          onSubmit={addPlan}
        />
      </Card>
    </div>
  )
}
