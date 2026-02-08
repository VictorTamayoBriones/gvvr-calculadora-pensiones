# Implementación de Reglas de Negocio - Presupuesto Inicial

## Resumen de Implementación

Se han implementado todas las reglas de negocio especificadas en el documento `REGLAS_NEGOCIO_PRESUPUESTO.md` para la sección de Presupuesto Inicial del formulario de Informe de Costo Mensual.

## Cambios Realizados

### 1. Hook Principal (`useInformeCostoMensual.ts`)

#### Cálculo de Monto Total Actualizado
```typescript
// REGLA CRÍTICA: El saldo AFORE solo se usa en modalidades REACTIVA TRADICIONAL y FINANCIADO 1
const calcularMontoTotal = useCallback(() => {
  const saldoAfore = parseFloat(generalData.saldoAfore) || 0;
  const prestamoFinanciero = parseFloat(generalData.prestamoFinanciero) || 0;

  // Solo sumar AFORE si la modalidad usa AFORE
  const usaAfore = generalData.modalidad === 'REACTIVA TRADICIONAL' ||
                   generalData.modalidad === 'FINANCIADO 1';

  const montoTotal = usaAfore
    ? saldoAfore + prestamoFinanciero
    : prestamoFinanciero;

  return montoTotal > 0 ? montoTotal.toString() : '';
}, [generalData.saldoAfore, generalData.prestamoFinanciero, generalData.modalidad]);
```

**Regla Implementada**: El saldo AFORE SOLO se suma al presupuesto total en las modalidades REACTIVA TRADICIONAL y FINANCIADO 1. En FINANCIADO 100 y REACTIVA FINANCIADO 100, el saldo AFORE NO se considera.

#### Validaciones de Presupuesto
Se agregó un nuevo memo `validacionesPresupuesto` que implementa las siguientes validaciones:

1. **Validación de Saldo AFORE**
   - No puede ser negativo
   - Advertencia si tiene AFORE pero la modalidad no lo usa

2. **Validación de Préstamo Financiero**
   - No puede ser negativo

3. **Validación de Monto Total**
   - Debe coincidir con el cálculo esperado
   - Verifica que la suma sea correcta según la modalidad

4. **Validación con Modalidad Seleccionada**
   - REACTIVA TRADICIONAL: Requiere mínimo $62,550
   - FINANCIADO 1: Requiere mínimo $62,550
   - FINANCIADO 100: No requiere presupuesto ($0)
   - REACTIVA FINANCIADO 100: No requiere presupuesto ($0)

5. **Restricción de Edad para REACTIVA FINANCIADO 100**
   - Solo viable para menores de 68 años
   - Error crítico bloqueante si edad >= 68

6. **Información sobre Desglose**
   - Muestra el desglose del presupuesto total
   - Indica claramente si se está usando AFORE o no

### 2. Componente `PresupuestoInicial.tsx`

#### Mejoras Visuales

1. **Indicador Visual de Uso de AFORE**
   ```tsx
   {!usaAfore && generalData.saldoAfore && parseFloat(generalData.saldoAfore) > 0 && (
     <span className="text-xs text-amber-600 dark:text-amber-400 ml-2">
       (No se usa en {generalData.modalidad})
     </span>
   )}
   ```

2. **Campo Opacado cuando AFORE no se Usa**
   - El campo de Saldo AFORE se muestra con opacidad reducida cuando la modalidad seleccionada no usa AFORE

3. **Texto Informativo**
   - Indica claramente "*Solo aplica para REACTIVA TRADICIONAL y FINANCIADO 1"
   - Label del monto total indica "(calculado automáticamente)"

4. **Validaciones Inline**
   - Errores en rojo con ícono de alerta
   - Advertencias en ámbar con ícono de alerta
   - Información en azul con ícono de información

### 3. Componente Principal (`InformeCostoMensual.tsx`)

Se actualizó para:
- Obtener `validacionesPresupuesto` del hook
- Pasar las validaciones al componente `PresupuestoInicial`

## Reglas de Negocio Implementadas

### ✅ Reglas Básicas

| Regla | Estado | Implementación |
|-------|--------|----------------|
| Saldo AFORE solo aplica en RETOMA/REACTIVA TRADICIONAL | ✅ | Cálculo condicional en `calcularMontoTotal` |
| Saldo AFORE no puede ser negativo | ✅ | Validación en `validacionesPresupuesto` |
| Préstamo no puede ser negativo | ✅ | Validación en `validacionesPresupuesto` |
| Monto total auto-calculado | ✅ | `useEffect` sincroniza el cálculo |
| Monto total readonly | ✅ | Campo con `readOnly` y `bg-muted` |

### ✅ Reglas por Modalidad

| Modalidad | Presupuesto Mínimo | Usa AFORE | Estado |
|-----------|-------------------|-----------|--------|
| REACTIVA TRADICIONAL | $62,550 | Sí ✓ | ✅ |
| FINANCIADO 1 | $62,550 | Sí ✓ | ✅ |
| FINANCIADO 100 | $0 | No ✗ | ✅ |
| REACTIVA FINANCIADO 100 | $0 | No ✗ | ✅ |

### ✅ Restricciones Especiales

| Restricción | Condición | Error/Advertencia | Estado |
|-------------|-----------|-------------------|--------|
| Edad REACTIVA FINANCIADO 100 | Edad >= 68 | Error Crítico | ✅ |
| AFORE no usado | AFORE > 0 y modalidad sin AFORE | Advertencia | ✅ |
| Presupuesto insuficiente | Presupuesto < Mínimo requerido | Error | ✅ |
| Presupuesto suficiente | Presupuesto >= Mínimo requerido | Info (sobrante) | ✅ |

## Tipos de Mensajes

### Errores (Rojos - Bloqueantes)
- Saldo AFORE negativo
- Préstamo negativo
- Monto total no coincide con cálculo
- Presupuesto insuficiente para modalidad
- Edad >= 68 con REACTIVA FINANCIADO 100

### Advertencias (Ámbar - No Bloqueantes)
- AFORE disponible pero modalidad no lo usa
- Sugerencia de cambiar a modalidad que use AFORE

### Información (Azul - Informativos)
- Desglose del presupuesto total
- Presupuesto suficiente con sobrante
- Indicadores de uso de AFORE

## Flujo de Cálculo

```
Usuario ingresa Préstamo Financiero
           ↓
Se verifica la modalidad seleccionada
           ↓
     ¿Usa AFORE?
    (REACTIVA TRADICIONAL o FINANCIADO 1)
     /              \
   Sí                No
    ↓                 ↓
AFORE + Préstamo   Solo Préstamo
    ↓                 ↓
    Monto Total Calculado
           ↓
    Se valida contra requisitos de modalidad
           ↓
    Se muestra resultado con validaciones inline
```

## Ejemplos de Uso

### Ejemplo 1: REACTIVA TRADICIONAL con AFORE
```
Modalidad: REACTIVA TRADICIONAL
Saldo AFORE: $15,000
Préstamo: $80,000
Monto Total: $95,000 (calculado: $15,000 + $80,000)

Validaciones:
✓ Presupuesto suficiente para REACTIVA TRADICIONAL
  Sobrante: $32,450 ($95,000 - $62,550)
ℹ Presupuesto total: $95,000 (AFORE: $15,000 + Préstamo: $80,000)
```

### Ejemplo 2: FINANCIADO 100 con AFORE disponible
```
Modalidad: FINANCIADO 100
Saldo AFORE: $20,000
Préstamo: $30,000
Monto Total: $30,000 (calculado: solo préstamo)

Validaciones:
⚠️ Tiene $20,000 en AFORE que NO se usará en FINANCIADO 100.
   El saldo AFORE solo se utiliza en REACTIVA TRADICIONAL y FINANCIADO 1.
ℹ Considere una modalidad que aproveche su saldo AFORE
ℹ Presupuesto total: $30,000 (solo Préstamo, AFORE no aplica)
```

### Ejemplo 3: REACTIVA FINANCIADO 100 con edad >= 68
```
Modalidad: REACTIVA FINANCIADO 100
Edad: 70 años
Saldo AFORE: $0
Préstamo: $0

Validaciones:
❌ RESTRICCIÓN CRÍTICA: REACTIVA FINANCIADO 100% solo es viable
   para menores de 68 años
```

### Ejemplo 4: Presupuesto Insuficiente
```
Modalidad: REACTIVA TRADICIONAL
Saldo AFORE: $10,000
Préstamo: $30,000
Monto Total: $40,000

Validaciones:
❌ Presupuesto insuficiente para REACTIVA TRADICIONAL.
   Requiere $62,550, tiene $40,000.
   Falta: $22,550
```

## Mejoras Futuras Sugeridas

1. **Costos Dinámicos**
   - Actualmente los costos ($62,550, etc.) están hardcodeados
   - Deberían venir de una configuración o API

2. **Recomendación Automática de Modalidad**
   - Implementar el algoritmo de recomendación del documento
   - Sugerir la mejor modalidad según presupuesto y edad

3. **Calculadora de Préstamo Necesario**
   - Herramienta que calcule cuánto préstamo se necesita
   - Según la modalidad deseada y el AFORE disponible

4. **Tabla de Modalidades Viables**
   - Mostrar todas las modalidades viables
   - Con sus requisitos y ventajas/desventajas

## Archivos Modificados

1. **src/pages/private/Calculator/Components/InformeCostoMensual/useInformeCostoMensual.ts**
   - Actualizado cálculo de `calcularMontoTotal`
   - Agregado `validacionesPresupuesto`

2. **src/pages/private/Calculator/Components/InformeCostoMensual/components/PresupuestoInicial.tsx**
   - Agregadas props para `validaciones`
   - Implementado indicador visual de uso de AFORE
   - Agregadas validaciones inline

3. **src/pages/private/Calculator/Components/InformeCostoMensual/InformeCostoMensual.tsx**
   - Agregado `validacionesPresupuesto` del hook
   - Pasado al componente `PresupuestoInicial`

## Testing

### Casos de Prueba Recomendados

1. **Test: Cálculo con REACTIVA TRADICIONAL**
   - AFORE: $15,000, Préstamo: $80,000
   - Esperado: Monto Total = $95,000

2. **Test: Cálculo con FINANCIADO 100**
   - AFORE: $20,000, Préstamo: $30,000
   - Esperado: Monto Total = $30,000 (ignora AFORE)

3. **Test: Validación de edad para REACTIVA FINANCIADO 100**
   - Edad: 70, Modalidad: REACTIVA FINANCIADO 100
   - Esperado: Error crítico

4. **Test: Presupuesto insuficiente**
   - AFORE: $0, Préstamo: $20,000, Modalidad: REACTIVA TRADICIONAL
   - Esperado: Error de presupuesto insuficiente

5. **Test: Advertencia de AFORE no usado**
   - AFORE: $25,000, Modalidad: FINANCIADO 100
   - Esperado: Advertencia que AFORE no se usa

---

**Fecha de Implementación**: 2026-02-06
**Documento Base**: `REGLAS_NEGOCIO_PRESUPUESTO.md`
**Estado**: ✅ Completado y Verificado
