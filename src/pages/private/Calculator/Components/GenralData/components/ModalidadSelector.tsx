import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HelpCircle, AlertCircle } from "lucide-react"
import type { Modalidad } from "@/models"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ModalidadSelectorProps {
  modalidad: Modalidad
  opciones: Modalidad[]
  descripcionOpciones?: Record<string, string>
  esInsuficiente?: boolean
  onModalidadChange: (value: string) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ModalidadSelector({
  modalidad,
  opciones,
  descripcionOpciones,
  esInsuficiente,
  onModalidadChange,
}: ModalidadSelectorProps) {
  return (
    <FieldGroup>
      <Field>
        <div className="flex items-center gap-1.5">
          <FieldLabel htmlFor="modalidad">Modalidad Seleccionada</FieldLabel>
          <Tooltip>
            <TooltipTrigger
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="font-medium mb-1">Tipo de financiamiento disponible</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>Las opciones se calculan automáticamente según:</li>
                <li>• Edad del prospecto (extraída del CURP)</li>
                <li>• Saldo AFORE disponible</li>
                <li>• Capacidad de préstamo calculada</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Badge de advertencia si es insuficiente */}
        {esInsuficiente && (
          <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-500 dark:border-amber-500/50 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Los fondos disponibles son insuficientes. Se requiere aporte adicional o
              negociar préstamo mayor.
            </p>
          </div>
        )}

        {/* Selector */}
        <Select value={modalidad} onValueChange={onModalidadChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una modalidad" />
          </SelectTrigger>
          <SelectContent>
            {opciones.map((opcion, index) => (
              <SelectItem key={opcion} value={opcion}>
                <div className="flex items-center gap-2">
                  {index === 0 && <span className="text-amber-500">⭐</span>}
                  <span>{opcion}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Descripción dinámica con estado */}
        {(() => {
          if (!modalidad || !descripcionOpciones) return null
          const descripcion = (
            descripcionOpciones as unknown as Record<string, string>
          )[modalidad]
          if (!descripcion) return null
          return (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                {descripcion}
              </p>
            </div>
          )
        })()}
      </Field>

      {/* Descripción detallada de la modalidad seleccionada */}
      {modalidad && (
        <div className="rounded-lg border bg-muted/50 p-4 mt-2">
          <p className="text-xs text-muted-foreground mb-1">
            Descripción del Financiamiento
          </p>
          <p className="text-sm">
            {modalidad === "FINANCIADO 1" &&
              "Financiamiento parcial - El cliente necesita aportar fondos adicionales."}
            {modalidad === "FINANCIADO 100" &&
              "Financiamiento total - Grupo Avivir cubre el 100% (inscripción + mensualidades + gestoría)."}
            {modalidad === "REACTIVA TRADICIONAL" &&
              "El cliente esta obligado a pagar su inscripcion y meses de contratacion, solo GRUPO A VIVIR financiara la GESTION."}
            {modalidad === "REACTIVA FINANCIADO 100" &&
              "GRUPO A VIVIR financiara el 100% de la inscripcion, pagos mensuales y la gestion."}
          </p>
        </div>
      )}

      {/* Indicador de múltiples opciones */}
      {opciones.length > 1 && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-xs text-green-800 dark:text-green-300 flex items-start gap-2">
            <span className="text-base">✓</span>
            <span>
              Tiene {opciones.length} opciones disponibles. La opción marcada con ⭐ es la
              recomendada según su perfil.
            </span>
          </p>
        </div>
      )}
    </FieldGroup>
  )
}
