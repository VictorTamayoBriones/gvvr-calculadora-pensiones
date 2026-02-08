/**
 * LÍNEA DE TIEMPO - MODALIDAD RETOMA
 *
 * Implementación de las reglas de negocio para el cálculo de la tabla
 * de pagos mensuales en la modalidad RETOMA.
 *
 * Basado en: reglas-linea-tiempo-retoma.md
 */

// =====================================================
// TIPOS
// =====================================================

export interface FilaPago {
  numero: number;
  mes: string; // 'ENE', 'FEB', 'MAR', etc.
  monto: number;
  esFila: 'pago' | 'total' | 'gestoria' | 'total-general';
}

export interface PrecioAnual {
  anio: number;
  precio: number;
}

export interface PrecioPrimerMes {
  fechaInicio: string; // 'MM/DD' formato
  fechaFin: string;
  precio: number;
}

export interface MesPago {
  fecha: Date;
  mes: string;
  anio: number;
}

export interface LineaTiempoInput {
  fechaAlta: string; // ISO date
  fechaFin: string; // ISO date
}

export interface LineaTiempoOutput {
  success: boolean;
  filas?: FilaPago[];
  errores?: string[];
  advertencias?: string[];
  detalles?: {
    duracionMeses: number;
    precioPromedio: number;
    totalPagos: number;
    gestoria: number;
    totalGeneral: number;
  };
}

// =====================================================
// CATÁLOGOS Y CONSTANTES
// =====================================================

export const CATALOGO_MESES: Record<number, string> = {
  0: 'ENE',
  1: 'FEB',
  2: 'MAR',
  3: 'ABR',
  4: 'MAY',
  5: 'JUN',
  6: 'JUL',
  7: 'AGO',
  8: 'SEP',
  9: 'OCT',
  10: 'NOV',
  11: 'DIC',
};

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

// =====================================================
// FUNCIONES UTILITARIAS
// =====================================================

/**
 * Suma días a una fecha
 */
export function addDays(fecha: Date, dias: number): Date {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

/**
 * Calcula diferencia en meses entre dos fechas
 * RN-RETOMA-001
 */
export function diffEnMeses(fechaInicio: Date, fechaFin: Date): number {
  const añosDiff = fechaFin.getFullYear() - fechaInicio.getFullYear();
  const mesesDiff = fechaFin.getMonth() - fechaInicio.getMonth();
  return añosDiff * 12 + mesesDiff;
}

/**
 * Formatea número como moneda mexicana
 */
export function formatMXN(monto: number): string {
  return `$${monto.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  // Convertir MM/DD a número comparable (MMDD)
  const fecha = parseInt(fechaMMDD.replace('/', ''));
  const rangoInicio = parseInt(inicio.replace('/', ''));
  const rangoFin = parseInt(fin.replace('/', ''));

  // Manejar caso donde el rango cruza el año (ej: 11/16 a 12/31 o 01/01 a 03/15)
  if (rangoInicio > rangoFin) {
    // El rango cruza el año (ej: 11/16 - 03/15 del siguiente año)
    return fecha >= rangoInicio || fecha <= rangoFin;
  }

  return fecha >= rangoInicio && fecha <= rangoFin;
}

// =====================================================
// GENERACIÓN DE SECUENCIA DE MESES
// =====================================================

/**
 * Genera la secuencia de meses según las reglas de RETOMA
 * RN-RETOMA-004
 *
 * - Primer mes: fechaAlta + 16 días
 * - Meses siguientes: +30 días cada uno
 */
export function generarSecuenciaMeses(fechaAlta: Date, duracionMeses: number): MesPago[] {
  const secuencia: MesPago[] = [];

  // Primer mes: fecha alta + 16 días
  let fechaActual = addDays(fechaAlta, 16);
  secuencia.push({
    fecha: new Date(fechaActual),
    mes: CATALOGO_MESES[fechaActual.getMonth()],
    anio: fechaActual.getFullYear(),
  });

  // Meses siguientes: +30 días cada uno
  for (let i = 1; i < duracionMeses; i++) {
    fechaActual = addDays(fechaActual, 30);
    secuencia.push({
      fecha: new Date(fechaActual),
      mes: CATALOGO_MESES[fechaActual.getMonth()],
      anio: fechaActual.getFullYear(),
    });
  }

  return secuencia;
}

// =====================================================
// CÁLCULO DE PRECIOS
// =====================================================

/**
 * Calcula el precio del primer mes según la fecha actual
 * RN-RETOMA-003
 *
 * IMPORTANTE: Evalúa en orden DESCENDENTE (más reciente primero)
 */
export function calcularPrecioPrimerMes(): number {
  const hoy = new Date();
  const hoyMMDD = fechaToMMDD(hoy);

  // Evaluar en orden DESCENDENTE para evitar bug de Excel
  for (let i = PRECIOS_PRIMER_MES.length - 1; i >= 0; i--) {
    const rango = PRECIOS_PRIMER_MES[i];
    if (estaDentroDeRango(hoyMMDD, rango.fechaInicio, rango.fechaFin)) {
      return rango.precio;
    }
  }

  // Fallback: si no encuentra rango, usar el precio más bajo
  return 3500;
}

/**
 * Calcula el precio de un mes según su año
 * RN-RETOMA-002
 */
export function calcularPrecioMes(anio: number): number | null {
  const precioAnual = PRECIOS_ANUALES.find((p) => p.anio === anio);
  return precioAnual ? precioAnual.precio : null;
}

// =====================================================
// CÁLCULO PRINCIPAL
// =====================================================

/**
 * Calcula la línea de tiempo completa de pagos RETOMA
 *
 * @param input - Fechas de inicio y fin del contrato
 * @returns Resultado con tabla de pagos o errores
 */
export function calcularLineaTiempo(input: LineaTiempoInput): LineaTiempoOutput {
  const advertencias: string[] = [];

  try {
    // ================================================
    // FASE 1: VALIDACIÓN DE DATOS DE ENTRADA
    // ================================================

    if (!input.fechaAlta || !input.fechaFin) {
      return {
        success: false,
        errores: ['Las fechas de inicio y fin del contrato son requeridas'],
      };
    }

    const fechaAlta = new Date(input.fechaAlta);
    const fechaFin = new Date(input.fechaFin);

    // Validar coherencia de fechas
    if (fechaFin <= fechaAlta) {
      return {
        success: false,
        errores: ['La fecha de fin debe ser posterior a la fecha de inicio'],
      };
    }

    // ================================================
    // FASE 2: CALCULAR DURACIÓN
    // ================================================

    const duracionMeses = diffEnMeses(fechaAlta, fechaFin);

    // Validar duración entre 14-18 meses
    if (duracionMeses < 14 || duracionMeses > 18) {
      return {
        success: false,
        errores: [
          `La duración debe estar entre 14 y 18 meses. Duración actual: ${duracionMeses} meses. ` +
            `Ajuste las fechas del contrato.`,
        ],
      };
    }

    // ================================================
    // FASE 3: GENERAR SECUENCIA DE MESES
    // ================================================

    const secuenciaMeses = generarSecuenciaMeses(fechaAlta, duracionMeses);

    // ================================================
    // FASE 4: CALCULAR PRECIOS DE CADA MES
    // ================================================

    const filas: FilaPago[] = [];
    let totalPagos = 0;

    // Primer mes - precio especial según fecha actual
    const precioPrimerMes = calcularPrecioPrimerMes();
    filas.push({
      numero: 1,
      mes: secuenciaMeses[0].mes,
      monto: precioPrimerMes,
      esFila: 'pago',
    });
    totalPagos += precioPrimerMes;

    // Meses siguientes - precio según año
    for (let i = 1; i < secuenciaMeses.length; i++) {
      const mesPago = secuenciaMeses[i];
      const precio = calcularPrecioMes(mesPago.anio);

      if (precio === null) {
        return {
          success: false,
          errores: [
            `No hay precio configurado para el año ${mesPago.anio}. ` +
              `Configure precios para todos los años del plan o ajuste las fechas del contrato.`,
          ],
        };
      }

      filas.push({
        numero: i + 1,
        mes: mesPago.mes,
        monto: precio,
        esFila: 'pago',
      });
      totalPagos += precio;
    }

    // ================================================
    // FASE 5: AGREGAR TOTALES
    // ================================================

    // Fila TOTAL
    filas.push({
      numero: 0,
      mes: 'TOTAL',
      monto: totalPagos,
      esFila: 'total',
    });

    // Fila GESTORÍA
    // RN-GEST-001: Si duración = 14 meses, usar tarifa fija
    // RN-GEST-002: Si duración ≠ 14 meses, calcular por tabla
    let montoGestoria: number;

    if (duracionMeses === 14) {
      // Caso estándar: Gestoría fija
      montoGestoria = GESTORIA_FIJA_14_MESES;
    } else {
      // Caso variable: Pago mensual × duración
      const añoInicio = fechaAlta.getFullYear();
      const pagoMensualGestoria = PAGO_MENSUAL_GESTORIA_RETOMA[añoInicio];

      if (!pagoMensualGestoria) {
        return {
          success: false,
          errores: [
            `No hay pago mensual de gestoría configurado para el año ${añoInicio}. ` +
              `Configure el pago mensual o ajuste las fechas del contrato.`,
          ],
        };
      }

      montoGestoria = pagoMensualGestoria * duracionMeses;

      // Advertencia si el monto es muy alto
      if (montoGestoria > 100000) {
        advertencias.push(
          `Gestoría muy alta ($${montoGestoria.toLocaleString('es-MX')}). ` +
            `Esto es normal para contratos largos (${duracionMeses} meses × $${pagoMensualGestoria.toLocaleString('es-MX')}/mes).`
        );
      }
    }

    filas.push({
      numero: 0,
      mes: 'GESTORIA',
      monto: montoGestoria,
      esFila: 'gestoria',
    });

    // Fila TOTAL GENERAL
    const totalGeneral = totalPagos + montoGestoria;
    filas.push({
      numero: 0,
      mes: 'TOTAL GENERAL',
      monto: totalGeneral,
      esFila: 'total-general',
    });

    // ================================================
    // FASE 6: CONSTRUIR RESULTADO
    // ================================================

    const precioPromedio = totalPagos / duracionMeses;

    return {
      success: true,
      filas,
      detalles: {
        duracionMeses,
        precioPromedio,
        totalPagos,
        gestoria: montoGestoria,
        totalGeneral,
      },
      advertencias: advertencias.length > 0 ? advertencias : undefined,
    };
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error inesperado al calcular línea de tiempo';

    return {
      success: false,
      errores: [mensaje],
    };
  }
}
