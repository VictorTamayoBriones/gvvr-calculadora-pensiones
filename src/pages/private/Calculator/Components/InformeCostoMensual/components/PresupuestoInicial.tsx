import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ValidationMessages } from './ValidationMessages';
import type { GeneralDataForm } from '@/models';
import { usaAforeEnModalidad } from '@/models/calculator.types';

interface PresupuestoInicialProps {
  generalData: GeneralDataForm;
  validaciones: {
    errores: string[];
    advertencias: string[];
    info: string[];
  };
  onPrestamoFinancieroChange: (value: string) => void;
  mensajeAplicabilidad?: string;
  saldoAFavor?: number;
}

/**
 * Sección de presupuesto inicial: muestra saldo AFORE (solo lectura), préstamo financiero
 * (editable) y monto total calculado. Incluye validaciones de suficiencia por modalidad.
 */
export function PresupuestoInicial({
  generalData,
  validaciones,
  onPrestamoFinancieroChange,
  mensajeAplicabilidad,
  saldoAFavor,
}: PresupuestoInicialProps) {
  // Determinar si la modalidad usa AFORE
  const usaAfore = usaAforeEnModalidad(generalData.modalidad);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presupuesto Inicial</CardTitle>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="saldoAfore">
                Saldo AFORE
                {!usaAfore && generalData.saldoAfore && parseFloat(generalData.saldoAfore) > 0 && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 ml-2">
                    (No se usa en {generalData.modalidad})
                  </span>
                )}
              </FieldLabel>
              <FieldContent>
                <Input
                  id="saldoAfore"
                  type="number"
                  value={generalData.saldoAfore}
                  readOnly
                  className={!usaAfore && parseFloat(generalData.saldoAfore || '0') > 0 ? 'opacity-60' : ''}
                />
              </FieldContent>
              {usaAfore && (
                <p className="text-xs text-muted-foreground mt-1">
                  *Solo aplica para REACTIVA TRADICIONAL y FINANCIADO 1
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="prestamoFinanciero">Préstamo financiero</FieldLabel>
              <FieldContent>
                <Input
                  id="prestamoFinanciero"
                  type="number"
                  value={generalData.prestamoFinanciero}
                  onChange={(e) => onPrestamoFinancieroChange(e.target.value)}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="montoTotalInvertir">
                Monto total para invertir
                <span className="text-xs text-muted-foreground ml-2">(calculado automáticamente)</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="montoTotalInvertir"
                  type="number"
                  value={generalData.montoTotalInvertir}
                  readOnly
                  className="bg-muted"
                />
              </FieldContent>
            </Field>

            {/* Saldo a favor — solo visible si > 0 */}
            {saldoAFavor != null && saldoAFavor > 0 && (
              <Field>
                <FieldLabel htmlFor="saldoAFavor">
                  Saldo a favor
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="saldoAFavor"
                    type="text"
                    value={`$${saldoAFavor.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    readOnly
                    className="bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200"
                  />
                </FieldContent>
              </Field>
            )}
          </div>

          {/* Mensaje de aplicabilidad */}
          {mensajeAplicabilidad && (
            <div className={`mt-3 p-3 rounded-lg border text-sm font-medium ${
              mensajeAplicabilidad.includes('SOLO APLICA')
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200'
                : 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
            }`}>
              {mensajeAplicabilidad}
            </div>
          )}

          {/* Validaciones del presupuesto */}
          <ValidationMessages
            errores={validaciones.errores}
            advertencias={validaciones.advertencias}
            info={validaciones.info}
          />
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
