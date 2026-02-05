import { useState, useMemo, useCallback, useEffect, type ChangeEvent, type FormEvent } from "react"
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

    // Calcular préstamo sugerido: Solo si el saldo es insuficiente
    const prestamoSugerido =
      saldo < VALOR_REFERENCIA
        ? Math.max(0, FACTOR_PENSION * FACTOR_PRESTAMO_MULTIPLICADOR - PRESTAMO_DESCUENTO)
        : 0

    // Total disponible con préstamo sugerido
    const totalDisponible = saldo + prestamoSugerido

    // Determinar si es suficiente
    const esSuficiente = totalDisponible >= VALOR_REFERENCIA

    // Calcular faltante o sobrante
    const diferencia = totalDisponible - VALOR_REFERENCIA
    const faltante = diferencia < 0 ? Math.abs(diferencia) : 0
    const sobrante = diferencia > 0 ? diferencia : 0

    // Determinar tipo de financiamiento basado en el préstamo sugerido
    const tipoFinanciamiento =
      totalDisponible < VALOR_REFERENCIA
        ? TIPO_FINANCIAMIENTO.FINANCIADO_1
        : TIPO_FINANCIAMIENTO.FINANCIADO_100

    // Determinar si necesita préstamo
    const necesitaPrestamo = prestamoSugerido > 0

    // Generar etiqueta si aplica (solo para REACTIVA FINANCIADO 100)
    const etiquetaPrestamo =
      saldo < VALOR_REFERENCIA && generalData.modalidad === "REACTIVA FINANCIADO 100"
        ? "NECESITA PRESTAMO FINANCIERO: "
        : ""

    return {
      saldoAfore: saldo,
      prestamoSugerido,
      totalDisponible,
      montoMinimo: VALOR_REFERENCIA,
      esSuficiente,
      faltante,
      sobrante,
      tipoFinanciamiento,
      necesitaPrestamo,
      etiquetaPrestamo,
      mensaje: MENSAJES_FINANCIAMIENTO[tipoFinanciamiento] ?? "",
    }
  }, [generalData.saldoAfore, generalData.modalidad])

  // --- modalidad calculation (age-based restrictions) ---------------------
  const modalidadesDisponibles = useMemo(() => {
    const curp = generalData.curp.trim()
    const saldo = Number(generalData.saldoAfore) || 0

    // Si no hay CURP válido, mostrar estado inicial
    if (!curp || curp.length !== 18) {
      return {
        opciones: [] as Modalidad[],
        modalidadSugerida: null,
        mensajeEdad: "",
        tieneRestriccion: false,
        requiereDatos: true,
        mensajeRequerimiento: "Complete el CURP para calcular las modalidades disponibles",
      }
    }

    const edadMeses = getAgeInMonthsFromCURP(curp)

    if (!edadMeses) {
      return {
        opciones: [] as Modalidad[],
        modalidadSugerida: null,
        mensajeEdad: "CURP inválido - No se pudo extraer la fecha de nacimiento",
        tieneRestriccion: false,
        requiereDatos: true,
        esError: true,
      }
    }

    // Validar edad mínima (< 58.5 años)
    if (edadMeses < EDAD_MINIMA_MESES) {
      return {
        opciones: [] as Modalidad[],
        modalidadSugerida: null,
        mensajeEdad: "PROSPECTO NO VALIDO PARA ESTE PRODUCTO, Edad minima de contratacion 58 años 6 meses",
        tieneRestriccion: true,
        esRechazo: true,
      }
    }

    // Validar que haya saldo AFORE ingresado
    if (saldo === 0) {
      return {
        opciones: [] as Modalidad[],
        modalidadSugerida: null,
        mensajeEdad: "",
        tieneRestriccion: false,
        requiereDatos: true,
        mensajeRequerimiento: "Ingrese el Saldo AFORE para calcular las modalidades disponibles",
      }
    }

    // Calcular préstamo y total disponible
    const prestamo =
      saldo < VALOR_REFERENCIA
        ? Math.max(0, FACTOR_PENSION * FACTOR_PRESTAMO_MULTIPLICADOR - PRESTAMO_DESCUENTO)
        : 0
    const totalDisponible = saldo + prestamo

    // Cliente mayor de 68 años: Solo REACTIVA TRADICIONAL
    if (edadMeses > EDAD_MAXIMA_REACTIVA_F100) {
      const edadAnios = Math.floor(edadMeses / 12)
      return {
        opciones: ["REACTIVA TRADICIONAL" as Modalidad],
        modalidadSugerida: "REACTIVA TRADICIONAL" as Modalidad,
        mensajeEdad: `Edad: ${edadAnios} años - SOLO APLICA PARA REACTIVA TRADICIONAL. Para Reactiva Financiado 100 solo son viables menores de 68 años.`,
        tieneRestriccion: true,
        esRechazo: false,
        descripcionOpciones: {
          "REACTIVA TRADICIONAL": `Única opción disponible - Edad: ${edadAnios} años (>68 años)`,
        },
      }
    }

    // Cliente entre 58.5 y 68 años: Determinar según capacidad financiera
    const esSuficiente = totalDisponible >= VALOR_REFERENCIA

    if (esSuficiente) {
      // Tiene fondos suficientes: FINANCIADO 100
      return {
        opciones: ["FINANCIADO 100" as Modalidad],
        modalidadSugerida: "FINANCIADO 100" as Modalidad,
        mensajeEdad: "",
        tieneRestriccion: false,
        esRechazo: false,
        descripcionOpciones: {
          "FINANCIADO 100": `✅ Suficiente - Total disponible: $${totalDisponible.toLocaleString('es-MX')}`,
        },
      }
    } else {
      // Fondos insuficientes: FINANCIADO 1
      const faltante = VALOR_REFERENCIA - totalDisponible
      return {
        opciones: ["FINANCIADO 1" as Modalidad],
        modalidadSugerida: "FINANCIADO 1" as Modalidad,
        mensajeEdad: "",
        tieneRestriccion: false,
        esRechazo: false,
        esInsuficiente: true,
        descripcionOpciones: {
          "FINANCIADO 1": `⚠️ Insuficiente - Falta: $${faltante.toLocaleString('es-MX')}`,
        },
      }
    }
  }, [generalData.curp, generalData.saldoAfore])

  // --- auto-update modalidad when options change -------------------------
  useEffect(() => {
    // Solo actualizar si hay una modalidad sugerida
    if (!modalidadesDisponibles.modalidadSugerida) return

    // Verificar si la modalidad actual es válida en las opciones disponibles
    const esModalidadValida = modalidadesDisponibles.opciones.includes(generalData.modalidad)

    // Si la modalidad actual no es válida, actualizar a la sugerida
    if (!esModalidadValida && modalidadesDisponibles.modalidadSugerida !== generalData.modalidad) {
      setGeneralData({ ...generalData, modalidad: modalidadesDisponibles.modalidadSugerida })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalidadesDisponibles.modalidadSugerida, modalidadesDisponibles.opciones.length])

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
