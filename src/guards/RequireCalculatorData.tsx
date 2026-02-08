import { Navigate } from 'react-router';
import { useCalculator } from '@/contexts/CalculatorContext';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';

interface RequireCalculatorDataProps {
  children: React.ReactNode;
}

/**
 * Componente guardián que verifica si existen datos de la calculadora
 * antes de permitir el acceso a rutas protegidas.
 *
 * Si no hay datos, redirige automáticamente a /calculadora/datosGenerales
 * o muestra un mensaje si la redirección falla.
 */
export function RequireCalculatorData({ children }: RequireCalculatorDataProps) {
  const { isDataPersisted } = useCalculator();

  // Si no hay datos guardados, redirigir a datos generales
  if (!isDataPersisted) {
    return <Navigate to="/calculadora/datosGenerales" replace />;
  }

  // Si hay datos, renderizar el contenido
  return <>{children}</>;
}

/**
 * Componente de fallback que se muestra si el guardián falla
 * (por ejemplo, si el usuario navega directamente a la URL)
 */
export function RequireCalculatorDataMessage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Datos Requeridos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Para acceder a esta sección, primero debes completar los datos generales de la calculadora.
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium">Por favor:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Ve a la sección "Datos Generales"</li>
              <li>Completa el formulario con la información del cliente</li>
              <li>Guarda los datos</li>
              <li>Regresa a esta sección</li>
            </ol>
          </div>
          <Button asChild className="w-full">
            <Link to="/calculadora/datosGenerales">
              Ir a Datos Generales
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
