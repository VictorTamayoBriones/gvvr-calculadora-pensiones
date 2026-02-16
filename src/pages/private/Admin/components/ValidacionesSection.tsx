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

  const handleSave = () => {
    onSave("validaciones", {
      minimoSemanasCotizadas: minimoSemanas,
      minimoSaldoAfore: minimoSaldo,
      edadMinimaMeses: edadMinima,
      edadMaximaReactivaF100: edadMaxima,
    })
  }

  const handleReset = () => {
    onReset("validaciones")
    // Refresh local state from defaults after reset
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
        <CardContent className="space-y-4">
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
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave}>Guardar cambios</Button>
            <Button variant="outline" onClick={handleReset}>Restaurar defaults</Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
