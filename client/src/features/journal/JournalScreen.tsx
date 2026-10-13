import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { SectionPlaceholder } from '../../components/ui/SectionPlaceholder'

/**
 * JournalScreen — page « Journal des séances » (features/journal/).
 *
 * Sprint 1 : seul le squelette de la page existe.
 * Le formulaire d'ajout arrivera au Sprint 2 (SessionForm + SessionCard).
 */
export function JournalScreen() {
  // useState = petite mémoire du composant. Ici : le formulaire est-il ouvert ?
  const [showHint, setShowHint] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <Card title="📓 Journal des séances">
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Ici, tu noteras chaque sortie : date, type, distance, durée, ressenti…
          Le formulaire complet arrive au prochain sprint.
        </p>

        <button
          type="button"
          onClick={() => setShowHint(!showHint)}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
        >
          + Nouvelle séance
        </button>

        {showHint && (
          <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            Le formulaire d'ajout sera implémenté au Sprint 2 — reste connecté ! 💪
          </p>
        )}
      </Card>

      <SectionPlaceholder
        emoji="📋"
        title="Liste des séances"
        description="La liste de tes séances (de la plus récente à la plus ancienne) s'affichera ici dès le Sprint 2."
      />
    </div>
  )
}
