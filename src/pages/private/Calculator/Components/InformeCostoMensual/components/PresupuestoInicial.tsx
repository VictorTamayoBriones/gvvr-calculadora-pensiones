import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { AlertCircle, Info } from 'lucide-react';
import type { GeneralDataForm } from '@/models';

interface PresupuestoInicialProps {
  generalData: GeneralDataForm;
  validaciones: {
    errores: string[];
    advertencias: string[];
    info: string[];
  };
  onPrestamoFinancieroChange: (value: string) => void;
}

export function PresupuestoInicial({
  generalData,
  validaciones,
  onPrestamoFinancieroChange
}: PresupuestoInicialProps) {
  // Determinar si la modalidad usa AFORE
  const usaAfore = generalData.modalidad === 'REACTIVA TRADICIONAL' ||
                   generalData.modalidad === 'FINANCIADO 1';

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
          {(validaciones.errores.length > 0 || validaciones.advertencias.length > 0 || validaciones.info.length > 0) && (
            <div className="space-y-3 mt-4">
              {/* Errores críticos */}
              {validaciones.errores.map((error, index) => (
                <div
                  key={`budget-error-${index}`}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-destructive/10 border-destructive text-destructive"
                >
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              ))}

              {/* Advertencias */}
              {validaciones.advertencias.map((advertencia, index) => (
                <div
                  key={`budget-warning-${index}`}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/30 border-amber-500 dark:border-amber-500/50 text-amber-900 dark:text-amber-200"
                >
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{advertencia}</p>
                </div>
              ))}

              {/* Información */}
              {validaciones.info.map((informacion, index) => (
                <div
                  key={`budget-info-${index}`}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500/50 text-blue-900 dark:text-blue-200"
                >
                  <Info className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{informacion}</p>
                </div>
              ))}
            </div>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
