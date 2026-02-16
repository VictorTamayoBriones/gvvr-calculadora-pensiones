import { useMemo, useCallback } from 'react';
import type { GeneralDataForm } from '@/models';
import {
  calcularFechaInicioContrato,
  calcularTotalMeses,
  calcularSemanasAlFinal,
} from '@/utils/dateCalculations';

/**
 * Gestiona las fechas del contrato: calcula fecha de inicio desde firma,
 * recalcula meses y semanas al cambiar fecha de fin.
 *
 * @returns Handlers para cambio de fechas y fecha de contrato formateada
 */
export function useContratoDates(
  generalData: GeneralDataForm,
  updateGeneralData: (data: Partial<GeneralDataForm>) => void
) {
  const handleFechaFirmaChange = useCallback((fechaFirma: string) => {
    const fechaInicioSugerida = calcularFechaInicioContrato(fechaFirma) || '';

    updateGeneralData({
      fechaFirmaContrato: fechaFirma,
      fechaInicioContrato: fechaInicioSugerida
    });

    // Si ya hay fecha fin, recalcular total de meses y semanas
    if (generalData.fechaFinContrato && fechaInicioSugerida) {
      const totalMesesNum = calcularTotalMeses(fechaInicioSugerida, generalData.fechaFinContrato);
      if (totalMesesNum !== null) {
        const semanasCotizadasNum = parseInt(generalData.semanasCotizadas) || 0;
        const semanasFinales = calcularSemanasAlFinal(semanasCotizadasNum, totalMesesNum);

        updateGeneralData({
          totalMeses: totalMesesNum.toString(),
          semanasAlFinal: semanasFinales.toString()
        });
      }
    }
  }, [updateGeneralData, generalData.fechaFinContrato, generalData.semanasCotizadas]);

  const handleFechaFinChange = useCallback((fechaFin: string) => {
    const totalMesesNum = calcularTotalMeses(generalData.fechaInicioContrato, fechaFin);

    if (totalMesesNum !== null) {
      const semanasCotizadasNum = parseInt(generalData.semanasCotizadas) || 0;
      const semanasFinales = calcularSemanasAlFinal(semanasCotizadasNum, totalMesesNum);

      updateGeneralData({
        fechaFinContrato: fechaFin,
        totalMeses: totalMesesNum.toString(),
        semanasAlFinal: semanasFinales.toString()
      });
    } else {
      // Si no se puede calcular meses (falta fecha inicio), solo actualizamos la fecha fin
      updateGeneralData({
        fechaFinContrato: fechaFin
      });
    }
  }, [updateGeneralData, generalData.fechaInicioContrato, generalData.semanasCotizadas]);

  const fechaContratoFormateada = useMemo(() => {
    if (!generalData.fechaInicioContrato) return '';
    const fecha = new Date(generalData.fechaInicioContrato);
    return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }, [generalData.fechaInicioContrato]);

  return { handleFechaFirmaChange, handleFechaFinChange, fechaContratoFormateada };
}
