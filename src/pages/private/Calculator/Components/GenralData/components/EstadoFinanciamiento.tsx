import type { TipoFinanciamiento } from "../constants"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface EstadoFinanciamientoProps {
  esSuficiente: boolean
  tipoFinanciamiento: TipoFinanciamiento
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function EstadoFinanciamiento({
  esSuficiente,
  tipoFinanciamiento,
}: EstadoFinanciamientoProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${
        esSuficiente
          ? "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-800"
          : "bg-destructive/10 text-destructive border border-destructive/30"
      }`}
    >
      <span className="text-lg">{esSuficiente ? "✅" : "⚠️"}</span>
      <span>Tipo de Financiamiento: {tipoFinanciamiento}</span>
    </div>
  )
}
