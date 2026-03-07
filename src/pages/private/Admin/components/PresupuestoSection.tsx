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

const MODALIDADES = [
  "REACTIVA TRADICIONAL",
  "FINANCIADO 1",
  "FINANCIADO 100",
  "REACTIVA FINANCIADO 100",
] as const

export function PresupuestoSection({ config, open, onToggle, onSave, onReset }: Props) {
  const [presupuesto, setPresupuesto] = useState<Record<string, number>>({
    ...config.presupuestoMinimo,
  })

  const updateModalidad = (modalidad: string, value: number) => {
    setPresupuesto((prev) => ({ ...prev, [modalidad]: value }))
  }

  const handleSave = () => {
    onSave("presupuesto", {
      presupuestoMinimo: presupuesto,
    })
  }

  const handleReset = () => {
    onReset("presupuesto")
    setTimeout(() => window.location.reload(), 100)
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <CardTitle className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Presupuesto Mínimo por Modalidad
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          <Label>Monto mínimo requerido por modalidad ($)</Label>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2">Modalidad</th>
                  <th className="text-left p-2">Mínimo ($)</th>
                </tr>
              </thead>
              <tbody>
                {MODALIDADES.map((modalidad) => (
                  <tr key={modalidad} className="border-t">
                    <td className="p-2 text-sm">{modalidad}</td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={presupuesto[modalidad] ?? 0}
                        onChange={(e) => updateModalidad(modalidad, Number(e.target.value))}
                        className="w-32"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Valor 0 significa sin requisito de presupuesto mínimo.
          </p>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave}>Guardar cambios</Button>
            <Button variant="outline" onClick={handleReset}>Restaurar defaults</Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
