import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle } from "lucide-react"
import { ResumenFinanciero } from "./ResumenFinanciero"
import { EstadoFinanciamiento } from "./EstadoFinanciamiento"
import { AccionRequerida } from "./AccionRequerida"
import { DetalleCalculoPrestamo } from "./DetalleCalculoPrestamo"
import { useAnalisisFinanciero } from "./useAnalisisFinanciero"
import type { Modalidad } from "@/models"
import {
  FACTOR_PRESTAMO_MULTIPLICADOR,
  PRESTAMO_DESCUENTO,
} from "../constants"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AnalisisFinancieroSectionProps {
  saldoAfore: string
  modalidad: Modalidad
  pensionMensual: number
  costoTotal: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function AnalisisFinancieroSection({
  saldoAfore,
  modalidad,
  pensionMensual,
  costoTotal,
}: AnalisisFinancieroSectionProps) {
  const { resultados } = useAnalisisFinanciero(saldoAfore, modalidad, pensionMensual, costoTotal)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis Financiero</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Etiqueta de préstamo si aplica */}
        {resultados.etiquetaPrestamo && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-500 dark:border-amber-500/50 p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-amber-900 dark:text-amber-200" />
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              {resultados.etiquetaPrestamo}
            </p>
          </div>
        )}

        {/* Resumen del cálculo */}
        <ResumenFinanciero
          saldoAfore={resultados.saldoAfore}
          prestamoSugerido={resultados.prestamoSugerido}
          totalDisponible={resultados.totalDisponible}
          montoMinimo={resultados.montoMinimo}
          esSuficiente={resultados.esSuficiente}
          faltante={resultados.faltante}
          sobrante={resultados.sobrante}
        />

        {/* Badge de estado */}
        <EstadoFinanciamiento
          esSuficiente={resultados.esSuficiente}
          tipoFinanciamiento={resultados.tipoFinanciamiento}
        />

        {/* Mensaje descriptivo */}
        {resultados.mensaje && (
          <>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">{resultados.mensaje}</p>
          </>
        )}

        {/* Mensaje de acción si es insuficiente */}
        {!resultados.esSuficiente && resultados.faltante > 0 && (
          <>
            <Separator className="my-4" />
            <AccionRequerida faltante={resultados.faltante} />
          </>
        )}

        {/* Detalle del cálculo del préstamo */}
        {resultados.necesitaPrestamo && (
          <>
            <Separator className="my-4" />
            <DetalleCalculoPrestamo
              factorPension={resultados.pensionMensual}
              factorMultiplicador={FACTOR_PRESTAMO_MULTIPLICADOR}
              descuento={PRESTAMO_DESCUENTO}
              prestamoSugerido={resultados.prestamoSugerido}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
