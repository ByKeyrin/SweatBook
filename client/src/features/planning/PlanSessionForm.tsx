import { useState, type FormEvent } from 'react'
import { addDays, format } from 'date-fns'
import { fr } from 'date-fns/locale'

import {
  PLANNED_TYPE_ICONS,
  PLANNED_TYPE_LABELS,
  type DayOfWeek,
  type PlannedType,
} from '../../types'
import type { PlannedSessionDraft } from '../../hooks/usePlanning'

/* ============================================================
 * PlanSessionForm — formulaire de planification d'une séance.
 * La séance est rattachée à un jour de la semaine affichée,
 * puis enregistrée dans le localStorage (clé « sweatbook_plan »)
 * via le hook usePlanning.
 * ============================================================ */

/** Les 7 jours de la semaine, indexés comme DayOfWeek (0 = lundi … 6 = dimanche). */
const DAY_LABELS: readonly string[] = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
]

/** Valeurs du formulaire : tous les champs en texte, comme dans les inputs. */
interface FormValues {
  day_of_week: string
  planned_type: PlannedType | ''
  planned_duration_min: string
  notes: string
}

/** Erreurs de validation, un message par champ fautif. */
type FormErrors = Partial<Record<keyof FormValues, string>>

/** Props du composant PlanSessionForm. */
export interface PlanSessionFormProps {
  /** Date du lundi de la semaine à planifier. */
  weekStart: Date
  /** Jour présélectionné dans le formulaire. */
  defaultDay?: DayOfWeek
  /** Callback appelé avec les données validées à l'enregistrement. */
  onSubmit: (draft: PlannedSessionDraft) => void
}

/**
 * Valide les valeurs du formulaire de planification.
 * @param {FormValues} values - Les valeurs saisies
 * @returns {FormErrors} Les erreurs trouvées (vide si tout est bon)
 */
function validateValues(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  // Jour obligatoire, dans la plage 0-6.
  const day = Number(values.day_of_week)
  if (!Number.isInteger(day) || day < 0 || day > 6) {
    errors.day_of_week = 'Jour invalide'
  }

  // Type obligatoire, dans la liste autorisée.
  if (!values.planned_type) {
    errors.planned_type = 'Type de séance invalide'
  }

  // Durée prévue obligatoire : nombre > 0, max 24 h (1440 min).
  const duration = Number(values.planned_duration_min.replace(',', '.'))
  if (!values.planned_duration_min) {
    errors.planned_duration_min = 'La durée prévue est obligatoire'
  } else if (!Number.isFinite(duration) || duration <= 0) {
    errors.planned_duration_min = 'La durée prévue doit être supérieure à 0'
  } else if (duration > 1440) {
    errors.planned_duration_min = 'La durée prévue ne peut pas dépasser 24 h'
  }

  // Notes facultatives : 500 caractères max.
  if (values.notes.length > 500) {
    errors.notes = 'Commentaire trop long (500 caractères max)'
  }

  return errors
}

/**
 * Composant PlanSessionForm - Planifie une séance future dans la semaine
 * @param {PlanSessionFormProps} props - Les props du composant
 * @param {Date} props.weekStart - Le lundi de la semaine à planifier
 * @param {DayOfWeek} [props.defaultDay] - Le jour présélectionné
 * @param {(draft: PlannedSessionDraft) => void} props.onSubmit - Callback d'enregistrement
 * @returns {JSX.Element} Composant PlanSessionForm
 */
export function PlanSessionForm({ weekStart, defaultDay = 0, onSubmit }: PlanSessionFormProps) {
  const [values, setValues] = useState<FormValues>(() => ({
    day_of_week: String(defaultDay),
    planned_type: '',
    planned_duration_min: '',
    notes: '',
  }))
  const [errors, setErrors] = useState<FormErrors>({})

  // Quand on clique « + Ajouter » sur un jour, on présélectionne ce jour.
  // (Ajustement pendant le rendu — pattern officiel React, pas d'useEffect.)
  const [prevDefaultDay, setPrevDefaultDay] = useState<DayOfWeek>(defaultDay)
  if (defaultDay !== prevDefaultDay) {
    setPrevDefaultDay(defaultDay)
    setValues((prev) => ({ ...prev, day_of_week: String(defaultDay) }))
  }

  /** Met à jour un champ du formulaire et efface son éventuelle erreur. */
  const handleChange = (field: keyof FormValues, value: string): void => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  /** Vérifie les champs puis transmet les données validées au parent. */
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    // Aucune donnée n'est envoyée si un champ est invalide.
    const nextErrors = validateValues(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({
      week_start: format(weekStart, 'yyyy-MM-dd'),
      day_of_week: Number(values.day_of_week) as DayOfWeek,
      planned_type: values.planned_type as PlannedType,
      planned_duration_min: Number(values.planned_duration_min.replace(',', '.')),
      notes: values.notes.trim() || undefined,
    })

    // Le formulaire repart à zéro (le jour sélectionné est conservé).
    setValues((prev) => ({
      day_of_week: prev.day_of_week,
      planned_type: '',
      planned_duration_min: '',
      notes: '',
    }))
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* ---------- Jour & type (côte à côte sur mobile) ---------- */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="plan-day" className="block text-sm font-medium text-slate-700">
            Jour <span className="text-red-500">*</span>
          </label>
          <select
            id="plan-day"
            value={values.day_of_week}
            onChange={(e) => handleChange('day_of_week', e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          >
            {DAY_LABELS.map((label, index) => (
              <option key={label} value={index}>
                {label}{' '}
                {format(addDays(weekStart, index), 'd MMM', { locale: fr })}
              </option>
            ))}
          </select>
          {errors.day_of_week && (
            <p role="alert" className="mt-1 text-sm text-red-600">{errors.day_of_week}</p>
          )}
        </div>

        <div>
          <label htmlFor="plan-type" className="block text-sm font-medium text-slate-700">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            id="plan-type"
            value={values.planned_type}
            onChange={(e) => handleChange('planned_type', e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          >
            <option value="">— Choisir —</option>
            {(Object.keys(PLANNED_TYPE_LABELS) as PlannedType[]).map((type) => (
              <option key={type} value={type}>
                {PLANNED_TYPE_ICONS[type]} {PLANNED_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          {errors.planned_type && (
            <p role="alert" className="mt-1 text-sm text-red-600">{errors.planned_type}</p>
          )}
        </div>
      </div>

      {/* ---------- Durée prévue ---------- */}
      <div>
        <label htmlFor="plan-duration" className="block text-sm font-medium text-slate-700">
          Durée prévue (min) <span className="text-red-500">*</span>
        </label>
        <input
          id="plan-duration"
          type="number"
          inputMode="numeric"
          step="5"
          min="1"
          max="1440"
          placeholder="45"
          value={values.planned_duration_min}
          onChange={(e) => handleChange('planned_duration_min', e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
        {errors.planned_duration_min && (
          <p role="alert" className="mt-1 text-sm text-red-600">{errors.planned_duration_min}</p>
        )}
      </div>

      {/* ---------- Notes ---------- */}
      <div>
        <label htmlFor="plan-notes" className="block text-sm font-medium text-slate-700">
          Notes
        </label>
        <textarea
          id="plan-notes"
          rows={3}
          maxLength={500}
          placeholder="Objectif, parcours prévu, intensité…"
          value={values.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-400">{values.notes.length}/500 caractères</p>
        {errors.notes && (
          <p role="alert" className="mt-1 text-sm text-red-600">{errors.notes}</p>
        )}
      </div>

      {/* ---------- Action ---------- */}
      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none active:scale-95"
      >
        Planifier la séance
      </button>
    </form>
  )
}
