import React, { useCallback, useRef } from "react"
import { useNavigate } from "react-router"
import { useCalculator } from "@/contexts/CalculatorContext"
import type { GeneralDataForm } from "@/models"
import { ROUTES } from "./constants"
import { usePensionYCostoTotal } from "./hooks/usePensionYCostoTotal"

// ---------------------------------------------------------------------------
// Hook Principal - Orquestador con Inversión de Control
// ---------------------------------------------------------------------------
export function useGeneralData() {
  const navigate = useNavigate()
  const { generalData, updateGeneralData } = useCalculator()

  // Calcular valores dinámicos de pensión y costo total
  const { pensionMensual, costoTotal } = usePensionYCostoTotal(
    generalData.curp,
    generalData.fechaNacimiento,
    generalData.fechaInicioContrato,
    generalData.fechaFinContrato
  )

  // Referencias para funciones de validación de cada sección
  const datosPersonalesValidateRef = useRef<(() => boolean) | null>(null)
  const modalidadValidateRef = useRef<(() => boolean) | null>(null)

  // --- Callbacks de registro de validación --------------------------------
  const registerDatosPersonalesValidation = useCallback((validate: () => boolean) => {
    datosPersonalesValidateRef.current = validate
  }, [])

  const registerModalidadValidation = useCallback((validate: () => boolean) => {
    modalidadValidateRef.current = validate
  }, [])

  // --- Handler de cambio de campo (Flujo unidireccional) ------------------
  const handleFieldChange = useCallback(
    (field: string, value: any) => {
      updateGeneralData({ [field]: value })
    },
    [updateGeneralData]
  )

  // --- Handler de actualizaciones automáticas -----------------------------
  const handleAutoUpdate = useCallback(
    (updates: Partial<GeneralDataForm>) => {
      updateGeneralData(updates)
    },
    [updateGeneralData]
  )

  // --- Handler de submit con validación orquestada -----------------------
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      // Validar todas las secciones
      const datosPersonalesValid = datosPersonalesValidateRef.current?.() ?? true
      const modalidadValid = modalidadValidateRef.current?.() ?? true

      const isValid = datosPersonalesValid && modalidadValid

      if (!isValid) return

      // Navegar al siguiente paso
      navigate(ROUTES.COTIZACION)
    },
    [navigate]
  )

  return {
    generalData,
    pensionMensual,
    costoTotal,
    handleFieldChange,
    handleAutoUpdate,
    handleSubmit,
    registerDatosPersonalesValidation,
    registerModalidadValidation,
  }
}
