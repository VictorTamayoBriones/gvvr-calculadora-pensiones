import type { Modalidad } from "@/models"
import { getEdadesValidacion, getSemanasMinimas } from "@/utils/preciosAnuales"
import { getAdminConfig } from "@/contexts/AdminConfigContext"

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
 * Verifica edad mínima y semanas cotizadas según ley aplicable.
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
  const edades = getEdadesValidacion()
  const semanas = getSemanasMinimas()

  // Validación de ley aplicable — solo Ley 73 es elegible
  if (leyAplicable === "LEY_97") {
    errores.push(
      "Solo clientes bajo Ley 73 pueden acceder a este producto. " +
      "Los clientes bajo Ley 97 no son elegibles para la recuperación de derechos pensionarios."
    )
  }

  // Validación de edad (Documento REGLAS_NEGOCIO_CLIENTE.md)
  if (edad < edades.programa) {
    errores.push(`El cliente debe tener al menos ${edades.programa} años para participar en el programa`)
  } else if (edad < edades.pension) {
    advertencias.push(`El cliente aún no cumple ${edades.pension} años (edad mínima de pensión). Puede preparar su caso.`)
  } else if (edad >= Math.floor(getAdminConfig().edadMaximaReactivaF100 / 12) && modalidad === "REACTIVA FINANCIADO 100") {
    errores.push(`⚠️ RESTRICCIÓN: La modalidad Financiado 100% solo es viable para menores de ${Math.floor(getAdminConfig().edadMaximaReactivaF100 / 12)} años`)
  }

  // Validación de semanas según ley
  if (leyAplicable === "LEY_73" && semanasCotizadas < semanas.ley73) {
    errores.push(`No cumple con el mínimo de ${semanas.ley73.toLocaleString('es-MX')} semanas requeridas para LEY 73`)
  } else if (leyAplicable === "LEY_97" && semanasCotizadas < semanas.ley97) {
    errores.push(`No cumple con el mínimo de ${semanas.ley97.toLocaleString('es-MX')} semanas requeridas para LEY 97`)
  }

  return { advertencias, errores }
}
