import {
  FACTOR_PRESTAMO_MULTIPLICADOR,
  PRESTAMO_DESCUENTO,
  TIPO_FINANCIAMIENTO,
  MENSAJES_FINANCIAMIENTO,
  type TipoFinanciamiento,
} from "../constants"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ResultadosFinancieros {
  saldoAfore: number
  prestamoSugerido: number
  totalDisponible: number
  montoMinimo: number
  esSuficiente: boolean
  faltante: number
  sobrante: number
  tipoFinanciamiento: TipoFinanciamiento
  necesitaPrestamo: boolean
  etiquetaPrestamo: string
  mensaje: string
  pensionMensual: number
}

// ---------------------------------------------------------------------------
// Pure calculation functions
// ---------------------------------------------------------------------------

/**
 * Calcula el préstamo sugerido basado en el saldo AFORE, pensión mensual y costo total.
 * Solo se sugiere préstamo si el saldo es insuficiente para cubrir el costo total.
 */
export function calcularPrestamoSugerido(
  saldoAfore: number,
  pensionMensual: number,
  costoTotal: number
): number {
  if (costoTotal <= 0 || saldoAfore >= costoTotal) {
    return 0
  }

  const prestamo = pensionMensual * FACTOR_PRESTAMO_MULTIPLICADOR - PRESTAMO_DESCUENTO
  return Math.max(0, prestamo)
}

/**
 * Calcula el total disponible sumando saldo AFORE y préstamo
 */
export function calcularTotalDisponible(saldoAfore: number, prestamo: number): number {
  return saldoAfore + prestamo
}

/**
 * Determina si el total disponible es suficiente para cubrir el costo total
 */
export function esSuficienteParaPension(totalDisponible: number, costoTotal: number): boolean {
  return costoTotal <= 0 || totalDisponible >= costoTotal
}

/**
 * Calcula el faltante o sobrante comparado con el costo total
 */
export function calcularDiferencia(totalDisponible: number, costoTotal: number): {
  faltante: number
  sobrante: number
} {
  const diferencia = totalDisponible - costoTotal

  return {
    faltante: diferencia < 0 ? Math.abs(diferencia) : 0,
    sobrante: diferencia > 0 ? diferencia : 0,
  }
}

/**
 * Determina el tipo de financiamiento basado en la capacidad financiera
 */
export function determinarTipoFinanciamiento(
  totalDisponible: number,
  costoTotal: number
): TipoFinanciamiento {
  return costoTotal <= 0 || totalDisponible >= costoTotal
    ? TIPO_FINANCIAMIENTO.FINANCIADO_100
    : TIPO_FINANCIAMIENTO.FINANCIADO_1
}

/**
 * Función principal que calcula todos los resultados financieros
 */
export function calcularResultadosFinancieros(
  saldoAfore: number,
  modalidad: string,
  pensionMensual: number,
  costoTotal: number
): ResultadosFinancieros {
  const prestamoSugerido = calcularPrestamoSugerido(saldoAfore, pensionMensual, costoTotal)
  const totalDisponible = calcularTotalDisponible(saldoAfore, prestamoSugerido)
  const esSuficiente = esSuficienteParaPension(totalDisponible, costoTotal)
  const { faltante, sobrante } = calcularDiferencia(totalDisponible, costoTotal)
  const tipoFinanciamiento = determinarTipoFinanciamiento(totalDisponible, costoTotal)
  const necesitaPrestamo = prestamoSugerido > 0

  // Generar etiqueta si aplica (solo para REACTIVA FINANCIADO 100)
  const etiquetaPrestamo =
    costoTotal > 0 && saldoAfore < costoTotal && modalidad === "REACTIVA FINANCIADO 100"
      ? "NECESITA PRESTAMO FINANCIERO: "
      : ""

  return {
    saldoAfore,
    prestamoSugerido,
    totalDisponible,
    montoMinimo: costoTotal,
    esSuficiente,
    faltante,
    sobrante,
    tipoFinanciamiento,
    necesitaPrestamo,
    etiquetaPrestamo,
    mensaje: MENSAJES_FINANCIAMIENTO[tipoFinanciamiento] ?? "",
    pensionMensual,
  }
}
