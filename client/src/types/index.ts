/* ============================================================
 * Types partagés de SweatBook — client/src/types/index.ts
 * ============================================================
 * Un « type » décrit la forme d'une donnée. TypeScript vérifie
 * ensuite qu'on l'utilise correctement (ex. : pas de texte dans
 * une distance). Source de vérité : docs/TECHNICAL.md §6.4.
 *
 * ⚠️ Pourquoi ces noms en anglais (distance_km, duration_min…) ?
 * Ce sont exactement les colonnes de la base SQLite et les champs
 * renvoyés par l'API REST — ainsi, aucun renommage n'est nécessaire
 * entre le serveur et le client.
 * ============================================================
 */

/** Les 5 types de sortie autorisés (docs/TECHNICAL.md, table `sessions`). */
export type SessionType = 'easy' | 'long' | 'interval' | 'tempo' | 'recovery';

/** Ressenti de la séance : 1 (très dur) à 5 (facile). */
export type Feeling = 1 | 2 | 3 | 4 | 5;

/** Jour de la semaine : 0 = lundi … 6 = dimanche. */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Une séance réalisée (journal). */
export interface Session {
  id: number;
  date: string; // 'YYYY-MM-DD'
  type: SessionType;
  distance_km: number;
  duration_min: number;
  avg_hr?: number; // bpm
  feeling?: Feeling;
  notes?: string;
}

/** Une entrée du planning hebdomadaire. */
export interface PlanEntry {
  id: number;
  week_start: string; // date du lundi de la semaine, 'YYYY-MM-DD'
  day_of_week: DayOfWeek;
  planned_type: SessionType | 'rest';
  planned_km?: number;
  session_id?: number; // séance réalisée liée (null = pas encore fait)
}

/** Statistiques agrégées par semaine (pour les graphiques). */
export interface WeeklyStat {
  week_start: string;
  session_count: number;
  total_km: number;
  avg_min_per_km: number;
}

/** Libellés français affichés dans l'interface. */
export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  easy: 'Sortie facile',
  long: 'Sortie longue',
  interval: 'Fractionné',
  tempo: 'Tempo',
  recovery: 'Récupération',
};

/* ------------------------------------------------------------
 * À titre de trace uniquement (non utilisé dans l'app) :
 * le brief du Sprint 1 proposait le modèle multi-sport ci-dessous.
 * Il a été écarté car il ne correspond ni à docs/TECHNICAL.md §6.4,
 * ni au schéma SQL, ni aux tests déjà présents dans tests/ (qui
 * utilisent easy/long/interval/tempo/recovery + distance_km…).
 * ------------------------------------------------------------ */
export interface BriefSession {
  id: string;
  date: string;
  type: 'course' | 'traction' | 'tennis' | 'force';
  distance?: number; // km
  duree?: number; // minutes
  fcMoyenne?: number; // bpm
  ressenti?: number; // 1-5
  notes?: string;
}
