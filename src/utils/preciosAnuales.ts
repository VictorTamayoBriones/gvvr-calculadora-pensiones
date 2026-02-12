/**
 * Constantes de precios de dominio compartidas.
 * Usadas por lineaTiempoRetoma.ts y calculoCostoTotal.ts.
 */

export interface PrecioAnual {
  anio: number;
  precio: number;
}

export interface PrecioPrimerMes {
  fechaInicio: string; // 'MM/DD' formato
  fechaFin: string;
  precio: number;
}

/**
 * Precios anuales para meses posteriores al primero
 * RN-RETOMA-002
 */
export const PRECIOS_ANUALES: PrecioAnual[] = [
  { anio: 2023, precio: 2200 },
  { anio: 2024, precio: 2400 },
  { anio: 2025, precio: 2650 },
  { anio: 2026, precio: 3200 },
  { anio: 2027, precio: 3950 },
  { anio: 2028, precio: 4700 },
];

/**
 * Precios del primer mes según fecha actual
 * RN-RETOMA-003
 *
 * IMPORTANTE: Evaluar en orden DESCENDENTE (más reciente primero)
 * para evitar el bug del Excel que siempre devuelve el primer valor
 */
export const PRECIOS_PRIMER_MES: PrecioPrimerMes[] = [
  { fechaInicio: '11/16', fechaFin: '12/31', precio: 4650 },
  { fechaInicio: '09/16', fechaFin: '11/15', precio: 4400 },
  { fechaInicio: '07/16', fechaFin: '09/15', precio: 4150 },
  { fechaInicio: '05/16', fechaFin: '07/15', precio: 3900 },
  { fechaInicio: '03/16', fechaFin: '05/15', precio: 3700 },
  { fechaInicio: '01/01', fechaFin: '03/15', precio: 3500 },
];

/**
 * Monto de gestoría fijo para 14 meses
 * RN-GEST-001: Para 14 meses se usa tarifa fija
 */
export const GESTORIA_FIJA_14_MESES = 18000;

/**
 * Tabla de pagos mensuales de gestoría para duraciones ≠ 14 meses
 * RN-GEST-002: Gestoría variable = Pago Mensual × Número de Meses
 *
 * Nota: Para RETOMA (MOD 1), el pago mensual es el mismo que PRECIOS_ANUALES
 */
export const PAGO_MENSUAL_GESTORIA_RETOMA: Record<number, number> = {
  2023: 2200,
  2024: 2400,
  2025: 2650,
  2026: 3200,
  2027: 3950,
  2028: 4700,
};
