import {
  VALOR_REFERENCIA,
  FACTOR_PENSION,
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
}

// ---------------------------------------------------------------------------
// Pure calculation functions
// ---------------------------------------------------------------------------

/**
 * Calcula el préstamo sugerido basado en el saldo AFORE
 * Solo se sugiere préstamo si el saldo es insuficiente
 */
export function calcularPrestamoSugerido(saldoAfore: number): number {
  if (saldoAfore >= VALOR_REFERENCIA) {
    return 0
  }

  const prestamo = FACTOR_PENSION * FACTOR_PRESTAMO_MULTIPLICADOR - PRESTAMO_DESCUENTO
  return Math.max(0, prestamo)
}

/**
 * Calcula el total disponible sumando saldo AFORE y préstamo
 */
export function calcularTotalDisponible(saldoAfore: number, prestamo: number): number {
  return saldoAfore + prestamo
}

/**
 * Determina si el total disponible es suficiente para cubrir el valor de referencia
 */
export function esSuficienteParaPension(totalDisponible: number): boolean {
  return totalDisponible >= VALOR_REFERENCIA
}

/**
 * Calcula el faltante o sobrante comparado con el valor de referencia
 */
export function calcularDiferencia(totalDisponible: number): {
  faltante: number
  sobrante: number
} {
  const diferencia = totalDisponible - VALOR_REFERENCIA

  return {
    faltante: diferencia < 0 ? Math.abs(diferencia) : 0,
    sobrante: diferencia > 0 ? diferencia : 0,
  }
}

/**
 * Determina el tipo de financiamiento basado en la capacidad financiera
 */
export function determinarTipoFinanciamiento(totalDisponible: number): TipoFinanciamiento {
  return totalDisponible >= VALOR_REFERENCIA
    ? TIPO_FINANCIAMIENTO.FINANCIADO_100
    : TIPO_FINANCIAMIENTO.FINANCIADO_1
}

/**
 * Función principal que calcula todos los resultados financieros
 */
export function calcularResultadosFinancieros(
  saldoAfore: number,
  modalidad: string
): ResultadosFinancieros {
  const prestamoSugerido = calcularPrestamoSugerido(saldoAfore)
  const totalDisponible = calcularTotalDisponible(saldoAfore, prestamoSugerido)
  const esSuficiente = esSuficienteParaPension(totalDisponible)
  const { faltante, sobrante } = calcularDiferencia(totalDisponible)
  const tipoFinanciamiento = determinarTipoFinanciamiento(totalDisponible)
  const necesitaPrestamo = prestamoSugerido > 0

  // Generar etiqueta si aplica (solo para REACTIVA FINANCIADO 100)
  const etiquetaPrestamo =
    saldoAfore < VALOR_REFERENCIA && modalidad === "REACTIVA FINANCIADO 100"
      ? "NECESITA PRESTAMO FINANCIERO: "
      : ""

  return {
    saldoAfore,
    prestamoSugerido,
    totalDisponible,
    montoMinimo: VALOR_REFERENCIA,
    esSuficiente,
    faltante,
    sobrante,
    tipoFinanciamiento,
    necesitaPrestamo,
    etiquetaPrestamo,
    mensaje: MENSAJES_FINANCIAMIENTO[tipoFinanciamiento] ?? "",
  }
}
