/**
 * LÍNEA DE TIEMPO - MODALIDAD FINANCIADO 100 (F100 / F100+)
 *
 * Implementación de las reglas de negocio para el cálculo de la tabla
 * de pagos mensuales en la modalidad FINANCIADO 100.
 *
 * Basado en: 02_REGLAS_OPERACIONES_COSTO_MENSUAL.md
 *
 * - Todos los costos base = tarifaAnual × 2
 * - Cargo F100+ = $4,850 fijo sumado a cada mes
 * - Primer mes: tarifa especial por umbral de año × 2
 * - Meses subsiguientes: TARIFAS_ANUALES[año] × 2
 * - Secuencia de meses: +16 días / +30 días (igual que RETOMA)
 */

import {
  getPreciosAnuales,
  getCargoFijoF100Plus,
  getTarifasPrimerMesF100,
  getGestoriaF100,
  getGestoriaFija14Meses,
  getDuracionContrato,
} from '@/utils/preciosAnuales';
import { formatMXN, generarSecuenciaMeses } from './lineaTiempoRetoma';

export { formatMXN };
export type { FilaCostoMensual };

// =====================================================
// TIPOS
// =====================================================

interface FilaCostoMensual {
  numero: number;
  mes: string;
  costoBase: number;     // Columna K — F.100% (tarifaAnual × 2)
  costoPlus: number;     // Columna L — F100+ (costoBase + $4,850)
  esFila: 'pago' | 'total' | 'gestoria' | 'total-general';
}

export interface LineaTiempoF100Input {
  fechaInicio: string;   // ISO date (fechaInicioContrato)
  totalMeses: number;
}

export interface LineaTiempoF100Output {
  success: boolean;
  filas?: FilaCostoMensual[];
  errores?: string[];
  detalles?: {
    duracionMeses: number;
    añoInicio: number;
    totalBase: number;
    totalPlus: number;
    gestoria: number;
    totalGeneralBase: number;
    totalGeneralPlus: number;
  };
}

// =====================================================
// CONSTANTES
// =====================================================

/** Factor de multiplicación: todos los costos × 2 (§3, §11) */
const FACTOR_X2 = 2;

// =====================================================
// FUNCIONES DE PRICING
// =====================================================

/**
 * Calcula el costo base del primer mes según la fecha actual del sistema.
 * §3.2: Evalúa umbrales de año en orden descendente, resultado × 2.
 *
 * Ejemplo: Si hoy > 2025-01-31 → tarifa 4200 → resultado 8,400
 */
function calcularCostoBasePrimerMes(): number {
  const hoy = new Date();
  const tarifas = getTarifasPrimerMesF100();

  // Evaluar de más reciente a más antiguo
  for (const umbral of tarifas) {
    const fechaUmbral = new Date(umbral.despuesDeAnio, 0, 31); // Jan 31 of that year
    if (hoy > fechaUmbral) {
      return umbral.tarifa * FACTOR_X2;
    }
  }

  // Fallback: tarifa más baja × 2
  const ultima = tarifas[tarifas.length - 1];
  return (ultima ? ultima.tarifa : 3500) * FACTOR_X2;
}

/**
 * Obtiene la gestoría según duración del contrato.
 * §7: 14 meses → $18,000, 15 meses → $16,000
 */
function obtenerGestoria(totalMeses: number): number {
  const tabla = getGestoriaF100();
  if (totalMeses in tabla) {
    return tabla[totalMeses];
  }
  // Fallback para duración no mapeada: usar gestoría fija de 14 meses
  return getGestoriaFija14Meses();
}

// =====================================================
// CÁLCULO PRINCIPAL
// =====================================================

/**
 * Calcula la línea de tiempo completa de pagos F100.
 *
 * @param input - Fecha de inicio y duración del contrato
 * @returns Resultado con tabla de pagos (2 columnas: F.100% y F100+) o errores
 */
export function calcularLineaTiempoF100(input: LineaTiempoF100Input): LineaTiempoF100Output {
  try {
    // ================================================
    // FASE 1: VALIDACIÓN
    // ================================================

    if (!input.fechaInicio) {
      return {
        success: false,
        errores: ['La fecha de inicio del contrato es requerida'],
      };
    }

    const duracion = getDuracionContrato();
    if (input.totalMeses < duracion.min || input.totalMeses > duracion.max) {
      return {
        success: false,
        errores: [
          `La duración debe estar entre ${duracion.min} y ${duracion.max} meses. Duración actual: ${input.totalMeses} meses.`,
        ],
      };
    }

    const fechaInicio = new Date(input.fechaInicio);
    const añoInicio = fechaInicio.getFullYear();

    // ================================================
    // FASE 2: GENERAR SECUENCIA DE MESES (+16 / +30 días)
    // ================================================

    const secuencia = generarSecuenciaMeses(fechaInicio, input.totalMeses);

    // ================================================
    // FASE 3: CALCULAR PRECIOS DE CADA MES
    // ================================================

    const filas: FilaCostoMensual[] = [];
    let totalBase = 0;
    let totalPlus = 0;
    const cargoFijo = getCargoFijoF100Plus(); // §4: $4,850 fijo

    for (let i = 0; i < secuencia.length; i++) {
      const mesPago = secuencia[i];
      let costoBase: number;

      if (i === 0) {
        // §3.2: Primer mes — tarifa especial por umbral de año × 2
        costoBase = calcularCostoBasePrimerMes();
      } else {
        // §3.3: Meses subsiguientes — TARIFAS_ANUALES[año] × 2
        const precioAnual = getPreciosAnuales().find((p) => p.anio === mesPago.anio);
        if (!precioAnual) {
          return {
            success: false,
            errores: [
              `No hay precio configurado para el año ${mesPago.anio}. ` +
                `Configure precios para todos los años del plan o ajuste las fechas del contrato.`,
            ],
          };
        }
        costoBase = precioAnual.precio * FACTOR_X2;
      }

      // §4: F100+ = costoBase + cargo fijo ($4,850)
      const costoPlus = costoBase + cargoFijo;

      filas.push({
        numero: i + 1,
        mes: mesPago.mes,
        costoBase,
        costoPlus,
        esFila: 'pago',
      });

      totalBase += costoBase;
      totalPlus += costoPlus;
    }

    // ================================================
    // FASE 4: FILAS DE CIERRE
    // ================================================

    // TOTAL
    filas.push({
      numero: 0,
      mes: 'TOTAL',
      costoBase: totalBase,
      costoPlus: totalPlus,
      esFila: 'total',
    });

    // GESTORÍA — §7: variable según duración
    const gestoria = obtenerGestoria(input.totalMeses);
    filas.push({
      numero: 0,
      mes: 'GESTORIA',
      costoBase: gestoria,
      costoPlus: gestoria,
      esFila: 'gestoria',
    });

    // TOTAL GENERAL
    const totalGeneralBase = totalBase + gestoria;
    const totalGeneralPlus = totalPlus + gestoria;
    filas.push({
      numero: 0,
      mes: 'TOTAL GENERAL',
      costoBase: totalGeneralBase,
      costoPlus: totalGeneralPlus,
      esFila: 'total-general',
    });

    // ================================================
    // FASE 5: RESULTADO
    // ================================================

    return {
      success: true,
      filas,
      detalles: {
        duracionMeses: input.totalMeses,
        añoInicio,
        totalBase,
        totalPlus,
        gestoria,
        totalGeneralBase,
        totalGeneralPlus,
      },
    };
  } catch (error) {
    const mensaje = error instanceof Error
      ? error.message
      : 'Error inesperado al calcular línea de tiempo F100';

    return {
      success: false,
      errores: [mensaje],
    };
  }
}
