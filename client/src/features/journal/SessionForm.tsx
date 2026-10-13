import { useState, type FormEvent } from 'react'

import { SESSION_TYPE_LABELS, type Feeling, type Session, type SessionType } from '../../types'

/* ============================================================
 * SessionForm — formulaire d'ajout / modification d'une séance.
 * Règles de validation : docs/FUNCTIONAL.md §5.2.
 * ============================================================ */

/** Valeurs du formulaire : tous les champs en texte, comme dans les inputs. */
interface FormValues {
  date: string
  type: SessionType | ''
  distance_km: string
  duration_min: string
  avg_hr: string
  feeling: string
  notes: string
}

/** Erreurs de validation, un message par champ fautif. */
type FormErrors = Partial<Record<keyof FormValues, string>>

/** Props du composant SessionForm. */
export interface SessionFormProps {
  /** Données de la séance à modifier (absentes en création). */
  initial?: Session
  /** Callback appelé avec les données validées à l'enregistrement. */
  onSubmit: (data: Omit<Session, 'id'>) => void
  /** Callback appelé quand l'utilisateur annule. */
  onCancel: () => void
}


/**
 * Renvoie la date du jour au format ISO (YYYY-MM-DD), en heure locale.
 * @returns {string} La date du jour
 */
function todayIso(): string {
  const now = new Date()
  // On corrige le décalage UTC pour rester sur le jour local.
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}

/**
 * Construit les valeurs initiales du formulaire.
 * @param {Session} [initial] - La séance à modifier, si édition
 * @returns {FormValues} Les valeurs à afficher dans les inputs
 */
function buildValues(initial?: Session): FormValues {
  return {
    date: initial?.date ?? todayIso(),
    type: initial?.type ?? '',
    distance_km: initial ? String(initial.distance_km) : '',
    duration_min: initial ? String(initial.duration_min) : '',
    avg_hr: initial?.avg_hr !== undefined ? String(initial.avg_hr) : '',
    feeling: initial?.feeling !== undefined ? String(initial.feeling) : '',
    notes: initial?.notes ?? '',
  }
}

/**
 * Valide les valeurs du formulaire (règles FUNCTIONAL.md §5.2).
 * @param {FormValues} values - Les valeurs saisies
 * @returns {FormErrors} Les erreurs trouvées (vide si tout est bon)
 */
function validateValues(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  // Date obligatoire, jamais dans le futur (comparaison de chaînes ISO).
  if (!values.date) {
    errors.date = 'La date est obligatoire'
  } else if (values.date > todayIso()) {
    errors.date = 'La date ne peut pas être dans le futur'
  }

  // Type obligatoire, dans la liste autorisée.
  if (!values.type) {
    errors.type = 'Type de séance invalide'
  }

  // Distance obligatoire : nombre > 0, max 500 km. La virgule est acceptée.
  const distance = Number(values.distance_km.replace(',', '.'))
  if (!values.distance_km) {
    errors.distance_km = 'La distance est obligatoire'
  } else if (!Number.isFinite(distance) || distance <= 0) {
    errors.distance_km = 'La distance doit être supérieure à 0'
  } else if (distance > 500) {
    errors.distance_km = 'La distance ne peut pas dépasser 500 km'
  }

  // Durée obligatoire : nombre > 0, max 24 h (1440 min).
  const duration = Number(values.duration_min.replace(',', '.'))
  if (!values.duration_min) {
    errors.duration_min = 'La durée est obligatoire'
  } else if (!Number.isFinite(duration) || duration <= 0) {
    errors.duration_min = 'La durée doit être supérieure à 0'
  } else if (duration > 1440) {
    errors.duration_min = 'La durée ne peut pas dépasser 24 h (1440 min)'
  }

  // FC facultative : entier entre 30 et 230 bpm.
  if (values.avg_hr) {
    const hr = Number(values.avg_hr)
    if (!Number.isInteger(hr) || hr < 30 || hr > 230) {
      errors.avg_hr = 'Fréquence cardiaque invalide'
    }
  }

  // Ressenti facultatif : entier entre 1 et 5.
  if (values.feeling) {
    const feeling = Number(values.feeling)
    if (!Number.isInteger(feeling) || feeling < 1 || feeling > 5) {
      errors.feeling = 'Le ressenti doit être entre 1 et 5'
    }
  }

  // Notes facultatives : 500 caractères max.
  if (values.notes.length > 500) {
    errors.notes = 'Commentaire trop long (500 caractères max)'
  }

  return errors
}

/**
 * Composant SessionForm - Saisie et validation d'une séance du journal
 * @param {SessionFormProps} props - Les props du composant
 * @param {Session} [props.initial] - La séance à modifier, si édition
 * @param {(data: Omit<Session, 'id'>) => void} props.onSubmit - Callback d'enregistrement
 * @param {() => void} props.onCancel - Callback d'annulation
 * @returns {JSX.Element} Composant SessionForm
 */
export function SessionForm({ initial, onSubmit, onCancel }: SessionFormProps) {
  const [values, setValues] = useState<FormValues>(() => buildValues(initial))
  const [errors, setErrors] = useState<FormErrors>({})

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
      date: values.date,
      type: values.type as SessionType,
      distance_km: Number(values.distance_km.replace(',', '.')),
      duration_min: Number(values.duration_min.replace(',', '.')),
      avg_hr: values.avg_hr ? Number(values.avg_hr) : undefined,
      feeling: values.feeling ? (Number(values.feeling) as Feeling) : undefined,
      notes: values.notes.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* ---------- Date ---------- */}
      <div>
        <label htmlFor="session-date" className="block text-sm font-medium text-slate-700">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          id="session-date"
          type="date"
          value={values.date}
          max={todayIso()}
          onChange={(e) => handleChange('date', e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
        {errors.date && <p role="alert" className="mt-1 text-sm text-red-600">{errors.date}</p>}
      </div>

      {/* ---------- Type ---------- */}
      <div>
        <label htmlFor="session-type" className="block text-sm font-medium text-slate-700">
          Type de sortie <span className="text-red-500">*</span>
        </label>
        <select
          id="session-type"
          value={values.type}
          onChange={(e) => handleChange('type', e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        >
          <option value="">— Choisir un type —</option>
          {(Object.keys(SESSION_TYPE_LABELS) as SessionType[]).map((type) => (
            <option key={type} value={type}>
              {SESSION_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        {errors.type && <p role="alert" className="mt-1 text-sm text-red-600">{errors.type}</p>}
      </div>

      {/* ---------- Distance & durée (côte à côte sur mobile) ---------- */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="session-distance" className="block text-sm font-medium text-slate-700">
            Distance (km) <span className="text-red-500">*</span>
          </label>
          <input
            id="session-distance"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            placeholder="15,5"
            value={values.distance_km}
            onChange={(e) => handleChange('distance_km', e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
          {errors.distance_km && <p role="alert" className="mt-1 text-sm text-red-600">{errors.distance_km}</p>}
        </div>

        <div>
          <label htmlFor="session-duration" className="block text-sm font-medium text-slate-700">
            Durée (min) <span className="text-red-500">*</span>
          </label>
          <input
            id="session-duration"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            placeholder="82,5"
            value={values.duration_min}
            onChange={(e) => handleChange('duration_min', e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
          {errors.duration_min && <p role="alert" className="mt-1 text-sm text-red-600">{errors.duration_min}</p>}
        </div>
      </div>

      {/* ---------- FC & ressenti (facultatifs) ---------- */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="session-hr" className="block text-sm font-medium text-slate-700">
            Fréquence cardiaque moyenne (bpm)
          </label>
          <input
            id="session-hr"
            type="number"
            inputMode="numeric"
            step="1"
            min="30"
            max="230"
            placeholder="145"
            value={values.avg_hr}
            onChange={(e) => handleChange('avg_hr', e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
          {errors.avg_hr && <p role="alert" className="mt-1 text-sm text-red-600">{errors.avg_hr}</p>}
        </div>

        <div>
          <label htmlFor="session-feeling" className="block text-sm font-medium text-slate-700">
            Ressenti (1-5)
          </label>
          <input
            id="session-feeling"
            type="number"
            inputMode="numeric"
            step="1"
            min="1"
            max="5"
            placeholder="4"
            value={values.feeling}
            onChange={(e) => handleChange('feeling', e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
          {errors.feeling && <p role="alert" className="mt-1 text-sm text-red-600">{errors.feeling}</p>}
        </div>
      </div>

      {/* ---------- Notes ---------- */}
      <div>
        <label htmlFor="session-notes" className="block text-sm font-medium text-slate-700">
          Notes
        </label>
        <textarea
          id="session-notes"
          rows={3}
          maxLength={500}
          placeholder="Météo, parcours, douleurs…"
          value={values.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-400">{values.notes.length}/500 caractères</p>
        {errors.notes && <p role="alert" className="mt-1 text-sm text-red-600">{errors.notes}</p>}
      </div>

      {/* ---------- Actions ---------- */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none active:scale-95"
        >
          Enregistrer
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:ring-2 focus:ring-slate-200 focus:outline-none active:scale-95"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
