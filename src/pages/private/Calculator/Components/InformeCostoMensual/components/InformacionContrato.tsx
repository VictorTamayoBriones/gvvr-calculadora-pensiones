import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { GeneralDataForm } from '@/models';
import { ValidationMessages } from './ValidationMessages';

interface InformacionContratoProps {
  generalData: GeneralDataForm;
  validaciones: {
    errores: string[];
    advertencias: string[];
  };
  onFechaFirmaChange: (fecha: string) => void;
  onFechaFinChange: (fecha: string) => void;
}

export function InformacionContrato({
  generalData,
  validaciones,
  onFechaFirmaChange,
  onFechaFinChange
}: InformacionContratoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Contrato</CardTitle>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="fechaFirmaContrato">Fecha de firma del contrato</FieldLabel>
              <FieldContent>
                <Input
                  id="fechaFirmaContrato"
                  type="date"
                  value={generalData.fechaFirmaContrato}
                  onChange={(e) => onFechaFirmaChange(e.target.value)}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="fechaInicioContrato">Fecha de inicio</FieldLabel>
              <FieldContent>
                <Input
                  id="fechaInicioContrato"
                  type="date"
                  value={generalData.fechaInicioContrato}
                  readOnly
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="fechaFinContrato">Fecha de fin</FieldLabel>
              <FieldContent>
                <Input
                  id="fechaFinContrato"
                  type="date"
                  value={generalData.fechaFinContrato}
                  onChange={(e) => onFechaFinChange(e.target.value)}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="totalMeses">Total de meses (mínimo 14)</FieldLabel>
              <FieldContent>
                <Input
                  id="totalMeses"
                  type="number"
                  value={generalData.totalMeses}
                  readOnly
                  className="bg-muted"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="semanasAlFinal">Semanas al final del ejercicio</FieldLabel>
              <FieldContent>
                <Input
                  id="semanasAlFinal"
                  type="number"
                  value={generalData.semanasAlFinal}
                  readOnly
                  className="bg-muted"
                />
              </FieldContent>
            </Field>
          </div>

          <ValidationMessages errores={validaciones.errores} advertencias={validaciones.advertencias} />
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
