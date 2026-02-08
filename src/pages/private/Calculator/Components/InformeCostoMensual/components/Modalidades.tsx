import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import type { GeneralDataForm } from '@/models';
import { calcularLineaTiempo, formatMXN, type FilaPago } from '../lineaTiempoRetoma';

interface ModalidadesProps {
  generalData: GeneralDataForm;
}

export function Modalidades({ generalData }: ModalidadesProps) {
  // Calcular línea de tiempo RETOMA
  const resultadoRetoma = useMemo(() => {
    if (!generalData.fechaInicioContrato || !generalData.fechaFinContrato) {
      return null;
    }

    return calcularLineaTiempo({
      fechaAlta: generalData.fechaInicioContrato,
      fechaFin: generalData.fechaFinContrato,
    });
  }, [generalData.fechaInicioContrato, generalData.fechaFinContrato]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modalidades</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primera División - MOD 1. RETOMA */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="text-sm font-semibold mb-3">MOD 1. RETOMA</h3>

            {!resultadoRetoma && (
              <div className="text-sm text-muted-foreground">
                <p>Complete las fechas del contrato para ver la tabla de pagos</p>
              </div>
            )}

            {resultadoRetoma && !resultadoRetoma.success && (
              <div className="space-y-2">
                {resultadoRetoma.errores?.map((error, index) => (
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

            {resultadoRetoma && resultadoRetoma.success && resultadoRetoma.filas && (
              <div className="space-y-3">
                {/* Advertencias si las hay */}
                {resultadoRetoma.advertencias && resultadoRetoma.advertencias.length > 0 && (
                  <div className="space-y-2">
                    {resultadoRetoma.advertencias.map((adv, index) => (
                      <div
                        key={`adv-${index}`}
                        className="flex items-start gap-2 p-3 rounded-lg border bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                      >
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p className="text-xs">{adv}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tabla de pagos */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-semibold">#</th>
                        <th className="text-left py-2 px-2 font-semibold">Mes</th>
                        <th className="text-right py-2 px-2 font-semibold">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultadoRetoma.filas.map((fila: FilaPago, index: number) => {
                        // Estilos según tipo de fila
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
                              {formatMXN(fila.monto)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Detalles adicionales */}
                {resultadoRetoma.detalles && (
                  <div className="text-xs text-muted-foreground space-y-1 mt-3 pt-3 border-t">
                    <p>Duración: {resultadoRetoma.detalles.duracionMeses} meses</p>
                    <p>Precio promedio: {formatMXN(resultadoRetoma.detalles.precioPromedio)}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Segunda División - Tabla 2 */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="text-sm font-semibold mb-3">MOD. 3 FINANCIADO 100% (F100+)</h3>
            <div className="text-sm text-muted-foreground">
              {/* Aquí irá el contenido de la segunda tabla */}
              <p>Contenido de la tabla 2 pendiente...</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
