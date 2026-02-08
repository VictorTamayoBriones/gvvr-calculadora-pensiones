import { addComa } from "@/helpers/formatText"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DetalleCalculoPrestamoProps {
  factorPension: number
  factorMultiplicador: number
  descuento: number
  prestamoSugerido: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function DetalleCalculoPrestamo({
  factorPension,
  factorMultiplicador,
  descuento,
  prestamoSugerido,
}: DetalleCalculoPrestamoProps) {
  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-blue-600 dark:text-blue-400 font-medium hover:underline">
        ¿Cómo se calcula el préstamo sugerido?
      </summary>
      <div className="mt-3 p-4 bg-muted/50 rounded-lg border space-y-2">
        <p className="font-medium">Fórmula:</p>
        <code className="block bg-background p-2 rounded text-xs font-mono">
          (Pensión Mensual × {factorMultiplicador}) - ${addComa(String(descuento))}
        </code>
        <p className="text-muted-foreground">
          Cálculo: (${addComa(String(factorPension))} × {factorMultiplicador}) - $
          {addComa(String(descuento))} = ${addComa(String(prestamoSugerido))}
        </p>
        <p className="text-xs text-muted-foreground italic mt-2">
          * Este es un monto sugerido. El préstamo final puede variar según aprobación de
          Grupo Avivir.
        </p>
      </div>
    </details>
  )
}
