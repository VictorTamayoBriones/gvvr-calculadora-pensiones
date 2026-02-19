import { useEffect } from "react"
import type { GeneralDataForm } from "@/models"
import {
  extraerDatosNacimientoDesdeCURP,
  calcularSinVigenciaDerechos,
  calcularLeyAplicable,
  calcularFechaInicioContrato,
  calcularDatosFinContrato,
  calcularTotalMesesDesdeSemanas,
} from "../utils/dateCalculations"

// ---------------------------------------------------------------------------
// Generic hook: encapsulates the repeated auto-field pattern
// ---------------------------------------------------------------------------
/**
 * Hook genérico para campos auto-calculados.
 * Encapsula el patrón común de:
 * 1. Calcular un valor derivado
 * 2. Limpiar campos si el cálculo falla
 * 3. Actualizar solo si hay cambios
 *
 * Este hook usa un enfoque de dependencias explícitas donde el caller
 * controla exactamente qué cambios deben disparar el recálculo.
 *
 * Nota sobre exhaustive-deps: Los hooks que llaman a useAutoField pasan
 * solo las dependencias del cálculo (ej: [curp], [fechaBaja]), no el estado
 * completo. Esto es intencional para evitar loops infinitos y mantener el
 * comportamiento predecible. generalData y setGeneralData se consideran estables.
 *
 * @param generalData - Estado actual del formulario
 * @param setGeneralData - Función para actualizar el estado
 * @param compute - Función que calcula los valores derivados
 * @param fieldsToCheck - Campos a limpiar si compute() retorna null
 * @param deps - Array de dependencias para el useEffect (controlado por el caller)
 */
function useAutoField(
  generalData: GeneralDataForm,
  setGeneralData: (data: GeneralDataForm) => void,
  compute: () => Partial<GeneralDataForm> | null,
  fieldsToCheck: (keyof GeneralDataForm)[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps: any[]
) {
  useEffect(() => {
    const result = compute()

    if (result === null) {
      const needsClear = fieldsToCheck.some((f) => generalData[f])
      if (needsClear) {
        const cleared = Object.fromEntries(fieldsToCheck.map((f) => [f, ""]))
        setGeneralData({ ...generalData, ...cleared } as GeneralDataForm)
      }
      return
    }

    const hasChanged = Object.entries(result).some(
      ([k, v]) => generalData[k as keyof GeneralDataForm] !== v
    )
    if (hasChanged) {
      setGeneralData({ ...generalData, ...result })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Auto-calcula edad y fecha de nacimiento a partir del CURP.
 * Limpia los campos si el CURP es inválido o está vacío.
 */
export function useAutoCalcularEdadYFechaNacimiento(
  curp: string,
  generalData: GeneralDataForm,
  setGeneralData: (data: GeneralDataForm) => void
) {
  useAutoField(
    generalData,
    setGeneralData,
    () => {
      const datos = extraerDatosNacimientoDesdeCURP(curp)
      if (!datos) return null
      return { fechaNacimiento: datos.fechaNacimiento, edad: datos.edad }
    },
    ["fechaNacimiento", "edad"],
    [curp]
  )
}

/**
 * Auto-calcula la fecha de vencimiento de derechos a partir de la fecha de baja
 * y las semanas cotizadas, usando la fórmula: min(semanas/4 * 7, 1716) días.
 */
export function useAutoCalcularSinVigenciaDerechos(
  fechaBaja: string,
  semanasCotizadas: string,
  generalData: GeneralDataForm,
  setGeneralData: (data: GeneralDataForm) => void
) {
  useAutoField(
    generalData,
    setGeneralData,
    () => {
      const semanas = Number(semanasCotizadas) || 0
      const sinVigencia = calcularSinVigenciaDerechos(fechaBaja, semanas)
      if (sinVigencia === null) return null
      return { sinVigenciaDerechos: sinVigencia }
    },
    ["sinVigenciaDerechos"],
    [fechaBaja, semanasCotizadas]
  )
}

/**
 * Auto-calcula la ley aplicable (LEY_73 o LEY_97) según fecha de nacimiento,
 * semanas cotizadas y fecha de baja.
 */
export function useAutoCalcularLeyAplicable(
  fechaNacimiento: string,
  semanasCotizadas: string,
  fechaBaja: string,
  generalData: GeneralDataForm,
  setGeneralData: (data: GeneralDataForm) => void
) {
  useAutoField(
    generalData,
    setGeneralData,
    () => {
      const semanas = Number(semanasCotizadas) || 0
      const ley = calcularLeyAplicable(fechaNacimiento, semanas, fechaBaja)
      if (ley === null) return null
      return { leyAplicable: ley }
    },
    ["leyAplicable"],
    [fechaNacimiento, semanasCotizadas, fechaBaja]
  )
}

/**
 * Auto-calcula la fecha de inicio del contrato a partir de la fecha de firma.
 * La fecha de inicio siempre es el día 1 del mes siguiente a la firma.
 */
export function useAutoCalcularFechaInicioContrato(
  fechaFirmaContrato: string,
  generalData: GeneralDataForm,
  setGeneralData: (data: GeneralDataForm) => void
) {
  useAutoField(
    generalData,
    setGeneralData,
    () => {
      if (!fechaFirmaContrato) return {}
      const fechaInicio = calcularFechaInicioContrato(fechaFirmaContrato)
      if (fechaInicio === null) return null
      return { fechaInicioContrato: fechaInicio }
    },
    ["fechaInicioContrato"],
    [fechaFirmaContrato]
  )
}

/**
 * Auto-calcula el total de meses del contrato a partir de las semanas cotizadas
 * y la fecha de inicio del contrato.
 *
 * Regla C17 sección 6.1:
 * - Si semanas > 448 → resolución en 63 semanas (441 días)
 * - Si semanas ≤ 448 → resolución en (510 - semanas) × 7 días
 */
export function useAutoCalcularTotalMeses(
  semanasCotizadas: string,
  fechaInicioContrato: string,
  generalData: GeneralDataForm,
  setGeneralData: (data: GeneralDataForm) => void
) {
  useAutoField(
    generalData,
    setGeneralData,
    () => {
      const semanas = Number(semanasCotizadas) || 0
      const totalMeses = calcularTotalMesesDesdeSemanas(semanas, fechaInicioContrato)
      if (totalMeses === null) return null
      return { totalMeses: String(totalMeses) }
    },
    ["totalMeses"],
    [semanasCotizadas, fechaInicioContrato]
  )
}

/**
 * Auto-calcula la fecha de fin del contrato y las semanas cotizadas al final
 * a partir de la fecha de inicio, total de meses y semanas iniciales.
 */
export function useAutoCalcularDatosFinContrato(
  fechaInicioContrato: string,
  totalMeses: string,
  semanasCotizadas: string,
  generalData: GeneralDataForm,
  setGeneralData: (data: GeneralDataForm) => void
) {
  useAutoField(
    generalData,
    setGeneralData,
    () => {
      const meses = Number(totalMeses) || 0
      const semanasIniciales = Number(semanasCotizadas) || 0
      const datos = calcularDatosFinContrato(fechaInicioContrato, meses, semanasIniciales)
      if (datos === null) return null
      return { fechaFinContrato: datos.fechaFin, semanasAlFinal: String(datos.semanasFinales) }
    },
    ["fechaFinContrato", "semanasAlFinal"],
    [fechaInicioContrato, totalMeses, semanasCotizadas]
  )
}
