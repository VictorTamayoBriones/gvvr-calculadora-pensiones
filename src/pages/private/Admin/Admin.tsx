import { useAdmin } from "./useAdmin"
import { ValidacionesSection } from "./components/ValidacionesSection"
import { CalculosPrestamoSection } from "./components/CalculosPrestamoSection"
import { CostosGestoriaSection } from "./components/CostosGestoriaSection"
import { PreciosAnualesSection } from "./components/PreciosAnualesSection"
import { PreciosPrimerMesSection } from "./components/PreciosPrimerMesSection"
import { TablaPensionesSection } from "./components/TablaPensionesSection"

export default function Admin() {
  const { config, openSections, toggleSection, handleSave, handleReset } = useAdmin()

  return (
    <div className="container mx-auto max-w-4xl py-6 space-y-4">
      <h1 className="text-2xl font-bold">Administración</h1>
      <p className="text-muted-foreground">
        Configura las constantes de negocio. Los cambios se aplican inmediatamente y persisten en el navegador.
      </p>

      <ValidacionesSection
        config={config}
        open={openSections.validaciones}
        onToggle={() => toggleSection("validaciones")}
        onSave={handleSave}
        onReset={handleReset}
      />

      <CalculosPrestamoSection
        config={config}
        open={openSections.calculosPrestamo}
        onToggle={() => toggleSection("calculosPrestamo")}
        onSave={handleSave}
        onReset={handleReset}
      />

      <CostosGestoriaSection
        config={config}
        open={openSections.costosGestoria}
        onToggle={() => toggleSection("costosGestoria")}
        onSave={handleSave}
        onReset={handleReset}
      />

      <PreciosAnualesSection
        config={config}
        open={openSections.preciosAnuales}
        onToggle={() => toggleSection("preciosAnuales")}
        onSave={handleSave}
        onReset={handleReset}
      />

      <PreciosPrimerMesSection
        config={config}
        open={openSections.preciosPrimerMes}
        onToggle={() => toggleSection("preciosPrimerMes")}
        onSave={handleSave}
        onReset={handleReset}
      />

      <TablaPensionesSection
        config={config}
        open={openSections.tablaPensiones}
        onToggle={() => toggleSection("tablaPensiones")}
        onSave={handleSave}
        onReset={handleReset}
      />
    </div>
  )
}
