/**
 * Tabla de Montos de Pensión Mensual
 *
 * Estructura: TABLA_PENSIONES[año][edad] = monto
 *
 * Fuente: Tabla oficial de pensiones mínimas del IMSS
 * Actualizada: 2026-02-06
 *
 * Reglas:
 * - Año 2023: Montos diferenciados por edad (60-64 vs 65+)
 * - Año 2024: Montos diferenciados por edad (60-64 vs 65+)
 * - Años 2025+: Monto único para todas las edades (60-83)
 * - Edades soportadas: 60 a 83 años
 */

export const TABLA_PENSIONES: Record<number, Record<number, number>> = {
  // Año 2023 - Montos diferenciados por edad
  2023: {
    60: 7003.00,
    61: 7003.00,
    62: 7003.00,
    63: 7003.00,
    64: 7003.00,
    65: 7003.00,
    66: 7003.00,
    67: 7003.00,
    68: 7003.00,
    69: 7003.00,
    70: 7003.00,
    71: 7003.00,
    72: 7003.00,
    73: 7003.00,
    74: 7003.00,
    75: 7003.00,
    76: 7003.00,
    77: 7003.00,
    78: 7003.00,
    79: 7003.00,
    80: 6652.85,
    81: 6302.70,
    82: 5952.55,
    83: 5602.40,
  },

  // Año 2024 - Montos diferenciados por edad
  2024: {
    60: 8400.00,
    61: 8400.00,
    62: 8400.00,
    63: 8400.00,
    64: 8400.00,
    65: 8400.00,
    66: 8400.00,
    67: 8400.00,
    68: 8400.00,
    69: 8400.00,
    70: 8400.00,
    71: 8400.00,
    72: 8400.00,
    73: 8400.00,
    74: 8400.00,
    75: 8400.00,
    76: 8400.00,
    77: 8400.00,
    78: 8400.00,
    79: 8400.00,
    80: 8400.00,
    81: 8400.00,
    82: 8400.00,
    83: 5252.25,
  },

  // Año 2025 - Monto único para todas las edades
  2025: {
    60: 9400.00,
    61: 9400.00,
    62: 9400.00,
    63: 9400.00,
    64: 9400.00,
    65: 9400.00,
    66: 9400.00,
    67: 9400.00,
    68: 9400.00,
    69: 9400.00,
    70: 9400.00,
    71: 9400.00,
    72: 9400.00,
    73: 9400.00,
    74: 9400.00,
    75: 9400.00,
    76: 9400.00,
    77: 9400.00,
    78: 9400.00,
    79: 9400.00,
    80: 9400.00,
    81: 9400.00,
    82: 9400.00,
    83: 9400.00,
  },

  // Año 2026 - Monto único para todas las edades
  2026: {
    60: 10100.00,
    61: 10100.00,
    62: 10100.00,
    63: 10100.00,
    64: 10100.00,
    65: 10100.00,
    66: 10100.00,
    67: 10100.00,
    68: 10100.00,
    69: 10100.00,
    70: 10100.00,
    71: 10100.00,
    72: 10100.00,
    73: 10100.00,
    74: 10100.00,
    75: 10100.00,
    76: 10100.00,
    77: 10100.00,
    78: 10100.00,
    79: 10100.00,
    80: 10100.00,
    81: 10100.00,
    82: 10100.00,
    83: 10100.00,
  },

  // Año 2027 - Monto único para todas las edades
  2027: {
    60: 10900.00,
    61: 10900.00,
    62: 10900.00,
    63: 10900.00,
    64: 10900.00,
    65: 10900.00,
    66: 10900.00,
    67: 10900.00,
    68: 10900.00,
    69: 10900.00,
    70: 10900.00,
    71: 10900.00,
    72: 10900.00,
    73: 10900.00,
    74: 10900.00,
    75: 10900.00,
    76: 10900.00,
    77: 10900.00,
    78: 10900.00,
    79: 10900.00,
    80: 10900.00,
    81: 10900.00,
    82: 10900.00,
    83: 10900.00,
  },
};

/**
 * Obtiene los años disponibles en la tabla
 */
export function getAñosDisponibles(): number[] {
  return Object.keys(TABLA_PENSIONES).map(Number).sort();
}

/**
 * Verifica si un año está disponible en la tabla
 */
export function esAñoDisponible(año: number): boolean {
  return año in TABLA_PENSIONES;
}

/**
 * Obtiene el rango de edades soportado
 */
export function getRangoEdades(): { min: number; max: number } {
  return { min: 60, max: 83 };
}
