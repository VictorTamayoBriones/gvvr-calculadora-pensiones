import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { GeneralDataForm } from '@/models';
import { VigenciaDerechosInfo } from './VigenciaDerechosInfo';
import { ValidationMessages } from './ValidationMessages';

interface InformacionClienteProps {
  generalData: GeneralDataForm;
  tieneVigencia: boolean | null;
  infoVigencia: {
    tipo: 'vigente' | 'vencido';
    mensaje: string;
    detalle?: string;
    accion?: string;
  } | null;
  validaciones: {
    errores: string[];
    advertencias: string[];
  };
}

export function InformacionCliente({
  generalData,
  tieneVigencia,
  infoVigencia,
  validaciones
}: InformacionClienteProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del cliente</CardTitle>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="nombreCompleto">Nombre completo</FieldLabel>
              <FieldContent>
                <Input
                  id="nombreCompleto"
                  type="text"
                  value={generalData.nombreCliente}
                  readOnly
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="nss">NSS (Número de Seguridad Social)</FieldLabel>
              <FieldContent>
                <Input
                  id="nss"
                  type="text"
                  value={generalData.nss}
                  readOnly
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="curp">CURP</FieldLabel>
              <FieldContent>
                <Input
                  id="curp"
                  type="text"
                  maxLength={18}
                  value={generalData.curp}
                  readOnly
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="fechaNacimiento">Fecha de nacimiento</FieldLabel>
              <FieldContent>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={generalData.fechaNacimiento}
                  readOnly
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="semanasCotizadas">Semanas cotizadas</FieldLabel>
              <FieldContent>
                <Input
                  id="semanasCotizadas"
                  type="number"
                  value={generalData.semanasCotizadas}
                  readOnly
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="edad">Edad</FieldLabel>
              <FieldContent>
                <Input
                  id="edad"
                  type="number"
                  value={generalData.edad}
                  readOnly
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="leyAplicable">Ley aplicable</FieldLabel>
              <FieldContent>
                <Select value={generalData.leyAplicable || undefined} disabled>
                  <SelectTrigger id="leyAplicable">
                    <SelectValue placeholder="Seleccionar ley" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEY_73">LEY 73</SelectItem>
                    <SelectItem value="LEY_97">LEY 97</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="fechaBaja">Fecha de baja</FieldLabel>
              <FieldContent>
                <Input
                  id="fechaBaja"
                  type="date"
                  value={generalData.fechaBaja}
                  readOnly
                />
              </FieldContent>
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="sinVigencia" className="flex items-center gap-2">
                {!tieneVigencia && (
                  <span>
                    Sin vigencia de derechos
                    {generalData.sinVigenciaDerechos && (
                      <span className="text-muted-foreground ml-2">
                        (Desde: {new Date(generalData.sinVigenciaDerechos).toLocaleDateString('es-MX')})
                      </span>
                    )}
                  </span>
                )}
              </FieldLabel>
            </Field>
          </div>

          <VigenciaDerechosInfo infoVigencia={infoVigencia} />
          <ValidationMessages errores={validaciones.errores} advertencias={validaciones.advertencias} />
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
