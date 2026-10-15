import { Card } from './Card'

/**
 * SectionPlaceholder — écran « bientôt disponible ».
 * Utilisé dans chaque section tant que la fonctionnalité n'est pas prête.
 */
export function SectionPlaceholder({
  emoji,
  title,
  description,
}: {
  emoji: string
  title: string
  description: string
}) {
  return (
    <Card>
      <div className="flex flex-col items-start gap-3">
        <span className="text-4xl" aria-hidden="true">
          {emoji}
        </span>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
          🚧 Bientôt disponible
        </span>
      </div>
    </Card>
  )
}
