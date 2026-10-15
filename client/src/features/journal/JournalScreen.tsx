import { useState } from 'react'

import type { Session } from '../../types'

import { Card } from '../../components/ui/Card'
import { useSessions } from '../../hooks/useSessions'
import { SessionForm } from './SessionForm'
import { SessionList } from './SessionList'

/* ============================================================
 * JournalScreen — page « Journal des séances » (features/journal/).
 * Elle assemble SessionForm + SessionList et pilote l'affichage
 * du formulaire (création ou modification).
 * ============================================================ */

/** Ce que le formulaire est en train de faire : créer ou modifier. */
type EditorTarget = { mode: 'create' } | { mode: 'edit'; session: Session }

/**
 * JournalScreen - Page du journal des séances
 * @returns {JSX.Element} Composant JournalScreen
 */
export function JournalScreen() {
  const { sessions, addSession, updateSession, deleteSession } = useSessions()

  // Le formulaire est masqué par défaut (editor = null).
  const [editor, setEditor] = useState<EditorTarget | null>(null)

  /** Enregistre la séance (création ou modification) puis ferme le formulaire. */
  const handleSubmit = (data: Omit<Session, 'id'>): void => {
    if (editor && editor.mode === 'edit') {
      updateSession(editor.session.id, data)
    } else {
      addSession(data)
    }
    setEditor(null)
  }

  const pageTitle = (
    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
      📓 Journal des séances
    </h2>
  )

  // ---------- Formulaire (masqué par défaut) ----------
  if (editor) {
    return (
      <div className="flex flex-col gap-4">
        {pageTitle}
        <Card title={editor.mode === 'edit' ? '✏️ Modifier la séance' : '➕ Nouvelle séance'}>
          <SessionForm
            // "key" force le formulaire à se réinitialiser quand la cible change.
            key={editor.mode === 'edit' ? editor.session.id : 'create'}
            initial={editor.mode === 'edit' ? editor.session : undefined}
            onSubmit={handleSubmit}
            onCancel={() => setEditor(null)}
          />
        </Card>
      </div>
    )
  }

  // ---------- Liste des séances ----------
  return (
    <div className="flex flex-col gap-4">
      {pageTitle}
      <SessionList
        sessions={sessions}
        onCreate={() => setEditor({ mode: 'create' })}
        onEdit={(session) => setEditor({ mode: 'edit', session })}
        onDelete={deleteSession}
      />
    </div>
  )
}
