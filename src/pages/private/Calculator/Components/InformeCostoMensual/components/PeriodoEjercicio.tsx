import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { GeneralDataForm } from '@/models';

interface PeriodoEjercicioProps {
  generalData: GeneralDataForm;
}

export function PeriodoEjercicio({ generalData }: PeriodoEjercicioProps) {
  // Calcular año y mes de inicio desde fechaInicioContrato
  const calcularPeriodoInicio = () => {
    if (!generalData.fechaInicioContrato) {
      return { anio: '', mes: '' };
    }

    const fecha = new Date(generalData.fechaInicioContrato);
    const anio = fecha.getFullYear().toString();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');

    return { anio, mes };
  };

  // Calcular año y mes de fin desde fechaFinContrato
  const calcularPeriodoFin = () => {
    if (!generalData.fechaFinContrato) {
      return { anio: '', mes: '' };
    }

    const fecha = new Date(generalData.fechaFinContrato);
    const anio = fecha.getFullYear().toString();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');

    return { anio, mes };
  };

  const periodoInicio = calcularPeriodoInicio();
  const periodoFin = calcularPeriodoFin();

  // Formatear mes para mostrar nombre
  const obtenerNombreMes = (mes: string) => {
    if (!mes) return '';
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const numeroMes = parseInt(mes, 10);
    return numeroMes >= 1 && numeroMes <= 12 ? meses[numeroMes - 1] : '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Período del Ejercicio</CardTitle>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Año y mes de inicio */}
            <Field>
              <FieldLabel htmlFor="anioInicio">Año de inicio</FieldLabel>
              <FieldContent>
                <Input
                  id="anioInicio"
                  type="text"
                  value={periodoInicio.anio}
                  readOnly
                  className="bg-muted"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="mesInicio">Mes de inicio</FieldLabel>
              <FieldContent>
                <Input
                  id="mesInicio"
                  type="text"
                  value={periodoInicio.mes ? `${periodoInicio.mes} - ${obtenerNombreMes(periodoInicio.mes)}` : ''}
                  readOnly
                  className="bg-muted"
                />
              </FieldContent>
            </Field>

            {/* Año y mes de fin */}
            <Field>
              <FieldLabel htmlFor="anioFin">Año de fin</FieldLabel>
              <FieldContent>
                <Input
                  id="anioFin"
                  type="text"
                  value={periodoFin.anio}
                  readOnly
                  className="bg-muted"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="mesFin">Mes de fin</FieldLabel>
              <FieldContent>
                <Input
                  id="mesFin"
                  type="text"
                  value={periodoFin.mes ? `${periodoFin.mes} - ${obtenerNombreMes(periodoFin.mes)}` : ''}
                  readOnly
                  className="bg-muted"
                />
              </FieldContent>
            </Field>
          </div>

          {/* Información adicional */}
          {(periodoInicio.anio || periodoFin.anio) && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Período:</span>{' '}
                {periodoInicio.anio && periodoInicio.mes && periodoFin.anio && periodoFin.mes
                  ? `${obtenerNombreMes(periodoInicio.mes)} ${periodoInicio.anio} - ${obtenerNombreMes(periodoFin.mes)} ${periodoFin.anio}`
                  : 'Ingrese las fechas de inicio y fin del contrato para calcular el período'}
              </p>
            </div>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
