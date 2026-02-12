import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { AlertCircle, Info } from 'lucide-react';
import type { GeneralDataForm } from '@/models';
import { calcularMontoPension } from '@/utils/calculoMontoPension';
import { useMemo } from 'react';

interface DatosPensionProps {
  generalData: GeneralDataForm;
}

export function DatosPension({ generalData }: DatosPensionProps) {
  // Calcular mes y año de ingreso de pensión desde fechaInicioContrato
  const calcularIngresoPension = () => {
    if (!generalData.fechaInicioContrato) {
      return '';
    }

    const fecha = new Date(generalData.fechaInicioContrato);
    const anio = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;
    const nombreMes = obtenerNombreMes(mes);

    return `${nombreMes} ${anio}`;
  };

  // Calcular mes y año de resolución de pensión desde fechaFinContrato
  const calcularResolucionPension = () => {
    if (!generalData.fechaFinContrato) {
      return '';
    }

    const fecha = new Date(generalData.fechaFinContrato);
    const anio = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;
    const nombreMes = obtenerNombreMes(mes);

    return `${nombreMes} ${anio}`;
  };

  // Obtener nombre del mes
  const obtenerNombreMes = (mes: number) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return mes >= 1 && mes <= 12 ? meses[mes - 1] : '';
  };

  const ingresoPension = calcularIngresoPension();
  const resolucionPension = calcularResolucionPension();

  // Calcular monto de pensión usando las reglas de negocio
  const resultadoPension = useMemo(() => {
    // Validar que tenemos los datos necesarios
    if (!generalData.fechaNacimiento || !generalData.curp ||
        !generalData.fechaInicioContrato || !generalData.fechaFinContrato) {
      return null;
    }

    return calcularMontoPension(
      generalData.fechaNacimiento,
      generalData.curp,
      generalData.fechaInicioContrato,
      generalData.fechaFinContrato
    );
  }, [
    generalData.fechaNacimiento,
    generalData.curp,
    generalData.fechaInicioContrato,
    generalData.fechaFinContrato
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de la Pensión</CardTitle>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Ingreso de pensión */}
            <Field>
              <FieldLabel htmlFor="ingresoPension">
                Ingreso de pensión en el mes
              </FieldLabel>
              <FieldContent>
                <Input
                  id="ingresoPension"
                  type="text"
                  value={ingresoPension}
                  readOnly
                  className="bg-muted"
                />
              </FieldContent>
            </Field>

            {/* Resolución de pensión */}
            <Field>
              <FieldLabel htmlFor="resolucionPension">
                Resolución de pensión
              </FieldLabel>
              <FieldContent>
                <Input
                  id="resolucionPension"
                  type="text"
                  value={resolucionPension}
                  readOnly
                  className="bg-muted"
                />
              </FieldContent>
            </Field>

            {/* Monto de pensión */}
            <Field>
              <FieldLabel htmlFor="montoPension">
                Monto de pensión
              </FieldLabel>
              <FieldContent>
                <Input
                  id="montoPension"
                  type="text"
                  value={resultadoPension?.success && resultadoPension.textoFormateado
                    ? resultadoPension.textoFormateado
                    : '$0.00'}
                  readOnly
                  className="bg-muted"
                />
              </FieldContent>
            </Field>
          </div>

          {/* Mostrar detalles del cálculo si existe */}
          {resultadoPension?.success && resultadoPension.detalles && (
            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="space-y-1 text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium">Detalles del cálculo:</p>
                  <ul className="space-y-0.5 text-xs">
                    <li>• Edad actual: {resultadoPension.detalles.edadActual} años</li>
                    <li>• Años de contrato: {resultadoPension.detalles.añosAdicionales} años</li>
                    <li>• Edad al pensionarse: {resultadoPension.detalles.edadAlPensionarse} años</li>
                    <li>• Año de pensión: {resultadoPension.detalles.añoPension}</li>
                    {resultadoPension.detalles.edadUsadaEnTabla !== resultadoPension.detalles.edadAlPensionarse && (
                      <li className="text-amber-700 dark:text-amber-300">
                        • Se usó edad {resultadoPension.detalles.edadUsadaEnTabla} para la búsqueda en tabla
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Mostrar advertencias si existen */}
          {resultadoPension?.success && resultadoPension.advertencias && resultadoPension.advertencias.length > 0 && (
            <div className="space-y-2 mt-3">
              {resultadoPension.advertencias.map((advertencia, index) => (
                <div
                  key={`pension-warning-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/30 border-amber-500 dark:border-amber-500/50 text-amber-900 dark:text-amber-200"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium">{advertencia}</p>
                </div>
              ))}
            </div>
          )}

          {/* Mostrar errores si existen */}
          {resultadoPension && !resultadoPension.success && resultadoPension.errores && (
            <div className="space-y-2 mt-3">
              {resultadoPension.errores.map((error, index) => (
                <div
                  key={`pension-error-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-destructive/10 border-destructive text-destructive"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium">{error}</p>
                </div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Nota:</span> Los montos son estimativos según la tabla oficial de pensiones mínimas.
              El monto final puede variar ±10% según la resolución del IMSS.
            </p>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
