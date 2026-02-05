import { useState, useMemo, useCallback, type ChangeEvent, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { useCalculator } from "@/contexts/CalculatorContext"
import { getAgeInMonthsFromCURP } from "@/helpers/extractBirthdateFromCURP"
import type { Modalidad } from "@/models"
import {
  VALIDATORS,
  createInitialErrors,
  createInitialTouched,
  type FormFields,
  type FormErrors,
  type FormTouched,
} from "./validators"
import {
  VALOR_REFERENCIA,
  FACTOR_PENSION,
  FACTOR_PRESTAMO_MULTIPLICADOR,
  PRESTAMO_DESCUENTO,
  TIPO_FINANCIAMIENTO,
  MENSAJES_FINANCIAMIENTO,
  ROUTES,
  EDAD_MINIMA_MESES,
  EDAD_MAXIMA_REACTIVA_F100,
} from "./constants"

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useGeneralData() {
  const navigate = useNavigate()
  const { generalData, setGeneralData } = useCalculator()

  const [errors, setErrors] = useState<FormErrors>(createInitialErrors())
  const [touched, setTouched] = useState<FormTouched>(createInitialTouched())

  // --- handlers ------------------------------------------------------------
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: FormFields; value: string }
    setGeneralData({ ...generalData, [name]: value })
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: VALIDATORS[name](value) }))
    }
  }, [generalData, touched, setGeneralData])

  const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: FormFields; value: string }
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: VALIDATORS[name](value) }))
  }, [])

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate all fields
    const newErrors = {} as FormErrors
    let hasError = false
    for (const key of Object.keys(VALIDATORS) as FormFields[]) {
      const msg = VALIDATORS[key](generalData[key])
      newErrors[key] = msg
      if (msg) hasError = true
    }

    setErrors(newErrors)
    setTouched(
      Object.fromEntries(Object.keys(VALIDATORS).map((k) => [k, true])) as FormTouched
    )

    if (hasError) return

    // Navigate to next step (Cotización)
    navigate(ROUTES.COTIZACION)
  }, [generalData, navigate])

  // --- derived calculations (business logic from the doc) -----------------
  const resultados = useMemo(() => {
    const saldo = Number(generalData.saldoAfore) || 0

    const prestamo =
      saldo < VALOR_REFERENCIA
        ? FACTOR_PENSION * FACTOR_PRESTAMO_MULTIPLICADOR - PRESTAMO_DESCUENTO
        : 0

    const total = saldo + prestamo
    const tipoFinanciamiento =
      total < VALOR_REFERENCIA
        ? TIPO_FINANCIAMIENTO.FINANCIADO_1
        : TIPO_FINANCIAMIENTO.FINANCIADO_100

    const necesitaPrestamo =
      saldo < VALOR_REFERENCIA && tipoFinanciamiento === TIPO_FINANCIAMIENTO.FINANCIADO_1

    return {
      prestamo,
      tipoFinanciamiento,
      necesitaPrestamo,
      mensaje: MENSAJES_FINANCIAMIENTO[tipoFinanciamiento] ?? "",
    }
  }, [generalData.saldoAfore])

  // --- modalidad calculation (age-based restrictions) ---------------------
  const modalidadesDisponibles = useMemo(() => {
    const curp = generalData.curp.trim()

    // Si no hay CURP válido, devolver modalidad por defecto
    if (!curp || curp.length !== 18) {
      return {
        opciones: ["FINANCIADO 100" as Modalidad],
        modalidadSugerida: "FINANCIADO 100" as Modalidad,
        mensajeEdad: "",
        tieneRestriccion: false,
      }
    }

    const edadMeses = getAgeInMonthsFromCURP(curp)

    if (!edadMeses) {
      return {
        opciones: ["FINANCIADO 100" as Modalidad],
        modalidadSugerida: "FINANCIADO 100" as Modalidad,
        mensajeEdad: "",
        tieneRestriccion: false,
      }
    }

    // Validar edad mínima
    if (edadMeses < EDAD_MINIMA_MESES) {
      return {
        opciones: [] as Modalidad[],
        modalidadSugerida: null,
        mensajeEdad: "PROSPECTO NO VALIDO PARA ESTE PRODUCTO, Edad minima de contratacion 58 años 6 meses",
        tieneRestriccion: true,
        esRechazo: true,
      }
    }

    const saldo = Number(generalData.saldoAfore) || 0
    const prestamo =
      saldo < VALOR_REFERENCIA
        ? FACTOR_PENSION * FACTOR_PRESTAMO_MULTIPLICADOR - PRESTAMO_DESCUENTO
        : 0
    const totalDisponible = saldo + prestamo

    // Cliente mayor de 68 años: Solo REACTIVA
    if (edadMeses > EDAD_MAXIMA_REACTIVA_F100) {
      return {
        opciones: ["REACTIVA FINANCIADO 100" as Modalidad, "REACTIVA TRADICIONAL" as Modalidad],
        modalidadSugerida: "REACTIVA FINANCIADO 100" as Modalidad,
        mensajeEdad: "SOLO APLICA PARA REACTIVA TRADICIONAL, Para Reactiva financiado 100 solo son viables menores de 68 años",
        tieneRestriccion: true,
        esRechazo: false,
      }
    }

    // Cliente entre 58.5 y 68 años: FINANCIADO 1 o FINANCIADO 100
    const modalidadSugerida = totalDisponible < VALOR_REFERENCIA
      ? "FINANCIADO 1" as Modalidad
      : "FINANCIADO 100" as Modalidad

    return {
      opciones: [modalidadSugerida],
      modalidadSugerida,
      mensajeEdad: "",
      tieneRestriccion: false,
      esRechazo: false,
    }
  }, [generalData.curp, generalData.saldoAfore])

  // --- modalidad change handler -------------------------------------------
  const handleModalidadChange = useCallback((value: string) => {
    const nuevaModalidad = value as Modalidad
    setGeneralData({ ...generalData, modalidad: nuevaModalidad })
  }, [generalData, setGeneralData])

  return {
    form: generalData,
    errors,
    touched,
    resultados,
    modalidadesDisponibles,
    handleChange,
    handleBlur,
    handleSubmit,
    handleModalidadChange,
  }
}
