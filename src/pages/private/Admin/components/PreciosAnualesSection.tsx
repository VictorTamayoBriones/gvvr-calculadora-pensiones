import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react"
import type { AdminConfig, ConfigSection } from "@/contexts/AdminConfigContext"
import type { PrecioAnual } from "@/utils/preciosAnuales"

interface Props {
  config: AdminConfig
  open: boolean
  onToggle: () => void
  onSave: (section: ConfigSection, values: Partial<AdminConfig>) => void
  onReset: (section: ConfigSection) => void
}

export function PreciosAnualesSection({ config, open, onToggle, onSave, onReset }: Props) {
  const [precios, setPrecios] = useState<PrecioAnual[]>([...config.preciosAnuales])
  const [gestoriaRetoma, setGestoriaRetoma] = useState<Record<number, number>>({
    ...config.pagoMensualGestoriaRetoma,
  })

  const addRow = () => {
    const lastYear = precios.length > 0 ? precios[precios.length - 1].anio + 1 : new Date().getFullYear()
    setPrecios([...precios, { anio: lastYear, precio: 0 }])
  }

  const removeRow = (index: number) => {
    setPrecios(precios.filter((_, i) => i !== index))
  }

  const updateRow = (index: number, field: keyof PrecioAnual, value: number) => {
    const updated = [...precios]
    updated[index] = { ...updated[index], [field]: value }
    setPrecios(updated)
  }

  const handleSave = () => {
    // Sync gestoriaRetoma with precios (same year -> same price by default)
    const newGestoria: Record<number, number> = {}
    for (const p of precios) {
      newGestoria[p.anio] = gestoriaRetoma[p.anio] ?? p.precio
    }
    onSave("preciosAnuales", {
      preciosAnuales: precios,
      pagoMensualGestoriaRetoma: newGestoria,
    })
  }

  const handleReset = () => {
    onReset("preciosAnuales")
    setTimeout(() => window.location.reload(), 100)
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <CardTitle className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Precios Anuales
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Precios por año (meses posteriores al primero)</Label>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2">Año</th>
                    <th className="text-left p-2">Precio ($)</th>
                    <th className="text-left p-2">Gestoría Retoma ($)</th>
                    <th className="w-10 p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {precios.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">
                        <Input
                          type="number"
                          value={row.anio}
                          onChange={(e) => updateRow(i, "anio", Number(e.target.value))}
                          className="w-24"
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
                        <Input
                          type="number"
                          value={gestoriaRetoma[row.anio] ?? row.precio}
                          onChange={(e) =>
                            setGestoriaRetoma({ ...gestoriaRetoma, [row.anio]: Number(e.target.value) })
                          }
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
              <Plus className="h-4 w-4 mr-1" /> Agregar año
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
