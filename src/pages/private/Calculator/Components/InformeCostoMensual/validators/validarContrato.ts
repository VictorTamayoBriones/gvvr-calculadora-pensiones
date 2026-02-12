import { parseISODate } from "@/utils/dateCalculations"

interface DatosContrato {
  fechaFirmaContrato: string
  fechaInicioContrato: string
  fechaFinContrato: string
  totalMeses: string
  semanasAlFinal: string
  semanasCotizadas: string
  fechaBaja: string
  leyAplicable: "LEY_73" | "LEY_97" | ""
}

interface ResultadoValidacionContrato {
  errores: string[]
  advertencias: string[]
  info: string[]
}

/**
 * Valida coherencia de fechas y duración del contrato.
 * Verifica que las fechas sean día 1, mínimo 14 meses, y semanas al final correctas.
 *
 * @returns Errores, advertencias e información sobre la validación del contrato
 */
export function validarContrato({
  fechaFirmaContrato,
  fechaInicioContrato,
  fechaFinContrato,
  totalMeses: totalMesesStr,
  semanasAlFinal: semanasAlFinalStr,
  semanasCotizadas: semanasCotizadasStr,
  fechaBaja,
  leyAplicable,
}: DatosContrato): ResultadoValidacionContrato {
  const errores: string[] = []
  const advertencias: string[] = []
  const info: string[] = []

  // Solo validar si hay datos del contrato
  const tieneAlgunDato = fechaFirmaContrato ||
                         fechaInicioContrato ||
                         fechaFinContrato ||
                         totalMesesStr

  if (!tieneAlgunDato) {
    return { errores, advertencias, info }
  }

  // Validar campos requeridos
  if (!fechaFirmaContrato) {
    advertencias.push("Ingrese la fecha de firma del contrato para iniciar el proceso")
  }
  if (!totalMesesStr && fechaFirmaContrato) {
    advertencias.push("Ingrese el total de meses del contrato")
  }

  // 1. VALIDACIONES DE FECHA DE FIRMA
  if (fechaFirmaContrato) {
    const fechaFirma = parseISODate(fechaFirmaContrato)
    const hoy = new Date()

    // No puede ser futura
    if (fechaFirma > hoy) {
      errores.push("La fecha de firma del contrato no puede ser futura")
    }
  }

  // 2. VALIDACIONES DE FECHA DE INICIO
  if (fechaInicioContrato) {
    const fechaInicio = parseISODate(fechaInicioContrato)

    // CRÍTICO: Debe ser día 1 del mes
    if (fechaInicio.getDate() !== 1) {
      errores.push("❌ CRÍTICO: La fecha de inicio DEBE ser el día 1 del mes")
    }

    // Validar relación con fecha de firma
    if (fechaFirmaContrato) {
      const fechaFirma = parseISODate(fechaFirmaContrato)
      const diffMeses = (fechaFirma.getFullYear() - fechaInicio.getFullYear()) * 12
                      + (fechaFirma.getMonth() - fechaInicio.getMonth())

      // No puede ser más de 6 meses anterior
      if (diffMeses > 6) {
        errores.push("La fecha de inicio no puede ser más de 6 meses anterior a la fecha de firma")
      }

      // No puede ser más de 2 meses posterior
      if (diffMeses < -2) {
        errores.push("La fecha de inicio no puede ser más de 2 meses posterior a la fecha de firma")
      }
    }

    // Validar que sea posterior a fecha de baja
    if (fechaBaja) {
      const fechaBajaDate = parseISODate(fechaBaja)
      if (fechaInicio <= fechaBajaDate) {
        errores.push("La fecha de inicio debe ser posterior a la fecha de baja del IMSS")
      }
    }
  }

  // 3. VALIDACIONES DE FECHA DE FIN
  if (fechaFinContrato) {
    const fechaFin = parseISODate(fechaFinContrato)

    // CRÍTICO: Debe ser día 1 del mes
    if (fechaFin.getDate() !== 1) {
      errores.push("❌ CRÍTICO: La fecha de fin DEBE ser el día 1 del mes")
    }

    // Debe ser posterior a fecha de inicio
    if (fechaInicioContrato) {
      const fechaInicio = parseISODate(fechaInicioContrato)
      if (fechaFin <= fechaInicio) {
        errores.push("La fecha de fin debe ser posterior a la fecha de inicio")
      }
    }
  }

  // 4. VALIDACIONES DE TOTAL DE MESES
  const totalMeses = Number(totalMesesStr) || 0

  if (totalMeses > 0) {
    // CRÍTICO: Mínimo 14 meses
    if (totalMeses < 14) {
      errores.push("❌ CRÍTICO: El contrato debe ser de al menos 14 meses para recuperar derechos ante el IMSS")
    }

    // Validar coherencia con fechas
    if (fechaInicioContrato && fechaFinContrato) {
      const fechaInicio = parseISODate(fechaInicioContrato)
      const fechaFin = parseISODate(fechaFinContrato)
      const mesesCalculados = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12
                            + (fechaFin.getMonth() - fechaInicio.getMonth())

      if (mesesCalculados !== totalMeses) {
        errores.push(`El total de meses (${totalMeses}) no coincide con la diferencia entre fechas (${mesesCalculados} meses)`)
      }
    }

    // Advertencia para contratos largos
    if (totalMeses > 24 && totalMeses <= 36) {
      advertencias.push(`Contrato de ${totalMeses} meses es más largo que el promedio. Verifique si es necesario.`)
    } else if (totalMeses > 36) {
      advertencias.push(`⚠️ Contrato muy largo de ${totalMeses} meses. Considere reducir la duración.`)
    }
  }

  // 5. VALIDACIONES DE SEMANAS AL FINAL
  const semanasAlFinal = Number(semanasAlFinalStr) || 0
  const semanasIniciales = Number(semanasCotizadasStr) || 0

  if (semanasAlFinal > 0 && totalMeses > 0) {
    // Validar cálculo correcto
    const semanasEsperadas = semanasIniciales + (totalMeses * 4)
    const calculoCorrecto = semanasAlFinal === semanasEsperadas

    if (!calculoCorrecto) {
      errores.push(`Las semanas al final (${semanasAlFinal}) no coinciden con el cálculo esperado (${semanasEsperadas})`)
    }

    // Solo mostrar validaciones de ley si el cálculo es correcto y el contrato cumple mínimo
    if (calculoCorrecto && totalMeses >= 14) {
      if (leyAplicable) {
        const requisitos: { [key: string]: number } = {
          'LEY_73': 500,
          'LEY_97': 1250
        }

        const minimoRequerido = requisitos[leyAplicable]

        if (minimoRequerido) {
          if (semanasAlFinal < minimoRequerido) {
            const semanasFaltantes = minimoRequerido - semanasAlFinal
            const mesesAdicionales = Math.ceil(semanasFaltantes / 4)
            errores.push(
              `❌ Con ${semanasAlFinal.toLocaleString('es-MX')} semanas al final, NO cumple el mínimo de ${minimoRequerido.toLocaleString('es-MX')} semanas para ${leyAplicable}. ` +
              `Necesita ${mesesAdicionales} meses adicionales (${semanasFaltantes} semanas más)`
            )
          }
        }
      }
    }
  }

  return { errores, advertencias, info }
}
