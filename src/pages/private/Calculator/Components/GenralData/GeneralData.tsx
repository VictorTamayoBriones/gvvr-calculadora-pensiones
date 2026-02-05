import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HelpCircle, AlertCircle } from "lucide-react"
import { addComa } from "@/helpers/formatText"
import { useGeneralData } from "./useGeneralData"

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function GeneralData() {
  const { form, errors, touched, resultados, modalidadesDisponibles, handleChange, handleBlur, handleSubmit, handleModalidadChange } = useGeneralData()

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
                {touched.curp && errors.curp && (
                  <FieldError>{errors.curp}</FieldError>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Semanas Cotizadas */}
              <Field data-invalid={touched.semanasCotizadas && errors.semanasCotizadas ? "true" : undefined}>
                <div className="flex items-center gap-1.5">
                  <FieldLabel htmlFor="semanasCotizadas">Semanas Cotizadas</FieldLabel>
                  <Tooltip>
                    <TooltipTrigger type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                      <HelpCircle className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="font-medium mb-1">Total de semanas cotizadas en IMSS</p>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Se necesita un mínimo de 430 semanas.</li>
                        <li>430 semanas equivalen aproximadamente a 8.3 años de cotización</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                {touched.semanasCotizadas && errors.semanasCotizadas && (
                  <FieldError>{errors.semanasCotizadas}</FieldError>
                )}
              </Field>

              {/* Fecha de Baja */}
              <Field data-invalid={touched.fechaBaja && errors.fechaBaja ? "true" : undefined}>
                <div className="flex items-center gap-1.5">
                <FieldLabel htmlFor="fechaBaja">Fecha de Baja</FieldLabel>
                  <Tooltip>
                    <TooltipTrigger type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                      <HelpCircle className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="font-medium mb-1">Fecha en que el trabajador causó baja del IMSS</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="fechaBaja"
                  name="fechaBaja"
                  type="date"
                  value={form.fechaBaja}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!(touched.fechaBaja && errors.fechaBaja)}
                />
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
                {touched.fechaInicioContrato && errors.fechaInicioContrato && (
                  <FieldError>{errors.fechaInicioContrato}</FieldError>
                )}
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* --- Modalidad de Financiamiento ----------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Modalidad de Financiamiento</CardTitle>
        </CardHeader>

        <CardContent>
          {/* Mensaje de edad si aplica */}
          {modalidadesDisponibles.mensajeEdad && (
            <div className={`rounded-lg border p-4 mb-4 flex items-start gap-3 ${
              modalidadesDisponibles.esRechazo
                ? "bg-destructive/10 border-destructive text-destructive"
                : "bg-amber-50 dark:bg-amber-950/30 border-amber-500 dark:border-amber-500/50 text-amber-900 dark:text-amber-200"
            }`}>
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{modalidadesDisponibles.mensajeEdad}</p>
            </div>
          )}

          {/* Selector de modalidad */}
          {modalidadesDisponibles.opciones.length > 0 ? (
            <FieldGroup>
              <Field>
                <div className="flex items-center gap-1.5">
                  <FieldLabel htmlFor="modalidad">Modalidad</FieldLabel>
                  <Tooltip>
                    <TooltipTrigger type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                      <HelpCircle className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="font-medium mb-1">Tipo de financiamiento disponible</p>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Las opciones varían según edad y capacidad financiera</li>
                        <li>La modalidad sugerida se muestra primero</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={form.modalidad} onValueChange={handleModalidadChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una modalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {modalidadesDisponibles.opciones.map((modalidad) => (
                      <SelectItem key={modalidad} value={modalidad}>
                        {modalidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Descripción de modalidad seleccionada */}
              {form.modalidad && (
                <div className="rounded-lg border bg-muted/50 p-4 mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Descripción</p>
                  <p className="text-sm">
                    {form.modalidad === "FINANCIADO 1" && "Financiamiento parcial - El cliente necesita aportar fondos adicionales."}
                    {form.modalidad === "FINANCIADO 100" && "Financiamiento total - Grupo a vivir cubre el 100% (inscripción + mensualidades + gestoría)."}
                    {form.modalidad === "REACTIVA TRADICIONAL" && "El cliente esta obligado a pagar su inscripcion y meses de contratacion, solo GRUPO A VIVIR financiara la GESTION."}
                    {form.modalidad === "REACTIVA FINANCIADO 100" && "GRUPO A VIVIR financiara el 100% de la inscripcion, pagos mensuales y la gestion."}
                  </p>
                </div>
              )}
            </FieldGroup>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              <p className="text-sm">Complete el CURP o ingresa uno valido para calcular las modalidades disponibles</p>
            </div>
          )}
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
