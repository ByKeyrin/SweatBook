import { useState } from 'react'
import { JournalScreen } from './features/journal/JournalScreen'
import { ProgressionScreen } from './features/progression/ProgressionScreen'
import { PlanningScreen } from './features/planning/PlanningScreen'

/*
 * App — composant racine de SweatBook (client/src/App.tsx).
 *
 * Il affiche :
 *   1. un en-tête (« 💦 SweatBook ») ;
 *   2. une navigation entre les 3 sections ;
 *   3. la section sélectionnée (Journal / Progression / Planning).
 *
 * 💡 Pourquoi useState ici ?
 * « tab » mémorise la section affichée. Quand on clique sur un onglet,
 * setTab() change cette valeur et React réaffiche automatiquement la page.
 */

/** Les 3 sections de l'app. */
const TABS = [
  { id: 'journal', label: 'Journal', icon: '📓' },
  {
    id: 'progression',
    label: 'Progression',
    icon: '📈',
    // La doc et les tests E2E appellent cette page « Graphiques » :
    // l'attribut aria-label permet de garder les deux appellations.
    ariaLabel: 'Progression — Graphiques',
  },
  { id: 'planning', label: 'Planning', icon: '🗓️' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function App() {
  const [tab, setTab] = useState<TabId>('journal')

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-12">
      {/* ---------- En-tête ---------- */}
      <header className="py-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          💦 SweatBook
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Ton carnet d'entraînement running
        </p>
      </header>

      {/* ---------- Navigation ---------- */}
      <nav className="sticky top-0 z-10 -mx-4 mb-6 border-b border-slate-200 bg-white/90 px-4 py-2 backdrop-blur">
        {/* Flex : les onglets se rangent sur une ligne, scrollable sur mobile */}
        <ul className="flex justify-center gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const isActive = t.id === tab
            return (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  aria-label={'ariaLabel' in t ? t.ariaLabel : t.label}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault() // on reste sur la même page (pas de rechargement)
                    setTab(t.id)
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span aria-hidden="true">{t.icon}</span>
                  {t.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ---------- Contenu de la section active ---------- */}
      <main className="flex-1">
        {tab === 'journal' && <JournalScreen />}
        {tab === 'progression' && <ProgressionScreen />}
        {tab === 'planning' && <PlanningScreen />}
      </main>

      {/* ---------- Pied de page ---------- */}
      <footer className="mt-10 text-center text-xs text-slate-400">
        SweatBook — Sprint 2 · Fait avec React + Vite + Tailwind 💪
      </footer>
    </div>
  )
}
