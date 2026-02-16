import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react"
import type { AdminConfig, ConfigSection } from "@/contexts/AdminConfigContext"

interface Props {
  config: AdminConfig
  open: boolean
  onToggle: () => void
  onSave: (section: ConfigSection, values: Partial<AdminConfig>) => void
  onReset: (section: ConfigSection) => void
}

export function TablaPensionesSection({ config, open, onToggle, onSave, onReset }: Props) {
  const [tabla, setTabla] = useState<Record<number, Record<number, number>>>(() =>
    JSON.parse(JSON.stringify(config.tablaPensiones))
  )

  const años = useMemo(() => Object.keys(tabla).map(Number).sort(), [tabla])
  const edades = useMemo(() => {
    if (años.length === 0) return []
    const firstYear = tabla[años[0]]
    return firstYear ? Object.keys(firstYear).map(Number).sort((a, b) => a - b) : []
  }, [tabla, años])

  const [selectedYear, setSelectedYear] = useState<number | null>(años[0] ?? null)

  const updateMonto = (año: number, edad: number, monto: number) => {
    setTabla((prev) => ({
      ...prev,
      [año]: { ...prev[año], [edad]: monto },
    }))
  }

  const setUniformAmount = (año: number, monto: number) => {
    setTabla((prev) => {
      const yearData = prev[año]
      if (!yearData) return prev
      const updated: Record<number, number> = {}
      for (const edad of Object.keys(yearData)) {
        updated[Number(edad)] = monto
      }
      return { ...prev, [año]: updated }
    })
  }

  const addYear = () => {
    const nextYear = años.length > 0 ? años[años.length - 1] + 1 : new Date().getFullYear()
    const defaultEdades: Record<number, number> = {}
    for (let e = 59; e <= 83; e++) {
      defaultEdades[e] = 0
    }
    setTabla((prev) => ({ ...prev, [nextYear]: defaultEdades }))
    setSelectedYear(nextYear)
  }

  const removeYear = (año: number) => {
    setTabla((prev) => {
      const next = { ...prev }
      delete next[año]
      return next
    })
    if (selectedYear === año) {
      setSelectedYear(años.find((a) => a !== año) ?? null)
    }
  }

  const handleSave = () => {
    onSave("tablaPensiones", { tablaPensiones: tabla })
  }

  const handleReset = () => {
    onReset("tablaPensiones")
    setTimeout(() => window.location.reload(), 100)
  }

  const selectedYearData = selectedYear != null ? tabla[selectedYear] : null

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <CardTitle className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Tabla de Pensiones
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Label>Año:</Label>
            {años.map((año) => (
              <div key={año} className="flex items-center gap-1">
                <Button
                  variant={selectedYear === año ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedYear(año)}
                >
                  {año}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeYear(año)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addYear}>
              <Plus className="h-4 w-4 mr-1" /> Agregar año
            </Button>
          </div>

          {selectedYear != null && selectedYearData && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label>Monto uniforme para {selectedYear}:</Label>
                <Input
                  type="number"
                  placeholder="Aplicar a todas las edades"
                  className="w-40"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = Number((e.target as HTMLInputElement).value)
                      if (val > 0) setUniformAmount(selectedYear, val)
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">Enter para aplicar</p>
              </div>

              <div className="border rounded-lg overflow-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2">Edad</th>
                      <th className="text-left p-2">Monto ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {edades.map((edad) => (
                      <tr key={edad} className="border-t">
                        <td className="p-2 font-medium">{edad} años</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={selectedYearData[edad] ?? 0}
                            onChange={(e) =>
                              updateMonto(selectedYear, edad, Number(e.target.value))
                            }
                            className="w-32"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave}>Guardar cambios</Button>
            <Button variant="outline" onClick={handleReset}>Restaurar defaults</Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
