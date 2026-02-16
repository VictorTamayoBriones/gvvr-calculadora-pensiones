import type { Modalidad } from "@/models"

interface DatosCliente {
  edad: number
  semanasCotizadas: number
  leyAplicable: "LEY_73" | "LEY_97" | ""
  modalidad: Modalidad
}

interface ResultadoValidacionCliente {
  errores: string[]
  advertencias: string[]
}

/**
 * Valida los datos del cliente para elegibilidad de pensión.
 * Verifica edad mínima (55 años) y semanas cotizadas según ley aplicable.
 *
 * @returns Errores y advertencias encontrados en la validación
 */
export function validarCliente({
  edad,
  semanasCotizadas,
  leyAplicable,
  modalidad,
}: DatosCliente): ResultadoValidacionCliente {
  const advertencias: string[] = []
  const errores: string[] = []

  // Validación de ley aplicable — solo Ley 73 es elegible
  if (leyAplicable === "LEY_97") {
    errores.push(
      "Solo clientes bajo Ley 73 pueden acceder a este producto. " +
      "Los clientes bajo Ley 97 no son elegibles para la recuperación de derechos pensionarios."
    )
  }

  // Validación de edad (Documento REGLAS_NEGOCIO_CLIENTE.md)
  if (edad < 55) {
    errores.push("El cliente debe tener al menos 55 años para participar en el programa")
  } else if (edad < 60) {
    advertencias.push("El cliente aún no cumple 60 años (edad mínima de pensión). Puede preparar su caso.")
  } else if (edad >= 68 && modalidad === "REACTIVA FINANCIADO 100") {
    errores.push("⚠️ RESTRICCIÓN: La modalidad Financiado 100% solo es viable para menores de 68 años")
  }

  // Validación de semanas según ley
  if (leyAplicable === "LEY_73" && semanasCotizadas < 500) {
    errores.push("No cumple con el mínimo de 500 semanas requeridas para LEY 73")
  } else if (leyAplicable === "LEY_97" && semanasCotizadas < 1250) {
    errores.push("No cumple con el mínimo de 1,250 semanas requeridas para LEY 97")
  }

  return { advertencias, errores }
}
