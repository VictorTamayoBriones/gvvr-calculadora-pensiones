import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react"
import type {
  GeneralDataForm,
  StoredGeneralData,
  CalculatorContextType,
} from "@/models"

// Re-export types for convenience
export type { GeneralDataForm, CalculatorContextType } from "@/models"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const STORAGE_KEY = "calculator:generalData" as const
const STORAGE_VERSION = "v1" as const

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
const initialGeneralData: GeneralDataForm = {
  nombreAsesor: "",
  nombreCliente: "",
  nss: "",
  curp: "",
  semanasCotizadas: "",
  fechaBaja: "",
  saldoAfore: "",
  fechaInicioContrato: "",
}

// ---------------------------------------------------------------------------
// Storage utilities
// ---------------------------------------------------------------------------
function loadFromStorage(): GeneralDataForm {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (!saved) return initialGeneralData

    const parsed: StoredGeneralData = JSON.parse(saved)

    // Version validation
    if (parsed.version !== STORAGE_VERSION) {
      console.warn("Storage version mismatch, clearing data")
      sessionStorage.removeItem(STORAGE_KEY)
      return initialGeneralData
    }

    // Data structure validation
    if (!parsed.data || typeof parsed.data !== "object") {
      throw new Error("Invalid data structure")
    }

    return { ...initialGeneralData, ...parsed.data }
  } catch (error) {
    console.error("Failed to load calculator data from storage:", error)
    sessionStorage.removeItem(STORAGE_KEY)
    return initialGeneralData
  }
}

function saveToStorage(data: GeneralDataForm): void {
  try {
    const toStore: StoredGeneralData = {
      version: STORAGE_VERSION,
      data,
      timestamp: Date.now(),
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  } catch (error) {
    console.error("Failed to save calculator data to storage:", error)
  }
}

function clearStorage(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear calculator data from storage:", error)
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const CalculatorContext = createContext<CalculatorContextType | undefined>(
  undefined
)

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [generalData, setGeneralDataState] = useState<GeneralDataForm>(
    loadFromStorage
  )

  // Derived state: check if any data exists
  const isDataPersisted = useMemo(
    () => Object.values(generalData).some((value) => value !== ""),
    [generalData]
  )

  // Sync to storage on data change
  useEffect(() => {
    if (isDataPersisted) {
      saveToStorage(generalData)
    }
  }, [generalData, isDataPersisted])

  const setGeneralData = useCallback((data: GeneralDataForm) => {
    setGeneralDataState(data)
  }, [])

  const updateGeneralData = useCallback(
    (data: Partial<GeneralDataForm>) => {
      setGeneralDataState((prev) => ({ ...prev, ...data }))
    },
    []
  )

  const clearData = useCallback(() => {
    setGeneralDataState(initialGeneralData)
    clearStorage()
  }, [])

  const contextValue = useMemo(
    () => ({
      generalData,
      setGeneralData,
      updateGeneralData,
      clearData,
      isDataPersisted,
    }),
    [generalData, setGeneralData, updateGeneralData, clearData, isDataPersisted]
  )

  return (
    <CalculatorContext.Provider value={contextValue}>
      {children}
    </CalculatorContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useCalculator() {
  const context = useContext(CalculatorContext)
  if (context === undefined) {
    throw new Error("useCalculator must be used within a CalculatorProvider")
  }
  return context
}
