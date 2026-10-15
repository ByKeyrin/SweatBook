import { useCallback, useEffect, useMemo, useState } from 'react'
import { addWeeks, format, startOfWeek, subWeeks } from 'date-fns'

import type { DayOfWeek, PlannedSession } from '../types'

/* ============================================================
 * usePlanning — planning hebdomadaire (client/src/hooks/).
 *
 * 💡 Même philosophie que useSessions : au Sprint 4, le backend
 * n'est pas encore branché, on stocke donc les séances planifiées
 * dans le localStorage (clé « sweatbook_plan »). Au Sprint 5, il
 * suffira de remplacer ce hook par des appels fetch() sur /api/plan.
 * ============================================================ */

/** Clé utilisée dans le localStorage du navigateur. */
const STORAGE_KEY = 'sweatbook_plan'

/** Données d'une séance planifiée sans son id (à la création/modification). */
export type PlannedSessionDraft = Omit<PlannedSession, 'id'>

/** Les 7 jours de la semaine, indexés comme DayOfWeek (0 = lundi … 6 = dimanche). */
export type PlansByDay = Record<DayOfWeek, PlannedSession[]>

/** Valeur retournée par le hook usePlanning. */
export interface UsePlanningResult {
  /** Date du lundi de la semaine affichée. */
  weekStart: Date
  /** Séances planifiées de la semaine affichée, groupées par jour. */
  plansByDay: PlansByDay
  /** Ajoute une séance planifiée et lui attribue un id. */
  addPlan: (draft: PlannedSessionDraft) => PlannedSession
  /** Modifie une séance planifiée existante grâce à son id. */
  updatePlan: (id: number, draft: PlannedSessionDraft) => void
  /** Supprime une séance planifiée grâce à son id. */
  deletePlan: (id: number) => void
  /** Affiche la semaine précédente. */
  goToPreviousWeek: () => void
  /** Affiche la semaine suivante. */
  goToNextWeek: () => void
  /** Reviens à la semaine en cours. */
  goToCurrentWeek: () => void
}

/**
 * Lit les séances planifiées sauvegardées dans le localStorage.
 * @returns {PlannedSession[]} La liste des planifications (vide si rien de valide)
 */
function loadPlans(): PlannedSession[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    // JSON.parse peut échouer si le contenu est corrompu : on repart de zéro.
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as PlannedSession[]) : []
  } catch {
    return []
  }
}

/**
 * Hook usePlanning - Gère le planning hebdomadaire avec persistance localStorage
 *
 * Charge les séances planifiées au démarrage, sauvegarde automatiquement
 * à chaque changement, et gère la navigation entre les semaines.
 *
 * @returns {UsePlanningResult} La semaine affichée + les fonctions du CRUD
 *
 * @example
 * const { plansByDay, addPlan, goToNextWeek } = usePlanning()
 * addPlan({ week_start: '2026-10-19', day_of_week: 0, planned_type: 'course', planned_duration_min: 45 })
 */
export function usePlanning(): UsePlanningResult {
  // Chargement paresseux : localStorage n'est lu qu'au premier rendu.
  const [plans, setPlans] = useState<PlannedSession[]>(loadPlans)

  // Semaine affichée : le lundi de la semaine en cours au démarrage.
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  )

  // Persistance automatique : on sauvegarde dès que la liste change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
    } catch {
      // Stockage plein ou indisponible : on ignore, l'app continue de fonctionner.
    }
  }, [plans])

  /** Génère un id libre (le plus grand id présent + 1). */
  const nextId = useCallback((): number => {
    return plans.reduce((max, p) => Math.max(max, p.id), 0) + 1
  }, [plans])

  /**
   * Ajoute une nouvelle séance au planning.
   * @param {PlannedSessionDraft} draft - Les données de la séance (sans id)
   * @returns {PlannedSession} La séance créée, avec son id
   */
  const addPlan = useCallback(
    (draft: PlannedSessionDraft): PlannedSession => {
      const created: PlannedSession = { id: nextId(), ...draft }
      setPlans((prev) => [...prev, created])
      return created
    },
    [nextId],
  )

  /**
   * Modifie une séance planifiée existante.
   * @param {number} id - L'id de la séance à modifier
   * @param {PlannedSessionDraft} draft - Les nouvelles données de la séance
   * @returns {void}
   */
  const updatePlan = useCallback((id: number, draft: PlannedSessionDraft): void => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { id, ...draft } : p)))
  }, [])

  /**
   * Supprime une séance du planning.
   * @param {number} id - L'id de la séance à supprimer
   * @returns {void}
   */
  const deletePlan = useCallback((id: number): void => {
    setPlans((prev) => prev.filter((p) => p.id !== id))
  }, [])

  /** Passe à la semaine précédente. */
  const goToPreviousWeek = useCallback((): void => {
    setWeekStart((prev) => subWeeks(prev, 1))
  }, [])

  /** Passe à la semaine suivante. */
  const goToNextWeek = useCallback((): void => {
    setWeekStart((prev) => addWeeks(prev, 1))
  }, [])

  /** Reviens à la semaine en cours. */
  const goToCurrentWeek = useCallback((): void => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }, [])

  // Groupement par jour : ne garde que la semaine affichée, puis range
  // chaque séance dans la « case » de son jour (0 = lundi … 6 = dimanche).
  const plansByDay = useMemo<PlansByDay>(() => {
    const grouped: PlansByDay = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    }
    const weekStartIso = format(weekStart, 'yyyy-MM-dd')
    for (const plan of plans) {
      if (plan.week_start === weekStartIso) {
        grouped[plan.day_of_week].push(plan)
      }
    }
    return grouped
  }, [plans, weekStart])

  return {
    weekStart,
    plansByDay,
    addPlan,
    updatePlan,
    deletePlan,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  }
}
