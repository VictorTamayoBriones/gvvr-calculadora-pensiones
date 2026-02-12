import { Button } from "@/components/ui/button"
import { useGeneralData } from "./useGeneralData"
import {
  DatosPersonalesSection,
  ModalidadSection,
  AnalisisFinancieroSection,
} from "./components"

// ---------------------------------------------------------------------------
// Component - Alta Cohesión y Bajo Acoplamiento
// ---------------------------------------------------------------------------
export default function GeneralData() {
  const {
    generalData,
    pensionMensual,
    costoTotal,
    handleFieldChange,
    handleAutoUpdate,
    handleSubmit,
    registerDatosPersonalesValidation,
    registerModalidadValidation,
  } = useGeneralData()

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Datos Personales y Laborales */}
      <DatosPersonalesSection
        generalData={generalData}
        onChange={handleFieldChange}
        onAutoUpdate={handleAutoUpdate}
        onValidationReady={registerDatosPersonalesValidation}
      />

      {/* Modalidad de Financiamiento */}
      <ModalidadSection
        curp={generalData.curp}
        saldoAfore={generalData.saldoAfore}
        modalidad={generalData.modalidad}
        pensionMensual={pensionMensual}
        costoTotal={costoTotal}
        onChange={handleFieldChange}
        onValidationReady={registerModalidadValidation}
      />

      {/* Análisis Financiero */}
      <AnalisisFinancieroSection
        saldoAfore={generalData.saldoAfore}
        modalidad={generalData.modalidad}
        pensionMensual={pensionMensual}
        costoTotal={costoTotal}
      />

      {/* Acción */}
      <div className="flex justify-end">
        <Button type="submit">Guardar y Continuar</Button>
      </div>
    </form>
  )
}
