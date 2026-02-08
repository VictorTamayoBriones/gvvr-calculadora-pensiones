import { addComa } from "@/helpers/formatText"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ResumenFinancieroProps {
  saldoAfore: number
  prestamoSugerido: number
  totalDisponible: number
  montoMinimo: number
  esSuficiente: boolean
  faltante: number
  sobrante: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ResumenFinanciero({
  saldoAfore,
  prestamoSugerido,
  totalDisponible,
  montoMinimo,
  esSuficiente,
  faltante,
  sobrante,
}: ResumenFinancieroProps) {
  return (
    <div className="space-y-3 mb-4">
      {/* Saldo AFORE */}
      <div className="flex justify-between items-center py-2 border-b">
        <span className="text-sm text-muted-foreground">Saldo AFORE</span>
        <span className="text-sm font-medium">
          {saldoAfore > 0 ? `$ ${addComa(String(saldoAfore))}` : "$ 0"}
        </span>
      </div>

      {/* Préstamo Sugerido */}
      <div className="flex justify-between items-center py-2 border-b">
        <span className="text-sm text-muted-foreground">+ Préstamo Sugerido</span>
        <span className="text-sm font-medium">
          {prestamoSugerido > 0 ? `$ ${addComa(String(prestamoSugerido))}` : "$ 0"}
        </span>
      </div>

      {/* Total Disponible */}
      <div className="flex justify-between items-center py-2 border-b-2 border-foreground/20">
        <span className="text-sm font-semibold">= Total Disponible</span>
        <span className="text-base font-bold">$ {addComa(String(totalDisponible))}</span>
      </div>

      <div className="h-2" />

      {/* Monto Mínimo Requerido */}
      <div className="flex justify-between items-center py-2 border-b">
        <span className="text-sm text-muted-foreground">Monto Mínimo Requerido</span>
        <span className="text-sm font-medium">$ {addComa(String(montoMinimo))}</span>
      </div>

      {/* Sobrante o Faltante */}
      {esSuficiente ? (
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-muted-foreground">Sobrante</span>
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
            $ {addComa(String(sobrante))}
          </span>
        </div>
      ) : (
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-muted-foreground">Faltante</span>
          <span className="text-sm font-semibold text-destructive">
            $ {addComa(String(faltante))}
          </span>
        </div>
      )}
    </div>
  )
}
