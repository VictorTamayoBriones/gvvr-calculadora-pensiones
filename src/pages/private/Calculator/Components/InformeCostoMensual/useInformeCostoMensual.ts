import { useMemo } from 'react';
import { useCalculator } from '@/contexts/CalculatorContext';

export function useInformeCostoMensual() {
  const { generalData } = useCalculator();

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

  // Validaciones según el documento de reglas de negocio
  const validaciones = useMemo(() => {
    const edad = Number(generalData.edad) || 0;
    const semanas = Number(generalData.semanasCotizadas) || 0;
    const ley = generalData.leyAplicable;
    const advertencias: string[] = [];
    const errores: string[] = [];

    // Validación de edad (Documento línea 388-466)
    if (edad < 55) {
      errores.push("El cliente debe tener al menos 55 años para participar en el programa");
    } else if (edad < 60) {
      advertencias.push("El cliente aún no cumple 60 años (edad mínima de pensión). Puede preparar su caso.");
    } else if (edad >= 68 && generalData.modalidad === "REACTIVA FINANCIADO 100") {
      errores.push("⚠️ RESTRICCIÓN: La modalidad Financiado 100% solo es viable para menores de 68 años");
    }

    // Validación de semanas según ley (Documento línea 283-385)
    if (ley === "LEY_73" && semanas < 500) {
      errores.push("No cumple con el mínimo de 500 semanas requeridas para LEY 73");
    } else if (ley === "LEY_97" && semanas < 1250) {
      errores.push("No cumple con el mínimo de 1,250 semanas requeridas para LEY 97");
    }

    return { advertencias, errores };
  }, [generalData.edad, generalData.semanasCotizadas, generalData.leyAplicable, generalData.modalidad]);

  return {
    generalData,
    fechaContratoFormateada,
    tieneVigencia,
    infoVigencia,
    validaciones
  };
}
