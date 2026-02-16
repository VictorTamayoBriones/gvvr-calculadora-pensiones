import { verifyCURP } from "@/helpers/verifyCURP"
import { getMinimoSemanasCotizadas, getMinimoSaldoAfore } from "./constants"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type FormFields =
  | "nombreAsesor"
  | "nombreCliente"
  | "nss"
  | "curp"
  | "semanasCotizadas"
  | "fechaBaja"
  | "saldoAfore"
  | "fechaInicioContrato"
  | "modalidad"

export type FormErrors = Record<FormFields, string>
export type FormTouched = Record<FormFields, boolean>

// ---------------------------------------------------------------------------
// Validation helpers for General Data form
// ---------------------------------------------------------------------------
export const VALIDATORS: Record<FormFields, (v: string) => string> = {
  nombreAsesor: (v: string) => (v.trim() === "" ? "Este campo es obligatorio." : ""),
  nombreCliente: (v: string) => (v.trim() === "" ? "Este campo es obligatorio." : ""),
  nss: (v: string) => {
    if (v.trim() === "") return "Este campo es obligatorio."
    if (!/^\d{11}$/.test(v)) {
      return "NSS INVALIDO - Favor de Ingresar el NSS a 11 posiciones. Vuelve a intentar."
    }
    return ""
  },
  curp: (v: string) => {
    if (v.trim() === "") return "Este campo es obligatorio."
    if (!verifyCURP(v)) return "El CURP ingresado no es válido. Verifica el formato."
    return ""
  },
  semanasCotizadas: (v: string) => {
    if (v.trim() === "") return "Este campo es obligatorio."
    const n = Number(v)
    if (isNaN(n) || n <= 0) return "Debe ser un número mayor a 0."
    if (n < getMinimoSemanasCotizadas()) {
      return `SEMANAS INSUFICIENTES - El mínimo de semanas permitidas para este producto es de ${getMinimoSemanasCotizadas()}, de lo contrario se debe ofrecer otras alternativas.`
    }
    return ""
  },
  fechaBaja: (v: string) => (v === "" ? "Este campo es obligatorio." : ""),
  saldoAfore: (v: string) => {
    if (v.trim() === "") return "Este campo es obligatorio."
    const valor = Number(v)
    if (isNaN(valor) || valor < 0) return "Debe ser un valor monetario ≥ 0."
    if (valor < getMinimoSaldoAfore()) {
      return `MONTO EN AFORE INSUFICIENTE - El monto mínimo para este producto es de $${getMinimoSaldoAfore().toLocaleString('es-MX')}, el cual se toma de las subcuentas de: SAR 92, RETIRO 97, VIVIENDA`
    }
    return ""
  },
  fechaInicioContrato: (v: string) => (v === "" ? "Este campo es obligatorio." : ""),
  modalidad: (v: string) => (v.trim() === "" ? "Debe seleccionar una modalidad." : ""),
}

// ---------------------------------------------------------------------------
// Initial states factory
// ---------------------------------------------------------------------------
export const createInitialErrors = (): FormErrors => ({
  nombreAsesor: "",
  nombreCliente: "",
  nss: "",
  curp: "",
  semanasCotizadas: "",
  fechaBaja: "",
  saldoAfore: "",
  fechaInicioContrato: "",
  modalidad: "",
})

export const createInitialTouched = (): FormTouched => ({
  nombreAsesor: false,
  nombreCliente: false,
  nss: false,
  curp: false,
  semanasCotizadas: false,
  fechaBaja: false,
  saldoAfore: false,
  fechaInicioContrato: false,
  modalidad: false,
})
