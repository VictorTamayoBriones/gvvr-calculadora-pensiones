import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { FormInput } from "./FormInput"
import { useDatosPersonales } from "./useDatosPersonales"
import type { GeneralDataForm } from "@/models"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DatosPersonalesSectionProps {
  generalData: GeneralDataForm
  onChange: (field: string, value: string) => void
  onAutoUpdate?: (updates: Partial<GeneralDataForm>) => void
  onValidationReady?: (validate: () => boolean) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function DatosPersonalesSection({
  generalData,
  onChange,
  onAutoUpdate,
  onValidationReady,
}: DatosPersonalesSectionProps) {
  const { form, errors, touched, handleChange, handleBlur } = useDatosPersonales({
    generalData,
    onChange,
    onAutoUpdate,
    onValidationReady,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos Personales y Laborales</CardTitle>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          {/* Fila 1: Nombre Asesor y Nombre Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              id="nombreAsesor"
              name="nombreAsesor"
              label="Nombre del Asesor"
              placeholder="Nombre del asesor asignado"
              value={form.nombreAsesor}
              error={errors.nombreAsesor}
              touched={touched.nombreAsesor}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <FormInput
              id="nombreCliente"
              name="nombreCliente"
              label="Nombre Cliente"
              placeholder="Nombre completo del cliente"
              value={form.nombreCliente}
              error={errors.nombreCliente}
              touched={touched.nombreCliente}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          {/* Fila 2: NSS y CURP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              id="nss"
              name="nss"
              label="NSS"
              placeholder="11 dígitos"
              inputMode="numeric"
              maxLength={11}
              value={form.nss}
              error={errors.nss}
              touched={touched.nss}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <FormInput
              id="curp"
              name="curp"
              label="CURP"
              placeholder="18 caracteres"
              maxLength={18}
              value={form.curp}
              error={errors.curp}
              touched={touched.curp}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          {/* Fila 3: Semanas Cotizadas y Fecha de Baja */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              id="semanasCotizadas"
              name="semanasCotizadas"
              label="Semanas Cotizadas"
              placeholder="Ej. 500"
              inputMode="numeric"
              value={form.semanasCotizadas}
              error={errors.semanasCotizadas}
              touched={touched.semanasCotizadas}
              onChange={handleChange}
              onBlur={handleBlur}
              tooltip={{
                title: "Total de semanas cotizadas en IMSS",
                items: [
                  "Se necesita un mínimo de 430 semanas.",
                  "430 semanas equivalen aproximadamente a 8.3 años de cotización",
                ],
              }}
            />

            <FormInput
              id="fechaBaja"
              name="fechaBaja"
              label="Fecha de Baja"
              type="date"
              value={form.fechaBaja}
              error={errors.fechaBaja}
              touched={touched.fechaBaja}
              onChange={handleChange}
              onBlur={handleBlur}
              tooltip={{
                title: "Fecha en que el trabajador causó baja del IMSS",
              }}
            />
          </div>

          {/* Fila 4: Saldo AFORE y Fecha Inicio Contrato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              id="saldoAfore"
              name="saldoAfore"
              label="Saldo AFORE"
              placeholder="0.00"
              inputMode="decimal"
              prefix="$"
              value={form.saldoAfore}
              error={errors.saldoAfore}
              touched={touched.saldoAfore}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <FormInput
              id="fechaInicioContrato"
              name="fechaInicioContrato"
              label="Fecha Inicio Contrato"
              type="date"
              value={form.fechaInicioContrato}
              error={errors.fechaInicioContrato}
              touched={touched.fechaInicioContrato}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
