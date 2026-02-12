import { getAgeInMonthsFromCURP } from "@/helpers/extractBirthdateFromCURP"
import type { Modalidad } from "@/models"
import {
  MODALIDADES,
  VALOR_REFERENCIA,
  CURP_LENGTH,
  SALDO_MINIMO_PARA_CALCULO,
  EDAD_MINIMA_MESES,
  EDAD_MAXIMA_REACTIVA_F100,
  MESES_POR_ANIO,
  MENSAJES_VALIDACION,
  crearMensajeEdadMaxima,
  crearDescripcionReactivaTradicional,
  crearDescripcionFinanciado100,
  crearDescripcionFinanciado1,
} from "../constants"
import { calcularPrestamoSugerido } from "./financialCalculations"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ModalidadesDisponibles {
  opciones: Modalidad[]
  modalidadSugerida: Modalidad | null
  mensajeEdad: string
  tieneRestriccion: boolean
  requiereDatos?: boolean
  mensajeRequerimiento?: string
  esError?: boolean
  esRechazo?: boolean
  esInsuficiente?: boolean
  descripcionOpciones?: Record<string, string>
}

// ---------------------------------------------------------------------------
// Pure calculation functions
// ---------------------------------------------------------------------------

/**
 * Valida que el CURP tenga el formato correcto
 */
export function validarCURP(curp: string): { valido: boolean; edadMeses: number | null } {
  const curpLimpio = curp.trim()

  if (!curpLimpio || curpLimpio.length !== CURP_LENGTH) {
    return { valido: false, edadMeses: null }
  }

  const edadMeses = getAgeInMonthsFromCURP(curpLimpio)

  if (!edadMeses) {
    return { valido: false, edadMeses: null }
  }

  return { valido: true, edadMeses }
}

/**
 * Determina si el cliente tiene edad mínima requerida
 */
export function cumpleEdadMinima(edadMeses: number): boolean {
  return edadMeses >= EDAD_MINIMA_MESES
}

/**
 * Determina si el cliente excede la edad máxima para REACTIVA F100
 */
export function excededEdadMaximaReactivaF100(edadMeses: number): boolean {
  return edadMeses > EDAD_MAXIMA_REACTIVA_F100
}

/**
 * Calcula las modalidades disponibles cuando el cliente excede edad máxima
 */
export function modalidadesPorEdadMaxima(edadMeses: number): ModalidadesDisponibles {
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

/**
 * Calcula las modalidades disponibles según capacidad financiera
 */
export function modalidadesPorCapacidadFinanciera(
  saldo: number
): ModalidadesDisponibles {
  const prestamo = calcularPrestamoSugerido(saldo)
  const totalDisponible = saldo + prestamo
  const esSuficiente = totalDisponible >= VALOR_REFERENCIA

  if (esSuficiente) {
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
  }

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

/**
 * Función principal que determina las modalidades disponibles
 */
export function calcularModalidadesDisponibles(
  curp: string,
  saldoAfore: number
): ModalidadesDisponibles {
  // Validar CURP
  const { valido, edadMeses } = validarCURP(curp)

  if (!valido) {
    if (!curp.trim() || curp.trim().length !== CURP_LENGTH) {
      return {
        opciones: [],
        modalidadSugerida: null,
        mensajeEdad: "",
        tieneRestriccion: false,
        requiereDatos: true,
        mensajeRequerimiento: MENSAJES_VALIDACION.CURP_REQUERIDO,
      }
    }

    return {
      opciones: [],
      modalidadSugerida: null,
      mensajeEdad: MENSAJES_VALIDACION.CURP_INVALIDO,
      tieneRestriccion: false,
      requiereDatos: true,
      esError: true,
    }
  }

  // Validar edad mínima
  if (!cumpleEdadMinima(edadMeses!)) {
    return {
      opciones: [],
      modalidadSugerida: null,
      mensajeEdad: MENSAJES_VALIDACION.EDAD_MINIMA_RECHAZO,
      tieneRestriccion: true,
      esRechazo: true,
    }
  }

  // Validar que haya saldo
  if (saldoAfore === SALDO_MINIMO_PARA_CALCULO) {
    return {
      opciones: [],
      modalidadSugerida: null,
      mensajeEdad: "",
      tieneRestriccion: false,
      requiereDatos: true,
      mensajeRequerimiento: MENSAJES_VALIDACION.SALDO_REQUERIDO,
    }
  }

  // Determinar modalidades según edad
  if (excededEdadMaximaReactivaF100(edadMeses!)) {
    return modalidadesPorEdadMaxima(edadMeses!)
  }

  // Determinar modalidades según capacidad financiera
  return modalidadesPorCapacidadFinanciera(saldoAfore)
}
