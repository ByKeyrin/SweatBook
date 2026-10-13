import { useCallback, useEffect, useState } from 'react'

import type { Session } from '../types'

/* ============================================================
 * useSessions — CRUD des séances du journal (client/src/hooks/).
 *
 * 💡 Pourquoi localStorage et pas l'API ?
 * Au Sprint 2, le backend n'existe pas encore : on stocke les
 * séances dans le navigateur (localStorage), qui reste rempli
 * même après un rechargement de la page. Au Sprint 3, il suffira
 * de remplacer le contenu de ce hook par des appels fetch().
 * ============================================================ */

/** Clé utilisée dans le localStorage du navigateur. */
const STORAGE_KEY = 'sweatbook.sessions'

/** Données d'une séance sans son id (à la création/modification). */
export type SessionDraft = Omit<Session, 'id'>

/** Valeur retournée par le hook useSessions. */
export interface UseSessionsResult {
  /** Liste des séances enregistrées. */
  sessions: Session[]
  /** Ajoute une séance et lui attribue un id. */
  addSession: (draft: SessionDraft) => Session
  /** Modifie une séance existante grâce à son id. */
  updateSession: (id: number, draft: SessionDraft) => void
  /** Supprime une séance grâce à son id. */
  deleteSession: (id: number) => void
}

/**
 * Lit les séances sauvegardées dans le localStorage.
 * @returns {Session[]} La liste des séances (vide si rien de valide n'est stocké)
 */
function loadSessions(): Session[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    // JSON.parse peut échouer si le contenu est corrompu : on repart de zéro.
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Session[]) : []
  } catch {
    return []
  }
}

/**
 * Hook useSessions - Gère les séances du journal avec persistance localStorage
 *
 * Charge les séances au démarrage, puis sauvegarde automatiquement
 * à chaque ajout, modification ou suppression.
 *
 * @returns {UseSessionsResult} Les séances + les fonctions du CRUD
 *
 * @example
 * const { sessions, addSession } = useSessions()
 * addSession({ date: '2026-10-13', type: 'easy', distance_km: 8, duration_min: 42 })
 */
export function useSessions(): UseSessionsResult {
  // Chargement paresseux : localStorage n'est lu qu'au premier rendu.
  const [sessions, setSessions] = useState<Session[]>(loadSessions)

  // Persistance automatique : on sauvegarde dès que la liste change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    } catch {
      // Stockage plein ou indisponible : on ignore, l'app continue de fonctionner.
    }
  }, [sessions])

  /** Génère un id libre (le plus grand id présent + 1). */
  const nextId = useCallback((): number => {
    return sessions.reduce((max, s) => Math.max(max, s.id), 0) + 1
  }, [sessions])

  /**
   * Ajoute une nouvelle séance au journal.
   * @param {SessionDraft} draft - Les données de la séance (sans id)
   * @returns {Session} La séance créée, avec son id
   */
  const addSession = useCallback(
    (draft: SessionDraft): Session => {
      const created: Session = { id: nextId(), ...draft }
      setSessions((prev) => [created, ...prev])
      return created
    },
    [nextId],
  )

  /**
   * Modifie une séance existante.
   * @param {number} id - L'id de la séance à modifier
   * @param {SessionDraft} draft - Les nouvelles données de la séance
   * @returns {void}
   */
  const updateSession = useCallback((id: number, draft: SessionDraft): void => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { id, ...draft } : s)),
    )
  }, [])

  /**
   * Supprime une séance du journal.
   * @param {number} id - L'id de la séance à supprimer
   * @returns {void}
   */
  const deleteSession = useCallback((id: number): void => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }, [])

  return { sessions, addSession, updateSession, deleteSession }
}
