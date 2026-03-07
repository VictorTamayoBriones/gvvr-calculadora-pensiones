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

export function ValidacionesContratoSection({ config, open, onToggle, onSave, onReset }: Props) {
  const [mesesMaxPrevio, setMesesMaxPrevio] = useState(config.mesesMaxPrevioFirma)
  const [mesesMaxPosterior, setMesesMaxPosterior] = useState(config.mesesMaxPosteriorFirma)
  const [duracionMinima, setDuracionMinima] = useState(config.duracionMinimaContrato)
  const [duracionMaxima, setDuracionMaxima] = useState(config.duracionMaximaContrato)
  const [advertenciaLargo, setAdvertenciaLargo] = useState(config.advertenciaContratoLargo)
  const [advertenciaMuyLargo, setAdvertenciaMuyLargo] = useState(config.advertenciaContratoMuyLargo)

  const handleSave = () => {
    onSave("validacionesContrato", {
      mesesMaxPrevioFirma: mesesMaxPrevio,
      mesesMaxPosteriorFirma: mesesMaxPosterior,
      duracionMinimaContrato: duracionMinima,
      duracionMaximaContrato: duracionMaxima,
      advertenciaContratoLargo: advertenciaLargo,
      advertenciaContratoMuyLargo: advertenciaMuyLargo,
    })
  }

  const handleReset = () => {
    onReset("validacionesContrato")
    setTimeout(() => window.location.reload(), 100)
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <CardTitle className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Validaciones de Contrato
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className="space-y-6">
          {/* Coherencia de fechas */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Coherencia de Fechas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Máx. meses previo a firma</Label>
                <Input
                  type="number"
                  value={mesesMaxPrevio}
                  onChange={(e) => setMesesMaxPrevio(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Inicio no puede ser más de {mesesMaxPrevio} meses antes de la firma
                </p>
              </div>
              <div className="space-y-2">
                <Label>Máx. meses posterior a firma</Label>
                <Input
                  type="number"
                  value={mesesMaxPosterior}
                  onChange={(e) => setMesesMaxPosterior(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Inicio no puede ser más de {mesesMaxPosterior} meses después de la firma
                </p>
              </div>
            </div>
          </div>

          {/* Duración del contrato */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Duración del Contrato</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duración mínima (meses)</Label>
                <Input
                  type="number"
                  value={duracionMinima}
                  onChange={(e) => setDuracionMinima(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Duración máxima (meses)</Label>
                <Input
                  type="number"
                  value={duracionMaxima}
                  onChange={(e) => setDuracionMaxima(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Advertencias */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Umbrales de Advertencia</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Advertencia contrato largo (meses)</Label>
                <Input
                  type="number"
                  value={advertenciaLargo}
                  onChange={(e) => setAdvertenciaLargo(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Advertencia si excede {advertenciaLargo} meses
                </p>
              </div>
              <div className="space-y-2">
                <Label>Advertencia contrato muy largo (meses)</Label>
                <Input
                  type="number"
                  value={advertenciaMuyLargo}
                  onChange={(e) => setAdvertenciaMuyLargo(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Advertencia fuerte si excede {advertenciaMuyLargo} meses
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
