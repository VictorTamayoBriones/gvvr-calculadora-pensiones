import { AlertCircle } from 'lucide-react';

interface ValidationMessagesProps {
  errores: string[];
  advertencias: string[];
}

export function ValidationMessages({ errores, advertencias }: ValidationMessagesProps) {
  if (errores.length === 0 && advertencias.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mt-4">
      {errores.map((error, index) => (
        <div
          key={`error-${index}`}
          className="flex items-start gap-3 p-4 rounded-lg border bg-destructive/10 border-destructive text-destructive"
        >
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ))}

      {advertencias.map((advertencia, index) => (
        <div
          key={`warning-${index}`}
          className="flex items-start gap-3 p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/30 border-amber-500 dark:border-amber-500/50 text-amber-900 dark:text-amber-200"
        >
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{advertencia}</p>
        </div>
      ))}
    </div>
  );
}
