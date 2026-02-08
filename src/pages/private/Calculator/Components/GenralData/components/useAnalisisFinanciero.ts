import { useMemo } from "react"
import { calcularResultadosFinancieros } from "../utils/financialCalculations"
import type { Modalidad } from "@/models"

// ---------------------------------------------------------------------------
// Hook: Maneja la lógica de Análisis Financiero
// ---------------------------------------------------------------------------
export function useAnalisisFinanciero(saldoAfore: string, modalidad: Modalidad) {
  // Calcular resultados financieros basado en saldo y modalidad
  const resultados = useMemo(
    () => calcularResultadosFinancieros(Number(saldoAfore) || 0, modalidad),
    [saldoAfore, modalidad]
  )

  return {
    resultados,
  }
}
