import { type Modalidad, usaAforeEnModalidad } from "@/models/calculator.types"
import { getPresupuestoMinimo } from "@/utils/preciosAnuales"
import { getAdminConfig } from "@/contexts/AdminConfigContext"

interface DatosPresupuesto {
  saldoAfore: number
  prestamoFinanciero: number
  montoTotalInvertir: number
  edad: number
  modalidad: Modalidad
}

interface ResultadoValidacionPresupuesto {
  errores: string[]
  advertencias: string[]
  info: string[]
}

/**
 * Valida el presupuesto disponible contra los requisitos de la modalidad seleccionada.
 * Verifica montos, coherencia del cálculo total, y restricciones de edad.
 *
 * @returns Errores, advertencias e información sobre la suficiencia del presupuesto
 */
export function validarPresupuesto({
  saldoAfore,
  prestamoFinanciero,
  montoTotalInvertir,
  edad,
  modalidad,
}: DatosPresupuesto): ResultadoValidacionPresupuesto {
  const errores: string[] = []
  const advertencias: string[] = []
  const info: string[] = []

  // 1. VALIDACIÓN DE SALDO AFORE
  if (saldoAfore < 0) {
    errores.push("El saldo AFORE no puede ser negativo")
  }

  // Advertencia si tiene AFORE pero la modalidad no lo usa
  const usaAfore = usaAforeEnModalidad(modalidad)
  if (saldoAfore > 0 && !usaAfore) {
    advertencias.push(
      `Tiene $${saldoAfore.toLocaleString('es-MX')} en AFORE que NO se usará en ${modalidad}. ` +
      `El saldo AFORE solo se utiliza en REACTIVA TRADICIONAL y FINANCIADO 1.`
    )
    info.push(`Considere una modalidad que aproveche su saldo AFORE`)
  }

  // 2. VALIDACIÓN DE PRÉSTAMO
  if (prestamoFinanciero < 0) {
    errores.push("El préstamo financiero no puede ser negativo")
  }

  // 3. VALIDACIÓN DE MONTO TOTAL
  const montoCalculado = usaAfore ? saldoAfore + prestamoFinanciero : prestamoFinanciero
  if (Math.abs(montoTotalInvertir - montoCalculado) > 0.01) {
    errores.push(
      `El monto total ($${montoTotalInvertir.toLocaleString('es-MX')}) no coincide con el cálculo esperado ` +
      `($${montoCalculado.toLocaleString('es-MX')})`
    )
  }

  // 4. VALIDACIÓN CON MODALIDAD SELECCIONADA
  const presupuestoMinConfig = getPresupuestoMinimo()
  const minimo = presupuestoMinConfig[modalidad] ?? 0

  {
    const presupuestoDisponible = usaAfore ? saldoAfore + prestamoFinanciero : prestamoFinanciero

    if (presupuestoDisponible < minimo && minimo > 0) {
      const faltante = minimo - presupuestoDisponible
      errores.push(
        `Presupuesto insuficiente para ${modalidad}. ` +
        `Requiere $${minimo.toLocaleString('es-MX')}, ` +
        `tiene $${presupuestoDisponible.toLocaleString('es-MX')}. ` +
        `Falta: $${faltante.toLocaleString('es-MX')}`
      )
    } else if (presupuestoDisponible >= minimo && minimo > 0) {
      const sobrante = presupuestoDisponible - minimo
      info.push(
        `✓ Presupuesto suficiente para ${modalidad}. ` +
        `Sobrante: $${sobrante.toLocaleString('es-MX')}`
      )
    }
  }

  // 5. RESTRICCIÓN DE EDAD PARA REACTIVA FINANCIADO 100
  const edadMaxF100 = Math.floor(getAdminConfig().edadMaximaReactivaF100 / 12)
  if (modalidad === 'REACTIVA FINANCIADO 100' && edad >= edadMaxF100) {
    errores.push(
      `⚠️ RESTRICCIÓN CRÍTICA: REACTIVA FINANCIADO 100% solo es viable para menores de ${edadMaxF100} años`
    )
  }

  // 6. INFORMACIÓN SOBRE DESGLOSE DEL PRESUPUESTO
  if (montoTotalInvertir > 0) {
    if (usaAfore && saldoAfore > 0) {
      info.push(
        `Presupuesto total: $${montoTotalInvertir.toLocaleString('es-MX')} ` +
        `(AFORE: $${saldoAfore.toLocaleString('es-MX')} + ` +
        `Préstamo: $${prestamoFinanciero.toLocaleString('es-MX')})`
      )
    } else {
      info.push(
        `Presupuesto total: $${montoTotalInvertir.toLocaleString('es-MX')} ` +
        `(solo Préstamo${!usaAfore ? ', AFORE no aplica' : ''})`
      )
    }
  }

  return { errores, advertencias, info }
}
