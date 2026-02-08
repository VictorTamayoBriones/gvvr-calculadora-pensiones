import { TABLA_PENSIONES, getAñosDisponibles, getRangoEdades } from './tablaPensiones';

/**
 * Tipos para el resultado del cálculo
 */
export interface ResultadoCalculoPension {
  success: boolean;
  montoPension?: number;
  textoFormateado?: string;
  detalles?: {
    edadActual: number;
    añosAdicionales: number;
    edadAlPensionarse: number;
    añoPension: number;
    edadUsadaEnTabla: number;
  };
  advertencias?: string[];
  errores?: string[];
}

/**
 * Calcula la edad en años completos considerando mes y día
 * Según RN-008 del documento
 */
export function calcularEdadPrecisa(fechaNacimiento: string | Date): number {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);

  // Normalizar a medianoche para evitar problemas de hora
  hoy.setHours(0, 0, 0, 0);
  nacimiento.setHours(0, 0, 0, 0);

  // Calcular diferencia de años
  let edad = hoy.getFullYear() - nacimiento.getFullYear();

  // Ajustar si no ha llegado su cumpleaños este año
  const mesActual = hoy.getMonth();
  const mesNacimiento = nacimiento.getMonth();
  const diaActual = hoy.getDate();
  const diaNacimiento = nacimiento.getDate();

  if (mesActual < mesNacimiento) {
    // Mes de cumpleaños aún no ha llegado
    edad--;
  } else if (mesActual === mesNacimiento && diaActual < diaNacimiento) {
    // Es el mes de cumpleaños pero el día aún no llega
    edad--;
  }

  return edad;
}

/**
 * Calcula los años adicionales entre dos fechas
 * Según RN-009: Diferencia de años calendario
 */
export function calcularAñosAdicionales(fechaInicio: string | Date, fechaFin: string | Date): number {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  const añosAdicionales = fin.getFullYear() - inicio.getFullYear();

  return añosAdicionales;
}

/**
 * Busca el monto de pensión en la tabla
 * Con validaciones y manejo de casos edge
 */
function buscarMontoPension(edad: number, año: number): { monto: number; advertencias: string[] } {
  const advertencias: string[] = [];
  const rangoEdades = getRangoEdades();

  // Validar que el año exista
  if (!TABLA_PENSIONES[año]) {
    throw new Error(`Año ${año} no disponible en tabla de montos`);
  }

  // Validar edad mínima
  if (edad < rangoEdades.min) {
    throw new Error(`Edad ${edad} menor al mínimo de pensión (${rangoEdades.min} años)`);
  }

  // Aplicar fallback si excede edad máxima (EDGE-005)
  let edadParaBusqueda = edad;
  if (edad > rangoEdades.max) {
    advertencias.push(
      `Edad al pensionarse (${edad} años) excede el máximo en tabla (${rangoEdades.max} años). ` +
        `Se usará el monto correspondiente a ${rangoEdades.max} años.`
    );
    edadParaBusqueda = rangoEdades.max;
  }

  // Buscar monto
  const monto = TABLA_PENSIONES[año][edadParaBusqueda];

  if (monto === null || monto === undefined) {
    throw new Error(`Monto no definido para edad ${edadParaBusqueda} y año ${año}`);
  }

  if (typeof monto !== 'number' || isNaN(monto) || monto <= 0) {
    throw new Error(`Monto inválido (${monto}) para edad ${edadParaBusqueda} y año ${año}`);
  }

  return { monto, advertencias };
}

/**
 * Calcula el monto de pensión mensual
 * Implementa todas las reglas de negocio del documento
 *
 * @param fechaNacimiento - Fecha de nacimiento del cliente
 * @param curp - CURP del cliente (usado como validación)
 * @param fechaInicio - Fecha de inicio del contrato
 * @param fechaFin - Fecha de fin del contrato
 * @returns Resultado del cálculo con monto, detalles, advertencias o errores
 */
export function calcularMontoPension(
  fechaNacimiento: string,
  curp: string,
  fechaInicio: string,
  fechaFin: string
): ResultadoCalculoPension {
  const advertencias: string[] = [];

  try {
    // ================================================
    // FASE 1: VALIDACIÓN DE DATOS DE ENTRADA
    // ================================================

    // RN-002: Validar datos del cliente
    if (!fechaNacimiento || !curp || curp.trim() === '') {
      return {
        success: false,
        errores: ['Complete la información del cliente para calcular el monto de pensión'],
      };
    }

    // RN-003: Validar datos del contrato
    if (!fechaInicio || !fechaFin) {
      return {
        success: false,
        errores: ['Complete las fechas del contrato para calcular el monto de pensión'],
      };
    }

    // RN-007: Validar coherencia de fechas
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (fin <= inicio) {
      return {
        success: false,
        errores: ['La fecha de fin del contrato debe ser posterior a la fecha de inicio'],
      };
    }

    // ================================================
    // FASE 2: CÁLCULO DE EDAD ACTUAL
    // ================================================

    const edadActual = calcularEdadPrecisa(fechaNacimiento);

    // Validar edad mínima razonable (50 años para iniciar proceso)
    if (edadActual < 50) {
      return {
        success: false,
        errores: ['El cliente debe tener al menos 50 años para iniciar el proceso de pensión'],
      };
    }

    // Advertencia si edad muy avanzada
    if (edadActual > 85) {
      advertencias.push('Cliente tiene edad muy avanzada. Verifique los datos.');
    }

    // ================================================
    // FASE 3: CÁLCULO DE AÑOS ADICIONALES
    // ================================================

    const añosAdicionales = calcularAñosAdicionales(fechaInicio, fechaFin);

    // Validar años adicionales no negativos
    if (añosAdicionales < 0) {
      return {
        success: false,
        errores: ['Los años adicionales no pueden ser negativos. Verifique las fechas del contrato.'],
      };
    }

    // Advertencia si contrato muy corto
    if (añosAdicionales < 1) {
      advertencias.push(
        'El contrato es muy corto (menos de 1 año de diferencia entre años). ' +
          'Esto podría no agregar años a la edad de pensión.'
      );
    }

    // Advertencia si contrato muy largo
    if (añosAdicionales > 10) {
      advertencias.push('El contrato es muy largo (más de 10 años). Verifique si es correcto.');
    }

    // ================================================
    // FASE 4: CÁLCULO DE EDAD AL PENSIONARSE
    // ================================================

    const edadAlPensionarse = edadActual + añosAdicionales;

    // RN-004: Validación de edad mínima para pensión (BLOQUEANTE)
    if (edadAlPensionarse < 60) {
      const faltante = 60 - edadAlPensionarse;
      return {
        success: false,
        errores: [
          `Con ${edadAlPensionarse} años al pensionarse, NO alcanza la edad mínima de 60 años. ` +
            `Faltan ${faltante} año(s). ` +
            `Considere aumentar la duración del contrato o esperar más tiempo para iniciar el proceso.`,
        ],
      };
    }

    // Validación de edad ideal (información)
    if (edadAlPensionarse >= 65 && edadAlPensionarse <= 75) {
      // Edad en rango ideal, no se requiere advertencia
    }

    // ================================================
    // FASE 5: DETERMINAR AÑO DE PENSIÓN
    // ================================================

    const añoPension = fin.getFullYear();

    // RN-006: Validar que el año esté en la tabla (BLOQUEANTE)
    if (!TABLA_PENSIONES[añoPension]) {
      const añosDisponibles = getAñosDisponibles();
      return {
        success: false,
        errores: [
          `El año de pensión (${añoPension}) no está disponible en la tabla de montos. ` +
            `Años disponibles: ${añosDisponibles.join(', ')} (2023-2027). ` +
            `Ajuste las fechas del contrato o contacte al administrador para actualizar la tabla.`,
        ],
      };
    }

    // Advertencia si el año es muy lejano
    const hoy = new Date();
    const añosDiferencia = añoPension - hoy.getFullYear();
    if (añosDiferencia > 5) {
      advertencias.push(
        `El año de pensión (${añoPension}) es lejano (${añosDiferencia} años en el futuro). ` +
          `Los montos pueden cambiar según la política gubernamental.`
      );
    }

    // ================================================
    // FASE 6: BUSCAR MONTO EN TABLA
    // ================================================

    const { monto, advertencias: advertenciasBusqueda } = buscarMontoPension(edadAlPensionarse, añoPension);

    advertencias.push(...advertenciasBusqueda);

    // Determinar edad usada (podría ser diferente si se aplicó fallback)
    const edadUsadaEnTabla = edadAlPensionarse > 83 ? 83 : edadAlPensionarse;

    // ================================================
    // FASE 7: FORMATEAR RESULTADO
    // ================================================

    const textoFormateado = `$${monto.toLocaleString('es-MX')}`;

    // ================================================
    // FASE 8: CONSTRUIR RESULTADO EXITOSO
    // ================================================

    return {
      success: true,
      montoPension: monto,
      textoFormateado,
      detalles: {
        edadActual,
        añosAdicionales,
        edadAlPensionarse,
        añoPension,
        edadUsadaEnTabla,
      },
      advertencias: advertencias.length > 0 ? advertencias : undefined,
    };
  } catch (error) {
    // Manejo de errores inesperados
    const mensaje = error instanceof Error ? error.message : 'Error inesperado al calcular monto de pensión';

    return {
      success: false,
      errores: [mensaje],
    };
  }
}
