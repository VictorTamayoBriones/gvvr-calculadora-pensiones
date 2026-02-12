/**
 * Cálculo del Costo Total del Trámite
 *
 * Función pura que calcula el costo total sumando pagos mensuales
 * (según tabla de precios anuales) + gestoría.
 *
 * Basado en: reglas-modalidad-C17.md sección 6
 */

import {
  PRECIOS_ANUALES,
  PRECIOS_PRIMER_MES,
  GESTORIA_FIJA_14_MESES,
  PAGO_MENSUAL_GESTORIA_RETOMA,
} from '@/utils/preciosAnuales';

export interface ResultadoCostoTotal {
  costoTotal: number;
  duracionMeses: number;
  totalPagos: number;
  gestoria: number;
}

/**
 * Calcula la diferencia en meses entre dos fechas
 */
function diffEnMeses(fechaInicio: Date, fechaFin: Date): number {
  const añosDiff = fechaFin.getFullYear() - fechaInicio.getFullYear();
  const mesesDiff = fechaFin.getMonth() - fechaInicio.getMonth();
  return añosDiff * 12 + mesesDiff;
}

/**
 * Convierte fecha a formato MM/DD para comparación con rangos
 */
function fechaToMMDD(fecha: Date): string {
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  return `${mes}/${dia}`;
}

/**
 * Compara si una fecha MM/DD está dentro de un rango
 */
function estaDentroDeRango(fechaMMDD: string, inicio: string, fin: string): boolean {
  const fecha = parseInt(fechaMMDD.replace('/', ''));
  const rangoInicio = parseInt(inicio.replace('/', ''));
  const rangoFin = parseInt(fin.replace('/', ''));

  if (rangoInicio > rangoFin) {
    return fecha >= rangoInicio || fecha <= rangoFin;
  }

  return fecha >= rangoInicio && fecha <= rangoFin;
}

/**
 * Calcula el precio del primer mes según la fecha actual
 */
function calcularPrecioPrimerMes(): number {
  const hoy = new Date();
  const hoyMMDD = fechaToMMDD(hoy);

  for (let i = PRECIOS_PRIMER_MES.length - 1; i >= 0; i--) {
    const rango = PRECIOS_PRIMER_MES[i];
    if (estaDentroDeRango(hoyMMDD, rango.fechaInicio, rango.fechaFin)) {
      return rango.precio;
    }
  }

  return 3500;
}

/**
 * Calcula el precio de un mes según su año
 */
function calcularPrecioMes(anio: number): number | null {
  const precioAnual = PRECIOS_ANUALES.find((p) => p.anio === anio);
  return precioAnual ? precioAnual.precio : null;
}

/**
 * Genera la secuencia de meses para el contrato.
 * - Primer mes: fechaInicio + 16 días
 * - Meses siguientes: +30 días cada uno
 */
function generarSecuenciaMeses(fechaInicio: Date, duracionMeses: number): { anio: number }[] {
  const secuencia: { anio: number }[] = [];

  let fechaActual = new Date(fechaInicio);
  fechaActual.setDate(fechaActual.getDate() + 16);
  secuencia.push({ anio: fechaActual.getFullYear() });

  for (let i = 1; i < duracionMeses; i++) {
    fechaActual = new Date(fechaActual);
    fechaActual.setDate(fechaActual.getDate() + 30);
    secuencia.push({ anio: fechaActual.getFullYear() });
  }

  return secuencia;
}

/**
 * Calcula el costo total del trámite basado en las fechas del contrato.
 *
 * @param fechaInicioContrato - Fecha de inicio del contrato (ISO string)
 * @param fechaFinContrato - Fecha de fin del contrato (ISO string)
 * @returns Resultado con costoTotal, duracionMeses, totalPagos y gestoria, o null si datos inválidos
 */
export function calcularCostoTotalTramite(
  fechaInicioContrato: string,
  fechaFinContrato: string
): ResultadoCostoTotal | null {
  if (!fechaInicioContrato || !fechaFinContrato) {
    return null;
  }

  const fechaInicio = new Date(fechaInicioContrato);
  const fechaFin = new Date(fechaFinContrato);

  if (fechaFin <= fechaInicio) {
    return null;
  }

  const duracionMeses = diffEnMeses(fechaInicio, fechaFin);

  if (duracionMeses < 14 || duracionMeses > 18) {
    return null;
  }

  // Generate month sequence and calculate prices
  const secuencia = generarSecuenciaMeses(fechaInicio, duracionMeses);

  // First month - special price based on current date
  const precioPrimerMes = calcularPrecioPrimerMes();
  let totalPagos = precioPrimerMes;

  // Subsequent months - price based on year
  for (let i = 1; i < secuencia.length; i++) {
    const precio = calcularPrecioMes(secuencia[i].anio);
    if (precio === null) {
      return null;
    }
    totalPagos += precio;
  }

  // Calculate gestoría
  let gestoria: number;
  if (duracionMeses === 14) {
    gestoria = GESTORIA_FIJA_14_MESES;
  } else {
    const añoInicio = fechaInicio.getFullYear();
    const pagoMensualGestoria = PAGO_MENSUAL_GESTORIA_RETOMA[añoInicio];
    if (!pagoMensualGestoria) {
      return null;
    }
    gestoria = pagoMensualGestoria * duracionMeses;
  }

  return {
    costoTotal: totalPagos + gestoria,
    duracionMeses,
    totalPagos,
    gestoria,
  };
}
