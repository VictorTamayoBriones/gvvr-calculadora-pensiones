import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react"
import type { AdminConfig, ConfigSection } from "@/contexts/AdminConfigContext"
import type { PrecioPrimerMes } from "@/utils/preciosAnuales"

interface Props {
  config: AdminConfig
  open: boolean
  onToggle: () => void
  onSave: (section: ConfigSection, values: Partial<AdminConfig>) => void
  onReset: (section: ConfigSection) => void
}

export function PreciosPrimerMesSection({ config, open, onToggle, onSave, onReset }: Props) {
  const [precios, setPrecios] = useState<PrecioPrimerMes[]>([...config.preciosPrimerMes])

  const addRow = () => {
    setPrecios([...precios, { fechaInicio: "01/01", fechaFin: "01/31", precio: 0 }])
  }

  const removeRow = (index: number) => {
    setPrecios(precios.filter((_, i) => i !== index))
  }

  const updateRow = (index: number, field: keyof PrecioPrimerMes, value: string | number) => {
    const updated = [...precios]
    updated[index] = { ...updated[index], [field]: value }
    setPrecios(updated)
  }

  const handleSave = () => {
    onSave("preciosPrimerMes", { preciosPrimerMes: precios })
  }

  const handleReset = () => {
    onReset("preciosPrimerMes")
    setTimeout(() => window.location.reload(), 100)
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <CardTitle className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Precios Primer Mes
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Rangos de fecha y precios del primer mes</Label>
            <p className="text-xs text-muted-foreground">Formato de fecha: MM/DD</p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2">Fecha inicio</th>
                    <th className="text-left p-2">Fecha fin</th>
                    <th className="text-left p-2">Precio ($)</th>
                    <th className="w-10 p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {precios.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">
                        <Input
                          value={row.fechaInicio}
                          onChange={(e) => updateRow(i, "fechaInicio", e.target.value)}
                          className="w-24"
                          placeholder="MM/DD"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.fechaFin}
                          onChange={(e) => updateRow(i, "fechaFin", e.target.value)}
                          className="w-24"
                          placeholder="MM/DD"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={row.precio}
                          onChange={(e) => updateRow(i, "precio", Number(e.target.value))}
                          className="w-28"
                        />
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(i)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="outline" size="sm" onClick={addRow}>
              <Plus className="h-4 w-4 mr-1" /> Agregar rango
            </Button>
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
