import { useMemo, useCallback, useEffect } from 'react';
import type { GeneralDataForm } from '@/models';
import { usaAforeEnModalidad } from '@/models/calculator.types';

/**
 * Calcula y sincroniza el monto total a invertir.
 * Suma AFORE + préstamo solo en modalidades que usan AFORE; de lo contrario usa solo el préstamo.
 */
export function useMontoTotal(
  generalData: GeneralDataForm,
  updateGeneralData: (data: Partial<GeneralDataForm>) => void
) {
  // REGLA CRÍTICA: El saldo AFORE solo se usa en modalidades REACTIVA TRADICIONAL y FINANCIADO 1
  const calcularMontoTotal = useCallback(() => {
    const saldoAfore = parseFloat(generalData.saldoAfore) || 0;
    const prestamoFinanciero = parseFloat(generalData.prestamoFinanciero) || 0;

    const usaAfore = usaAforeEnModalidad(generalData.modalidad);

    const montoTotal = usaAfore
      ? saldoAfore + prestamoFinanciero
      : prestamoFinanciero;

    if (montoTotal > 0) {
      return montoTotal.toString();
    }
    return '';
  }, [generalData.saldoAfore, generalData.prestamoFinanciero, generalData.modalidad]);

  const montoTotalCalculado = useMemo(() => {
    return calcularMontoTotal();
  }, [calcularMontoTotal]);

  // Sincronizar el monto total calculado con el estado
  useEffect(() => {
    if (montoTotalCalculado !== generalData.montoTotalInvertir) {
      updateGeneralData({ montoTotalInvertir: montoTotalCalculado });
    }
  }, [montoTotalCalculado, generalData.montoTotalInvertir, updateGeneralData]);
}
