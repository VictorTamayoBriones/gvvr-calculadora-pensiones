import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { GeneralDataForm } from '@/models';

interface PresupuestoInicialProps {
  generalData: GeneralDataForm;
  onPrestamoFinancieroChange: (value: string) => void;
}

export function PresupuestoInicial({
  generalData,
  onPrestamoFinancieroChange
}: PresupuestoInicialProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Presupuesto Inicial</CardTitle>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="saldoAfore">Saldo AFORE</FieldLabel>
              <FieldContent>
                <Input
                  id="saldoAfore"
                  type="number"
                  value={generalData.saldoAfore}
                  readOnly
                />
              </FieldContent>
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
              <FieldLabel htmlFor="montoTotalInvertir">Monto total para invertir</FieldLabel>
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
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
