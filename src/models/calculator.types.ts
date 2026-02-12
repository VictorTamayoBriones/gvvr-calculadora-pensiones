// ---------------------------------------------------------------------------
// Modalidad types - Domain types should not depend on UI components
// ---------------------------------------------------------------------------
/** Constantes de modalidades de financiamiento disponibles en el sistema. */
export const MODALIDADES = {
  FINANCIADO_1: "FINANCIADO 1",
  FINANCIADO_100: "FINANCIADO 100",
  REACTIVA_TRADICIONAL: "REACTIVA TRADICIONAL",
  REACTIVA_FINANCIADO_100: "REACTIVA FINANCIADO 100",
} as const

/** Tipo unión derivado de las modalidades de financiamiento disponibles. */
export type Modalidad = typeof MODALIDADES[keyof typeof MODALIDADES]

/**
 * Determina si una modalidad utiliza el saldo AFORE en el cálculo del presupuesto.
 *
 * @param modalidad - La modalidad de financiamiento a evaluar
 * @returns true si la modalidad usa AFORE (REACTIVA TRADICIONAL o FINANCIADO 1), false en caso contrario
 *
 * @remarks
 * Solo las modalidades REACTIVA TRADICIONAL y FINANCIADO 1 consideran el saldo AFORE
 * en el cálculo del monto total a invertir. Las modalidades FINANCIADO 100 y
 * REACTIVA FINANCIADO 100 NO utilizan el saldo AFORE.
 */
export function usaAforeEnModalidad(modalidad: Modalidad): boolean {
  return modalidad === MODALIDADES.FINANCIADO_1 ||
         modalidad === MODALIDADES.REACTIVA_TRADICIONAL
}

// ---------------------------------------------------------------------------
// Form Data Types
// ---------------------------------------------------------------------------

/** Estructura del formulario de datos generales de la calculadora de pensiones. */
export interface GeneralDataForm {
  nombreAsesor: string
  nombreCliente: string
  nss: string
  curp: string
  semanasCotizadas: string
  fechaBaja: string
  saldoAfore: string
  fechaInicioContrato: string
  modalidad: Modalidad
  fechaNacimiento: string
  edad: string
  leyAplicable: "LEY_73" | "LEY_97" | ""
  sinVigenciaDerechos: string
  fechaFirmaContrato: string
  fechaFinContrato: string
  totalMeses: string
  semanasAlFinal: string
  prestamoFinanciero: string
  montoTotalInvertir: string
}

// ---------------------------------------------------------------------------
// Storage Types
// ---------------------------------------------------------------------------
/** Envoltorio genérico para datos persistidos en sessionStorage con versionamiento. */
export interface StoredData<T = unknown> {
  version: string
  data: T
  timestamp: number
}

/** Tipo concreto para los datos generales almacenados en sessionStorage. */
export type StoredGeneralData = StoredData<GeneralDataForm>

// ---------------------------------------------------------------------------
// Context Types
// ---------------------------------------------------------------------------
/** Contrato del contexto de React que expone el estado y acciones de la calculadora. */
export interface CalculatorContextType {
  generalData: GeneralDataForm
  setGeneralData: (data: GeneralDataForm) => void
  updateGeneralData: (data: Partial<GeneralDataForm>) => void
  clearData: () => void
  isDataPersisted: boolean
}
