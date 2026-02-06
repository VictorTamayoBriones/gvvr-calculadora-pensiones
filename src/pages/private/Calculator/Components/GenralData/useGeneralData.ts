import { useState, useMemo, useCallback, useEffect, type ChangeEvent, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { useCalculator } from "@/contexts/CalculatorContext"
import { getAgeInMonthsFromCURP, extractBirthdateFromCURP } from "@/helpers/extractBirthdateFromCURP"
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
  CURP_LENGTH,
  SALDO_MINIMO_PARA_CALCULO,
  MESES_POR_ANIO,
  MODALIDADES,
  MENSAJES_VALIDACION,
  crearMensajeEdadMaxima,
  crearDescripcionReactivaTradicional,
  crearDescripcionFinanciado100,
  crearDescripcionFinanciado1,
  type TipoFinanciamiento,
} from "./constants"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ResultadosFinancieros {
  saldoAfore: number
  prestamoSugerido: number
  totalDisponible: number
  montoMinimo: number
  esSuficiente: boolean
  faltante: number
  sobrante: number
  tipoFinanciamiento: TipoFinanciamiento
  necesitaPrestamo: boolean
  etiquetaPrestamo: string
  mensaje: string
}

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
  const resultados = useMemo<ResultadosFinancieros>(() => {
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
      saldo < VALOR_REFERENCIA && generalData.modalidad === MODALIDADES.REACTIVA_FINANCIADO_100
        ? MENSAJES_VALIDACION.NECESITA_PRESTAMO
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
    if (!curp || curp.length !== CURP_LENGTH) {
      return {
        opciones: [] as Modalidad[],
        modalidadSugerida: null,
        mensajeEdad: "",
        tieneRestriccion: false,
        requiereDatos: true,
        mensajeRequerimiento: MENSAJES_VALIDACION.CURP_REQUERIDO,
      }
    }

    const edadMeses = getAgeInMonthsFromCURP(curp)

    if (!edadMeses) {
      return {
        opciones: [] as Modalidad[],
        modalidadSugerida: null,
        mensajeEdad: MENSAJES_VALIDACION.CURP_INVALIDO,
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
        mensajeEdad: MENSAJES_VALIDACION.EDAD_MINIMA_RECHAZO,
        tieneRestriccion: true,
        esRechazo: true,
      }
    }

    // Validar que haya saldo AFORE ingresado
    if (saldo === SALDO_MINIMO_PARA_CALCULO) {
      return {
        opciones: [] as Modalidad[],
        modalidadSugerida: null,
        mensajeEdad: "",
        tieneRestriccion: false,
        requiereDatos: true,
        mensajeRequerimiento: MENSAJES_VALIDACION.SALDO_REQUERIDO,
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
      const edadAnios = Math.floor(edadMeses / MESES_POR_ANIO)
      return {
        opciones: [MODALIDADES.REACTIVA_TRADICIONAL as Modalidad],
        modalidadSugerida: MODALIDADES.REACTIVA_TRADICIONAL as Modalidad,
        mensajeEdad: crearMensajeEdadMaxima(edadAnios),
        tieneRestriccion: true,
        esRechazo: false,
        descripcionOpciones: {
          [MODALIDADES.REACTIVA_TRADICIONAL]: crearDescripcionReactivaTradicional(edadAnios),
        },
      }
    }

    // Cliente entre 58.5 y 68 años: Determinar según capacidad financiera
    const esSuficiente = totalDisponible >= VALOR_REFERENCIA

    if (esSuficiente) {
      // Tiene fondos suficientes: FINANCIADO 100
      return {
        opciones: [MODALIDADES.FINANCIADO_100 as Modalidad],
        modalidadSugerida: MODALIDADES.FINANCIADO_100 as Modalidad,
        mensajeEdad: "",
        tieneRestriccion: false,
        esRechazo: false,
        descripcionOpciones: {
          [MODALIDADES.FINANCIADO_100]: crearDescripcionFinanciado100(totalDisponible),
        },
      }
    } else {
      // Fondos insuficientes: FINANCIADO 1
      const faltante = VALOR_REFERENCIA - totalDisponible
      return {
        opciones: [MODALIDADES.FINANCIADO_1 as Modalidad],
        modalidadSugerida: MODALIDADES.FINANCIADO_1 as Modalidad,
        mensajeEdad: "",
        tieneRestriccion: false,
        esRechazo: false,
        esInsuficiente: true,
        descripcionOpciones: {
          [MODALIDADES.FINANCIADO_1]: crearDescripcionFinanciado1(faltante),
        },
      }
    }
  }, [generalData.curp, generalData.saldoAfore])

  // --- auto-calculate edad and fechaNacimiento from CURP -----------------
  useEffect(() => {
    const curp = generalData.curp.trim()

    // Si no hay CURP válido, limpiar campos calculados
    if (!curp || curp.length !== CURP_LENGTH) {
      if (generalData.fechaNacimiento || generalData.edad) {
        setGeneralData({ ...generalData, fechaNacimiento: "", edad: "" })
      }
      return
    }

    // Extraer fecha de nacimiento del CURP
    const fechaNacimiento = extractBirthdateFromCURP(curp)

    if (!fechaNacimiento) {
      // CURP inválido, limpiar campos
      if (generalData.fechaNacimiento || generalData.edad) {
        setGeneralData({ ...generalData, fechaNacimiento: "", edad: "" })
      }
      return
    }

    // Formatear fecha de nacimiento a formato ISO (YYYY-MM-DD)
    const fechaNacimientoISO = fechaNacimiento.toISOString().split('T')[0]

    // Calcular edad en años
    const hoy = new Date()
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
    const mes = hoy.getMonth() - fechaNacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--
    }

    // Actualizar solo si los valores han cambiado
    if (generalData.fechaNacimiento !== fechaNacimientoISO || generalData.edad !== String(edad)) {
      setGeneralData({
        ...generalData,
        fechaNacimiento: fechaNacimientoISO,
        edad: String(edad)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generalData.curp])

  // --- auto-calculate sinVigenciaDerechos from fechaBaja -----------------
  useEffect(() => {
    const fechaBaja = generalData.fechaBaja.trim()

    // Si no hay fecha de baja válida, limpiar campo calculado
    if (!fechaBaja) {
      if (generalData.sinVigenciaDerechos) {
        setGeneralData({ ...generalData, sinVigenciaDerechos: "" })
      }
      return
    }

    try {
      // Calcular sin vigencia de derechos: fecha_baja + 5 años
      const baja = new Date(fechaBaja)
      const sinVigencia = new Date(baja)
      sinVigencia.setFullYear(sinVigencia.getFullYear() + 5)
      const sinVigenciaISO = sinVigencia.toISOString().split('T')[0]

      // Actualizar solo si el valor ha cambiado
      if (generalData.sinVigenciaDerechos !== sinVigenciaISO) {
        setGeneralData({
          ...generalData,
          sinVigenciaDerechos: sinVigenciaISO
        })
      }
    } catch {
      // Fecha inválida, limpiar campo
      if (generalData.sinVigenciaDerechos) {
        setGeneralData({ ...generalData, sinVigenciaDerechos: "" })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generalData.fechaBaja])

  // --- auto-calculate leyAplicable from fechaNacimiento, semanas, fechaBaja -----------------
  useEffect(() => {
    const fechaNacimiento = generalData.fechaNacimiento.trim()
    const semanas = Number(generalData.semanasCotizadas) || 0
    const fechaBaja = generalData.fechaBaja.trim()

    // Si faltan datos esenciales, limpiar campo calculado
    if (!fechaNacimiento || !semanas || !fechaBaja) {
      if (generalData.leyAplicable) {
        setGeneralData({ ...generalData, leyAplicable: "" })
      }
      return
    }

    try {
      // Calcular fecha aproximada de primera cotización
      // fecha_primera_cotizacion ≈ fecha_baja - (semanas_cotizadas / 52 años)
      const baja = new Date(fechaBaja)
      const añosCotizados = semanas / 52
      const fechaPrimeraCotizacionAprox = new Date(baja)
      fechaPrimeraCotizacionAprox.setFullYear(
        fechaPrimeraCotizacionAprox.getFullYear() - Math.floor(añosCotizados)
      )

      // Fecha límite para LEY 73: 1 de julio de 1997
      const fechaLimite = new Date('1997-07-01')

      // Determinar ley aplicable
      let leyCalculada: "LEY_73" | "LEY_97" =
        fechaPrimeraCotizacionAprox < fechaLimite ? "LEY_73" : "LEY_97"

      // Actualizar solo si el valor ha cambiado
      if (generalData.leyAplicable !== leyCalculada) {
        setGeneralData({
          ...generalData,
          leyAplicable: leyCalculada
        })
      }
    } catch {
      // Error en cálculo, limpiar campo
      if (generalData.leyAplicable) {
        setGeneralData({ ...generalData, leyAplicable: "" })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generalData.fechaNacimiento, generalData.semanasCotizadas, generalData.fechaBaja])

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

  // --- auto-calculate fechaInicioContrato from fechaFirmaContrato -----------------
  useEffect(() => {
    const fechaFirma = generalData.fechaFirmaContrato.trim()

    // Si no hay fecha de firma válida, limpiar campo calculado
    if (!fechaFirma) {
      if (generalData.fechaInicioContrato) {
        setGeneralData({ ...generalData, fechaInicioContrato: "" })
      }
      return
    }

    try {
      const firma = new Date(fechaFirma)
      const dia = firma.getDate()

      let fechaInicio: Date

      if (dia <= 15) {
        // Alta retroactiva al 1ro del mes corriente
        fechaInicio = new Date(firma.getFullYear(), firma.getMonth(), 1)
      } else {
        // Alta al 1ro del mes siguiente
        fechaInicio = new Date(firma.getFullYear(), firma.getMonth() + 1, 1)
      }

      const fechaInicioISO = fechaInicio.toISOString().split('T')[0]

      // Actualizar solo si el valor ha cambiado
      if (generalData.fechaInicioContrato !== fechaInicioISO) {
        setGeneralData({
          ...generalData,
          fechaInicioContrato: fechaInicioISO
        })
      }
    } catch {
      // Fecha inválida, limpiar campo
      if (generalData.fechaInicioContrato) {
        setGeneralData({ ...generalData, fechaInicioContrato: "" })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generalData.fechaFirmaContrato])

  // --- auto-calculate fechaFinContrato and semanasAlFinal from fechaInicioContrato and totalMeses -----------------
  useEffect(() => {
    const fechaInicio = generalData.fechaInicioContrato.trim()
    const totalMeses = Number(generalData.totalMeses) || 0

    // Si faltan datos esenciales, limpiar campos calculados
    if (!fechaInicio || !totalMeses) {
      if (generalData.fechaFinContrato || generalData.semanasAlFinal) {
        setGeneralData({
          ...generalData,
          fechaFinContrato: "",
          semanasAlFinal: ""
        })
      }
      return
    }

    try {
      // Calcular fecha de fin: fecha_inicio + total_meses
      const inicio = new Date(fechaInicio)
      const fin = new Date(inicio)
      fin.setMonth(fin.getMonth() + totalMeses)
      fin.setDate(1) // Asegurar que sea día 1
      const fechaFinISO = fin.toISOString().split('T')[0]

      // Calcular semanas al final: semanas_iniciales + (total_meses × 4)
      const semanasIniciales = Number(generalData.semanasCotizadas) || 0
      const semanasFinales = semanasIniciales + (totalMeses * 4)

      // Actualizar solo si los valores han cambiado
      if (generalData.fechaFinContrato !== fechaFinISO ||
          generalData.semanasAlFinal !== String(semanasFinales)) {
        setGeneralData({
          ...generalData,
          fechaFinContrato: fechaFinISO,
          semanasAlFinal: String(semanasFinales)
        })
      }
    } catch {
      // Error en cálculo, limpiar campos
      if (generalData.fechaFinContrato || generalData.semanasAlFinal) {
        setGeneralData({
          ...generalData,
          fechaFinContrato: "",
          semanasAlFinal: ""
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generalData.fechaInicioContrato, generalData.totalMeses, generalData.semanasCotizadas])

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
