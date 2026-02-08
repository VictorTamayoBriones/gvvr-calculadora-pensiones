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
  onChange: (field: string, value: string) => void
  onValidationReady?: (validate: () => boolean) => void
}

// ---------------------------------------------------------------------------
// Hook: Maneja la lógica de Modalidad
// ---------------------------------------------------------------------------
export function useModalidad({
  curp,
  saldoAfore,
  modalidad,
  onChange,
  onValidationReady,
}: UseModalidadProps) {
  const [error, setError] = useState<string>("")
  const [touched, setTouched] = useState<boolean>(false)

  // Calcular modalidades disponibles basado en CURP y saldo
  const modalidadesDisponibles = useMemo(
    () => calcularModalidadesDisponibles(curp, Number(saldoAfore) || 0),
    [curp, saldoAfore]
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

  // Auto-actualizar modalidad cuando cambian las opciones disponibles
  useEffect(() => {
    if (!modalidadesDisponibles.modalidadSugerida) return

    const esModalidadValida = modalidadesDisponibles.opciones.includes(modalidad)

    if (!esModalidadValida && modalidadesDisponibles.modalidadSugerida !== modalidad) {
      onChange("modalidad", modalidadesDisponibles.modalidadSugerida)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalidadesDisponibles.modalidadSugerida, modalidadesDisponibles.opciones.length])

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
    error,
    touched,
    handleModalidadChange,
    validate,
  }
}
