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
import { FACTOR_PENSION } from "./constants"

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
          {/* Mensaje de edad/error si aplica */}
          {modalidadesDisponibles.mensajeEdad && (
            <div className={`rounded-lg border p-4 mb-4 flex items-start gap-3 ${
              modalidadesDisponibles.esRechazo
                ? "bg-destructive/10 border-destructive text-destructive"
                : modalidadesDisponibles.esError
                ? "bg-red-50 dark:bg-red-950/30 border-red-500 dark:border-red-500/50 text-red-900 dark:text-red-200"
                : "bg-amber-50 dark:bg-amber-950/30 border-amber-500 dark:border-amber-500/50 text-amber-900 dark:text-amber-200"
            }`}>
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{modalidadesDisponibles.mensajeEdad}</p>
            </div>
          )}

          {/* Mensaje de requerimiento de datos */}
          {modalidadesDisponibles.requiereDatos && modalidadesDisponibles.mensajeRequerimiento && (
            <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">{modalidadesDisponibles.mensajeRequerimiento}</p>
            </div>
          )}

          {/* Selector de modalidad */}
          {modalidadesDisponibles.opciones.length > 0 && (
            <FieldGroup>
              <Field>
                <div className="flex items-center gap-1.5">
                  <FieldLabel htmlFor="modalidad">Modalidad Seleccionada</FieldLabel>
                  <Tooltip>
                    <TooltipTrigger type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                      <HelpCircle className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="font-medium mb-1">Tipo de financiamiento disponible</p>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Las opciones se calculan automáticamente según:</li>
                        <li>• Edad del prospecto (extraída del CURP)</li>
                        <li>• Saldo AFORE disponible</li>
                        <li>• Capacidad de préstamo calculada</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Badge con estado visual */}
                {modalidadesDisponibles.esInsuficiente && (
                  <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-500 dark:border-amber-500/50 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      Los fondos disponibles son insuficientes. Se requiere aporte adicional o negociar préstamo mayor.
                    </p>
                  </div>
                )}

                <Select value={form.modalidad} onValueChange={handleModalidadChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una modalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {modalidadesDisponibles.opciones.map((modalidad, index) => (
                      <SelectItem key={modalidad} value={modalidad}>
                        <div className="flex items-center gap-2">
                          {index === 0 && <span className="text-amber-500">⭐</span>}
                          <span>{modalidad}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Descripción dinámica con estado */}
                {(() => {
                  if (!form.modalidad || !modalidadesDisponibles.descripcionOpciones) return null
                  const descripcion = (modalidadesDisponibles.descripcionOpciones as unknown as Record<string, string>)[form.modalidad]
                  if (!descripcion) return null
                  return (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                        {descripcion}
                      </p>
                    </div>
                  )
                })()}
              </Field>

              {/* Descripción detallada de la modalidad seleccionada */}
              {form.modalidad && (
                <div className="rounded-lg border bg-muted/50 p-4 mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Descripción del Financiamiento</p>
                  <p className="text-sm">
                    {form.modalidad === "FINANCIADO 1" && "Financiamiento parcial - El cliente necesita aportar fondos adicionales."}
                    {form.modalidad === "FINANCIADO 100" && "Financiamiento total - Grupo Avivir cubre el 100% (inscripción + mensualidades + gestoría)."}
                    {form.modalidad === "REACTIVA TRADICIONAL" && "El cliente esta obligado a pagar su inscripcion y meses de contratacion, solo GRUPO AVIVIR financiara la GESTION."}
                    {form.modalidad === "REACTIVA FINANCIADO 100" && "GRUPO AVIVIR financiara el 100% de la inscripcion, pagos mensuales y la gestion."}
                  </p>
                </div>
              )}

              {/* Indicador de múltiples opciones */}
              {modalidadesDisponibles.opciones.length > 1 && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-xs text-green-800 dark:text-green-300 flex items-start gap-2">
                    <span className="text-base">✓</span>
                    <span>
                      Tiene {modalidadesDisponibles.opciones.length} opciones disponibles.
                      La opción marcada con ⭐ es la recomendada según su perfil.
                    </span>
                  </p>
                </div>
              )}
            </FieldGroup>
          )}
        </CardContent>
      </Card>

      {/* --- Análisis Financiero -------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Financiero</CardTitle>
        </CardHeader>

        <CardContent>
          {/* Etiqueta de préstamo si aplica */}
          {resultados.etiquetaPrestamo && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-500 dark:border-amber-500/50 p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-amber-900 dark:text-amber-200" />
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                {resultados.etiquetaPrestamo}
              </p>
            </div>
          )}

          {/* Resumen del cálculo */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Saldo AFORE</span>
              <span className="text-sm font-medium">
                {resultados.saldoAfore > 0 ? `$ ${addComa(String(resultados.saldoAfore))}` : "$ 0"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">+ Préstamo Sugerido</span>
              <span className="text-sm font-medium">
                {resultados.prestamoSugerido > 0 ? `$ ${addComa(String(resultados.prestamoSugerido))}` : "$ 0"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b-2 border-foreground/20">
              <span className="text-sm font-semibold">= Total Disponible</span>
              <span className="text-base font-bold">
                $ {addComa(String(resultados.totalDisponible))}
              </span>
            </div>

            <div className="h-2" />

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Monto Mínimo Requerido</span>
              <span className="text-sm font-medium">
                $ {addComa(String(resultados.montoMinimo))}
              </span>
            </div>

            {resultados.esSuficiente ? (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Sobrante</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  $ {addComa(String(resultados.sobrante))}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Faltante</span>
                <span className="text-sm font-semibold text-destructive">
                  $ {addComa(String(resultados.faltante))}
                </span>
              </div>
            )}
          </div>

          {/* Badge de estado */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${
            resultados.esSuficiente
              ? "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-800"
              : "bg-destructive/10 text-destructive border border-destructive/30"
          }`}>
            <span className="text-lg">{resultados.esSuficiente ? "✅" : "⚠️"}</span>
            <span>Modalidad: {resultados.tipoFinanciamiento}</span>
          </div>

          {/* Mensaje descriptivo */}
          {resultados.mensaje && (
            <>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">{resultados.mensaje}</p>
            </>
          )}

          {/* Mensaje de acción si es insuficiente */}
          {!resultados.esSuficiente && resultados.faltante > 0 && (
            <>
              <Separator className="my-4" />
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">
                  <strong>⚠️ Acción requerida:</strong>
                </p>
                <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1 list-disc list-inside">
                  <li>El cliente necesita aportar $ {addComa(String(resultados.faltante))} adicionales, o</li>
                  <li>Negociar un préstamo mayor con Grupo Avivir</li>
                </ul>
              </div>
            </>
          )}

          {/* Detalle del cálculo del préstamo */}
          {resultados.necesitaPrestamo && (
            <>
              <Separator className="my-4" />
              <details className="text-sm">
                <summary className="cursor-pointer text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  ¿Cómo se calcula el préstamo sugerido?
                </summary>
                <div className="mt-3 p-4 bg-muted/50 rounded-lg border space-y-2">
                  <p className="font-medium">Fórmula:</p>
                  <code className="block bg-background p-2 rounded text-xs font-mono">
                    (Pensión Mensual × 7.5) - $10,000
                  </code>
                  <p className="text-muted-foreground">
                    Cálculo: (${addComa(String(FACTOR_PENSION))} × 7.5) - $10,000 = ${addComa(String(resultados.prestamoSugerido))}
                  </p>
                  <p className="text-xs text-muted-foreground italic mt-2">
                    * Este es un monto sugerido. El préstamo final puede variar según aprobación de Grupo Avivir.
                  </p>
                </div>
              </details>
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
