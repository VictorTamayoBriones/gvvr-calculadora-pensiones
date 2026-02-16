import { getAdminConfig } from "@/contexts/AdminConfigContext"

// ---------------------------------------------------------------------------
// Validation constants
// ---------------------------------------------------------------------------
export const MINIMO_SEMANAS_COTIZADAS = 430  // Minimum weeks required for eligibility
export const MINIMO_SALDO_AFORE = 15_000     // Minimum AFORE balance in MXN
export const CURP_LENGTH = 18                // Standard CURP length
export const SALDO_MINIMO_PARA_CALCULO = 0   // Minimum balance to trigger calculations

// ---------------------------------------------------------------------------
// Age validation constants
// ---------------------------------------------------------------------------
export const EDAD_MINIMA_MESES = 702          // 58.5 years minimum age
export const EDAD_MAXIMA_REACTIVA_F100 = 816  // 68 years maximum for REACTIVA FINANCIADO 100
export const MESES_POR_ANIO = 12              // Conversion factor for months to years

// ---------------------------------------------------------------------------
// Calculation constants
// ---------------------------------------------------------------------------
export const FACTOR_PRESTAMO_MULTIPLICADOR = 9
export const PRESTAMO_DESCUENTO = 10_000
export const TASA_RETENCION_PRESTAMO = 0.30        // 30% de retención sobre pensión para pagar crédito
export const MESES_RETENCION_PRESTAMO = 60          // 60 meses (5 años) de retención

// ---------------------------------------------------------------------------
// Admin-configurable getters (read from localStorage via AdminConfig)
// ---------------------------------------------------------------------------
export function getMinimoSemanasCotizadas(): number {
  return getAdminConfig().minimoSemanasCotizadas
}
export function getMinimoSaldoAfore(): number {
  return getAdminConfig().minimoSaldoAfore
}
export function getEdadMinimaMeses(): number {
  return getAdminConfig().edadMinimaMeses
}
export function getEdadMaximaReactivaF100(): number {
  return getAdminConfig().edadMaximaReactivaF100
}
export function getFactorPrestamoMultiplicador(): number {
  return getAdminConfig().factorPrestamoMultiplicador
}
export function getPrestamoDescuento(): number {
  return getAdminConfig().prestamoDescuento
}
export function getTasaRetencionPrestamo(): number {
  return getAdminConfig().tasaRetencionPrestamo
}
export function getMesesRetencionPrestamo(): number {
  return getAdminConfig().mesesRetencionPrestamo
}

// ---------------------------------------------------------------------------
// Financing types
// ---------------------------------------------------------------------------
export const TIPO_FINANCIAMIENTO = {
  REACTIVA_TRADICIONAL: "REACTIVA TRADICIONAL",
  REACTIVA_FINANCIADO_100: "REACTIVA FINANCIADO 100",
  FINANCIADO_100: "FINANCIADO 100",
  FINANCIADO_1: "FINANCIADO 1",
} as const

export type TipoFinanciamiento = typeof TIPO_FINANCIAMIENTO[keyof typeof TIPO_FINANCIAMIENTO]

// ---------------------------------------------------------------------------
// Modalidad types - Re-exported from domain models
// ---------------------------------------------------------------------------
export { MODALIDADES, type Modalidad } from "@/models/calculator.types"

// ---------------------------------------------------------------------------
// User-facing messages
// ---------------------------------------------------------------------------
export const MENSAJES_VALIDACION = {
  CURP_REQUERIDO: "Complete el CURP para calcular las modalidades disponibles",
  CURP_INVALIDO: "CURP inválido - No se pudo extraer la fecha de nacimiento",
  SALDO_REQUERIDO: "Ingrese el Saldo AFORE para calcular las modalidades disponibles",
  EDAD_MINIMA_RECHAZO: "PROSPECTO NO VALIDO PARA ESTE PRODUCTO, Edad minima de contratacion 58 años 6 meses",
  NECESITA_PRESTAMO: "NECESITA PRESTAMO FINANCIERO: ",
} as const

// ---------------------------------------------------------------------------
// Dynamic message templates
// ---------------------------------------------------------------------------
export const crearMensajeEdadMaxima = (edadAnios: number): string =>
  `Edad: ${edadAnios} años - SOLO APLICA PARA REACTIVA TRADICIONAL. Para Reactiva Financiado 100 solo son viables menores de 68 años.`

export const crearDescripcionReactivaTradicional = (edadAnios: number): string =>
  `Única opción disponible - Edad: ${edadAnios} años (>68 años)`

export const crearDescripcionFinanciado100 = (totalDisponible: number): string =>
  `✅ Suficiente - Total disponible: $${totalDisponible.toLocaleString('es-MX')}`

export const crearDescripcionFinanciado1 = (faltante: number): string =>
  `⚠️ Insuficiente - Falta: $${faltante.toLocaleString('es-MX')}`

// ---------------------------------------------------------------------------
// Result messages
// ---------------------------------------------------------------------------
export const MENSAJES_FINANCIAMIENTO: Record<TipoFinanciamiento, string> = {
  [TIPO_FINANCIAMIENTO.REACTIVA_TRADICIONAL]:
    "El cliente está obligado a pagar su inscripción y meses de contratación, solo GRUPO A VIVIR financiará la GESTIÓN.",
  [TIPO_FINANCIAMIENTO.REACTIVA_FINANCIADO_100]:
    "GRUPO A VIVIR financiará el 100% de la inscripción, pagos mensuales y la gestión.",
  [TIPO_FINANCIAMIENTO.FINANCIADO_100]:
    "El cliente tiene capacidad financiera para cubrir los costos.",
  [TIPO_FINANCIAMIENTO.FINANCIADO_1]:
    "El cliente requiere financiamiento adicional.",
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
export const ROUTES = {
  COTIZACION: "/calculadora/cotizacion",
} as const
