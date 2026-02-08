import { addComa } from "@/helpers/formatText"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AccionRequeridaProps {
  faltante: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function AccionRequerida({ faltante }: AccionRequeridaProps) {
  return (
    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4">
      <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">
        <strong>⚠️ Acción requerida:</strong>
      </p>
      <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1 list-disc list-inside">
        <li>
          El cliente necesita aportar $ {addComa(String(faltante))} adicionales, o
        </li>
        <li>Negociar un préstamo mayor con Grupo Avivir</li>
      </ul>
    </div>
  )
}
