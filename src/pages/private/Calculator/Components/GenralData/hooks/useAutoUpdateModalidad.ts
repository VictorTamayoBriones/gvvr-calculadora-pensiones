import { useEffect } from "react"
import type { GeneralDataForm } from "@/models"
import type { ModalidadesDisponibles } from "../utils/modalidadCalculations"

// ---------------------------------------------------------------------------
// Hook: Auto-update modalidad when options change
// ---------------------------------------------------------------------------
export function useAutoUpdateModalidad(
  modalidadesDisponibles: ModalidadesDisponibles,
  generalData: GeneralDataForm,
  setGeneralData: (data: GeneralDataForm) => void
) {
  useEffect(() => {
    // Solo actualizar si hay una modalidad sugerida
    if (!modalidadesDisponibles.modalidadSugerida) return

    // Verificar si la modalidad actual es válida en las opciones disponibles
    const esModalidadValida = modalidadesDisponibles.opciones.includes(
      generalData.modalidad
    )

    // Si la modalidad actual no es válida, actualizar a la sugerida
    if (
      !esModalidadValida &&
      modalidadesDisponibles.modalidadSugerida !== generalData.modalidad
    ) {
      setGeneralData({
        ...generalData,
        modalidad: modalidadesDisponibles.modalidadSugerida,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalidadesDisponibles.modalidadSugerida, modalidadesDisponibles.opciones.length])
}
