# GVVR Calculadora de Pensiones

Aplicación web para calcular opciones de pensión y financiamiento para prospectos de Grupo a Vivir.

## Stack

- **React 19** · **TypeScript** · **Vite 7**
- **Tailwind CSS v4** · **shadcn/ui** · **Radix UI**
- **React Router v7**

## Requisitos

- [Bun](https://bun.sh) >= 1.x
- Node.js >= 20 (requerido por Vite 7)

## Desarrollo

```bash
bun install        # Instalar dependencias
bun dev            # Servidor de desarrollo (http://localhost:5173)
bun build          # Type-check + build de producción
bun preview        # Preview del build de producción
bun lint           # ESLint
```

## Estructura del Proyecto

```
src/
├── contexts/          # AuthContext · CalculatorContext
├── guards/            # PrivateRoute · RequireCalculatorData
├── layouts/           # PrivateLayout (sidebar + header)
├── pages/
│   ├── public/Login/
│   └── private/
│       ├── Dashboard/
│       └── Calculator/
│           └── Components/
│               ├── GenralData/          # Formulario de datos generales
│               ├── Cotizacion/
│               └── InformeCostoMensual/
├── components/ui/     # Componentes shadcn/ui
├── models/            # TypeScript types
├── helpers/           # Utilidades (formatText, CURP)
└── routes/            # Definición de rutas
docs/                  # Reglas de negocio y documentación técnica
```

## Flujo de la Aplicación

1. **Login** — autenticación simple (mock, sin backend)
2. **Datos Generales** — captura de datos del prospecto + cálculo de modalidad
3. **Cotización** — (en desarrollo)
4. **Informe de Costo Mensual** — reporte detallado de la pensión

## Documentación

Las reglas de negocio y documentación técnica se encuentran en [`docs/`](docs/).
