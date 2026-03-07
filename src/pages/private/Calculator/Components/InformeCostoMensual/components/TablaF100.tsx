import { useMemo, memo } from 'react';
import { AlertCircle } from 'lucide-react';
import type { GeneralDataForm } from '@/models';
import { calcularLineaTiempoF100, formatMXN, type FilaCostoMensual } from '../lineaTiempoF100';
import { getDuracionContrato } from '@/utils/preciosAnuales';

interface TablaF100Props {
  generalData: GeneralDataForm;
}

export const TablaF100 = memo(function TablaF100({ generalData }: TablaF100Props) {
  const resultado = useMemo(() => {
    if (!generalData.fechaInicioContrato || !generalData.totalMeses) {
      return null;
    }
    const totalMeses = parseInt(generalData.totalMeses) || 0;
    if (totalMeses < getDuracionContrato().min) return null;

    return calcularLineaTiempoF100({
      fechaInicio: generalData.fechaInicioContrato,
      totalMeses,
    });
  }, [generalData.fechaInicioContrato, generalData.totalMeses]);

  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <h3 className="text-sm font-semibold mb-1">MOD. 3 FINANCIADO 100%</h3>

      {!resultado && (
        <div className="text-sm text-muted-foreground">
          <p>Complete las fechas del contrato para ver la tabla de pagos</p>
        </div>
      )}

      {resultado && !resultado.success && (
        <div className="space-y-2">
          {resultado.errores?.map((error, index) => (
            <div
              key={`error-${index}`}
              className="flex items-start gap-2 p-3 rounded-lg border bg-destructive/10 border-destructive/30 text-destructive"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-xs">{error}</p>
            </div>
          ))}
        </div>
      )}

      {resultado && resultado.success && resultado.filas && (
        <div className="space-y-3">
          {/* Año de inicio */}
          {resultado.detalles && (
            <p className="text-xs text-muted-foreground">
              Año inicio: {resultado.detalles.añoInicio}
            </p>
          )}

          {/* Tabla de pagos con 2 columnas de monto */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-semibold">#</th>
                  <th className="text-left py-2 px-2 font-semibold">Mes</th>
                  <th className="text-right py-2 px-2 font-semibold">F.100%</th>
                  <th className="text-right py-2 px-2 font-semibold">F100+</th>
                </tr>
              </thead>
              <tbody>
                {resultado.filas.map((fila: FilaCostoMensual, index: number) => {
                  const esTotal = fila.esFila === 'total';
                  const esGestoria = fila.esFila === 'gestoria';
                  const esTotalGeneral = fila.esFila === 'total-general';
                  const esFilaEspecial = esTotal || esGestoria || esTotalGeneral;

                  return (
                    <tr
                      key={index}
                      className={`border-b ${
                        esTotalGeneral
                          ? 'bg-primary/10 font-bold'
                          : esTotal || esGestoria
                            ? 'bg-muted/50 font-semibold'
                            : 'hover:bg-muted/30'
                      }`}
                    >
                      <td className="py-2 px-2">{fila.numero > 0 ? fila.numero : ''}</td>
                      <td className="py-2 px-2">{fila.mes}</td>
                      <td className={`py-2 px-2 text-right ${esFilaEspecial ? 'font-semibold' : ''}`}>
                        {formatMXN(fila.costoBase)}
                      </td>
                      <td className={`py-2 px-2 text-right ${esFilaEspecial ? 'font-semibold' : ''}`}>
                        {formatMXN(fila.costoPlus)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Detalles adicionales */}
          {resultado.detalles && (
            <div className="text-xs text-muted-foreground space-y-1 mt-3 pt-3 border-t">
              <p>Duración: {resultado.detalles.duracionMeses} meses</p>
              <p>Diferencia F100+: {formatMXN(resultado.detalles.totalPlus - resultado.detalles.totalBase)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
