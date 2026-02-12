# Plan de Refactorizacion: Cohesion, Acoplamiento y Mantenibilidad

## Diagnostico actual

El proyecto tiene buenos cimientos arquitectonicos: separacion clara entre contextos, guards, layouts, y paginas. Los modulos de utilidades puras (`dateCalculations.ts`, `financialCalculations.ts`, `calculoMontoPension.ts`, `lineaTiempoRetoma.ts`) son excelentes ejemplos de alta cohesion y bajo acoplamiento.

Sin embargo, hay problemas concretos que, si no se atienden ahora, escalaran conforme el proyecto crezca.

### Problemas identificados

| # | Problema | Severidad | Archivos afectados |
|---|----------|-----------|-------------------|
| P1 | `useInformeCostoMensual.ts` mezcla 6+ responsabilidades en 480 lineas | Alta | `InformeCostoMensual/useInformeCostoMensual.ts` |
| P2 | Logica de calculo de fechas duplicada entre modulos | Alta | `dateCalculations.ts`, `useInformeCostoMensual.ts` |
| P3 | Calculo de prestamo duplicado | Alta | `modalidadCalculations.ts:63-69`, `financialCalculations.ts:36-43` |
| P4 | Regla `usaAfore` (string literal) repetida en 3 lugares sin constante | Media | `useInformeCostoMensual.ts:97`, `PresupuestoInicial.tsx:23`, validaciones |
| P5 | 5 hooks auto-calculo con patron identico y `eslint-disable` | Media | `useAutoCalculatedFields.ts` |
| P6 | `useModalidad` modifica estado del padre como efecto secundario oculto | Media | `useModalidad.ts:50-59` |
| P7 | Import circular de tipos: `models/` importa desde `GenralData/constants` | Media | `calculator.types.ts:5` |
| P8 | Validaciones de negocio incrustadas en hook de UI (no testeables como funciones puras) | Alta | `useInformeCostoMensual.ts:165-464` |
| P9 | Renderizado de mensajes de validacion duplicado entre componentes | Baja | `PresupuestoInicial.tsx`, `ValidationMessages.tsx` |

---

## Fases de trabajo

### Fase 1 — Invertir la dependencia de tipos (P7)

**Objetivo:** Los modelos del dominio no deben depender de componentes de UI.

**Estado actual:**
```
calculator.types.ts  →  importa Modalidad desde  →  GenralData/constants.ts
```

**Estado deseado:**
```
models/calculator.types.ts  ←  define Modalidad
GenralData/constants.ts     ←  importa Modalidad desde @/models
```

**Cambios:**
1. Mover la definicion de `Modalidad` y `MODALIDADES` de `GenralData/constants.ts` a `src/models/calculator.types.ts`
2. En `GenralData/constants.ts`, importar `Modalidad` y `MODALIDADES` desde `@/models`
3. Eliminar el `import type { Modalidad }` invertido en `calculator.types.ts`
4. Verificar que todos los consumidores sigan compilando (`bun build`)

**Archivos a modificar:**
- `src/models/calculator.types.ts`
- `src/pages/private/Calculator/Components/GenralData/constants.ts`

**Riesgo:** Bajo. Solo mueve declaraciones de tipo.

---

### Fase 2 — Extraer funcion pura `usaAforeEnModalidad()` (P4)

**Objetivo:** Eliminar la regla de negocio dispersa como string literal y centralizarla.

**Estado actual:**
```typescript
// Repetido en 3 archivos distintos:
const usaAfore = generalData.modalidad === 'REACTIVA TRADICIONAL' ||
                 generalData.modalidad === 'FINANCIADO 1';
```

**Cambios:**
1. Crear funcion pura en `src/models/calculator.types.ts` (junto al tipo `Modalidad`):
   ```typescript
   export function usaAforeEnModalidad(modalidad: Modalidad): boolean {
     return modalidad === MODALIDADES.FINANCIADO_1 ||
            modalidad === MODALIDADES.REACTIVA_TRADICIONAL
   }
   ```
2. Reemplazar las 3 ocurrencias por llamadas a esta funcion
3. Usar la constante `MODALIDADES` en lugar de strings literales

**Archivos a modificar:**
- `src/models/calculator.types.ts` (agregar funcion)
- `src/pages/private/Calculator/Components/InformeCostoMensual/useInformeCostoMensual.ts`
- `src/pages/private/Calculator/Components/InformeCostoMensual/components/PresupuestoInicial.tsx`

**Riesgo:** Bajo.

---

### Fase 3 — Eliminar duplicacion de calculo de prestamo (P3)

**Objetivo:** Una sola implementacion del calculo de prestamo.

**Estado actual:**
```typescript
// En modalidadCalculations.ts:63
export function calcularPrestamo(saldo: number): number {
  if (saldo >= VALOR_REFERENCIA) return 0
  return Math.max(0, FACTOR_PENSION * FACTOR_PRESTAMO_MULTIPLICADOR - PRESTAMO_DESCUENTO)
}

// En financialCalculations.ts:36
export function calcularPrestamoSugerido(saldoAfore: number): number {
  if (saldoAfore >= VALOR_REFERENCIA) return 0
  const prestamo = FACTOR_PENSION * FACTOR_PRESTAMO_MULTIPLICADOR - PRESTAMO_DESCUENTO
  return Math.max(0, prestamo)
}
```

**Cambios:**
1. Eliminar `calcularPrestamo()` de `modalidadCalculations.ts`
2. En `modalidadCalculations.ts`, importar `calcularPrestamoSugerido` desde `financialCalculations.ts`
3. Actualizar las llamadas internas en `modalidadCalculations.ts` (linea 109: `calcularPrestamo(saldo)` → `calcularPrestamoSugerido(saldo)`)

**Archivos a modificar:**
- `src/pages/private/Calculator/Components/GenralData/utils/modalidadCalculations.ts`

**Riesgo:** Bajo. Misma logica, solo se consolida.

---

### Fase 4 — Consolidar calculos de fecha duplicados (P2)

**Objetivo:** Un solo modulo de calculos de fechas para todo el proyecto.

**Estado actual:**
- `GenralData/utils/dateCalculations.ts` — funciones puras bien organizadas
- `useInformeCostoMensual.ts` — reimplementa `calcularFechaInicioSugerida()`, `calcularTotalMeses()`, `calcularSemanasAlFinal()` como `useCallback` dentro del hook

La logica de `calcularFechaInicioSugerida` en el hook (lineas 15-29) es identica a `calcularFechaInicioContrato` en `dateCalculations.ts` (lineas 106-129).

**Cambios:**
1. Promover `dateCalculations.ts` a nivel compartido: mover de `GenralData/utils/` a `src/utils/dateCalculations.ts`
2. Agregar a `dateCalculations.ts` las funciones que faltan:
   - `calcularTotalMeses(fechaInicio: string, fechaFin: string): number | null`
   - `calcularSemanasAlFinal(semanasIniciales: number, totalMeses: number): number`
3. En `useInformeCostoMensual.ts`, eliminar las funciones locales `calcularFechaInicioSugerida`, `calcularTotalMeses`, `calcularSemanasAlFinal` y reemplazar por imports desde `@/utils/dateCalculations`
4. Actualizar imports en `GenralData/hooks/useAutoCalculatedFields.ts` para apuntar a la nueva ruta
5. Actualizar path alias si es necesario o usar `@/utils/`

**Archivos a crear:**
- `src/utils/dateCalculations.ts` (mover desde GenralData)

**Archivos a modificar:**
- `src/pages/private/Calculator/Components/InformeCostoMensual/useInformeCostoMensual.ts`
- `src/pages/private/Calculator/Components/GenralData/hooks/useAutoCalculatedFields.ts`
- `src/pages/private/Calculator/Components/GenralData/utils/dateCalculations.ts` (reemplazar por re-export o eliminar)

**Riesgo:** Medio. Requiere actualizar multiples imports.

---

### Fase 5 — Extraer validaciones de `useInformeCostoMensual` a funciones puras (P1, P8)

**Objetivo:** Las reglas de negocio de validacion deben ser funciones puras, testeables independientemente del hook de React.

**Estado actual:** `useInformeCostoMensual.ts` tiene 3 bloques `useMemo` masivos:
- `validacionesCliente` (lineas 166-190) — 25 lineas de reglas de negocio
- `validacionesContrato` (lineas 193-360) — 167 lineas con 5 fases de validacion
- `validacionesPresupuesto` (lineas 362-464) — 102 lineas con 6 fases de validacion

**Cambios:**
1. Crear `src/pages/private/Calculator/Components/InformeCostoMensual/validators/` con:
   - `validarCliente.ts` — funcion pura `validarCliente(data): { errores, advertencias }`
   - `validarContrato.ts` — funcion pura `validarContrato(data): { errores, advertencias, info }`
   - `validarPresupuesto.ts` — funcion pura `validarPresupuesto(data): { errores, advertencias, info }`
   - `index.ts` — barrel export
2. Cada funcion recibe solo los campos que necesita (no todo `GeneralDataForm`), reduciendo acoplamiento
3. En `useInformeCostoMensual.ts`, los `useMemo` quedan como wrappers delgados:
   ```typescript
   const validacionesCliente = useMemo(
     () => validarCliente({ edad, semanasCotizadas, leyAplicable, modalidad }),
     [edad, semanasCotizadas, leyAplicable, modalidad]
   )
   ```
4. Mover `parseISODate` a `dateCalculations.ts` (utilidad compartida)

**Archivos a crear:**
- `src/pages/private/Calculator/Components/InformeCostoMensual/validators/validarCliente.ts`
- `src/pages/private/Calculator/Components/InformeCostoMensual/validators/validarContrato.ts`
- `src/pages/private/Calculator/Components/InformeCostoMensual/validators/validarPresupuesto.ts`
- `src/pages/private/Calculator/Components/InformeCostoMensual/validators/index.ts`

**Archivos a modificar:**
- `src/pages/private/Calculator/Components/InformeCostoMensual/useInformeCostoMensual.ts` (reduccion de ~290 lineas)

**Riesgo:** Medio. La logica de validacion es compleja pero se mueve intacta.

---

### Fase 6 — Descomponer `useInformeCostoMensual` en hooks enfocados (P1)

**Objetivo:** El hook orquestador no debe exceder ~80 lineas. Cada responsabilidad en su propio hook.

**Estado actual post-Fase 5:** El hook aun tiene logica de:
- Calculo de monto total con regla de modalidad (lineas 91-120)
- Formateo de fecha para header (lineas 124-128)
- Calculo de vigencia de derechos (lineas 131-163)
- Handlers de fecha (lineas 57-87)

**Cambios:**
1. Crear `useMontoTotal.ts` — hook que calcula y sincroniza `montoTotalInvertir` usando `usaAforeEnModalidad()`
2. Crear `useVigenciaDerechos.ts` — hook que calcula `tieneVigencia` e `infoVigencia`
3. Crear `useContratoDates.ts` — hook con `handleFechaFirmaChange` y `handleFechaFinChange`
4. `useInformeCostoMensual.ts` queda como orquestador que compone los hooks:
   ```typescript
   export function useInformeCostoMensual() {
     const { generalData, updateGeneralData } = useCalculator()
     const vigencia = useVigenciaDerechos(generalData)
     const montoTotal = useMontoTotal(generalData, updateGeneralData)
     const contratoDates = useContratoDates(generalData, updateGeneralData)
     const validacionesCliente = useMemo(() => validarCliente(...), [...])
     const validacionesContrato = useMemo(() => validarContrato(...), [...])
     const validacionesPresupuesto = useMemo(() => validarPresupuesto(...), [...])
     return { generalData, updateGeneralData, ...vigencia, ...contratoDates, validacionesCliente, validacionesContrato, validacionesPresupuesto }
   }
   ```

**Archivos a crear:**
- `src/pages/private/Calculator/Components/InformeCostoMensual/hooks/useMontoTotal.ts`
- `src/pages/private/Calculator/Components/InformeCostoMensual/hooks/useVigenciaDerechos.ts`
- `src/pages/private/Calculator/Components/InformeCostoMensual/hooks/useContratoDates.ts`

**Archivos a modificar:**
- `src/pages/private/Calculator/Components/InformeCostoMensual/useInformeCostoMensual.ts`

**Riesgo:** Medio. Requiere cuidado con las dependencias de `useMemo`/`useCallback`.

---

### Fase 7 — Refactorizar hooks de auto-calculo con patron generico (P5)

**Objetivo:** Eliminar la repeticion de 5 hooks casi identicos y las supresiones de `eslint-disable`.

**Estado actual:** 5 hooks en `useAutoCalculatedFields.ts` siguen el mismo patron:
```typescript
useEffect(() => {
  const resultado = calcularAlgo(dependencia)
  if (!resultado) { limpiarCampo(); return }
  if (valorActual !== resultado) { actualizarCampo(resultado) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [dependencia])
```

**Cambios:**
1. Crear un hook generico `useAutoField` que encapsule el patron:
   ```typescript
   function useAutoField<T>(
     compute: () => T | null,
     deps: DependencyList,
     currentValue: T,
     onUpdate: (value: T) => void,
     onClear: () => void
   ) {
     useEffect(() => {
       const result = compute()
       if (result === null) { onClear(); return }
       if (currentValue !== result) onUpdate(result)
     }, deps) // deps es explicito, no necesita disable
   }
   ```
2. Reescribir los 5 hooks usando `useAutoField`, eliminando las supresiones de eslint
3. Mantener los nombres publicos de las funciones para no romper consumidores

**Archivos a modificar:**
- `src/pages/private/Calculator/Components/GenralData/hooks/useAutoCalculatedFields.ts`

**Riesgo:** Bajo. Refactor interno, interfaz publica no cambia.

---

### Fase 8 — Hacer explicito el efecto secundario de `useModalidad` (P6)

**Objetivo:** El padre debe controlar cuando se actualiza la modalidad, no el hook hijo.

**Estado actual:**
```typescript
// useModalidad.ts:50-59
useEffect(() => {
  if (!modalidadesDisponibles.modalidadSugerida) return
  const esModalidadValida = modalidadesDisponibles.opciones.includes(modalidad)
  if (!esModalidadValida && modalidadesDisponibles.modalidadSugerida !== modalidad) {
    onChange("modalidad", modalidadesDisponibles.modalidadSugerida) // efecto oculto
  }
}, [modalidadesDisponibles.modalidadSugerida, ...])
```

**Cambios:**
1. Eliminar el `useEffect` auto-update de `useModalidad.ts`
2. Exponer `modalidadSugerida` en el return del hook
3. En `ModalidadSection.tsx` (o en el orquestador `GeneralData.tsx`), manejar la auto-seleccion de forma explicita:
   ```typescript
   const { modalidadSugerida, esModalidadValida } = useModalidad(...)

   useEffect(() => {
     if (modalidadSugerida && !esModalidadValida) {
       onChange("modalidad", modalidadSugerida)
     }
   }, [modalidadSugerida, esModalidadValida])
   ```

**Archivos a modificar:**
- `src/pages/private/Calculator/Components/GenralData/components/useModalidad.ts`
- `src/pages/private/Calculator/Components/GenralData/components/ModalidadSection.tsx`

**Riesgo:** Bajo. El comportamiento es identico, solo se hace explicito.

---

### Fase 9 — Componente unificado de mensajes de validacion (P9)

**Objetivo:** Un solo componente para renderizar errores/advertencias/info, eliminando JSX duplicado.

**Estado actual:** `PresupuestoInicial.tsx` (lineas 89-125) implementa su propio renderizado de validaciones con markup casi identico al de `ValidationMessages.tsx`.

**Cambios:**
1. Verificar que `ValidationMessages.tsx` soporte los 3 niveles: `errores`, `advertencias`, `info`
2. Reemplazar el bloque de validaciones en `PresupuestoInicial.tsx` por:
   ```tsx
   <ValidationMessages
     errores={validaciones.errores}
     advertencias={validaciones.advertencias}
     info={validaciones.info}
   />
   ```
3. Si `ValidationMessages` no soporta `info`, extenderlo

**Archivos a modificar:**
- `src/pages/private/Calculator/Components/InformeCostoMensual/components/ValidationMessages.tsx`
- `src/pages/private/Calculator/Components/InformeCostoMensual/components/PresupuestoInicial.tsx`

**Riesgo:** Bajo.

---

## Orden de ejecucion y dependencias

```
Fase 1 (tipos)
  │
  ├── Fase 2 (usaAfore) ← depende de Modalidad en models
  │
  └── Fase 3 (prestamo) ← independiente

Fase 4 (fechas compartidas)
  │
  └── Fase 5 (validadores puros) ← usa dateCalculations compartido
        │
        └── Fase 6 (descomponer hook) ← depende de validadores extraidos

Fase 7 (auto-calculo generico) ← independiente

Fase 8 (modalidad explicita) ← independiente

Fase 9 (ValidationMessages) ← independiente
```

**Fases que se pueden ejecutar en paralelo:**
- Fases 1, 4, 7, 8, 9 son independientes entre si
- Fase 2 depende de Fase 1
- Fase 3 es independiente
- Fase 5 depende de Fase 4
- Fase 6 depende de Fase 5

---

## Verificacion despues de cada fase

Despues de completar cada fase:

1. `bun build` — debe compilar sin errores (TypeScript strict + no unused)
2. `bun lint` — sin nuevas advertencias
3. Verificacion manual: abrir la app, navegar por el flujo completo (login → datos generales → informe costo mensual) y confirmar que todo funciona igual

---

## Metricas de exito

| Metrica | Antes | Despues esperado |
|---------|-------|-----------------|
| Lineas de `useInformeCostoMensual.ts` | 480 | ~60 |
| Funciones duplicadas entre modulos | 3 | 0 |
| Reglas de negocio como string literal repetido | 3 ocurrencias | 0 |
| `eslint-disable` en hooks de auto-calculo | 5 | 0 |
| Efectos secundarios ocultos en hooks | 1 | 0 |
| Imports circulares de tipos | 1 | 0 |
| Funciones de validacion testeables como puras | 0 | 3 |
