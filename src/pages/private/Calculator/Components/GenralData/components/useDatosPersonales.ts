import { useState, useCallback, useEffect, type ChangeEvent } from "react"
import type { GeneralDataForm } from "@/models"
import {
  VALIDATORS,
  type FormFields,
  type FormErrors,
  type FormTouched,
} from "../validators"
import {
  useAutoCalcularEdadYFechaNacimiento,
  useAutoCalcularSinVigenciaDerechos,
  useAutoCalcularLeyAplicable,
  useAutoCalcularFechaInicioContrato,
  useAutoCalcularDatosFinContrato,
} from "../hooks/useAutoCalculatedFields"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type DatosPersonalesFields = Extract<
  FormFields,
  | "nombreAsesor"
  | "nombreCliente"
  | "nss"
  | "curp"
  | "semanasCotizadas"
  | "fechaBaja"
  | "saldoAfore"
  | "fechaInicioContrato"
>

interface UseDatosPersonalesProps {
  generalData: GeneralDataForm
  onChange: (field: string, value: string) => void
  onAutoUpdate?: (updates: Partial<GeneralDataForm>) => void
  onValidationReady?: (validate: () => boolean) => void
}

// ---------------------------------------------------------------------------
// Hook: Maneja la lógica de Datos Personales
// ---------------------------------------------------------------------------
export function useDatosPersonales({
  generalData,
  onChange,
  onAutoUpdate,
  onValidationReady,
}: UseDatosPersonalesProps) {
  const [errors, setErrors] = useState<Pick<FormErrors, DatosPersonalesFields>>({
    nombreAsesor: "",
    nombreCliente: "",
    nss: "",
    curp: "",
    semanasCotizadas: "",
    fechaBaja: "",
    saldoAfore: "",
    fechaInicioContrato: "",
  })

  const [touched, setTouched] = useState<Pick<FormTouched, DatosPersonalesFields>>({
    nombreAsesor: false,
    nombreCliente: false,
    nss: false,
    curp: false,
    semanasCotizadas: false,
    fechaBaja: false,
    saldoAfore: false,
    fechaInicioContrato: false,
  })

  // --- Handlers ------------------------------------------------------------
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target as { name: DatosPersonalesFields; value: string }
      onChange(name, value)

      if (touched[name]) {
        setErrors((prev) => ({ ...prev, [name]: VALIDATORS[name](value) }))
      }
    },
    [onChange, touched]
  )

  const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: DatosPersonalesFields; value: string }
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: VALIDATORS[name](value) }))
  }, [])

  // --- Wrapper para setGeneralData -----------------------------------------
  const setGeneralDataWrapper = useCallback(
    (data: GeneralDataForm) => {
      if (!onAutoUpdate) return
      onAutoUpdate(data)
    },
    [onAutoUpdate]
  )

  // --- Auto-calculated fields ----------------------------------------------
  useAutoCalcularEdadYFechaNacimiento(generalData.curp, generalData, setGeneralDataWrapper)
  useAutoCalcularSinVigenciaDerechos(generalData.fechaBaja, generalData, setGeneralDataWrapper)
  useAutoCalcularLeyAplicable(
    generalData.fechaNacimiento,
    generalData.semanasCotizadas,
    generalData.fechaBaja,
    generalData,
    setGeneralDataWrapper
  )
  useAutoCalcularFechaInicioContrato(
    generalData.fechaFirmaContrato,
    generalData,
    setGeneralDataWrapper
  )
  useAutoCalcularDatosFinContrato(
    generalData.fechaInicioContrato,
    generalData.totalMeses,
    generalData.semanasCotizadas,
    generalData,
    setGeneralDataWrapper
  )

  // --- Validation ----------------------------------------------------------
  const validate = useCallback((): boolean => {
    const fields: DatosPersonalesFields[] = [
      "nombreAsesor",
      "nombreCliente",
      "nss",
      "curp",
      "semanasCotizadas",
      "fechaBaja",
      "saldoAfore",
      "fechaInicioContrato",
    ]

    const newErrors = {} as Pick<FormErrors, DatosPersonalesFields>
    let hasError = false

    for (const field of fields) {
      const msg = VALIDATORS[field](generalData[field])
      newErrors[field] = msg
      if (msg) hasError = true
    }

    setErrors(newErrors)
    setTouched({
      nombreAsesor: true,
      nombreCliente: true,
      nss: true,
      curp: true,
      semanasCotizadas: true,
      fechaBaja: true,
      saldoAfore: true,
      fechaInicioContrato: true,
    })

    return !hasError
  }, [generalData])

  // Exponer validación al padre
  useEffect(() => {
    if (onValidationReady) {
      onValidationReady(validate)
    }
  }, [onValidationReady, validate])

  return {
    form: generalData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
  }
}
