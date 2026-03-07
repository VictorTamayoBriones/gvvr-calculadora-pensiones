import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { AdminConfig, ConfigSection } from "@/contexts/AdminConfigContext"

interface Props {
  config: AdminConfig
  open: boolean
  onToggle: () => void
  onSave: (section: ConfigSection, values: Partial<AdminConfig>) => void
  onReset: (section: ConfigSection) => void
}

export function ValidacionesSection({ config, open, onToggle, onSave, onReset }: Props) {
  const [minimoSemanas, setMinimoSemanas] = useState(config.minimoSemanasCotizadas)
  const [minimoSaldo, setMinimoSaldo] = useState(config.minimoSaldoAfore)
  const [edadMinima, setEdadMinima] = useState(config.edadMinimaMeses)
  const [edadMaxima, setEdadMaxima] = useState(config.edadMaximaReactivaF100)
  const [edadMinimaPrograma, setEdadMinimaPrograma] = useState(config.edadMinimaPrograma)
  const [edadMinimaPension, setEdadMinimaPension] = useState(config.edadMinimaPension)
  const [semanasMinLey73, setSemanasMinLey73] = useState(config.semanasMinLey73)
  const [semanasMinLey97, setSemanasMinLey97] = useState(config.semanasMinLey97)
  const [edadMinimaProceso, setEdadMinimaProceso] = useState(config.edadMinimaProceso)
  const [edadAlertaAvanzada, setEdadAlertaAvanzada] = useState(config.edadAlertaAvanzada)
  const [topeDiasConservacion, setTopeDiasConservacion] = useState(config.topeDiasConservacion)

  const handleSave = () => {
    onSave("validaciones", {
      minimoSemanasCotizadas: minimoSemanas,
      minimoSaldoAfore: minimoSaldo,
      edadMinimaMeses: edadMinima,
      edadMaximaReactivaF100: edadMaxima,
      edadMinimaPrograma,
      edadMinimaPension,
      semanasMinLey73,
      semanasMinLey97,
      edadMinimaProceso,
      edadAlertaAvanzada,
      topeDiasConservacion,
    })
  }

  const handleReset = () => {
    onReset("validaciones")
    setTimeout(() => window.location.reload(), 100)
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <CardTitle className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Validaciones
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className="space-y-6">
          {/* Sección: Datos Generales */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Datos Generales</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mínimo semanas cotizadas</Label>
                <Input
                  type="number"
                  value={minimoSemanas}
                  onChange={(e) => setMinimoSemanas(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Mínimo saldo AFORE ($)</Label>
                <Input
                  type="number"
                  value={minimoSaldo}
                  onChange={(e) => setMinimoSaldo(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Edad mínima (meses)</Label>
                <Input
                  type="number"
                  value={edadMinima}
                  onChange={(e) => setEdadMinima(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  {(edadMinima / 12).toFixed(1)} años
                </p>
              </div>
              <div className="space-y-2">
                <Label>Edad máxima Reactiva F100 (meses)</Label>
                <Input
                  type="number"
                  value={edadMaxima}
                  onChange={(e) => setEdadMaxima(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  {(edadMaxima / 12).toFixed(1)} años
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Edades del Cliente */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Edades del Cliente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Edad mínima programa (años)</Label>
                <Input
                  type="number"
                  value={edadMinimaPrograma}
                  onChange={(e) => setEdadMinimaPrograma(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Edad mínima para participar en el programa
                </p>
              </div>
              <div className="space-y-2">
                <Label>Edad mínima pensión (años)</Label>
                <Input
                  type="number"
                  value={edadMinimaPension}
                  onChange={(e) => setEdadMinimaPension(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Se emite advertencia si el cliente no cumple esta edad
                </p>
              </div>
              <div className="space-y-2">
                <Label>Edad mínima proceso (años)</Label>
                <Input
                  type="number"
                  value={edadMinimaProceso}
                  onChange={(e) => setEdadMinimaProceso(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Edad mínima para iniciar proceso de pensión
                </p>
              </div>
              <div className="space-y-2">
                <Label>Edad alerta avanzada (años)</Label>
                <Input
                  type="number"
                  value={edadAlertaAvanzada}
                  onChange={(e) => setEdadAlertaAvanzada(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Se emite advertencia si el cliente supera esta edad
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Semanas por Ley */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Semanas Mínimas por Ley</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mínimo semanas LEY 73</Label>
                <Input
                  type="number"
                  value={semanasMinLey73}
                  onChange={(e) => setSemanasMinLey73(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Mínimo semanas LEY 97</Label>
                <Input
                  type="number"
                  value={semanasMinLey97}
                  onChange={(e) => setSemanasMinLey97(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Sección: Conservación de Derechos */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Conservación de Derechos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tope máximo días conservación</Label>
                <Input
                  type="number"
                  value={topeDiasConservacion}
                  onChange={(e) => setTopeDiasConservacion(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  {(topeDiasConservacion / 365).toFixed(1)} años aprox.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave}>Guardar cambios</Button>
            <Button variant="outline" onClick={handleReset}>Restaurar defaults</Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
