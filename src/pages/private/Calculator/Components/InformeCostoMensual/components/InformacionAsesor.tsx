import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface InformacionAsesorProps {
  nombreAsesor: string;
}

export function InformacionAsesor({ nombreAsesor }: InformacionAsesorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Asesor</CardTitle>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="nombreAsesor">Nombre del asesor responsable</FieldLabel>
            <FieldContent>
              <Input
                id="nombreAsesor"
                type="text"
                value={nombreAsesor}
                readOnly
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
