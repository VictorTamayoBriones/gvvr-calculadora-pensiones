import { extractBirthdateFromCURP } from "@/helpers/extractBirthdateFromCURP"

// ---------------------------------------------------------------------------
// Date calculation functions
// ---------------------------------------------------------------------------

/**
 * Calcula la edad en años desde una fecha de nacimiento
 */
export function calcularEdadEnAnios(fechaNacimiento: Date): number {
  const hoy = new Date()
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
  const mes = hoy.getMonth() - fechaNacimiento.getMonth()

  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--
  }

  return edad
}

/**
 * Extrae fecha de nacimiento y edad desde un CURP
 * Retorna null si el CURP es inválido o incompleto
 */
export function extraerDatosNacimientoDesdeCURP(curp: string): {
  fechaNacimiento: string
  edad: string
} | null {
  const curpLimpio = curp.trim()

  if (!curpLimpio || curpLimpio.length !== 18) {
    return null
  }

  const fechaNacimiento = extractBirthdateFromCURP(curpLimpio)

  if (!fechaNacimiento) {
    return null
  }

  const fechaNacimientoISO = fechaNacimiento.toISOString().split("T")[0]
  const edad = calcularEdadEnAnios(fechaNacimiento)

  return {
    fechaNacimiento: fechaNacimientoISO,
    edad: String(edad),
  }
}

/**
 * Calcula la fecha sin vigencia de derechos (fecha de baja + 5 años)
 */
export function calcularSinVigenciaDerechos(fechaBaja: string): string | null {
  if (!fechaBaja.trim()) {
    return null
  }

  try {
    const baja = new Date(fechaBaja)
    const sinVigencia = new Date(baja)
    sinVigencia.setFullYear(sinVigencia.getFullYear() + 5)

    return sinVigencia.toISOString().split("T")[0]
  } catch {
    return null
  }
}

/**
 * Calcula la ley aplicable según fecha de nacimiento, semanas cotizadas y fecha de baja
 */
export function calcularLeyAplicable(
  fechaNacimiento: string,
  semanasCotizadas: number,
  fechaBaja: string
): "LEY_73" | "LEY_97" | null {
  if (!fechaNacimiento.trim() || !semanasCotizadas || !fechaBaja.trim()) {
    return null
  }

  try {
    // Calcular fecha aproximada de primera cotización
    // fecha_primera_cotizacion ≈ fecha_baja - (semanas_cotizadas / 52 años)
    const baja = new Date(fechaBaja)
    const añosCotizados = semanasCotizadas / 52
    const fechaPrimeraCotizacionAprox = new Date(baja)
    fechaPrimeraCotizacionAprox.setFullYear(
      fechaPrimeraCotizacionAprox.getFullYear() - Math.floor(añosCotizados)
    )

    // Fecha límite para LEY 73: 1 de julio de 1997
    const fechaLimite = new Date("1997-07-01")

    return fechaPrimeraCotizacionAprox < fechaLimite ? "LEY_73" : "LEY_97"
  } catch {
    return null
  }
}

/**
 * Calcula la fecha de inicio de contrato según la fecha de firma
 * - Si firma antes del día 15: retroactivo al 1ro del mes corriente
 * - Si firma después del día 15: al 1ro del mes siguiente
 */
export function calcularFechaInicioContrato(fechaFirma: string): string | null {
  if (!fechaFirma.trim()) {
    return null
  }

  try {
    const firma = new Date(fechaFirma)
    const dia = firma.getDate()

    let fechaInicio: Date

    if (dia <= 15) {
      // Alta retroactiva al 1ro del mes corriente
      fechaInicio = new Date(firma.getFullYear(), firma.getMonth(), 1)
    } else {
      // Alta al 1ro del mes siguiente
      fechaInicio = new Date(firma.getFullYear(), firma.getMonth() + 1, 1)
    }

    return fechaInicio.toISOString().split("T")[0]
  } catch {
    return null
  }
}

/**
 * Calcula la fecha de fin de contrato y semanas al final
 */
export function calcularDatosFinContrato(
  fechaInicio: string,
  totalMeses: number,
  semanasIniciales: number
): { fechaFin: string; semanasFinales: number } | null {
  if (!fechaInicio.trim() || !totalMeses) {
    return null
  }

  try {
    // Calcular fecha de fin: fecha_inicio + total_meses
    const inicio = new Date(fechaInicio)
    const fin = new Date(inicio)
    fin.setMonth(fin.getMonth() + totalMeses)
    fin.setDate(1) // Asegurar que sea día 1

    const fechaFin = fin.toISOString().split("T")[0]

    // Calcular semanas al final: semanas_iniciales + (total_meses × 4)
    const semanasFinales = semanasIniciales + totalMeses * 4

    return { fechaFin, semanasFinales }
  } catch {
    return null
  }
}
