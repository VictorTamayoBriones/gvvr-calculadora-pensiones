import { useMemo } from 'react';

/**
 * Determina si el cliente tiene vigencia de derechos ante el IMSS.
 *
 * @param sinVigenciaDerechos - Fecha ISO hasta la cual el cliente pierde vigencia
 * @returns Estado de vigencia (vigente/vencido) con mensaje descriptivo
 */
export function useVigenciaDerechos(sinVigenciaDerechos: string) {
  const tieneVigencia = useMemo(() => {
    if (!sinVigenciaDerechos) return null;
    const hoy = new Date();
    const sinVigencia = new Date(sinVigenciaDerechos);
    return hoy <= sinVigencia;
  }, [sinVigenciaDerechos]);

  const infoVigencia = useMemo(() => {
    if (!sinVigenciaDerechos || tieneVigencia === null) return null;

    const hoy = new Date();
    const sinVigencia = new Date(sinVigenciaDerechos);

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
  }, [sinVigenciaDerechos, tieneVigencia]);

  return { tieneVigencia, infoVigencia };
}
