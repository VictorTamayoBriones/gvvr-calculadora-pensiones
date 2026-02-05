// ---------------------------------------------------------------------------
// Form Data Types
// ---------------------------------------------------------------------------
export type Modalidad =
  | "FINANCIADO 1"
  | "FINANCIADO 100"
  | "REACTIVA TRADICIONAL"
  | "REACTIVA FINANCIADO 100"

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
}

// ---------------------------------------------------------------------------
// Storage Types
// ---------------------------------------------------------------------------
export interface StoredData<T = unknown> {
  version: string
  data: T
  timestamp: number
}

export type StoredGeneralData = StoredData<GeneralDataForm>

// ---------------------------------------------------------------------------
// Context Types
// ---------------------------------------------------------------------------
export interface CalculatorContextType {
  generalData: GeneralDataForm
  setGeneralData: (data: GeneralDataForm) => void
  updateGeneralData: (data: Partial<GeneralDataForm>) => void
  clearData: () => void
  isDataPersisted: boolean
}
