import { useMemo, useCallback } from 'react';
import type { GeneralDataForm } from '@/models';
import {
  calcularFechaInicioContrato,
  calcularTotalMesesDesdeSemanas,
  calcularDatosFinContrato,
  formatearFechaCorta,
} from '@/utils/dateCalculations';

/**
 * Gestiona las fechas del contrato: calcula fecha de inicio desde firma,
 * y recalcula fechaFinContrato y totalMeses automáticamente.
 *
 * @returns Handler para cambio de fechaFirma y fecha de contrato formateada
 */
export function useContratoDates(
  generalData: GeneralDataForm,
  updateGeneralData: (data: Partial<GeneralDataForm>) => void
) {
  const handleFechaFirmaChange = useCallback((fechaFirma: string) => {
    const fechaInicioSugerida = calcularFechaInicioContrato(fechaFirma) || '';

    const semanasCotizadasNum = parseInt(generalData.semanasCotizadas) || 0;
    const totalMesesNum = fechaInicioSugerida
      ? calcularTotalMesesDesdeSemanas(semanasCotizadasNum, fechaInicioSugerida)
      : null;

    const datosFin = totalMesesNum !== null
      ? calcularDatosFinContrato(fechaInicioSugerida, totalMesesNum, semanasCotizadasNum)
      : null;

    updateGeneralData({
      fechaFirmaContrato: fechaFirma,
      fechaInicioContrato: fechaInicioSugerida,
      ...(totalMesesNum !== null && { totalMeses: totalMesesNum.toString() }),
      ...(datosFin !== null && {
        fechaFinContrato: datosFin.fechaFin,
        semanasAlFinal: datosFin.semanasFinales.toString(),
      }),
    });
  }, [updateGeneralData, generalData.semanasCotizadas]);

  const fechaContratoFormateada = useMemo(() => {
    return formatearFechaCorta(generalData.fechaInicioContrato);
  }, [generalData.fechaInicioContrato]);

  return { handleFechaFirmaChange, fechaContratoFormateada };
}
