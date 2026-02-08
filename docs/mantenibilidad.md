📊 Análisis de Mantenibilidad y Escalabilidad - GVVR Calculadora de Pensiones
Resumen Ejecutivo
Estado actual: Proyecto en etapa temprana (~3,500 líneas) con arquitectura sólida pero con deuda técnica crítica que puede impedir el crecimiento.

Prioridades identificadas:

Seguridad y bugs críticos (bloqueantes)
Estructura de datos y lógica de negocio (escalabilidad)
Testing y validación (mantenibilidad)
Integración con APIs (funcionalidad completa)
🔴 PROBLEMAS CRÍTICOS (Atención Inmediata)
1. Código de Debug en Producción
Archivo: src/pages/private/Calculator/stepper.css:52
Problema: background: red; hardcodeado (sobrescribe gradient)
Impacto: Bug visual en componente principal
Solución: 1 línea de cambio
2. Autenticación Sin Validación
Archivo: src/pages/public/Login/useLogin.ts
Problema: El campo password se recolecta pero nunca se valida

const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  login(user)  // ← password ignorado
}
Impacto: Cualquiera puede acceder como cualquier usuario
Solución: Si es demo/POC, documentarlo claramente; si es producción, implementar validación real
3. Valores de Negocio Hardcodeados
Archivo: src/pages/private/Calculator/Components/GenralData/GeneralData.tsx:53-54

const VALOR_REFERENCIA = 80_000   // K25 – placeholder
const FACTOR_PENSION   = 12_000   // F44 – placeholder
Problema: Datos del formulario F100 no conectados a fuente real
Impacto: Cálculos incorrectos en producción
Solución: Mover a configuración centralizada o API
🟠 PROBLEMAS DE ESCALABILIDAD (Alta Prioridad)
4. Lógica de Negocio en Componentes
Problema: Cálculos de pensiones mezclados con UI (30 líneas en componente)

Ubicación actual:


// GeneralData.tsx:119-149
const resultados = useMemo(() => {
  // Cálculos complejos de pensión aquí
  const pensionMaxima = Math.min(
    salarioDiarioRegistrado * FACTOR_PENSION,
    VALOR_REFERENCIA
  )
  // ... más lógica
})
Impacto en escalabilidad:

❌ Imposible reutilizar lógica en otros componentes
❌ Difícil testear unitariamente
❌ Modificaciones requieren cambios en UI
Solución propuesta:


src/
├── services/
│   └── pension-calculator/
│       ├── calculator.service.ts    # Lógica pura
│       ├── calculator.service.test.ts
│       └── types.ts
5. Gestión de Estado No Escalará Más Allá de 5-7 Contexts
Estado actual: 2 contexts (Auth, Calculator)

Riesgos futuros:

Agregar más features (AFORE, historial, comparativas) = más contexts
Context Hell: re-renders innecesarios cuando crece el árbol
Difícil debuggear el flujo de datos
Recomendación:

Ahora: Mantener contexts actuales (son suficientes)
Cuando lleguen a 4+ contexts: Migrar a Zustand o Jotai (más ligeros que Redux)
6. Sin Capa de API / Data Fetching
Problema: No existe patrón para llamadas a backend

Necesidad futura:

Obtener datos de CONSAR (comisiones AFORE)
Validar CURP contra registros oficiales
Guardar cálculos en base de datos
Sincronizar entre dispositivos
Solución sugerida:


// src/services/api/
├── client.ts          // Axios/fetch wrapper con auth
├── endpoints/
│   ├── afore.api.ts
│   ├── pension.api.ts
│   └── user.api.ts
└── hooks/
    └── usePensionData.ts  // React Query hook
Librería recomendada: TanStack Query (ex React Query) para:

Cache automático
Re-fetch en foco de ventana
Estados de loading/error/success
Optimistic updates
7. Validación de Formularios No Escalable
Problema actual: Validadores inline en componente (60 líneas)


// GeneralData.tsx:20-46
const VALIDATORS: Record<string, (value: string) => string> = {
  salarioDiarioRegistrado: (value: string) => {
    if (!value) return "Este campo es obligatorio"
    // ... más reglas
  },
  // 7 campos más...
}
Por qué no escala:

Lógica duplicada si otros componentes necesitan validación similar
No reutilizable fuera de este componente
Difícil mantener reglas de negocio complejas
Solución recomendada:
Usar React Hook Form + Zod para schemas tipados:


// schemas/generalData.schema.ts
import { z } from 'zod'

export const generalDataSchema = z.object({
  salarioDiarioRegistrado: z.number()
    .positive('Debe ser positivo')
    .max(100_000, 'Máximo 100,000'),
  // ... más campos
})

// En componente:
const { register, handleSubmit, formState } = useForm({
  resolver: zodResolver(generalDataSchema)
})
Beneficios:

✅ Validación client-side y server-side con mismo schema
✅ TypeScript infiere tipos automáticamente
✅ Fácil agregar reglas complejas (dependen de otros campos)
✅ Mensajes de error centralizados
🟡 PROBLEMAS DE MANTENIBILIDAD (Media Prioridad)
8. Cero Cobertura de Tests
Riesgo: Cambios futuros pueden romper cálculos financieros sin detectarse

Prioridad de testing:

Tests unitarios para lógica de negocio (cálculos de pensión)
Tests de integración para flujos de usuario (completar formulario)
Tests E2E para casos críticos (login → calcular → resultado)
Setup mínimo recomendado:


bun add -d vitest @testing-library/react @testing-library/user-event

// services/pension-calculator/calculator.service.test.ts
import { describe, it, expect } from 'vitest'
import { calcularPension } from './calculator.service'

describe('Cálculo de Pensión', () => {
  it('debe aplicar FACTOR_PENSION correctamente', () => {
    const resultado = calcularPension({
      salarioDiarioRegistrado: 500,
      semanasLaboradas: 1000
    })
    expect(resultado.pensionMaxima).toBe(6_000_000) // 500 * 12_000
  })
})
9. Sin Error Boundaries
Problema: Si un componente crashea, toda la app se rompe

Solución:


// components/ErrorBoundary.tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
10. TypeScript Typing Gaps
Problemas encontrados:


// GeneralData.tsx:105-108
Object.keys(VALIDATORS).forEach((key) => {
  const fieldKey = key as keyof GeneralDataForm
  const value = form[fieldKey]  // ← Asume que todos los campos existen
})
Mejora:


const VALIDATOR_KEYS = Object.keys(VALIDATORS) as Array<keyof GeneralDataForm>
VALIDATOR_KEYS.forEach((key) => {
  const value = form[key] // ← Ahora TypeScript sabe que es válido
})
📐 RECOMENDACIONES ARQUITECTÓNICAS
Para Mantenibilidad
1. Extraer Lógica de Negocio

src/
├── services/
│   ├── pension/
│   │   ├── calculator.service.ts
│   │   ├── validator.service.ts
│   │   └── formatter.service.ts
│   └── afore/
│       └── commission.service.ts
2. Implementar Feature Folders (cuando crezca el proyecto)
En lugar de carpetas por tipo (pages/, components/, hooks/), agrupar por feature:


src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.ts
│   ├── calculator/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types.ts
│   │   └── index.ts
│   └── dashboard/
└── shared/
    ├── components/
    └── utils/
Ventajas:

✅ Todo relacionado con una feature está junto
✅ Fácil entender scope de cambios
✅ Equipos pueden trabajar en features independientes
3. Centralizar Constantes de Negocio

// src/config/business-rules.ts
export const PENSION_CONSTANTS = {
  VALOR_REFERENCIA: 80_000,
  FACTOR_PENSION: 12_000,
  SEMANAS_MINIMAS: 500,
  EDAD_RETIRO: 65
} as const

// Usar con tipado estricto
type PensionConstant = keyof typeof PENSION_CONSTANTS
Para Escalabilidad
4. Implementar Code Splitting

// routes/AppRoutes.tsx
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('@PrivatePages/Dashboard'))
const Calculator = lazy(() => import('@PrivatePages/Calculator'))

// En JSX:
<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
5. Agregar Performance Monitoring

// main.tsx
import { reportWebVitals } from './utils/performance'

reportWebVitals((metric) => {
  // Enviar a analytics (Google Analytics, Datadog, etc.)
  console.log(metric)
})
6. Preparar para i18n (Internacionalización)
Si eventualmente soportarán múltiples idiomas:


// i18n/es.json
{
  "calculator": {
    "fields": {
      "salarioDiarioRegistrado": "Salario Diario Registrado",
      "errors": {
        "required": "Este campo es obligatorio"
      }
    }
  }
}
🎯 PLAN DE ACCIÓN PRIORIZADO
Fase 1: Estabilización (1-2 semanas)
 Crítico: Eliminar background: red en stepper.css
 Crítico: Documentar/Implementar autenticación real
 Crítico: Mover constantes de negocio a archivo centralizado
 Alto: Implementar componente Cotizacion (actualmente stub)
 Alto: Agregar error boundaries básicos
Fase 2: Fundamentos de Escalabilidad (2-3 semanas)
 Extraer lógica de negocio a services/
 Implementar capa de API (axios + React Query)
 Agregar React Hook Form + Zod para validación
 Setup testing básico (Vitest + RTL)
 Escribir tests para cálculos de pensión
Fase 3: Arquitectura Avanzada (3-4 semanas)
 Migrar a Feature Folders (si el equipo crece)
 Implementar Zustand (si contexts > 4)
 Code splitting para rutas
 Agregar Storybook para componentes UI
 Performance monitoring (Web Vitals)
Fase 4: Producción-Ready (Ongoing)
 Coverage de tests > 80%
 Documentación técnica (Arquitectura, ADRs)
 CI/CD pipeline (tests automáticos, linting)
 Monitoring y alertas (Sentry, Datadog)
 A11y audit (accesibilidad WCAG)
📊 Métricas de Mantenibilidad Actuales
Métrica	Valor Actual	Objetivo	Estado
Cobertura de Tests	0%	>80%	🔴
TypeScript Strict	✅	✅	🟢
Componentes Documentados	0%	100%	🔴
Deuda Técnica	Alta	Baja	🔴
Líneas por Componente	~150	<200	🟢
Dependencias Desactualizadas	0	0	🟢
Bundle Size	350KB	<500KB	🟢
🚀 Recomendaciones de Stack para Crecimiento
Si el proyecto crece 5x (15K+ líneas):
State Management: Zustand o Jotai
Form Management: React Hook Form + Zod
Data Fetching: TanStack Query
Testing: Vitest + Testing Library + Playwright (E2E)
Documentation: Storybook + TSDoc
Monorepo (si múltiples apps): Turborepo
Si requieren alta performance:
Virtualización: TanStack Virtual (listas grandes)
Memoization agresiva: React.memo, useMemo, useCallback
Web Workers: Para cálculos pesados
¿Quieres que profundice en alguna de estas áreas específicas o que comience a implementar alguna de las mejoras prioritarias?

