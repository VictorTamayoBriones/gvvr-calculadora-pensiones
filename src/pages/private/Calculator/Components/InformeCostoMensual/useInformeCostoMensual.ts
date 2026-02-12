import { useMemo } from 'react';
import { useCalculator } from '@/contexts/CalculatorContext';
import { useContratoDates } from './hooks/useContratoDates';
import { useMontoTotal } from './hooks/useMontoTotal';
import { useVigenciaDerechos } from './hooks/useVigenciaDerechos';
import { validarCliente, validarContrato, validarPresupuesto } from './validators';

/**
 * Hook orquestador del Informe de Costo Mensual.
 * Coordina fechas de contrato, monto total, vigencia de derechos,
 * y las tres validaciones (cliente, contrato, presupuesto).
 */
export function useInformeCostoMensual() {
  const { generalData, updateGeneralData } = useCalculator();

  const { handleFechaFirmaChange, handleFechaFinChange, fechaContratoFormateada } =
    useContratoDates(generalData, updateGeneralData);

  useMontoTotal(generalData, updateGeneralData);

  const { tieneVigencia, infoVigencia } =
    useVigenciaDerechos(generalData.sinVigenciaDerechos);

  // Validaciones delegadas a funciones puras
  const validacionesCliente = useMemo(
    () => validarCliente({
      edad: Number(generalData.edad) || 0,
      semanasCotizadas: Number(generalData.semanasCotizadas) || 0,
      leyAplicable: generalData.leyAplicable,
      modalidad: generalData.modalidad,
    }),
    [generalData.edad, generalData.semanasCotizadas, generalData.leyAplicable, generalData.modalidad]
  );

  const validacionesContrato = useMemo(
    () => validarContrato({
      fechaFirmaContrato: generalData.fechaFirmaContrato,
      fechaInicioContrato: generalData.fechaInicioContrato,
      fechaFinContrato: generalData.fechaFinContrato,
      totalMeses: generalData.totalMeses,
      semanasAlFinal: generalData.semanasAlFinal,
      semanasCotizadas: generalData.semanasCotizadas,
      fechaBaja: generalData.fechaBaja,
      leyAplicable: generalData.leyAplicable,
    }),
    [
      generalData.fechaFirmaContrato,
      generalData.fechaInicioContrato,
      generalData.fechaFinContrato,
      generalData.totalMeses,
      generalData.semanasAlFinal,
      generalData.semanasCotizadas,
      generalData.fechaBaja,
      generalData.leyAplicable,
    ]
  );

  const validacionesPresupuesto = useMemo(
    () => validarPresupuesto({
      saldoAfore: parseFloat(generalData.saldoAfore) || 0,
      prestamoFinanciero: parseFloat(generalData.prestamoFinanciero) || 0,
      montoTotalInvertir: parseFloat(generalData.montoTotalInvertir) || 0,
      edad: Number(generalData.edad) || 0,
      modalidad: generalData.modalidad,
    }),
    [
      generalData.saldoAfore,
      generalData.prestamoFinanciero,
      generalData.montoTotalInvertir,
      generalData.edad,
      generalData.modalidad,
    ]
  );

  return {
    generalData,
    updateGeneralData,
    fechaContratoFormateada,
    tieneVigencia,
    infoVigencia,
    validacionesCliente,
    validacionesContrato,
    validacionesPresupuesto,
    handleFechaFirmaChange,
    handleFechaFinChange,
  };
}
