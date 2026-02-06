import { AlertCircle, CheckCircle } from 'lucide-react';

interface InfoVigencia {
  tipo: 'vigente' | 'vencido';
  mensaje: string;
  detalle?: string;
  accion?: string;
}

interface VigenciaDerechosInfoProps {
  infoVigencia: InfoVigencia | null;
}

export function VigenciaDerechosInfo({ infoVigencia }: VigenciaDerechosInfoProps) {
  if (!infoVigencia) return null;

  if (infoVigencia.tipo === 'vencido') {
    return (
      <div className="rounded-lg border bg-red-50 dark:bg-red-950/30 border-red-500 dark:border-red-500/50 p-4 mt-4">
        <div className="flex items-start gap-3 mb-2">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-900 dark:text-red-200">
              {infoVigencia.mensaje}
            </p>
            {infoVigencia.detalle && (
              <p className="text-red-800 dark:text-red-300 mt-1">
                {infoVigencia.detalle}
              </p>
            )}
          </div>
        </div>
        {infoVigencia.accion && (
          <div className="dark:bg-red-900/20 rounded-md" style={{ paddingLeft: '30px' }}>
            <p className="text-sm font-semibold text-red-900 dark:text-red-200">
              📋 {infoVigencia.accion}
            </p>
            <p className="text-red-800 dark:text-red-300 mt-1">
              Este es el propósito principal del programa de recuperación de derechos pensionarios
            </p>
          </div>
        )}
      </div>
    );
  }

  if (infoVigencia.tipo === 'vigente') {
    return (
      <div className="flex items-start gap-3 p-4 rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-500 dark:border-green-500/50 text-green-900 dark:text-green-200 mt-4">
        <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
        <p className="text-sm font-medium">{infoVigencia.mensaje}</p>
      </div>
    );
  }

  return null;
}
