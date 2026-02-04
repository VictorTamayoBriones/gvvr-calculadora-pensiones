/**
 * Valida el formato de un CURP (Clave Única de Registro de Población)
 *
 * Formato del CURP (18 caracteres):
 * - Posiciones 1-4: Letra inicial y vocal interna del primer apellido,
 *                   letra inicial del segundo apellido y primera letra del nombre
 * - Posiciones 5-10: Fecha de nacimiento (AAMMDD)
 * - Posición 11: Sexo (H/M)
 * - Posiciones 12-13: Estado de nacimiento (código de 2 letras)
 * - Posiciones 14-16: Consonantes internas de apellidos y nombre
 * - Posiciones 17-18: Homoclave (alfanumérica)
 *
 * Ejemplo: TABV000622HTLMRCA0
 *
 * @param curp - String del CURP a validar
 * @returns true si el CURP tiene formato válido, false en caso contrario
 */
export const verifyCURP = (curp: string): boolean => {
  if (!curp || typeof curp !== 'string') {
    return false
  }

  // Convertir a mayúsculas para validación consistente
  const curpUpperCase = curp.trim().toUpperCase()

  // Expresión regular para validar formato CURP
  // [A-Z]{4} - 4 letras iniciales (apellidos y nombre)
  // \d{6} - 6 dígitos de fecha (AAMMDD)
  // [HM] - Sexo (H o M)
  // [A-Z]{2} - 2 letras del estado
  // [B-DF-HJ-NP-TV-Z]{3} - 3 consonantes (excluye vocales y Ñ)
  // [A-Z0-9]{2} - Homoclave (2 caracteres alfanuméricos)
  const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]{2}$/

  if (!curpRegex.test(curpUpperCase)) {
    return false
  }

  // Validación adicional de fecha
  const month = parseInt(curpUpperCase.substring(6, 8), 10)
  const day = parseInt(curpUpperCase.substring(8, 10), 10)

  // Validar mes (01-12)
  if (month < 1 || month > 12) {
    return false
  }

  // Validar día (01-31)
  if (day < 1 || day > 31) {
    return false
  }

  // Validación básica de días por mes
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (day > daysInMonth[month - 1]) {
    return false
  }

  return true
}