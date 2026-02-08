import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertMessage } from "./AlertMessage"
import { ModalidadSelector } from "./ModalidadSelector"
import { useModalidad } from "./useModalidad"
import type { Modalidad } from "@/models"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ModalidadSectionProps {
  curp: string
  saldoAfore: string
  modalidad: Modalidad
  onChange: (field: string, value: string) => void
  onValidationReady?: (validate: () => boolean) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ModalidadSection({
  curp,
  saldoAfore,
  modalidad,
  onChange,
  onValidationReady,
}: ModalidadSectionProps) {
  const { modalidadesDisponibles, handleModalidadChange } = useModalidad({
    curp,
    saldoAfore,
    modalidad,
    onChange,
    onValidationReady,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modalidad de Financiamiento</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Mensaje de edad/error si aplica */}
        {modalidadesDisponibles.mensajeEdad && (
          <AlertMessage
            message={modalidadesDisponibles.mensajeEdad}
            variant={
              modalidadesDisponibles.esRechazo
                ? "error"
                : modalidadesDisponibles.esError
                  ? "info"
                  : "warning"
            }
          />
        )}

        {/* Mensaje de requerimiento de datos */}
        {modalidadesDisponibles.requiereDatos &&
          modalidadesDisponibles.mensajeRequerimiento && (
            <AlertMessage
              message={modalidadesDisponibles.mensajeRequerimiento}
              variant="required"
            />
          )}

        {/* Selector de modalidad */}
        {modalidadesDisponibles.opciones.length > 0 && (
          <ModalidadSelector
            modalidad={modalidad}
            opciones={modalidadesDisponibles.opciones}
            descripcionOpciones={modalidadesDisponibles.descripcionOpciones}
            esInsuficiente={modalidadesDisponibles.esInsuficiente}
            onModalidadChange={handleModalidadChange}
          />
        )}
      </CardContent>
    </Card>
  )
}
