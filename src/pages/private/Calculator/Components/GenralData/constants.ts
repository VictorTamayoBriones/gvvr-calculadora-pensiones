// ---------------------------------------------------------------------------
// Business-logic constants
// ---------------------------------------------------------------------------
// TODO: In production, these values should come from a configuration API or sheet
export const VALOR_REFERENCIA = 80_000   // K25 – placeholder
export const FACTOR_PENSION   = 12_000   // F44 – placeholder

// ---------------------------------------------------------------------------
// Validation constants
// ---------------------------------------------------------------------------
export const MINIMO_SEMANAS_COTIZADAS = 430  // Minimum weeks required for eligibility
export const MINIMO_SALDO_AFORE = 15_000     // Minimum AFORE balance in MXN

// ---------------------------------------------------------------------------
// Age validation constants
// ---------------------------------------------------------------------------
export const EDAD_MINIMA_MESES = 702          // 58.5 years minimum age
export const EDAD_MAXIMA_REACTIVA_F100 = 816  // 68 years maximum for REACTIVA FINANCIADO 100

// ---------------------------------------------------------------------------
// Calculation constants
// ---------------------------------------------------------------------------
export const FACTOR_PRESTAMO_MULTIPLICADOR = 7.5
export const PRESTAMO_DESCUENTO = 10_000

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
