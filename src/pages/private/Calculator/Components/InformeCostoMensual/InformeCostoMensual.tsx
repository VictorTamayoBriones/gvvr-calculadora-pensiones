import LOGO from '@/assets/logo_gvvr.webp';
import './style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useInformeCostoMensual } from './useInformeCostoMensual';

export default function InformeCostoMensual() {
  const { generalData, fechaContratoFormateada, tieneVigencia, infoVigencia, validaciones } = useInformeCostoMensual();

  return (
    <div className='InformeCostoMensual flex flex-col gap-4'>
        <header>
            <img src={LOGO} alt="Grupo a vivir" />
            <div>
                <p>FECHA FIRMA DE CONTRATO: {fechaContratoFormateada || '05/02/26'}</p>
                <h1>RECUPERACIÓN DE DERECHOS PENSIONARIOS</h1>
            </div>
        </header>

        <form className='flex flex-col gap-4' >

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
                                    {
                                        !tieneVigencia && (
                                            <span>
                                                Sin vigencia de derechos
                                                {generalData.sinVigenciaDerechos && (
                                                    <span className="text-muted-foreground ml-2">
                                                        (Desde: {new Date(generalData.sinVigenciaDerechos).toLocaleDateString('es-MX')})
                                                    </span>
                                                )}
                                            </span>
                                        )
                                    }
                                </FieldLabel>
                            </Field>
                        </div>
                    </FieldGroup>
                </CardContent>
            </Card>

            {/* Mensajes de validación */}
            {(validaciones.errores.length > 0 || validaciones.advertencias.length > 0 || infoVigencia) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Estado de Elegibilidad</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {/* Errores críticos */}
                            {validaciones.errores.map((error, index) => (
                                <div
                                    key={`error-${index}`}
                                    className="flex items-start gap-3 p-4 rounded-lg border bg-destructive/10 border-destructive text-destructive"
                                >
                                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            ))}

                            {/* Advertencias */}
                            {validaciones.advertencias.map((advertencia, index) => (
                                <div
                                    key={`warning-${index}`}
                                    className="flex items-start gap-3 p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/30 border-amber-500 dark:border-amber-500/50 text-amber-900 dark:text-amber-200"
                                >
                                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                    <p className="text-sm font-medium">{advertencia}</p>
                                </div>
                            ))}

                            {/* Información de vigencia de derechos */}
                            {infoVigencia && infoVigencia.tipo === 'vencido' && (
                                <div className="rounded-lg border bg-red-50 dark:bg-red-950/30 border-red-500 dark:border-red-500/50 p-4">
                                    <div className="flex items-start gap-3 mb-2">
                                        <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-red-900 dark:text-red-200">
                                                {infoVigencia.mensaje}
                                            </p>
                                            <p className=" text-red-800 dark:text-red-300 mt-1">
                                                {infoVigencia.detalle}
                                            </p>
                                        </div>
                                    </div>
                                    <div className=" dark:bg-red-900/20 rounded-md" style={{paddingLeft:'30px'}}>
                                        <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                                            📋 {infoVigencia.accion}
                                        </p>
                                        <p className=" text-red-800 dark:text-red-300 mt-1">
                                            Este es el propósito principal del programa de recuperación de derechos pensionarios
                                        </p>
                                    </div>
                                </div>
                            )}

                            {infoVigencia && infoVigencia.tipo === 'vigente' && (
                                <div className="flex items-start gap-3 p-4 rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-500 dark:border-green-500/50 text-green-900 dark:text-green-200">
                                    <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                    <p className="text-sm font-medium">{infoVigencia.mensaje}</p>
                                </div>
                            )}

                            {/* Mensaje de éxito si no hay errores ni advertencias */}
                            {validaciones.errores.length === 0 &&
                             validaciones.advertencias.length === 0 &&
                             (!infoVigencia || infoVigencia.tipo === 'vigente') && (
                                <div className="flex items-start gap-3 p-4 rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-500 dark:border-green-500/50 text-green-900 dark:text-green-200">
                                    <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                    <p className="text-sm font-medium">
                                        El cliente cumple con todos los requisitos básicos para el programa
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

        </form>
    </div>
  )
}
