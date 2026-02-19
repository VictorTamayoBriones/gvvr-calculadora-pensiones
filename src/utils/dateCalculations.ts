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
 * Calcula la fecha de vencimiento de derechos según la fórmula del IMSS:
 * 1. Periodo de conservación = semanasCotizadas / 4 (en semanas)
 * 2. Conversión a días = periodoConservación × 7
 * 3. Tope máximo = min(días, 1716)
 * 4. Fecha vencimiento = fechaBaja + días definitivos
 */
const TOPE_MAXIMO_DIAS_CONSERVACION = 1716

export function calcularSinVigenciaDerechos(fechaBaja: string, semanasCotizadas: number): string | null {
  if (!fechaBaja.trim() || !semanasCotizadas || semanasCotizadas <= 0) {
    return null
  }

  try {
    // Paso 2-3: Calcular días de conservación con tope
    const periodoConservacionSemanas = semanasCotizadas / 4
    const diasConservacion = Math.floor(periodoConservacionSemanas * 7)
    const diasDefinitivos = Math.min(diasConservacion, TOPE_MAXIMO_DIAS_CONSERVACION)

    // Paso 4: Sumar días a la fecha de baja (parsing sin timezone)
    const [anio, mes, dia] = fechaBaja.split('-').map(Number)
    const sinVigencia = new Date(anio, mes - 1, dia)
    sinVigencia.setDate(sinVigencia.getDate() + diasDefinitivos)

    // Formatear manualmente para evitar conversión UTC
    const yyyy = sinVigencia.getFullYear()
    const mm = String(sinVigencia.getMonth() + 1).padStart(2, '0')
    const dd = String(sinVigencia.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
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
    // Parsear sin timezone y sumar meses
    const [anio, mes, dia] = fechaInicio.split('-').map(Number)
    const fin = new Date(anio, mes - 1 + totalMeses, dia)
    fin.setDate(1) // Asegurar que sea día 1

    // Formatear manualmente para evitar conversión UTC en toISOString
    const yyyy = fin.getFullYear()
    const mm = String(fin.getMonth() + 1).padStart(2, '0')
    const dd = String(fin.getDate()).padStart(2, '0')
    const fechaFin = `${yyyy}-${mm}-${dd}`

    // Calcular semanas al final: semanas_iniciales + (total_meses × 4)
    const semanasFinales = semanasIniciales + totalMeses * 4

    return { fechaFin, semanasFinales }
  } catch {
    return null
  }
}

/**
 * Calcula el total de meses entre dos fechas
 * Retorna null si alguna fecha es inválida
 */
export function calcularTotalMeses(fechaInicio: string, fechaFin: string): number | null {
  if (!fechaInicio.trim() || !fechaFin.trim()) {
    return null
  }

  try {
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)

    const meses = (fin.getFullYear() - inicio.getFullYear()) * 12
      + (fin.getMonth() - inicio.getMonth())

    return meses
  } catch {
    return null
  }
}

/**
 * Calcula las semanas acumuladas al final del período
 * semanasFinales = semanasIniciales + (totalMeses × 4)
 */
export function calcularSemanasAlFinal(semanasIniciales: number, totalMeses: number): number {
  return semanasIniciales + (totalMeses * 4)
}

/**
 * Helper function to parse ISO date strings without timezone issues
 * Used in InformeCostoMensual for date parsing
 */
export function parseISODate(dateString: string): Date {
  if (!dateString) return new Date()
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Calcula el total de meses del contrato a partir de las semanas cotizadas.
 *
 * Regla C17 sección 6.1:
 * - Si semanas > 448 → resolución en 63 semanas (441 días)
 * - Si semanas ≤ 448 → resolución en (510 - semanas) × 7 días
 * - Convertir días a meses redondeando al entero superior
 *
 * @param semanasCotizadas - Número de semanas cotizadas del cliente
 * @param fechaInicioContrato - Fecha de inicio del contrato (ISO string)
 * @returns Total de meses del contrato, o null si datos inválidos
 */
export function calcularTotalMesesDesdeSemanas(
  semanasCotizadas: number,
  fechaInicioContrato: string
): number | null {
  if (!semanasCotizadas || semanasCotizadas <= 0 || !fechaInicioContrato.trim()) {
    return null
  }

  // Calcular días hasta resolución
  const diasHastaResolucion = semanasCotizadas > 448
    ? 441 // 63 semanas × 7 días
    : (510 - semanasCotizadas) * 7

  // Parsear fecha sin timezone para evitar desplazamiento UTC
  const [anioI, mesI, diaI] = fechaInicioContrato.split('-').map(Number)
  const inicio = new Date(anioI, mesI - 1, diaI)

  // Calcular fecha base sumando días (JS desborda el día automáticamente al mes correcto)
  const fechaBase = new Date(anioI, mesI - 1, diaI + diasHastaResolucion)

  // Redondear al día 1 según quincena:
  // - Día ≤ 15 → primer día del mismo mes
  // - Día ≥ 16 → primer día del mes siguiente
  const diaBase = fechaBase.getDate()
  const mesFin = diaBase >= 16 ? fechaBase.getMonth() + 1 : fechaBase.getMonth()
  const fechaFin = new Date(fechaBase.getFullYear(), mesFin, 1)

  // Calcular diferencia en meses entre inicio y fechaFin
  const totalMeses =
    (fechaFin.getFullYear() - inicio.getFullYear()) * 12 +
    (fechaFin.getMonth() - inicio.getMonth())

  return totalMeses
}
