import { useMemo, useCallback, useState, useEffect } from "react"
import type { Modalidad } from "@/models"
import { calcularModalidadesDisponibles } from "../utils/modalidadCalculations"
import { VALIDATORS } from "../validators"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface UseModalidadProps {
  curp: string
  saldoAfore: string
  modalidad: Modalidad
  pensionMensual: number
  costoTotal: number
  onChange: (field: string, value: string) => void
  onValidationReady?: (validate: () => boolean) => void
}

/**
 * Gestiona la selección y validación de la modalidad de financiamiento.
 * Calcula modalidades disponibles según CURP y saldo AFORE, y expone validación al padre.
 */
export function useModalidad({
  curp,
  saldoAfore,
  modalidad,
  pensionMensual,
  costoTotal,
  onChange,
  onValidationReady,
}: UseModalidadProps) {
  const [error, setError] = useState<string>("")
  const [touched, setTouched] = useState<boolean>(false)

  // Calcular modalidades disponibles basado en CURP y saldo
  const modalidadesDisponibles = useMemo(
    () => calcularModalidadesDisponibles(curp, Number(saldoAfore) || 0, pensionMensual, costoTotal),
    [curp, saldoAfore, pensionMensual, costoTotal]
  )

  // Handler para cambio de modalidad
  const handleModalidadChange = useCallback(
    (value: string) => {
      onChange("modalidad", value)
      setTouched(true)

      // Validar
      const msg = VALIDATORS.modalidad(value)
      setError(msg)
    },
    [onChange]
  )

  // Expose whether current modalidad is valid so the parent can act explicitly
  const esModalidadValida = modalidadesDisponibles.opciones.includes(modalidad)
  const modalidadSugerida = modalidadesDisponibles.modalidadSugerida

  // Validación
  const validate = useCallback((): boolean => {
    const msg = VALIDATORS.modalidad(modalidad)
    setError(msg)
    setTouched(true)
    return !msg
  }, [modalidad])

  // Exponer validación al padre
  useEffect(() => {
    if (onValidationReady) {
      onValidationReady(validate)
    }
  }, [onValidationReady, validate])

  return {
    modalidad,
    modalidadesDisponibles,
    modalidadSugerida,
    esModalidadValida,
    error,
    touched,
    handleModalidadChange,
    validate,
  }
}
