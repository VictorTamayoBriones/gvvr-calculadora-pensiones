import { useMemo, useCallback, useEffect } from 'react';
import { useCalculator } from '@/contexts/CalculatorContext';

export function useInformeCostoMensual() {
  const { generalData, updateGeneralData } = useCalculator();

  // Función helper para parsear fechas ISO sin problemas de zona horaria
  const parseISODate = useCallback((dateString: string): Date => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }, []);

  // Función para calcular fecha de inicio sugerida según fecha de firma
  const calcularFechaInicioSugerida = useCallback((fechaFirma: string) => {
    if (!fechaFirma) return '';

    const fecha = new Date(fechaFirma);
    const dia = fecha.getDate();

    if (dia <= 15) {
      // Alta retroactiva al 1ro del mes corriente
      return new Date(fecha.getFullYear(), fecha.getMonth(), 1).toISOString().split('T')[0];
    } else {
      // Alta al 1ro del mes siguiente
      const mesSiguiente = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 1);
      return mesSiguiente.toISOString().split('T')[0];
    }
  }, []);

  // Función para calcular total de meses entre fecha inicio y fin
  const calcularTotalMeses = useCallback((fechaInicio: string, fechaFin: string) => {
    if (!fechaInicio || !fechaFin) return '';

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const meses = (fin.getFullYear() - inicio.getFullYear()) * 12
                 + (fin.getMonth() - inicio.getMonth());

    return meses.toString();
  }, []);

  // Función para calcular semanas al final
  const calcularSemanasAlFinal = useCallback((semanasCotizadas: string, totalMeses: string) => {
    if (!semanasCotizadas || !totalMeses) return '';

    const semanas = parseInt(semanasCotizadas);
    const meses = parseInt(totalMeses);

    if (isNaN(semanas) || isNaN(meses)) return '';

    return (semanas + (meses * 4)).toString();
  }, []);

  // Handler para actualizar fecha de firma y recalcular fecha de inicio
  const handleFechaFirmaChange = useCallback((fechaFirma: string) => {
    const fechaInicioSugerida = calcularFechaInicioSugerida(fechaFirma);

    updateGeneralData({
      fechaFirmaContrato: fechaFirma,
      fechaInicioContrato: fechaInicioSugerida
    });

    // Si ya hay fecha fin, recalcular total de meses y semanas
    if (generalData.fechaFinContrato && fechaInicioSugerida) {
      const totalMeses = calcularTotalMeses(fechaInicioSugerida, generalData.fechaFinContrato);
      const semanasFinales = calcularSemanasAlFinal(generalData.semanasCotizadas, totalMeses);

      updateGeneralData({
        totalMeses,
        semanasAlFinal: semanasFinales
      });
    }
  }, [calcularFechaInicioSugerida, calcularTotalMeses, calcularSemanasAlFinal, updateGeneralData, generalData.fechaFinContrato, generalData.semanasCotizadas]);

  // Handler para actualizar fecha de fin y recalcular total meses
  const handleFechaFinChange = useCallback((fechaFin: string) => {
    const totalMeses = calcularTotalMeses(generalData.fechaInicioContrato, fechaFin);
    const semanasFinales = calcularSemanasAlFinal(generalData.semanasCotizadas, totalMeses);

    updateGeneralData({
      fechaFinContrato: fechaFin,
      totalMeses,
      semanasAlFinal: semanasFinales
    });
  }, [calcularTotalMeses, calcularSemanasAlFinal, updateGeneralData, generalData.fechaInicioContrato, generalData.semanasCotizadas]);

  // Calcular automáticamente el monto total para invertir cuando cambien los valores
  // REGLA CRÍTICA: El saldo AFORE solo se usa en modalidades REACTIVA TRADICIONAL y FINANCIADO 1
  const calcularMontoTotal = useCallback(() => {
    const saldoAfore = parseFloat(generalData.saldoAfore) || 0;
    const prestamoFinanciero = parseFloat(generalData.prestamoFinanciero) || 0;

    // Solo sumar AFORE si la modalidad usa AFORE (REACTIVA TRADICIONAL o FINANCIADO 1)
    // En FINANCIADO 100 y REACTIVA FINANCIADO 100, NO se usa el saldo AFORE
    const usaAfore = generalData.modalidad === 'REACTIVA TRADICIONAL' ||
                     generalData.modalidad === 'FINANCIADO 1';

    const montoTotal = usaAfore
      ? saldoAfore + prestamoFinanciero
      : prestamoFinanciero;

    if (montoTotal > 0) {
      return montoTotal.toString();
    }
    return '';
  }, [generalData.saldoAfore, generalData.prestamoFinanciero, generalData.modalidad]);

  // Actualizar monto total cuando cambien saldo AFORE o préstamo
  const montoTotalCalculado = useMemo(() => {
    return calcularMontoTotal();
  }, [calcularMontoTotal]);

  // Sincronizar el monto total calculado con el estado
  useEffect(() => {
    if (montoTotalCalculado !== generalData.montoTotalInvertir) {
      updateGeneralData({ montoTotalInvertir: montoTotalCalculado });
    }
  }, [montoTotalCalculado, generalData.montoTotalInvertir, updateGeneralData]);


  // Formatear fecha para el header
  const fechaContratoFormateada = useMemo(() => {
    if (!generalData.fechaInicioContrato) return '';
    const fecha = new Date(generalData.fechaInicioContrato);
    return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }, [generalData.fechaInicioContrato]);

  // Verificar si tiene vigencia de derechos
  const tieneVigencia = useMemo(() => {
    if (!generalData.sinVigenciaDerechos) return null;
    const hoy = new Date();
    const sinVigencia = new Date(generalData.sinVigenciaDerechos);
    return hoy <= sinVigencia;
  }, [generalData.sinVigenciaDerechos]);

  // Calcular tiempo sin vigencia
  const infoVigencia = useMemo(() => {
    if (!generalData.sinVigenciaDerechos || tieneVigencia === null) return null;

    const hoy = new Date();
    const sinVigencia = new Date(generalData.sinVigenciaDerechos);

    if (tieneVigencia) {
      const diasRestantes = Math.floor((sinVigencia.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      return {
        tipo: 'vigente' as const,
        mensaje: `El cliente mantiene vigencia de derechos hasta el ${sinVigencia.toLocaleDateString('es-MX')} (${diasRestantes} días restantes)`
      };
    } else {
      const tiempoVencido = hoy.getTime() - sinVigencia.getTime();
      const añosVencido = Math.floor(tiempoVencido / (1000 * 60 * 60 * 24 * 365.25));
      const mesesVencido = Math.floor((tiempoVencido % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));

      return {
        tipo: 'vencido' as const,
        mensaje: `⚠️ ATENCIÓN: El cliente perdió vigencia de derechos el ${sinVigencia.toLocaleDateString('es-MX')}`,
        detalle: `Hace ${añosVencido} años y ${mesesVencido} meses que no tiene vigencia`,
        accion: 'REQUIERE recuperación de derechos mediante cotización al IMSS'
      };
    }
  }, [generalData.sinVigenciaDerechos, tieneVigencia]);

  // Validaciones de información del cliente
  const validacionesCliente = useMemo(() => {
    const edad = Number(generalData.edad) || 0;
    const semanas = Number(generalData.semanasCotizadas) || 0;
    const ley = generalData.leyAplicable;
    const advertencias: string[] = [];
    const errores: string[] = [];

    // Validación de edad (Documento REGLAS_NEGOCIO_CLIENTE.md)
    if (edad < 55) {
      errores.push("El cliente debe tener al menos 55 años para participar en el programa");
    } else if (edad < 60) {
      advertencias.push("El cliente aún no cumple 60 años (edad mínima de pensión). Puede preparar su caso.");
    } else if (edad >= 68 && generalData.modalidad === "REACTIVA FINANCIADO 100") {
      errores.push("⚠️ RESTRICCIÓN: La modalidad Financiado 100% solo es viable para menores de 68 años");
    }

    // Validación de semanas según ley
    if (ley === "LEY_73" && semanas < 500) {
      errores.push("No cumple con el mínimo de 500 semanas requeridas para LEY 73");
    } else if (ley === "LEY_97" && semanas < 1250) {
      errores.push("No cumple con el mínimo de 1,250 semanas requeridas para LEY 97");
    }

    return { advertencias, errores };
  }, [generalData.edad, generalData.semanasCotizadas, generalData.leyAplicable, generalData.modalidad]);

  // Validaciones del contrato (REGLAS_NEGOCIO_CONTRATO.md)
  const validacionesContrato = useMemo(() => {
    const errores: string[] = [];
    const advertencias: string[] = [];
    const info: string[] = [];

    // Solo validar si hay datos del contrato
    const tieneAlgunDato = generalData.fechaFirmaContrato ||
                           generalData.fechaInicioContrato ||
                           generalData.fechaFinContrato ||
                           generalData.totalMeses;

    if (!tieneAlgunDato) {
      return { errores, advertencias, info };
    }

    // Validar campos requeridos
    if (tieneAlgunDato) {
      if (!generalData.fechaFirmaContrato) {
        advertencias.push("Ingrese la fecha de firma del contrato para iniciar el proceso");
      }
      if (!generalData.totalMeses && generalData.fechaFirmaContrato) {
        advertencias.push("Ingrese el total de meses del contrato");
      }
    }

    // 1. VALIDACIONES DE FECHA DE FIRMA
    if (generalData.fechaFirmaContrato) {
      const fechaFirma = parseISODate(generalData.fechaFirmaContrato);
      const hoy = new Date();

      // No puede ser futura
      if (fechaFirma > hoy) {
        errores.push("La fecha de firma del contrato no puede ser futura");
      }
    }

    // 2. VALIDACIONES DE FECHA DE INICIO
    if (generalData.fechaInicioContrato) {
      const fechaInicio = parseISODate(generalData.fechaInicioContrato);

      // CRÍTICO: Debe ser día 1 del mes
      if (fechaInicio.getDate() !== 1) {
        errores.push("❌ CRÍTICO: La fecha de inicio DEBE ser el día 1 del mes");
      }

      // Validar relación con fecha de firma
      if (generalData.fechaFirmaContrato) {
        const fechaFirma = parseISODate(generalData.fechaFirmaContrato);
        const diffMeses = (fechaFirma.getFullYear() - fechaInicio.getFullYear()) * 12
                        + (fechaFirma.getMonth() - fechaInicio.getMonth());

        // No puede ser más de 6 meses anterior
        if (diffMeses > 6) {
          errores.push("La fecha de inicio no puede ser más de 6 meses anterior a la fecha de firma");
        }

        // No puede ser más de 2 meses posterior
        if (diffMeses < -2) {
          errores.push("La fecha de inicio no puede ser más de 2 meses posterior a la fecha de firma");
        }
      }

      // Validar que sea posterior a fecha de baja
      if (generalData.fechaBaja) {
        const fechaBaja = parseISODate(generalData.fechaBaja);
        if (fechaInicio <= fechaBaja) {
          errores.push("La fecha de inicio debe ser posterior a la fecha de baja del IMSS");
        }
      }
    }

    // 3. VALIDACIONES DE FECHA DE FIN
    if (generalData.fechaFinContrato) {
      const fechaFin = parseISODate(generalData.fechaFinContrato);

      // CRÍTICO: Debe ser día 1 del mes
      if (fechaFin.getDate() !== 1) {
        errores.push("❌ CRÍTICO: La fecha de fin DEBE ser el día 1 del mes");
      }

      // Debe ser posterior a fecha de inicio
      if (generalData.fechaInicioContrato) {
        const fechaInicio = parseISODate(generalData.fechaInicioContrato);
        if (fechaFin <= fechaInicio) {
          errores.push("La fecha de fin debe ser posterior a la fecha de inicio");
        }
      }
    }

    // 4. VALIDACIONES DE TOTAL DE MESES
    const totalMeses = Number(generalData.totalMeses) || 0;

    if (totalMeses > 0) {
      // CRÍTICO: Mínimo 14 meses
      if (totalMeses < 14) {
        errores.push("❌ CRÍTICO: El contrato debe ser de al menos 14 meses para recuperar derechos ante el IMSS");
      }

      // Validar coherencia con fechas
      if (generalData.fechaInicioContrato && generalData.fechaFinContrato) {
        const fechaInicio = parseISODate(generalData.fechaInicioContrato);
        const fechaFin = parseISODate(generalData.fechaFinContrato);
        const mesesCalculados = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12
                              + (fechaFin.getMonth() - fechaInicio.getMonth());

        if (mesesCalculados !== totalMeses) {
          errores.push(`El total de meses (${totalMeses}) no coincide con la diferencia entre fechas (${mesesCalculados} meses)`);
        }
      }

      // Advertencia para contratos largos
      if (totalMeses > 24 && totalMeses <= 36) {
        advertencias.push(`Contrato de ${totalMeses} meses es más largo que el promedio. Verifique si es necesario.`);
      } else if (totalMeses > 36) {
        advertencias.push(`⚠️ Contrato muy largo de ${totalMeses} meses. Considere reducir la duración.`);
      }
    }

    // 5. VALIDACIONES DE SEMANAS AL FINAL
    const semanasAlFinal = Number(generalData.semanasAlFinal) || 0;
    const semanasIniciales = Number(generalData.semanasCotizadas) || 0;

    if (semanasAlFinal > 0 && totalMeses > 0) {
      // Validar cálculo correcto
      const semanasEsperadas = semanasIniciales + (totalMeses * 4);
      const calculoCorrecto = semanasAlFinal === semanasEsperadas;

      if (!calculoCorrecto) {
        errores.push(`Las semanas al final (${semanasAlFinal}) no coinciden con el cálculo esperado (${semanasEsperadas})`);
      }

      // Solo mostrar validaciones de ley si el cálculo es correcto y el contrato cumple mínimo
      if (calculoCorrecto && totalMeses >= 14) {
        // Validar con ley aplicable
        if (generalData.leyAplicable) {
          const requisitos: { [key: string]: number } = {
            'LEY_73': 500,
            'LEY_97': 1250
          };

          const minimoRequerido = requisitos[generalData.leyAplicable];

          if (minimoRequerido) {
            if (semanasAlFinal < minimoRequerido) {
              const semanasFaltantes = minimoRequerido - semanasAlFinal;
              const mesesAdicionales = Math.ceil(semanasFaltantes / 4);
              errores.push(
                `❌ Con ${semanasAlFinal.toLocaleString('es-MX')} semanas al final, NO cumple el mínimo de ${minimoRequerido.toLocaleString('es-MX')} semanas para ${generalData.leyAplicable}. ` +
                `Necesita ${mesesAdicionales} meses adicionales (${semanasFaltantes} semanas más)`
              );
            }
          }
        }
      }
    }

    return { errores, advertencias, info };
  }, [
    parseISODate,
    generalData.fechaFirmaContrato,
    generalData.fechaInicioContrato,
    generalData.fechaFinContrato,
    generalData.totalMeses,
    generalData.semanasAlFinal,
    generalData.semanasCotizadas,
    generalData.fechaBaja,
    generalData.leyAplicable
  ]);

  // Validaciones de presupuesto (REGLAS_NEGOCIO_PRESUPUESTO.md)
  const validacionesPresupuesto = useMemo(() => {
    const errores: string[] = [];
    const advertencias: string[] = [];
    const info: string[] = [];

    const saldoAfore = parseFloat(generalData.saldoAfore) || 0;
    const prestamo = parseFloat(generalData.prestamoFinanciero) || 0;
    const montoTotal = parseFloat(generalData.montoTotalInvertir) || 0;
    const edad = Number(generalData.edad) || 0;
    const modalidad = generalData.modalidad;

    // 1. VALIDACIÓN DE SALDO AFORE
    if (saldoAfore < 0) {
      errores.push("El saldo AFORE no puede ser negativo");
    }

    // Advertencia si tiene AFORE pero la modalidad no lo usa
    const usaAfore = modalidad === 'REACTIVA TRADICIONAL' || modalidad === 'FINANCIADO 1';
    if (saldoAfore > 0 && !usaAfore) {
      advertencias.push(
        `Tiene $${saldoAfore.toLocaleString('es-MX')} en AFORE que NO se usará en ${modalidad}. ` +
        `El saldo AFORE solo se utiliza en REACTIVA TRADICIONAL y FINANCIADO 1.`
      );
      info.push(`Considere una modalidad que aproveche su saldo AFORE`);
    }

    // 2. VALIDACIÓN DE PRÉSTAMO
    if (prestamo < 0) {
      errores.push("El préstamo financiero no puede ser negativo");
    }

    // 3. VALIDACIÓN DE MONTO TOTAL
    const montoCalculado = usaAfore ? saldoAfore + prestamo : prestamo;
    if (Math.abs(montoTotal - montoCalculado) > 0.01) {
      errores.push(
        `El monto total ($${montoTotal.toLocaleString('es-MX')}) no coincide con el cálculo esperado ` +
        `($${montoCalculado.toLocaleString('es-MX')})`
      );
    }

    // 4. VALIDACIÓN CON MODALIDAD SELECCIONADA
    // Nota: Estos valores son aproximados basados en el documento REGLAS_NEGOCIO_PRESUPUESTO.md
    // En producción deberían venir de una configuración o cálculo dinámico
    const requisitos: { [key: string]: { minimo: number, nombre: string } } = {
      'REACTIVA TRADICIONAL': { minimo: 62550, nombre: 'REACTIVA TRADICIONAL' },
      'FINANCIADO 1': { minimo: 62550, nombre: 'FINANCIADO 1' },
      'FINANCIADO 100': { minimo: 0, nombre: 'FINANCIADO 100' },
      'REACTIVA FINANCIADO 100': { minimo: 0, nombre: 'REACTIVA FINANCIADO 100' }
    };

    const req = requisitos[modalidad];
    if (req) {
      const presupuestoDisponible = usaAfore ? saldoAfore + prestamo : prestamo;

      if (presupuestoDisponible < req.minimo && req.minimo > 0) {
        const faltante = req.minimo - presupuestoDisponible;
        errores.push(
          `Presupuesto insuficiente para ${req.nombre}. ` +
          `Requiere $${req.minimo.toLocaleString('es-MX')}, ` +
          `tiene $${presupuestoDisponible.toLocaleString('es-MX')}. ` +
          `Falta: $${faltante.toLocaleString('es-MX')}`
        );
      } else if (presupuestoDisponible >= req.minimo && req.minimo > 0) {
        const sobrante = presupuestoDisponible - req.minimo;
        info.push(
          `✓ Presupuesto suficiente para ${req.nombre}. ` +
          `Sobrante: $${sobrante.toLocaleString('es-MX')}`
        );
      }
    }

    // 5. RESTRICCIÓN DE EDAD PARA REACTIVA FINANCIADO 100
    if (modalidad === 'REACTIVA FINANCIADO 100' && edad >= 68) {
      errores.push(
        "⚠️ RESTRICCIÓN CRÍTICA: REACTIVA FINANCIADO 100% solo es viable para menores de 68 años"
      );
    }

    // 6. INFORMACIÓN SOBRE DESGLOSE DEL PRESUPUESTO
    if (montoTotal > 0) {
      if (usaAfore && saldoAfore > 0) {
        info.push(
          `Presupuesto total: $${montoTotal.toLocaleString('es-MX')} ` +
          `(AFORE: $${saldoAfore.toLocaleString('es-MX')} + ` +
          `Préstamo: $${prestamo.toLocaleString('es-MX')})`
        );
      } else {
        info.push(
          `Presupuesto total: $${montoTotal.toLocaleString('es-MX')} ` +
          `(solo Préstamo${!usaAfore ? ', AFORE no aplica' : ''})`
        );
      }
    }

    return { errores, advertencias, info };
  }, [
    generalData.saldoAfore,
    generalData.prestamoFinanciero,
    generalData.montoTotalInvertir,
    generalData.edad,
    generalData.modalidad
  ]);

  return {
    generalData,
    updateGeneralData,
    fechaContratoFormateada,
    tieneVigencia,
    infoVigencia,
    validacionesCliente,
    validacionesContrato,
    validacionesPresupuesto,
    // Handlers para autocompletado
    handleFechaFirmaChange,
    handleFechaFinChange
  };
}
