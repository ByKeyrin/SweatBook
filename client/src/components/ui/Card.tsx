import type { ReactNode } from 'react'

/**
 * Card — composant « carte » réutilisable (client/src/components/ui/).
 * Tout ce qu'on met entre <Card> … </Card> est affiché dans une jolie boîte.
 *
 * 💡 « ReactNode » = n'importe quel contenu React (texte, balises, composants…).
 */
export function Card({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      {title && (
        <h2 className="mb-3 text-lg font-semibold text-slate-800">{title}</h2>
      )}
      {children}
    </div>
  )
}
