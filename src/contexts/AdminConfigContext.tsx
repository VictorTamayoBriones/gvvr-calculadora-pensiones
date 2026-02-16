import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react"
import type { PrecioAnual, PrecioPrimerMes } from "@/utils/preciosAnuales"

// ---------------------------------------------------------------------------
// Config shape
// ---------------------------------------------------------------------------
export interface AdminConfig {
  // Validaciones
  minimoSemanasCotizadas: number
  minimoSaldoAfore: number
  edadMinimaMeses: number
  edadMaximaReactivaF100: number

  // Cálculos de préstamo
  factorPrestamoMultiplicador: number
  prestamoDescuento: number
  tasaRetencionPrestamo: number
  mesesRetencionPrestamo: number

  // Costos y gestoría
  costoGestoria: number
  gestoriaFija14Meses: number

  // Precios anuales
  preciosAnuales: PrecioAnual[]
  preciosPrimerMes: PrecioPrimerMes[]
  pagoMensualGestoriaRetoma: Record<number, number>

  // Tabla de pensiones
  tablaPensiones: Record<number, Record<number, number>>
}

// ---------------------------------------------------------------------------
// Defaults (current hardcoded values)
// ---------------------------------------------------------------------------
export const DEFAULT_CONFIG: AdminConfig = {
  minimoSemanasCotizadas: 430,
  minimoSaldoAfore: 15_000,
  edadMinimaMeses: 702,
  edadMaximaReactivaF100: 816,

  factorPrestamoMultiplicador: 9,
  prestamoDescuento: 10_000,
  tasaRetencionPrestamo: 0.30,
  mesesRetencionPrestamo: 60,

  costoGestoria: 18_000,
  gestoriaFija14Meses: 18_000,

  preciosAnuales: [
    { anio: 2023, precio: 2200 },
    { anio: 2024, precio: 2400 },
    { anio: 2025, precio: 2650 },
    { anio: 2026, precio: 3200 },
    { anio: 2027, precio: 3950 },
    { anio: 2028, precio: 4700 },
  ],
  preciosPrimerMes: [
    { fechaInicio: '11/16', fechaFin: '12/31', precio: 4650 },
    { fechaInicio: '09/16', fechaFin: '11/15', precio: 4400 },
    { fechaInicio: '07/16', fechaFin: '09/15', precio: 4150 },
    { fechaInicio: '05/16', fechaFin: '07/15', precio: 3900 },
    { fechaInicio: '03/16', fechaFin: '05/15', precio: 3700 },
    { fechaInicio: '01/01', fechaFin: '03/15', precio: 3500 },
  ],
  pagoMensualGestoriaRetoma: {
    2023: 2200,
    2024: 2400,
    2025: 2650,
    2026: 3200,
    2027: 3950,
    2028: 4700,
  },

  tablaPensiones: {
    2023: {
      59: 5252.25, 60: 5252.25, 61: 5602.40, 62: 5952.55,
      63: 6302.70, 64: 6652.85, 65: 7003.00, 66: 7003.00,
      67: 7003.00, 68: 7003.00, 69: 7003.00, 70: 7003.00,
      71: 7003.00, 72: 7003.00, 73: 7003.00, 74: 7003.00,
      75: 7003.00, 76: 7003.00, 77: 7003.00, 78: 7003.00,
      79: 7003.00, 80: 7003.00, 81: 7003.00, 82: 7003.00,
      83: 7003.00,
    },
    2024: Object.fromEntries(
      Array.from({ length: 25 }, (_, i) => [59 + i, 8400.00])
    ),
    2025: Object.fromEntries(
      Array.from({ length: 25 }, (_, i) => [59 + i, 9400.00])
    ),
    2026: Object.fromEntries(
      Array.from({ length: 25 }, (_, i) => [59 + i, 10100.00])
    ),
    2027: Object.fromEntries(
      Array.from({ length: 25 }, (_, i) => [59 + i, 10900.00])
    ),
  },
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------
const STORAGE_KEY = "admin:config" as const
const STORAGE_VERSION = "v1" as const

interface StoredAdminConfig {
  version: string
  data: Partial<AdminConfig>
  timestamp: number
}

function loadFromStorage(): Partial<AdminConfig> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return {}
    const parsed: StoredAdminConfig = JSON.parse(saved)
    if (parsed.version !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY)
      return {}
    }
    if (!parsed.data || typeof parsed.data !== "object") return {}
    return parsed.data
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return {}
  }
}

function saveToStorage(data: Partial<AdminConfig>): void {
  try {
    const toStore: StoredAdminConfig = {
      version: STORAGE_VERSION,
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  } catch (error) {
    console.error("Failed to save admin config:", error)
  }
}

// ---------------------------------------------------------------------------
// Standalone getter (for pure utility functions without React context)
// ---------------------------------------------------------------------------
export function getAdminConfig(): AdminConfig {
  const overrides = loadFromStorage()
  return { ...DEFAULT_CONFIG, ...overrides }
}

// ---------------------------------------------------------------------------
// Section keys for reset
// ---------------------------------------------------------------------------
export type ConfigSection =
  | "validaciones"
  | "calculosPrestamo"
  | "costosGestoria"
  | "preciosAnuales"
  | "preciosPrimerMes"
  | "tablaPensiones"

const SECTION_KEYS: Record<ConfigSection, (keyof AdminConfig)[]> = {
  validaciones: [
    "minimoSemanasCotizadas",
    "minimoSaldoAfore",
    "edadMinimaMeses",
    "edadMaximaReactivaF100",
  ],
  calculosPrestamo: [
    "factorPrestamoMultiplicador",
    "prestamoDescuento",
    "tasaRetencionPrestamo",
    "mesesRetencionPrestamo",
  ],
  costosGestoria: ["costoGestoria", "gestoriaFija14Meses"],
  preciosAnuales: ["preciosAnuales", "pagoMensualGestoriaRetoma"],
  preciosPrimerMes: ["preciosPrimerMes"],
  tablaPensiones: ["tablaPensiones"],
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface AdminConfigContextType {
  config: AdminConfig
  updateConfig: (partial: Partial<AdminConfig>) => void
  resetConfig: () => void
  resetSection: (section: ConfigSection) => void
}

const AdminConfigContext = createContext<AdminConfigContextType | undefined>(
  undefined
)

export function AdminConfigProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Partial<AdminConfig>>(loadFromStorage)

  const config = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...overrides }),
    [overrides]
  )

  const updateConfig = useCallback((partial: Partial<AdminConfig>) => {
    setOverrides((prev) => {
      const next = { ...prev, ...partial }
      saveToStorage(next)
      return next
    })
  }, [])

  const resetConfig = useCallback(() => {
    setOverrides({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const resetSection = useCallback((section: ConfigSection) => {
    setOverrides((prev) => {
      const next = { ...prev }
      for (const key of SECTION_KEYS[section]) {
        delete next[key]
      }
      saveToStorage(next)
      return next
    })
  }, [])

  const contextValue = useMemo(
    () => ({ config, updateConfig, resetConfig, resetSection }),
    [config, updateConfig, resetConfig, resetSection]
  )

  return (
    <AdminConfigContext.Provider value={contextValue}>
      {children}
    </AdminConfigContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAdminConfig() {
  const context = useContext(AdminConfigContext)
  if (context === undefined) {
    throw new Error("useAdminConfig must be used within an AdminConfigProvider")
  }
  return context
}
