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
}

/**
 * Sección de presupuesto inicial: muestra saldo AFORE (solo lectura), préstamo financiero
 * (editable) y monto total calculado. Incluye validaciones de suficiencia por modalidad.
 */
export function PresupuestoInicial({
  generalData,
  validaciones,
  onPrestamoFinancieroChange
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
          </div>

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
