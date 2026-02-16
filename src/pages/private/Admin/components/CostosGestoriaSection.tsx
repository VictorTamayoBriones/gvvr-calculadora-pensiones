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

export function CostosGestoriaSection({ config, open, onToggle, onSave, onReset }: Props) {
  const [costoGestoria, setCostoGestoria] = useState(config.costoGestoria)
  const [gestoriaFija, setGestoriaFija] = useState(config.gestoriaFija14Meses)

  const handleSave = () => {
    onSave("costosGestoria", {
      costoGestoria,
      gestoriaFija14Meses: gestoriaFija,
    })
  }

  const handleReset = () => {
    onReset("costosGestoria")
    setTimeout(() => window.location.reload(), 100)
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <CardTitle className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Costos y Gestoría
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Costo gestoría ($)</Label>
              <Input
                type="number"
                value={costoGestoria}
                onChange={(e) => setCostoGestoria(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Gestoría fija 14 meses ($)</Label>
              <Input
                type="number"
                value={gestoriaFija}
                onChange={(e) => setGestoriaFija(Number(e.target.value))}
              />
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
