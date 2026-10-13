# 🧩 SweatBook — Templates JSDoc

> Ce document fournit les **gabarits de code** à copier-coller pour documenter le code
> de SweatBook au fur et à mesure. Ils suivent les règles de [CONVENTIONS.md](./CONVENTIONS.md).
> 🟢 **Niveau débutant accepté** : chaque template est complet et commenté.

---

## Table des matières

1. [Template de composant React](#1-template-de-composant-react)
2. [Template de hook](#2-template-de-hook)
3. [Template de service API](#3-template-de-service-api)
4. [Template de type TypeScript](#4-template-de-type-typescript)

---

## 1. Template de composant React

Fichier : `client/src/components/Composant.tsx`

```tsx
import type { Session } from '../types';

/** Props du composant SessionCard */
export interface SessionCardProps {
  /** Les données de la séance à afficher */
  session: Session;
  /** Callback appelé quand l'utilisateur supprime la séance */
  onDelete?: (id: number) => void;
}

/**
 * Composant SessionCard - Affiche une carte de séance
 * @param {SessionCardProps} props - Les props du composant
 * @param {Session} props.session - Les données de la séance
 * @param {(id: number) => void} [props.onDelete] - Callback de suppression
 * @returns {JSX.Element} Composant SessionCard
 */
export function SessionCard({ session, onDelete }: SessionCardProps) {
  // Allure en min/km (format course) — calculée à l'affichage
  const pace = session.duration_min / session.distance_km;

  return (
    <article className="flex flex-col gap-2 rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{session.date}</h3>
      <p className="text-sm text-gray-600">{session.type} · {pace.toFixed(2)} min/km</p>
    </article>
  );
}
```

Points clés :
- Description : `Composant X - Rôle`, en français.
- `@param {XxxProps} props` puis le détail de chaque prop.
- `@returns {JSX.Element}`.

---

## 2. Template de hook

Fichier : `client/src/hooks/useSessions.ts`

```ts
import { useState, useEffect } from 'react';
import type { Session } from '../types';
import { fetchSessions } from '../services/api';

/** Valeur retournée par le hook useSessions */
export interface UseSessionsResult {
  /** Liste des séances chargées */
  sessions: Session[];
  /** Vrai pendant le chargement */
  isLoading: boolean;
  /** Message d'erreur éventuel */
  error: string | null;
  /** Recharge les séances depuis l'API */
  refresh: () => Promise<void>;
}

/**
 * Hook useSessions - Charge et expose les séances du journal
 *
 * Appelle `GET /api/sessions` au montage du composant, et expose
 * un rafraîchissement manuel.
 *
 * @returns {UseSessionsResult} État des séances + fonction de rafraîchissement
 */
export function useSessions(): UseSessionsResult {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Recharge la liste des séances depuis l'API.
   * @returns {Promise<void>}
   */
  const refresh = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setSessions(await fetchSessions());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return { sessions, isLoading, error, refresh };
}
```

Points clés :
- Description : `Hook useX - Rôle`.
- Documenter le **type de retour** complet (interface dédiée exportée).
- Les fonctions internes exposées (`refresh`) reçoivent aussi leur JSDoc.

---

## 3. Template de service API

Fichier : `client/src/services/api.ts`

```ts
import type { Session } from '../types';

/** URL de base de l'API (le proxy Vite redirige /api vers :3001) */
const API_BASE_URL = '/api';

/**
 * Erreur API - Erreur structurée renvoyée par le client HTTP
 */
export class ApiError extends Error {
  /** Code HTTP de la réponse */
  status: number;

  /**
   * @param {number} status - Code HTTP (400, 404, 500…)
   * @param {string} message - Message d'erreur (`{ "error": "…" }`)
   */
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Envoie une requête JSON vers l'API et renvoie la réponse décodée.
 * @param {string} path - Chemin relatif (ex. `/sessions`)
 * @param {RequestInit} [init] - Options fetch (méthode, corps…)
 * @returns {Promise<T>} Le corps JSON de la réponse
 * @throws {ApiError} Si le serveur répond avec un code d'erreur
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

/**
 * Récupère toutes les séances (plus récente d'abord).
 * @returns {Promise<Session[]>} Liste des séances
 * @throws {ApiError} En cas d'échec de la requête
 *
 * @example
 * const sessions = await fetchSessions();
 */
export function fetchSessions(): Promise<Session[]> {
  return request<Session[]>('/sessions');
}

/**
 * Crée une nouvelle séance.
 * @param {Omit<Session, 'id'>} data - Données de la séance à créer
 * @returns {Promise<Session>} La séance créée (avec son id)
 * @throws {ApiError} Si les données sont invalides (400)
 */
export function createSession(data: Omit<Session, 'id'>): Promise<Session> {
  return request<Session>('/sessions', { method: 'POST', body: JSON.stringify(data) });
}
```

Points clés :
- Une fonction par endpoint, nommée : `fetch…` (GET), `create…` (POST),
  `update…` (PUT), `delete…` (DELETE).
- `@throws {ApiError}` documenté dès qu'il y a un appel réseau.
- `@example` recommandé pour les fonctions publiques utilisées ailleurs.

---

## 4. Template de type TypeScript

Fichier : `client/src/types/index.ts`

```ts
/**
 * Type de sortie - Catégories de séances de course
 */
export type SessionType = 'easy' | 'long' | 'interval' | 'tempo' | 'recovery';

/**
 * Séance - Une sortie de course enregistrée dans le journal
 *
 * Les champs suivent le schéma SQL de la table `sessions` (snake_case).
 */
export interface Session {
  /** Identifiant unique (auto-incrémenté) */
  id: number;
  /** Date de la séance (format ISO YYYY-MM-DD) */
  date: string;
  /** Type de sortie */
  type: SessionType;
  /** Distance en kilomètres (> 0) */
  distance_km: number;
  /** Durée en minutes (> 0) */
  duration_min: number;
  /** Fréquence cardiaque moyenne (bpm) */
  avg_hr?: number;
  /** Ressenti de 1 (très dur) à 5 (facile) */
  feeling?: 1 | 2 | 3 | 4 | 5;
  /** Commentaire libre */
  notes?: string;
}

/**
 * Entrée de planning - Un créneau planifié dans la semaine
 */
export interface PlanEntry {
  /** Identifiant unique */
  id: number;
  /** Date du lundi de la semaine (YYYY-MM-DD) */
  week_start: string;
  /** Jour de la semaine (0 = lundi … 6 = dimanche) */
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Type prévu (`rest` pour un jour de repos) */
  planned_type: SessionType | 'rest';
  /** Distance prévue en km */
  planned_km?: number;
  /** Id de la séance réalisée liée (absent = pas encore fait) */
  session_id?: number;
}

/**
 * Statistique hebdomadaire - Agrégat d'une semaine pour les graphiques
 */
export interface WeeklyStat {
  /** Date du lundi de la semaine (YYYY-MM-DD) */
  week_start: string;
  /** Nombre de séances dans la semaine */
  session_count: number;
  /** Distance totale en km */
  total_km: number;
  /** Allure moyenne en min/km */
  avg_min_per_km: number;
}
```

Points clés :
- JSDoc **au-dessus du type** + commentaire `/** … */` sur **chaque champ**.
- Description : `Nom - Rôle`, en français.
- Champs alignés sur le schéma SQL (snake_case) — voir CONVENTIONS.md §4.

---

*Document maintenu par BIC (agent documentation). Un template manquant ? Ouvrez une issue !*
