import { useMemo } from "react"
import { calcularMontoPension } from "@/utils/calculoMontoPension"
import { calcularCostoTotalTramite } from "@/utils/calculoCostoTotal"

/**
 * Hook dedicado a calcular los dos valores dinámicos que alimentan
 * al análisis financiero y la selección de modalidad.
 *
 * - pensionMensual: se obtiene de TABLA_PENSIONES[año][edad] usando la edad proyectada
 * - costoTotal: suma de pagos mensuales (según tabla de precios anuales) + gestoría
 */
export function usePensionYCostoTotal(
  curp: string,
  fechaNacimiento: string,
  fechaInicioContrato: string,
  fechaFinContrato: string
): { pensionMensual: number; costoTotal: number } {
  return useMemo(() => {
    if (!curp || !fechaNacimiento || !fechaInicioContrato || !fechaFinContrato) {
      return { pensionMensual: 0, costoTotal: 0 }
    }

    // Calculate pension
    const resultadoPension = calcularMontoPension(
      fechaNacimiento,
      curp,
      fechaInicioContrato,
      fechaFinContrato
    )
    const pensionMensual = resultadoPension.success && resultadoPension.montoPension
      ? resultadoPension.montoPension
      : 0

    // Calculate total cost
    const resultadoCosto = calcularCostoTotalTramite(fechaInicioContrato, fechaFinContrato)
    const costoTotal = resultadoCosto ? resultadoCosto.costoTotal : 0

    return { pensionMensual, costoTotal }
  }, [curp, fechaNacimiento, fechaInicioContrato, fechaFinContrato])
}
