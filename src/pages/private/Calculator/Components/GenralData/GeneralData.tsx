import { useState, useMemo, type ChangeEvent, type FormEvent } from "react"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field"
import { addComa } from "@/helpers/formatText"

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
const VALIDATORS = {
  nombreAsesor: (v: string) => (v.trim() === "" ? "Este campo es obligatorio." : ""),
  nombreCliente: (v: string) => (v.trim() === "" ? "Este campo es obligatorio." : ""),
  nss: (v: string) => {
    if (v.trim() === "") return "Este campo es obligatorio."
    if (!/^\d{11}$/.test(v)) return "El NSS debe tener exactamente 11 dígitos."
    return ""
  },
  curp: (v: string) => {
    if (v.trim() === "") return "Este campo es obligatorio."
    if (!/^[A-Za-z0-9]{18}$/.test(v)) return "El CURP debe tener exactamente 18 caracteres alfanuméricos."
    return ""
  },
  semanasCotizadas: (v: string) => {
    if (v.trim() === "") return "Este campo es obligatorio."
    const n = Number(v)
    if (isNaN(n) || n <= 0) return "Debe ser un número mayor a 0."
    return ""
  },
  fechaBaja: (v: string) => (v === "" ? "Este campo es obligatorio." : ""),
  saldoAfore: (v: string) => {
    if (v.trim() === "") return "Este campo es obligatorio."
    if (isNaN(Number(v)) || Number(v) < 0) return "Debe ser un valor monetario ≥ 0."
    return ""
  },
  fechaInicioContrato: (v: string) => (v === "" ? "Este campo es obligatorio." : ""),
} as const

type FormFields = keyof typeof VALIDATORS

// ---------------------------------------------------------------------------
// Business-logic constants (would come from other sheets in production)
// ---------------------------------------------------------------------------
const VALOR_REFERENCIA = 80_000   // K25 – placeholder
const FACTOR_PENSION   = 12_000   // F44 – placeholder

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function GeneralData() {
  // --- form state ----------------------------------------------------------
  const [form, setForm] = useState({
    nombreAsesor: "",
    nombreCliente: "",
    nss: "",
    curp: "",
    semanasCotizadas: "",
    fechaBaja: "",
    saldoAfore: "",
    fechaInicioContrato: "",
  })

  const [errors, setErrors] = useState<Record<FormFields, string>>({
    nombreAsesor: "",
    nombreCliente: "",
    nss: "",
    curp: "",
    semanasCotizadas: "",
    fechaBaja: "",
    saldoAfore: "",
    fechaInicioContrato: "",
  })

  const [touched, setTouched] = useState<Record<FormFields, boolean>>({
    nombreAsesor: false,
    nombreCliente: false,
    nss: false,
    curp: false,
    semanasCotizadas: false,
    fechaBaja: false,
    saldoAfore: false,
    fechaInicioContrato: false,
  })

  // --- handlers ------------------------------------------------------------
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: FormFields; value: string }
    setForm((prev) => ({ ...prev, [name]: value }))
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: VALIDATORS[name](value) }))
    }
  }

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: FormFields; value: string }
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: VALIDATORS[name](value) }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newErrors = {} as Record<FormFields, string>
    let hasError = false
    for (const key of Object.keys(VALIDATORS) as FormFields[]) {
      const msg = VALIDATORS[key](form[key])
      newErrors[key] = msg
      if (msg) hasError = true
    }
    setErrors(newErrors)
    setTouched(
      Object.fromEntries(Object.keys(VALIDATORS).map((k) => [k, true])) as Record<FormFields, boolean>
    )
    if (hasError) return
    // TODO: emit / navigate on valid submit
  }

  // --- derived calculations (business logic from the doc) -----------------
  const resultados = useMemo(() => {
    const saldo = Number(form.saldoAfore) || 0

    const prestamo =
      saldo < VALOR_REFERENCIA ? FACTOR_PENSION * 7.5 - 10_000 : 0

    const total = saldo + prestamo
    const tipoFinanciamiento =
      total < VALOR_REFERENCIA ? "FINANCIADO 1" : "FINANCIADO 100"

    const necesitaPrestamo =
      saldo < VALOR_REFERENCIA && tipoFinanciamiento === "FINANCIADO 1"

    const mensajes: Record<string, string> = {
      "REACTIVA TRADICIONAL":
        "El cliente está obligado a pagar su inscripción y meses de contratación, solo GRUPO AVIVIR financiará la GESTIÓN.",
      "REACTIVA FINANCIADO 100":
        "GRUPO AVIVIR financiará el 100% de la inscripción, pagos mensuales y la gestión.",
      "FINANCIADO 100":
        "El cliente tiene capacidad financiera para cubrir los costos.",
      "FINANCIADO 1":
        "El cliente requiere financiamiento adicional.",
    }

    return {
      prestamo,
      tipoFinanciamiento,
      necesitaPrestamo,
      mensaje: mensajes[tipoFinanciamiento] ?? "",
    }
  }, [form.saldoAfore])

  // --- render --------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* --- Datos Personales y Laborales --------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Personales y Laborales</CardTitle>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            {/* Nombre del Asesor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field data-invalid={touched.nombreAsesor && errors.nombreAsesor ? "true" : undefined}>
                <FieldLabel htmlFor="nombreAsesor">Nombre del Asesor</FieldLabel>
                <Input
                  id="nombreAsesor"
                  name="nombreAsesor"
                  placeholder="Nombre del asesor asignado"
                  value={form.nombreAsesor}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!(touched.nombreAsesor && errors.nombreAsesor)}
                />
                {touched.nombreAsesor && errors.nombreAsesor && (
                  <FieldError>{errors.nombreAsesor}</FieldError>
                )}
              </Field>

              {/* Nombre Cliente */}
              <Field data-invalid={touched.nombreCliente && errors.nombreCliente ? "true" : undefined}>
                <FieldLabel htmlFor="nombreCliente">Nombre Cliente</FieldLabel>
                <Input
                  id="nombreCliente"
                  name="nombreCliente"
                  placeholder="Nombre completo del cliente"
                  value={form.nombreCliente}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!(touched.nombreCliente && errors.nombreCliente)}
                />
                {touched.nombreCliente && errors.nombreCliente && (
                  <FieldError>{errors.nombreCliente}</FieldError>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* NSS */}
              <Field data-invalid={touched.nss && errors.nss ? "true" : undefined}>
                <FieldLabel htmlFor="nss">NSS</FieldLabel>
                <Input
                  id="nss"
                  name="nss"
                  placeholder="11 dígitos"
                  inputMode="numeric"
                  maxLength={11}
                  value={form.nss}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!(touched.nss && errors.nss)}
                />
                <FieldDescription>Número de Seguridad Social (11 dígitos)</FieldDescription>
                {touched.nss && errors.nss && (
                  <FieldError>{errors.nss}</FieldError>
                )}
              </Field>

              {/* CURP */}
              <Field data-invalid={touched.curp && errors.curp ? "true" : undefined}>
                <FieldLabel htmlFor="curp">CURP</FieldLabel>
                <Input
                  id="curp"
                  name="curp"
                  placeholder="18 caracteres"
                  maxLength={18}
                  value={form.curp}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!(touched.curp && errors.curp)}
                />
                <FieldDescription>Clave Única de Registro de Población (18 caracteres)</FieldDescription>
                {touched.curp && errors.curp && (
                  <FieldError>{errors.curp}</FieldError>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Semanas Cotizadas */}
              <Field data-invalid={touched.semanasCotizadas && errors.semanasCotizadas ? "true" : undefined}>
                <FieldLabel htmlFor="semanasCotizadas">Semanas Cotizadas</FieldLabel>
                <Input
                  id="semanasCotizadas"
                  name="semanasCotizadas"
                  placeholder="Ej. 500"
                  inputMode="numeric"
                  value={form.semanasCotizadas}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!(touched.semanasCotizadas && errors.semanasCotizadas)}
                />
                <FieldDescription>Total de semanas cotizadas en IMSS</FieldDescription>
                {touched.semanasCotizadas && errors.semanasCotizadas && (
                  <FieldError>{errors.semanasCotizadas}</FieldError>
                )}
              </Field>

              {/* Fecha de Baja */}
              <Field data-invalid={touched.fechaBaja && errors.fechaBaja ? "true" : undefined}>
                <FieldLabel htmlFor="fechaBaja">Fecha de Baja</FieldLabel>
                <Input
                  id="fechaBaja"
                  name="fechaBaja"
                  type="date"
                  value={form.fechaBaja}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!(touched.fechaBaja && errors.fechaBaja)}
                />
                <FieldDescription>Última fecha de baja laboral</FieldDescription>
                {touched.fechaBaja && errors.fechaBaja && (
                  <FieldError>{errors.fechaBaja}</FieldError>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Saldo AFORE */}
              <Field data-invalid={touched.saldoAfore && errors.saldoAfore ? "true" : undefined}>
                <FieldLabel htmlFor="saldoAfore">Saldo AFORE</FieldLabel>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">$</span>
                  <Input
                    id="saldoAfore"
                    name="saldoAfore"
                    placeholder="0.00"
                    inputMode="decimal"
                    className="pl-7"
                    value={form.saldoAfore}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!(touched.saldoAfore && errors.saldoAfore)}
                  />
                </div>
                <FieldDescription>Saldo disponible en AFORE</FieldDescription>
                {touched.saldoAfore && errors.saldoAfore && (
                  <FieldError>{errors.saldoAfore}</FieldError>
                )}
              </Field>

              {/* Fecha Inicio Contrato */}
              <Field data-invalid={touched.fechaInicioContrato && errors.fechaInicioContrato ? "true" : undefined}>
                <FieldLabel htmlFor="fechaInicioContrato">Fecha Inicio Contrato</FieldLabel>
                <Input
                  id="fechaInicioContrato"
                  name="fechaInicioContrato"
                  type="date"
                  value={form.fechaInicioContrato}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!(touched.fechaInicioContrato && errors.fechaInicioContrato)}
                />
                <FieldDescription>Inicio del contrato de servicios</FieldDescription>
                {touched.fechaInicioContrato && errors.fechaInicioContrato && (
                  <FieldError>{errors.fechaInicioContrato}</FieldError>
                )}
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* --- Resultados automáticos (cálculos derivados) ------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados del Cálculo</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Préstamo Financiero</p>
              <p className="text-lg font-semibold">
                {resultados.prestamo > 0 ? `$ ${addComa(String(resultados.prestamo))}` : "$ 0"}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Tipo de Financiamiento</p>
              <p className="text-lg font-semibold">{resultados.tipoFinanciamiento}</p>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Alerta Préstamo</p>
              <p className={`text-sm font-medium ${resultados.necesitaPrestamo ? "text-destructive" : "text-green-600"}`}>
                {resultados.necesitaPrestamo ? "Necesita préstamo financiero" : "Sin alerta"}
              </p>
            </div>
          </div>

          {resultados.mensaje && (
            <>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">{resultados.mensaje}</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* --- Acción ------------------------------------------------------ */}
      <div className="flex justify-end">
        <Button type="submit">Guardar y Continuar</Button>
      </div>
    </form>
  )
}
