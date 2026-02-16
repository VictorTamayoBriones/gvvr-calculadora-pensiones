/**
 * Cálculo del Impacto del Préstamo Financiero
 *
 * Funciones puras que calculan el impacto de un préstamo financiero
 * sobre la pensión mensual del cliente: retención del 30% durante 60 meses,
 * saldo a favor, y mensaje de aplicabilidad por modalidad.
 *
 * Basado en: calculo-prestamo-financiero.md
 */

import {
  getTasaRetencionPrestamo,
  getMesesRetencionPrestamo,
} from '@/pages/private/Calculator/Components/GenralData/constants';

// =====================================================
// TIPOS
// =====================================================

export interface ImpactoPension {
  tieneDescuento: boolean;
  descuentoMensual: number;
  pensionTemporal: number;
  pensionPlena: number;
  mesesRetencion: number;
  tasaRetencion: number;
}

export interface ResultadoImpactoPrestamo {
  impactoPension: ImpactoPension;
  saldoAFavor: number;
  mensajeAplicabilidad: string;
}

// =====================================================
// FUNCIONES PURAS
// =====================================================

/**
 * Calcula el impacto del préstamo sobre la pensión mensual.
 *
 * Si el préstamo > 0, se aplica una retención del 30% sobre la pensión
 * durante 60 meses (5 años). Después de ese periodo, el cliente recibe
 * la pensión plena.
 *
 * @param pensionMensual - Monto de pensión mensual estimada
 * @param prestamoCapturado - Monto del préstamo financiero capturado
 * @returns Detalles del impacto sobre la pensión
 */
export function calcularImpactoPrestamo(
  pensionMensual: number,
  prestamoCapturado: number
): ImpactoPension {
  if (prestamoCapturado <= 0 || pensionMensual <= 0) {
    return {
      tieneDescuento: false,
      descuentoMensual: 0,
      pensionTemporal: pensionMensual,
      pensionPlena: pensionMensual,
      mesesRetencion: 0,
      tasaRetencion: 0,
    };
  }

  const descuentoMensual = pensionMensual * getTasaRetencionPrestamo();
  const pensionTemporal = pensionMensual - descuentoMensual;

  return {
    tieneDescuento: true,
    descuentoMensual,
    pensionTemporal,
    pensionPlena: pensionMensual,
    mesesRetencion: getMesesRetencionPrestamo(),
    tasaRetencion: getTasaRetencionPrestamo(),
  };
}

/**
 * Calcula el saldo a favor del cliente.
 *
 * Si el monto total para invertir (ya calculado por useMontoTotal respetando
 * usaAforeEnModalidad) supera el costo total del trámite, la diferencia
 * queda como saldo a favor.
 *
 * @param montoTotalInvertir - Monto total disponible para invertir
 * @param costoTotal - Costo total del trámite (pagos + gestoría)
 * @returns Saldo a favor (nunca negativo)
 */
export function calcularSaldoAFavor(
  montoTotalInvertir: number,
  costoTotal: number
): number {
  return Math.max(0, montoTotalInvertir - costoTotal);
}

/**
 * Determina el mensaje de aplicabilidad según la comparación
 * entre el monto disponible y el costo total.
 *
 * - Si monto < costo: "SOLO APLICA PARA MOD 1 RETOMA"
 * - Si monto > costo: "APLICA PARA CUALQUIER MODALIDAD"
 * - Si son iguales: cadena vacía
 *
 * @param montoTotalInvertir - Monto total disponible para invertir
 * @param costoTotal - Costo total del trámite
 * @returns Mensaje de aplicabilidad o cadena vacía
 */
export function obtenerMensajeAplicabilidad(
  montoTotalInvertir: number,
  costoTotal: number
): string {
  if (montoTotalInvertir < costoTotal) {
    return 'SOLO APLICA PARA MOD 1 RETOMA';
  }
  if (montoTotalInvertir > costoTotal) {
    return 'APLICA PARA CUALQUIER MODALIDAD';
  }
  return '';
}
