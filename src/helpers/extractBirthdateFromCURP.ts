/**
 * Extrae la fecha de nacimiento de un CURP válido
 *
 * Formato del CURP (posiciones 5-10): AAMMDD
 * - AA: Año (2 dígitos) - Posiciones 4-5
 * - MM: Mes (2 dígitos) - Posiciones 6-7
 * - DD: Día (2 dígitos) - Posiciones 8-9
 *
 * Nota: Para determinar el siglo (1900 vs 2000), se usa una heurística:
 * - Si el año >= 50, se asume 19XX (1950-1999)
 * - Si el año < 50, se asume 20XX (2000-2049)
 *
 * @param curp - String del CURP (debe tener 18 caracteres)
 * @returns Date object con la fecha de nacimiento o null si es inválido
 */
export const extractBirthdateFromCURP = (curp: string): Date | null => {
  if (!curp || typeof curp !== 'string') {
    return null
  }

  const curpTrimmed = curp.trim()

  // Validar longitud
  if (curpTrimmed.length !== 18) {
    return null
  }

  try {
    // Extraer componentes de fecha (substring es 0-indexed)
    const yearStr = curpTrimmed.substring(4, 6)    // Posiciones 5-6 en formato 1-indexed
    const monthStr = curpTrimmed.substring(6, 8)   // Posiciones 7-8
    const dayStr = curpTrimmed.substring(8, 10)    // Posiciones 9-10

    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10)
    const day = parseInt(dayStr, 10)

    // Validar que sean números válidos
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return null
    }

    // Determinar el siglo usando heurística
    const fullYear = year >= 50 ? 1900 + year : 2000 + year

    // Crear fecha (mes es 0-indexed en JavaScript Date)
    const birthdate = new Date(fullYear, month - 1, day)

    // Validar que la fecha sea válida (JavaScript corrige fechas inválidas automáticamente)
    if (
      birthdate.getFullYear() !== fullYear ||
      birthdate.getMonth() !== month - 1 ||
      birthdate.getDate() !== day
    ) {
      return null
    }

    return birthdate
  } catch {
    return null
  }
}

/**
 * Calcula la edad en meses desde una fecha de nacimiento hasta hoy
 *
 * @param birthdate - Fecha de nacimiento
 * @returns Número de meses de edad
 */
export const calculateAgeInMonths = (birthdate: Date): number => {
  const today = new Date()
  const years = today.getFullYear() - birthdate.getFullYear()
  const months = today.getMonth() - birthdate.getMonth()
  return (years * 12) + months
}

/**
 * Extrae la edad en meses directamente desde un CURP
 *
 * @param curp - String del CURP
 * @returns Número de meses de edad o null si el CURP es inválido
 */
export const getAgeInMonthsFromCURP = (curp: string): number | null => {
  const birthdate = extractBirthdateFromCURP(curp)
  if (!birthdate) {
    return null
  }
  return calculateAgeInMonths(birthdate)
}
