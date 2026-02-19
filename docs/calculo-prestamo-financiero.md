# Cálculo del Préstamo Financiero para el Cliente

## Documento técnico para migración a React — Grupo AVIVIR

---

## 1. Contexto del préstamo

El préstamo financiero es un crédito que una institución financiera regulada por el IMSS otorga al cliente para cubrir la diferencia entre lo que tiene disponible en su AFORE y el costo total del trámite de recuperación de pensión. No todos los clientes necesitan un préstamo; depende de si su saldo AFORE es suficiente para cubrir los costos del servicio.

El préstamo tiene un impacto directo sobre tres aspectos del sistema:

- Determina las **opciones disponibles en el combo de Modalidad** (si el cliente alcanza o no a cubrir el costo total).
- Genera un **descuento del 30% sobre la pensión mensual durante 60 meses** para liquidar el crédito.
- Condiciona el **mensaje informativo** que se muestra al asesor sobre la necesidad de financiamiento.

---

## 2. Los dos campos de préstamo: calculado vs. capturado

Este es un punto crítico que hay que entender bien para la migración. **Existen dos valores distintos** relacionados con el préstamo en el sistema, y cumplen funciones completamente diferentes:

### 2.1. Monto calculado (sugerencia del sistema)

Es un valor que el sistema calcula automáticamente en una celda oculta para uso interno. Se obtiene con la siguiente regla:

- **Si el saldo AFORE del cliente es menor que el costo total del trámite** → se calcula como: **Pensión mensual estimada × 7.5 − $10,000**
- **Si el saldo AFORE es igual o mayor al costo total** → el valor es **$0** (no necesita financiamiento)

Este monto calculado se usa **exclusivamente** para evaluar si el saldo del cliente más el financiamiento potencial alcanzan a cubrir el costo total, lo cual determina las opciones del combo de Modalidad. No se presenta directamente al cliente ni se usa en las hojas de proyección.

Ejemplo con datos del archivo: pensión estimada $10,900. Saldo AFORE $15,000 < Costo total $107,100 → Préstamo calculado = $10,900 × 7.5 − $10,000 = **$71,750**.

### 2.2. Monto capturado (ingresado por el asesor)

Es un valor numérico que el **asesor ingresa manualmente** en la pantalla de Datos Generales. Representa el monto real del crédito que se gestionará con la institución financiera. No tiene validación de datos ni fórmula; es un campo libre.

En el ejemplo del archivo, el asesor ingresó **$80,000** (diferente al calculado de $71,750).

Este monto capturado es el que fluye hacia:

- La hoja **"INFORME COSTO MENSUAL"** como "PRÉSTAMO FINANCIERO".
- Las tres hojas de **"PROYECCIÓN DE PENSIÓN"** como "Crédito con una institución financiera regulada por el IMSS".
- El cálculo del **descuento mensual del 30%** sobre la pensión.
- El cálculo del **"Monto total para invertir"** (Saldo AFORE + Préstamo capturado).
- La determinación del **saldo a favor** al liquidar el proyecto.

### 2.3. ¿Por qué dos valores diferentes?

El monto calculado es una **estimación interna** de cuánto financiamiento necesitaría el cliente en teoría, basada en la capacidad de endeudamiento (7.5 meses de pensión). El monto capturado es lo que **realmente se solicita** al banco, que puede ser mayor o menor según negociaciones, capacidad crediticia real u otros factores que el asesor evalúa fuera del sistema.

> **⚠️ Consideración para la migración:** En React, se puede implementar el monto calculado como una **sugerencia visible** al asesor (por ejemplo, un texto auxiliar que diga "Monto sugerido: $71,750") mientras el asesor captura el monto real en el campo editable. Esto haría más transparente una lógica que en Excel está completamente oculta.

---

## 3. Flujo completo del cálculo del préstamo sugerido

### 3.1. Paso 1 — Obtener el saldo AFORE

Es un dato que captura el asesor directamente. Representa los recursos disponibles en las subcuentas de SAR 92, Retiro 97 y Vivienda.

**Validación:** mínimo **$15,000**. Si el monto es inferior, el sistema muestra: *"El monto mínimo para este producto es de $15,000, el cual se toma de las subcuentas de SAR 92, Retiro 97 y Vivienda."*

### 3.2. Paso 2 — Obtener el costo total del trámite

El costo total proviene de la hoja "INFORME COSTO MENSUAL" y depende de la duración del contrato en meses y las tarifas vigentes por año. Su valor varía entre aproximadamente $62,000 y $175,000 dependiendo de la modalidad y duración. (El detalle completo de este cálculo está documentado en el archivo de reglas de la Modalidad).

Para el producto **Financiado 100**, el costo total con el ejemplo del archivo es **$107,100**, compuesto por:

- 14 pagos mensuales (inscripción + 13 meses a tarifa doble): $89,100
- Gestoría: $18,000
- **Total general: $107,100**

### 3.3. Paso 3 — Evaluar si necesita préstamo

La comparación es directa:

```
SI Saldo AFORE < Costo total del trámite:
    → El cliente NECESITA financiamiento
    → Se calcula el préstamo sugerido

SI Saldo AFORE ≥ Costo total del trámite:
    → El cliente NO necesita financiamiento
    → El préstamo sugerido es $0
```

Ejemplo: $15,000 < $107,100 → **sí necesita préstamo**.

### 3.4. Paso 4 — Calcular el monto del préstamo sugerido

La fórmula es:

**Préstamo sugerido = Pensión mensual estimada × 7.5 − $10,000**

Donde:

- **Pensión mensual estimada** es el valor obtenido de la tabla de pensiones (ver documento de cálculo de pensión). Se obtiene de la hoja "PROYECCIÓN DE PENSIÓN" que a su vez lo toma de "INFORME COSTO MENSUAL".
- **7.5** es el multiplicador que representa la capacidad de endeudamiento: equivale a 7.5 meses de pensión futura como garantía del crédito.
- **$10,000** es un descuento fijo que se resta del monto calculado. Podría representar un monto de reserva, gastos administrativos del crédito, o un colchón de seguridad.

Desglose del ejemplo:

| Componente | Valor |
|-----------|-------|
| Pensión mensual estimada | $10,900 |
| × 7.5 meses | $81,750 |
| − Descuento fijo | −$10,000 |
| **Préstamo sugerido** | **$71,750** |

### 3.5. Paso 5 — Evaluar suficiencia total (con préstamo)

Una vez calculado el préstamo sugerido, el sistema evalúa si la combinación de saldo AFORE más préstamo sugerido alcanza para cubrir el costo total:

```
SI (Saldo AFORE + Préstamo sugerido) ≥ Costo total:
    → Opción del combo: "FINANCIADO 100"
    → (Los recursos combinados cubren el 100% del costo)

SI (Saldo AFORE + Préstamo sugerido) < Costo total:
    → Opción del combo: "FINANCIADO 1"
    → (Ni con préstamo se cubre el total — caso especial)
```

Ejemplo: $15,000 + $71,750 = $86,750 < $107,100 → **no alcanza** → opción "FINANCIADO 1".

> **Nota del ejemplo:** Curiosamente, en el archivo de ejemplo el saldo + préstamo sugerido ($86,750) NO cubre el costo total ($107,100), pero el asesor capturó $80,000 como préstamo real, dando un total de $95,000 que tampoco cubre los $107,100. Sin embargo, la modalidad seleccionada es "FINANCIADO 100". Esto confirma que la selección final de modalidad es **manual** (el asesor elige del combo) y puede no coincidir con la recomendación calculada.

---

## 4. Flujo del préstamo capturado (monto real)

Una vez que el asesor ingresa el monto del préstamo, este valor fluye por el sistema de la siguiente manera:

### 4.1. Monto total para invertir

En la hoja "INFORME COSTO MENSUAL" se calcula:

**Monto total para invertir = Saldo AFORE + Préstamo capturado**

Ejemplo: $15,000 + $80,000 = **$95,000**.

### 4.2. Mensaje de aplicabilidad

El sistema compara el monto total para invertir contra el costo total del trámite y muestra uno de dos mensajes:

- Si **Monto total < Costo total** → *"SOLO APLICA PARA MOD 1 RETOMA"*
  (Los recursos no alcanzan para Financiado 100; solo sirve para la modalidad donde el cliente paga parte de su bolsillo).

- Si **Monto total > Costo total** → *"APLICA PARA CUALQUIER MODALIDAD"*
  (Los recursos sobran; el cliente puede elegir cualquier esquema).

Ejemplo: $95,000 < $107,100 → **"SOLO APLICA PARA MOD 1 RETOMA"**.

### 4.3. Proyección de pensión — Forma de pago

En las hojas de proyección, el préstamo capturado se presenta dentro de la sección "Forma de pago" del proyecto:

| Concepto | Valor (ejemplo) |
|----------|----------------|
| Saldo en AFORE (SAR 92, Retiro 97 y Vivienda) | $15,000 |
| Crédito con institución financiera regulada por IMSS | $80,000 |
| **Total de recursos para mi proyecto** | **$95,000** |

### 4.4. Saldo a favor

Si el total de recursos del cliente supera el costo del proyecto, se calcula un saldo a favor:

```
SI Total de recursos > Costo del proyecto:
    → Saldo a favor = Total de recursos − Costo del proyecto

SI Total de recursos ≤ Costo del proyecto:
    → Saldo a favor = $0
```

Ejemplo: $95,000 ≤ $107,100 → **Saldo a favor = $0**.

---

## 5. Impacto del préstamo en la pensión del cliente

Esta es la parte más importante para la presentación al cliente: cómo el préstamo afecta lo que realmente recibirá de pensión mensual.

### 5.1. Descuento congelado por 60 meses

Si el cliente tiene un préstamo (monto capturado > $0), se le aplica un descuento fijo mensual durante los primeros **60 meses** (5 años) de pensión para liquidar el crédito:

**Descuento mensual = Pensión mensual estimada × 30%**

Este descuento se "congela": se calcula una sola vez al momento de la proyección y se mantiene fijo durante los 60 meses, sin importar si la pensión se incrementa por actualizaciones anuales.

Ejemplo: $10,900 × 30% = **$3,270 de descuento mensual**.

### 5.2. Pensión temporal durante 60 meses

Lo que el cliente realmente recibe durante los primeros 5 años es:

**Pensión temporal = Pensión mensual − Descuento congelado**

Ejemplo: $10,900 − $3,270 = **$7,630 mensuales durante 60 meses**.

### 5.3. Pensión completa después de 60 meses

Una vez liquidado el crédito (al mes 61), el cliente recibe la pensión completa sin descuentos:

**Pensión plena = Pensión mensual estimada = $10,900**

### 5.4. Condición para aplicar el descuento

El descuento **solo se aplica si existe un préstamo capturado**. Si el monto del préstamo es $0, no hay descuento y el cliente recibe la pensión completa desde el primer mes:

```
SI Préstamo capturado = $0:
    → Descuento = $0
    → Pensión temporal = Pensión completa

SI Préstamo capturado > $0:
    → Descuento = Pensión × 30%
    → Pensión temporal = Pensión × 70% (durante 60 meses)
```

### 5.5. Resumen numérico del ejemplo

| Concepto | Valor |
|----------|-------|
| Pensión mensual estimada | $10,900 |
| Descuento mensual (30%) | $3,270 |
| Pensión temporal (meses 1–60) | $7,630 |
| Pensión plena (mes 61 en adelante) | $10,900 |
| Aguinaldo anual (pensión × 90%) | $9,810 |
| Pensión anual (pensión × 12 + aguinaldo) | $140,610 |

---

## 6. Etiqueta y mensaje condicional del préstamo

### 6.1. Mensaje "NECESITA PRÉSTAMO FINANCIERO"

En la pantalla de Datos Generales, junto al campo del préstamo capturado, aparece condicionalmente una etiqueta que dice **"NECESITA PRÉSTAMO FINANCIERO:"** seguida del monto. Esta etiqueta solo aparece cuando se cumplen **ambas** condiciones:

1. El **saldo AFORE es menor** que el costo total del trámite (es decir, el cliente no puede pagar solo con su AFORE).
2. La **opción principal del combo de modalidad** es exactamente `"REACTIVA FINANCIADO 100"`.

Si alguna de las dos condiciones no se cumple, la etiqueta no se muestra.

> **⚠️ Observación:** En la implementación actual del Excel, la opción del combo nunca produce exactamente el texto `"REACTIVA FINANCIADO 100"` (produce `" FINANCIADO 1"` o `"FINANCIADO 100"`), por lo que este mensaje **nunca se muestra en la práctica**. Es otra inconsistencia que hay que resolver en la migración.

### 6.2. Mensaje de edad y restricción de modalidad

Independientemente del préstamo, si el cliente tiene más de 68 años, el sistema muestra: *"Solo aplica para Reactiva Tradicional. Para Reactiva Financiado 100 solo son viables menores de 68 años."*

Esto implica que clientes mayores de 68 no pueden acceder al financiamiento completo y deben pagar por su cuenta (excepto la gestoría).

---

## 7. Las tres variantes de producto y su relación con el préstamo

El sistema maneja tres tipos de producto, cada uno con un costo total diferente y, por tanto, una necesidad de financiamiento distinta:

| Producto | Nombre | Pago mensual | Costo total (14 meses) | Gestoría |
|----------|--------|-------------|----------------------|----------|
| **F1** | Financiado 1 (Retoma) | Unitario ($2,650–$3,500) | $62,550 | $18,000 |
| **F100** | Financiado 100 | Doble (×2) | $107,100 | $18,000 |
| **F100+** | Financiado 100 Plus | Triple+ (~$10,150–$11,850) | $175,000 | $18,000 |

La hoja "PROYECCIÓN DE PENSIÓN" (normal) busca el costo correspondiente al producto **F100** de una tabla de productos que contiene los tres tipos.

Las tres hojas de proyección de pensión comparten la misma estructura de forma de pago y descuento, pero difieren en el costo del proyecto que presentan:

- **PROYECCIÓN DE PENSIÓN (normal):** Usa el costo total de F100 obtenido mediante VLOOKUP en la tabla de productos.
- **PROYECCIÓN DE PENSIÓN_1:** Usa directamente el costo total general de la modalidad F100 del informe de costos.
- **PROYECCIÓN DE PENSIÓN PLUS:** Usa el costo total de la modalidad F100+ (la más cara).

---

## 8. Cadena completa de dependencias

```
ENTRADAS DEL ASESOR
│
├── Saldo AFORE ──────────────────────────────────────────────┐
│   (validación: ≥ $15,000)                                   │
│                                                              │
├── Préstamo capturado ───────────────────────────────────────┐│
│   (ingreso manual, sin validación)                          ││
│                                                              ││
├── CURP ───► Fecha nacimiento ───► Edad actual               ││
│                                                              ││
├── Semanas cotizadas ───► Fecha resolución                   ││
│                                                              ││
├── Fecha inicio contrato ───┬──► Duración contrato (meses)   ││
│                            │                                 ││
│                            └──► Año resolución               ││
│                                      │                       ││
│                            ┌─────────┘                       ││
│                            ▼                                 ││
│                   Pensión mensual estimada                   ││
│                   (tabla edad × año)                         ││
│                            │                                 ││
│              ┌─────────────┼─────────────────┐              ││
│              ▼             ▼                  ▼              ││
│     Préstamo sugerido   Gestoría        Descuento 30%       ││
│     (pensión×7.5−10K)  (pensión×2)     (sobre pensión)      ││
│              │             │                  │              ││
│              │             ▼                  │              ││
│              │      Costo total ◄─── Pagos mensuales        ││
│              │      del trámite      (tabla precios×2)      ││
│              │             │                                 ││
│              ▼             ▼                                 ││
│    ╔═══════════════════════════════════╗                     ││
│    ║  EVALUACIÓN DE SUFICIENCIA       ║                     ││
│    ║                                  ║                     ││
│    ║  Saldo AFORE + Préstamo sugerido ║◄────────────────────┘│
│    ║        vs. Costo total           ║                      │
│    ║                                  ║                      │
│    ║  → Opciones del combo Modalidad  ║                      │
│    ╚═══════════════════════════════════╝                      │
│                                                              │
│    ╔═══════════════════════════════════╗                      │
│    ║  FLUJO DEL PRÉSTAMO CAPTURADO    ║◄─────────────────────┘
│    ║                                  ║
│    ║  Saldo AFORE + Préstamo real     ║
│    ║  = Monto total para invertir     ║
│    ║                                  ║
│    ║  → Mensaje de aplicabilidad      ║
│    ║  → Proyecciones de pensión       ║
│    ║  → Descuento 30% por 60 meses   ║
│    ║  → Saldo a favor (si sobra)      ║
│    ╚═══════════════════════════════════╝
```

---

## 9. Variables involucradas — referencia consolidada

### 9.1. Entradas directas del asesor

| Variable | Descripción | Validación | Ejemplo |
|----------|-------------|------------|---------|
| Saldo AFORE | Monto disponible en subcuentas SAR 92, Retiro 97, Vivienda | ≥ $15,000 (entero) | $15,000 |
| Préstamo capturado | Monto del crédito real a gestionar | Ninguna (libre) | $80,000 |
| CURP | Clave Única de Registro de Población | Exactamente 18 caracteres | GAHL521102HDFRRS02 |
| Semanas cotizadas | Semanas cotizadas ante el IMSS | ≥ 430 (entero) | 860 |
| Fecha inicio contrato | Fecha de arranque del servicio | Fecha válida | 01/11/2025 |

### 9.2. Variables intermedias calculadas

| Variable | Fórmula | Ejemplo |
|----------|---------|---------|
| Edad actual | Años completos desde fecha nacimiento hasta hoy | 73 años |
| Fecha resolución | Fecha inicio + (63×7 días si semanas > 448; sino (510−semanas)×7 días), normalizada al primer día del mes | 01/01/2027 |
| Duración contrato | Meses entre fecha inicio y fecha resolución | 14 meses |
| Año resolución | Año calendario de la fecha de resolución | 2027 |
| Edad proyectada | Edad actual + (año resolución − año inicio contrato) | 75 años |
| Pensión mensual | Búsqueda en tabla por edad proyectada y año resolución | $10,900 |
| Costo total trámite | Suma de pagos mensuales + gestoría, según duración y tarifas | $107,100 |

### 9.3. Variables de salida del préstamo

| Variable | Fórmula | Ejemplo |
|----------|---------|---------|
| Préstamo sugerido | SI saldo < costo: pensión × 7.5 − 10,000; SINO: 0 | $71,750 |
| Monto total para invertir | Saldo AFORE + Préstamo capturado | $95,000 |
| Saldo a favor | SI total > costo: total − costo; SINO: 0 | $0 |
| Descuento mensual | SI préstamo captado > 0: pensión × 30%; SINO: 0 | $3,270 |
| Pensión temporal (60 meses) | Pensión − descuento | $7,630 |
| Pensión plena (mes 61+) | Pensión mensual estimada | $10,900 |

---

## 10. Reglas de negocio del préstamo

### 10.1. Condiciones para que el préstamo aplique

| Regla | Descripción |
|-------|-------------|
| El préstamo se sugiere cuando... | El saldo AFORE del cliente no alcanza a cubrir el costo total del trámite |
| El préstamo NO aplica cuando... | El saldo AFORE ≥ costo total (el cliente puede pagar todo con su AFORE) |
| Restricción de edad | Clientes mayores de 68 años solo aplican para Reactiva Tradicional, no para Financiado 100 |
| Ley aplicable | Solo clientes bajo Ley 73 pueden acceder al producto |

### 10.2. Constantes del cálculo

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| Multiplicador de capacidad | **7.5** | Meses de pensión que se toman como base de endeudamiento |
| Descuento fijo | **$10,000** | Monto que se resta del cálculo bruto del préstamo |
| Porcentaje de retención | **30%** | Porcentaje de la pensión que se descuenta mensualmente para pagar el crédito |
| Plazo de liquidación | **60 meses** | Duración del periodo de descuento (5 años) |
| Saldo AFORE mínimo | **$15,000** | Monto mínimo para que el producto sea viable |

### 10.3. Relación entre préstamo sugerido y capacidad real de pago

Es interesante verificar si la fórmula del préstamo sugerido es coherente con la capacidad de pago del cliente en 60 meses:

| Cálculo | Valor |
|---------|-------|
| Préstamo sugerido | $71,750 |
| Descuento mensual (pensión × 30%) | $3,270 |
| Total pagado en 60 meses ($3,270 × 60) | $196,200 |
| Diferencia (lo pagado − el préstamo) | $124,450 |

Esto indica que el mecanismo de retención del 30% sobre la pensión genera un pago total significativamente mayor al monto del préstamo. La diferencia probablemente cubre intereses, comisiones de la institución financiera y el margen de Grupo AVIVIR. El sistema no modela explícitamente estos costos financieros; solo calcula el monto del crédito y el descuento sobre la pensión.

---

## 11. Inconsistencias detectadas

### 11.1. Préstamo sugerido vs. préstamo capturado desconectados

No hay ninguna validación ni advertencia que compare el préstamo capturado contra el sugerido. El asesor puede ingresar cualquier monto, incluso $0 o un valor muy superior al sugerido. En la migración a React se recomienda:

- Mostrar el monto sugerido como referencia visible.
- Advertir si el monto capturado es muy diferente al sugerido.
- Advertir si el monto total para invertir (AFORE + préstamo) no cubre el costo total del trámite.

### 11.2. El mensaje "NECESITA PRÉSTAMO FINANCIERO" nunca se muestra

La condición para mostrar la etiqueta exige que la opción del combo sea exactamente `"REACTIVA FINANCIADO 100"`, pero esa cadena nunca se produce en la fórmula del combo (produce `" FINANCIADO 1"` o `"FINANCIADO 100"`). En React, hay que decidir si esta etiqueta debe mostrarse basándose solo en la primera condición (saldo < costo total).

### 11.3. Descuento del 30% no considera el monto real del préstamo

El descuento del 30% se aplica sobre la pensión completa sin importar cuánto sea el préstamo real. Un préstamo de $10,000 genera el mismo descuento que uno de $80,000. Esto es por diseño (es un porcentaje fijo de retención, no una amortización calculada), pero es algo a tener en cuenta para la presentación al cliente.

---

## 12. Consideraciones para la implementación en React

### 12.1. Estructura de datos sugerida

```javascript
// Estado del préstamo dentro del formulario
const loanState = {
  // Entradas
  saldoAfore: 15000,           // Capturado por el asesor
  prestamoCaptured: 80000,     // Capturado por el asesor

  // Calculados automáticamente
  costoTotalTramite: 107100,   // Viene del cálculo de costos
  pensionMensual: 10900,       // Viene del cálculo de pensión

  // Derivados del préstamo
  prestamoSugerido: 71750,     // pensión × 7.5 − 10000
  montoTotalInvertir: 95000,   // saldoAfore + prestamoCaptured
  saldoAFavor: 0,              // max(0, montoTotal − costoTotal)
  descuentoMensual: 3270,      // pensión × 0.30 (si hay préstamo)
  pensionTemporal: 7630,       // pensión − descuento
  mesesDescuento: 60,          // Constante
};
```

### 12.2. Funciones reutilizables

```javascript
const LOAN_MULTIPLIER = 7.5;
const LOAN_DISCOUNT = 10000;
const RETENTION_RATE = 0.30;
const RETENTION_MONTHS = 60;

function calculateSuggestedLoan(pensionMensual, saldoAfore, costoTotal) {
  if (saldoAfore >= costoTotal) return 0;
  return pensionMensual * LOAN_MULTIPLIER - LOAN_DISCOUNT;
}

function calculateTotalInvestment(saldoAfore, prestamoCapturado) {
  return saldoAfore + prestamoCapturado;
}

function calculateSaldoAFavor(totalInvestment, costoProyecto) {
  return Math.max(0, totalInvestment - costoProyecto);
}

function calculatePensionWithLoan(pensionMensual, prestamoCapturado) {
  if (prestamoCapturado === 0) {
    return {
      descuentoMensual: 0,
      pensionTemporal: pensionMensual,
      pensionPlena: pensionMensual,
      mesesDescuento: 0,
    };
  }
  const descuento = pensionMensual * RETENTION_RATE;
  return {
    descuentoMensual: descuento,
    pensionTemporal: pensionMensual - descuento,
    pensionPlena: pensionMensual,
    mesesDescuento: RETENTION_MONTHS,
  };
}

function getApplicabilityMessage(totalInvestment, costoTotal) {
  if (totalInvestment < costoTotal) {
    return 'SOLO APLICA PARA MOD 1 RETOMA';
  }
  if (totalInvestment > costoTotal) {
    return 'APLICA PARA CUALQUIER MODALIDAD';
  }
  return ''; // Exactamente igual, sin mensaje
}
```

### 12.3. Flujo reactivo recomendado

En React, el cálculo del préstamo debe reaccionar a cambios en cascada. Usando `useMemo` o `useEffect`:

1. **Cuando cambie** el CURP, semanas cotizadas o fecha inicio → recalcular pensión mensual.
2. **Cuando cambie** la pensión o el saldo AFORE → recalcular préstamo sugerido.
3. **Cuando cambie** el saldo AFORE o el préstamo capturado → recalcular monto total, saldo a favor y mensaje de aplicabilidad.
4. **Cuando cambie** la pensión o el préstamo capturado → recalcular descuento y pensión temporal.

Las constantes (7.5, $10,000, 30%, 60 meses) deben ser configurables, ya que podrían cambiar por política de negocio.
