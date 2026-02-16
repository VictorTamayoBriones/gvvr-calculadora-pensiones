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

export function CalculosPrestamoSection({ config, open, onToggle, onSave, onReset }: Props) {
  const [factor, setFactor] = useState(config.factorPrestamoMultiplicador)
  const [descuento, setDescuento] = useState(config.prestamoDescuento)
  const [tasa, setTasa] = useState(config.tasaRetencionPrestamo)
  const [meses, setMeses] = useState(config.mesesRetencionPrestamo)

  const handleSave = () => {
    onSave("calculosPrestamo", {
      factorPrestamoMultiplicador: factor,
      prestamoDescuento: descuento,
      tasaRetencionPrestamo: tasa,
      mesesRetencionPrestamo: meses,
    })
  }

  const handleReset = () => {
    onReset("calculosPrestamo")
    setTimeout(() => window.location.reload(), 100)
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <CardTitle className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Cálculos de Préstamo
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Factor multiplicador</Label>
              <Input
                type="number"
                value={factor}
                onChange={(e) => setFactor(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Descuento ($)</Label>
              <Input
                type="number"
                value={descuento}
                onChange={(e) => setDescuento(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Tasa de retención</Label>
              <Input
                type="number"
                step="0.01"
                value={tasa}
                onChange={(e) => setTasa(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                {(tasa * 100).toFixed(0)}%
              </p>
            </div>
            <div className="space-y-2">
              <Label>Meses de retención</Label>
              <Input
                type="number"
                value={meses}
                onChange={(e) => setMeses(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                {(meses / 12).toFixed(1)} años
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
