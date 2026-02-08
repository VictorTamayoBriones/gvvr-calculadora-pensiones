# Reglas de Negocio y Validaciones - Sección: Presupuesto Inicial

## 📋 ÍNDICE
1. [Saldo AFORE](#1-saldo-afore)
2. [Préstamo Financiero](#2-préstamo-financiero)
3. [Monto Total para Invertir](#3-monto-total-para-invertir)
4. [Relación con Modalidades](#4-relación-con-modalidades-de-recuperación)
5. [Validaciones Cruzadas](#5-validaciones-cruzadas)
6. [Tabla de Suficiencia Presupuestaria](#6-tabla-de-suficiencia-presupuestaria)
7. [Flujo de Decisión](#7-flujo-de-decisión-de-modalidad)

---

## CONTEXTO GENERAL

### Propósito del Presupuesto Inicial
El presupuesto inicial determina **cuánto dinero tiene disponible el cliente** para financiar su proceso de recuperación de pensión. Este presupuesto se compone de dos fuentes:

1. **Saldo AFORE**: Dinero acumulado en la cuenta individual del IMSS
2. **Préstamo Financiero**: Dinero que el cliente puede aportar de otras fuentes

La suma de ambos determina qué modalidad de recuperación es viable para el cliente.

---

## 1. SALDO AFORE

### Definición
Cantidad de dinero que el cliente tiene acumulado en su cuenta individual de AFORE (Administradora de Fondos para el Retiro).

### Reglas de Negocio

#### Característica Principal
```
⚠️ IMPORTANTE: El Saldo AFORE SOLO APLICA PARA MODALIDAD 1 (RETOMA)

Texto original del sistema:
"*SOLO APLICA PARA MOD 1 RETOMA*"

Significado:
- En RETOMA: El saldo AFORE se cuenta como parte del presupuesto
- En FINANCIADO 50%: NO se usa el saldo AFORE
- En FINANCIADO 100%: NO se usa el saldo AFORE
```

#### Propósito del Saldo AFORE
```
En la Modalidad RETOMA:
El cliente "retoma" su AFORE, es decir, lo usa como parte de su
presupuesto inicial para pagar las cuotas de recuperación.

Este dinero SALE de su cuenta AFORE y se usa para:
1. Pagar las cuotas mensuales al IMSS
2. Cubrir los costos de gestoría

Por eso solo aplica en RETOMA, donde el cliente usa sus propios recursos.
```

### Validaciones Básicas

```javascript
Validaciones:
✓ Puede ser cero ($0)
✓ Debe ser número positivo
✓ No puede ser negativo
✓ Debe ser número entero (sin decimales)
✓ Rango típico: $0 - $100,000

Formato de moneda:
- Moneda: MXN (Pesos mexicanos)
- Sin decimales
- Con separadores de miles

Restricción de uso:
if (modalidad !== 'RETOMA') {
  // El saldo AFORE NO se considera en el presupuesto
  presupuesto_disponible = prestamo_financiero;
} else {
  // Solo en RETOMA se suma el AFORE
  presupuesto_disponible = saldo_afore + prestamo_financiero;
}
```

### Rangos Comunes

```
┌─────────────┬──────────────────────────────────────┐
│ Saldo AFORE │ Interpretación                       │
├─────────────┼──────────────────────────────────────┤
│ $0          │ No tiene AFORE o ya lo retiró        │
│ $5,000      │ Saldo muy bajo                       │
│ $10,000     │ Saldo bajo                           │
│ $15,000     │ Saldo medio-bajo (ejemplo del Excel) │
│ $20,000     │ Saldo medio                          │
│ $30,000     │ Saldo medio-alto                     │
│ $50,000+    │ Saldo alto                           │
│ $100,000+   │ Saldo muy alto (poco común)          │
└─────────────┴──────────────────────────────────────┘
```

### Casos Especiales

```javascript
// Caso 1: Cliente sin AFORE
Saldo AFORE: $0
Razón: Ya lo retiró, nunca tuvo, o cambió a LEY 97
Modalidades viables: 
  - RETOMA: Solo si préstamo ≥ $62,550
  - FINANCIADO 50%: Si préstamo ≥ $22,275
  - FINANCIADO 100%: Siempre viable

// Caso 2: AFORE muy alto
Saldo AFORE: $80,000
Préstamo: $0
Total: $80,000
Modalidad sugerida: RETOMA (tiene suficiente)

// Caso 3: AFORE + Préstamo
Saldo AFORE: $15,000
Préstamo: $80,000
Total: $95,000
Modalidades viables: Todas
```

### Validación con Modalidad

```javascript
function validarSaldoAfore(saldoAfore, modalidad, totalRequerido) {
  // Validación básica
  if (saldoAfore < 0) {
    return {
      valido: false,
      error: 'El saldo AFORE no puede ser negativo'
    };
  }
  
  // Advertencia si hay AFORE pero no es RETOMA
  if (saldoAfore > 0 && modalidad !== 'RETOMA') {
    return {
      valido: true,
      warning: `Tiene $${saldoAfore.toLocaleString()} en AFORE pero no se usará en ${modalidad}. Solo aplica en RETOMA.`,
      sugerencia: 'Considere la modalidad RETOMA para aprovechar su saldo AFORE'
    };
  }
  
  // Validación de suficiencia para RETOMA
  if (modalidad === 'RETOMA' && saldoAfore < totalRequerido) {
    const faltante = totalRequerido - saldoAfore;
    return {
      valido: true,
      info: `Con solo AFORE falta $${faltante.toLocaleString()}. Necesita préstamo adicional.`
    };
  }
  
  return { valido: true };
}
```

### Mensajes de Usuario

```javascript
// Mensaje si tiene AFORE pero elige otra modalidad
if (saldoAfore > 0 && modalidad !== 'RETOMA') {
  mostrarAdvertencia(
    `⚠️ NOTA: Su saldo AFORE de $${saldoAfore.toLocaleString()} NO se usará en la modalidad ${modalidad}. 
    El saldo AFORE solo se utiliza en la Modalidad RETOMA.`
  );
}

// Mensaje si no tiene AFORE y elige RETOMA
if (saldoAfore === 0 && modalidad === 'RETOMA') {
  mostrarInfo(
    `ℹ️ Para RETOMA sin saldo AFORE, necesita un préstamo de al menos $62,550.`
  );
}

// Mensaje si tiene mucho AFORE
if (saldoAfore >= 70000) {
  mostrarInfo(
    `✓ Su saldo AFORE es suficiente para cubrir RETOMA completo. 
    No necesita préstamo adicional.`
  );
}
```

### Ejemplos Completos

```javascript
// Ejemplo 1: Saldo normal con RETOMA
Saldo AFORE: $15,000
Modalidad: RETOMA
Costo RETOMA: $62,550
Validación: ✓ Contribuye al presupuesto
Faltante: $47,550 (necesita préstamo)

// Ejemplo 2: Sin AFORE, usando FINANCIADO 50%
Saldo AFORE: $0
Modalidad: FINANCIADO 50%
Validación: ✓ No aplica AFORE en esta modalidad
Presupuesto: Solo préstamo

// Ejemplo 3: AFORE alto con RETOMA
Saldo AFORE: $70,000
Modalidad: RETOMA
Costo RETOMA: $62,550
Validación: ✓ Suficiente, sobran $7,450
Préstamo necesario: $0

// Ejemplo 4: AFORE con modalidad incompatible
Saldo AFORE: $20,000
Modalidad: FINANCIADO 100%
Validación: ✓ Válido pero ⚠️ Advertencia
Mensaje: "AFORE no se usa en FINANCIADO 100%"
Sugerencia: "Considere RETOMA para usar su AFORE"
```

### Mensajes de Error/Advertencia
- "El saldo AFORE no puede ser negativo"
- "El saldo AFORE debe ser un número entero"
- "⚠️ Su saldo AFORE solo se usará si elige modalidad RETOMA"
- "ℹ️ Para usar su AFORE de $[X], debe seleccionar modalidad RETOMA"

---

## 2. PRÉSTAMO FINANCIERO

### Definición
Dinero que el cliente puede aportar de **fuentes propias** (ahorros, préstamos personales, apoyo familiar, etc.) para complementar o cubrir los costos de recuperación de pensión.

### Reglas de Negocio

#### Características Principales
```
- Puede venir de cualquier fuente legal
- Común: Ahorros personales, préstamo familiar, crédito personal
- Es ADICIONAL al Saldo AFORE (en RETOMA)
- PUEDE SER CERO en algunas modalidades
- Se usa en TODAS las modalidades
```

#### Validaciones Básicas

```javascript
Validaciones:
✓ Puede ser cero ($0)
✓ Debe ser número positivo o cero
✓ No puede ser negativo
✓ Debe ser número entero (sin decimales)
✓ Rango típico: $0 - $200,000
✓ Máximo recomendado: $150,000

Restricciones por modalidad:
RETOMA: 
  - Préstamo mínimo depende de AFORE
  - Si AFORE = $0, entonces préstamo ≥ $62,550
  
FINANCIADO 50%:
  - Préstamo mínimo: $22,275
  - Puede ser mayor
  
FINANCIADO 100%:
  - Préstamo puede ser $0
  - Cliente no aporta dinero
```

### Rangos Comunes

```
┌──────────────┬──────────────────────────────────────┐
│ Préstamo     │ Interpretación                       │
├──────────────┼──────────────────────────────────────┤
│ $0           │ Cliente no tiene recursos adicionales│
│ $20,000      │ Aporte bajo                          │
│ $30,000      │ Aporte medio-bajo                    │
│ $50,000      │ Aporte medio                         │
│ $80,000      │ Aporte medio-alto (ejemplo del Excel)│
│ $100,000     │ Aporte alto                          │
│ $150,000+    │ Aporte muy alto (poco común)         │
└──────────────┴──────────────────────────────────────┘
```

### Cálculo de Préstamo Mínimo

```javascript
function calcularPrestamoMinimo(saldoAfore, modalidad, costoTotal) {
  let prestamoMinimo;
  
  switch(modalidad) {
    case 'RETOMA':
      // Costo total RETOMA: $62,550
      prestamoMinimo = Math.max(0, 62550 - saldoAfore);
      return {
        minimo: prestamoMinimo,
        mensaje: prestamoMinimo === 0 
          ? `Su saldo AFORE cubre el costo completo`
          : `Necesita al menos $${prestamoMinimo.toLocaleString()} adicionales`
      };
      
    case 'FINANCIADO_50':
      // Cliente paga 50% de pagos: $22,275
      prestamoMinimo = 22275;
      return {
        minimo: prestamoMinimo,
        mensaje: `Requiere $${prestamoMinimo.toLocaleString()} para cubrir su parte (50%)`
      };
      
    case 'FINANCIADO_100':
      // Cliente no aporta
      prestamoMinimo = 0;
      return {
        minimo: prestamoMinimo,
        mensaje: 'No requiere préstamo, Grupo AVIVIR financia todo'
      };
      
    default:
      return { minimo: 0, mensaje: 'Modalidad no especificada' };
  }
}

// Ejemplos de uso:
// RETOMA con AFORE $15,000
calcularPrestamoMinimo(15000, 'RETOMA', 62550)
// Resultado: { minimo: 47550, mensaje: "Necesita al menos $47,550 adicionales" }

// RETOMA con AFORE $70,000
calcularPrestamoMinimo(70000, 'RETOMA', 62550)
// Resultado: { minimo: 0, mensaje: "Su saldo AFORE cubre el costo completo" }

// FINANCIADO 50%
calcularPrestamoMinimo(0, 'FINANCIADO_50', 22275)
// Resultado: { minimo: 22275, mensaje: "Requiere $22,275 para cubrir su parte (50%)" }
```

### Validaciones con Modalidad

```javascript
function validarPrestamoConModalidad(prestamo, saldoAfore, modalidad) {
  const presupuesto = modalidad === 'RETOMA' 
    ? saldoAfore + prestamo 
    : prestamo;
  
  const requisitos = {
    'RETOMA': {
      minimo: 62550,
      nombre: 'RETOMA',
      incluye: 'Saldo AFORE'
    },
    'FINANCIADO_50': {
      minimo: 22275,
      nombre: 'FINANCIADO 50%',
      incluye: 'Solo préstamo (AFORE no aplica)'
    },
    'FINANCIADO_100': {
      minimo: 0,
      nombre: 'FINANCIADO 100%',
      incluye: 'No requiere aporte del cliente'
    }
  };
  
  const req = requisitos[modalidad];
  
  if (presupuesto < req.minimo) {
    const faltante = req.minimo - presupuesto;
    return {
      valido: false,
      error: `Presupuesto insuficiente para ${req.nombre}. Falta: $${faltante.toLocaleString()}`,
      presupuestoActual: presupuesto,
      requerido: req.minimo,
      faltante: faltante
    };
  }
  
  return { 
    valido: true,
    presupuesto: presupuesto,
    sobrante: presupuesto - req.minimo
  };
}
```

### Escenarios de Préstamo

```javascript
// Escenario 1: Préstamo alto + AFORE medio
Saldo AFORE: $15,000
Préstamo: $80,000
Total: $95,000
Modalidades viables: TODAS
Modalidad óptima: RETOMA (usa ambos recursos)

// Escenario 2: Solo préstamo, sin AFORE
Saldo AFORE: $0
Préstamo: $70,000
Total: $70,000
Modalidades viables:
  ✓ RETOMA: Sí ($70,000 > $62,550)
  ✓ FINANCIADO 50%: Sí ($70,000 > $22,275)
  ✓ FINANCIADO 100%: Sí (siempre)

// Escenario 3: Préstamo bajo, sin AFORE
Saldo AFORE: $0
Préstamo: $20,000
Total: $20,000
Modalidades viables:
  ✗ RETOMA: No ($20,000 < $62,550)
  ✗ FINANCIADO 50%: No ($20,000 < $22,275)
  ✓ FINANCIADO 100%: Sí (siempre)
Recomendación: FINANCIADO 100% es la única opción

// Escenario 4: Sin recursos
Saldo AFORE: $0
Préstamo: $0
Total: $0
Modalidades viables:
  ✗ RETOMA: No
  ✗ FINANCIADO 50%: No
  ✓ FINANCIADO 100%: Sí (única opción posible)

// Escenario 5: Préstamo justo para F50
Saldo AFORE: $0
Préstamo: $22,275
Total: $22,275
Modalidades viables:
  ✗ RETOMA: No ($22,275 < $62,550)
  ✓ FINANCIADO 50%: Sí (exacto)
  ✓ FINANCIADO 100%: Sí
Recomendación: FINANCIADO 50% o 100%
```

### Mensajes de Error/Advertencia
- "El préstamo no puede ser negativo"
- "El préstamo debe ser un número entero"
- "⚠️ El presupuesto total ($[X]) es insuficiente para RETOMA (requiere $62,550)"
- "⚠️ El préstamo ($[X]) es insuficiente para FINANCIADO 50% (requiere $22,275)"
- "ℹ️ Con $0 de préstamo, solo puede acceder a FINANCIADO 100%"

---

## 3. MONTO TOTAL PARA INVERTIR

### Definición
**Suma del Saldo AFORE y el Préstamo Financiero**. Representa el presupuesto total disponible del cliente.

### Regla de Cálculo

```javascript
// IMPORTANTE: El cálculo depende de la modalidad

function calcularMontoTotal(saldoAfore, prestamoFinanciero, modalidad) {
  if (modalidad === 'RETOMA') {
    // Solo en RETOMA se suma el AFORE
    return saldoAfore + prestamoFinanciero;
  } else {
    // En FINANCIADO 50% y 100%, el AFORE NO se usa
    return prestamoFinanciero;
  }
}

// Ejemplos:
// RETOMA
calcularMontoTotal(15000, 80000, 'RETOMA')
// Resultado: $95,000

// FINANCIADO 50%
calcularMontoTotal(15000, 80000, 'FINANCIADO_50')
// Resultado: $80,000 (AFORE no cuenta)

// FINANCIADO 100%
calcularMontoTotal(15000, 80000, 'FINANCIADO_100')
// Resultado: $80,000 (no se usa, cliente no aporta)
```

### Características

```
- Campo de SOLO LECTURA (calculado automáticamente)
- NO es editable por el usuario
- Se actualiza cuando cambian AFORE o Préstamo
- Determina qué modalidades son viables
- Es la base para validar suficiencia presupuestaria
```

### Validaciones

```javascript
function validarMontoTotal(saldoAfore, prestamo, montoTotal, modalidad) {
  // Verificar cálculo correcto
  const calculado = modalidad === 'RETOMA' 
    ? saldoAfore + prestamo 
    : prestamo;
  
  if (montoTotal !== calculado) {
    return {
      valido: false,
      error: `El monto total ($${montoTotal.toLocaleString()}) no coincide con el cálculo ($${calculado.toLocaleString()})`
    };
  }
  
  // Validar que no sea negativo
  if (montoTotal < 0) {
    return {
      valido: false,
      error: 'El monto total no puede ser negativo'
    };
  }
  
  return { valido: true };
}
```

### Presentación al Usuario

```javascript
function presentarMontoTotal(saldoAfore, prestamo, modalidad) {
  const total = modalidad === 'RETOMA' 
    ? saldoAfore + prestamo 
    : prestamo;
  
  let desglose;
  if (modalidad === 'RETOMA') {
    desglose = `$${saldoAfore.toLocaleString()} (AFORE) + $${prestamo.toLocaleString()} (Préstamo)`;
  } else {
    desglose = `$${prestamo.toLocaleString()} (solo Préstamo, AFORE no aplica)`;
  }
  
  return {
    total: total,
    desglose: desglose,
    formato: `$${total.toLocaleString()}`,
    mensaje: modalidad === 'RETOMA'
      ? 'Presupuesto total disponible'
      : 'Presupuesto (sin considerar AFORE)'
  };
}
```

### Rangos Comunes

```
┌──────────────┬──────────────────────────────────────┐
│ Monto Total  │ Modalidades Viables                  │
├──────────────┼──────────────────────────────────────┤
│ $0           │ Solo FINANCIADO 100%                 │
│ $10,000      │ Solo FINANCIADO 100%                 │
│ $22,275      │ FINANCIADO 50% y 100%                │
│ $30,000      │ FINANCIADO 50% y 100%                │
│ $62,550      │ TODAS (mínimo para RETOMA)           │
│ $80,000      │ TODAS                                │
│ $95,000      │ TODAS (ejemplo del Excel)            │
│ $100,000+    │ TODAS (con sobrante)                 │
└──────────────┴──────────────────────────────────────┘
```

### Ejemplos Completos

```javascript
// Ejemplo 1: Presupuesto alto con RETOMA
Saldo AFORE: $15,000
Préstamo: $80,000
Modalidad: RETOMA
Monto Total: $95,000
Cálculo: $15,000 + $80,000 = $95,000 ✓
Desglose: "$15,000 (AFORE) + $80,000 (Préstamo)"

// Ejemplo 2: Mismo presupuesto con F50
Saldo AFORE: $15,000
Préstamo: $80,000
Modalidad: FINANCIADO 50%
Monto Total: $80,000 (solo préstamo)
Cálculo: $80,000 (AFORE no cuenta) ✓
Desglose: "$80,000 (solo Préstamo)"
Nota: ⚠️ AFORE de $15,000 no se usa

// Ejemplo 3: Presupuesto justo
Saldo AFORE: $0
Préstamo: $62,550
Modalidad: RETOMA
Monto Total: $62,550
Validación: ✓ Exacto para RETOMA mínimo

// Ejemplo 4: Presupuesto insuficiente
Saldo AFORE: $10,000
Préstamo: $30,000
Modalidad: RETOMA
Monto Total: $40,000
Requerido: $62,550
Faltante: $22,550
Validación: ✗ Insuficiente
Alternativa: Cambiar a FINANCIADO 50% o 100%
```

### Mensajes Informativos

```javascript
// Mostrar siempre el desglose
const info = {
  total: `$${montoTotal.toLocaleString()}`,
  componentes: modalidad === 'RETOMA'
    ? `AFORE: $${saldoAfore.toLocaleString()} + Préstamo: $${prestamo.toLocaleString()}`
    : `Préstamo: $${prestamo.toLocaleString()} (AFORE no aplica en ${modalidad})`,
  modalidadesViables: determinarModalidadesViables(montoTotal)
};
```

---

## 4. RELACIÓN CON MODALIDADES DE RECUPERACIÓN

### Descripción de Modalidades

#### MODALIDAD 1: RETOMA
```
Concepto: El cliente paga TODOS los costos usando sus propios recursos

Componentes del costo:
- Pagos mensuales al IMSS: $44,550 (14 meses)
- Gestoría: $18,000
- TOTAL REQUERIDO: $62,550

Presupuesto usado:
- Saldo AFORE: Sí, se usa ✓
- Préstamo: Sí, se usa ✓
- Total disponible: AFORE + Préstamo

Ventajas:
✓ Usa el saldo AFORE existente
✓ Cliente mantiene control total
✓ Pagos más bajos ($3,200-$3,500/mes)
✓ No genera deuda con Grupo AVIVIR

Desventajas:
✗ Requiere presupuesto completo ($62,550)
✗ Cliente debe tener liquidez
```

#### MODALIDAD 2: FINANCIADO 50%
```
Concepto: Cliente paga 50% de los pagos mensuales, 
          Grupo AVIVIR financia el otro 50% + gestoría

Componentes del costo:
Cliente paga:
- 50% de pagos mensuales: $22,275 (14 meses)
- Gestoría: $0 (la paga AVIVIR)
- TOTAL CLIENTE: $22,275

Grupo AVIVIR financia:
- 50% de pagos mensuales: $22,275
- 100% de gestoría: $18,000
- Pagos completos al IMSS: $44,550
- TOTAL AVIVIR: $62,550

Inversión total del programa: $84,825

Presupuesto usado:
- Saldo AFORE: NO se usa ✗
- Préstamo: Sí, debe ser ≥ $22,275
- Total disponible: Solo Préstamo

Pagos mensuales del cliente:
Mes 1: $1,750 (50% de $3,500)
Mes 2: $1,325 (50% de $2,650)
Mes 3-14: $1,600 (50% de $3,200)

Ventajas:
✓ Requiere menos dinero del cliente ($22,275 vs $62,550)
✓ Grupo AVIVIR paga la gestoría
✓ Pagos mensuales más bajos para el cliente

Desventajas:
✗ No usa el saldo AFORE
✗ Inversión total más alta ($84,825)
✗ Cliente debe poder pagar su parte
```

#### MODALIDAD 3: FINANCIADO 100%
```
Concepto: Grupo AVIVIR financia el 100% del costo,
          Cliente NO aporta dinero

Componentes del costo:
Cliente paga: $0

Grupo AVIVIR financia:
- Pagos mensuales al IMSS: $89,100 (14 meses)
- Gestoría: $18,000
- TOTAL AVIVIR: $107,100

Presupuesto usado:
- Saldo AFORE: NO se usa ✗
- Préstamo: NO se requiere (puede ser $0)
- Total disponible: No aplica

Pagos mensuales (que paga AVIVIR):
Mes 1: $7,000 (2x de RETOMA)
Mes 2: $5,300 (2x de RETOMA)
Mes 3-14: $6,400 (2x de RETOMA)

IMPORTANTE: Pagos son EL DOBLE que en RETOMA
Razón: El cliente debe devolver el financiamiento
       a través de pagos más altos cuando obtenga su pensión

Restricción CRÍTICA:
⚠️ Solo viable para menores de 68 años
Texto del sistema:
"Para Reactiva financiado 100 solo son viables menores de 68 años"

Ventajas:
✓ Cliente NO aporta dinero
✓ Ideal para quien no tiene recursos
✓ Acceso inmediato sin liquidez

Desventajas:
✗ Inversión total muy alta ($107,100)
✗ Pagos al IMSS son el doble
✗ No usa el saldo AFORE
✗ Restricción de edad (< 68 años)
✗ Cliente debe devolver el doble después
```

### Tabla Comparativa de Modalidades

```
┌────────────────────┬─────────────┬──────────────────┬──────────────────┐
│ Concepto           │ RETOMA      │ FINANCIADO 50%   │ FINANCIADO 100%  │
├────────────────────┼─────────────┼──────────────────┼──────────────────┤
│ Usa AFORE          │ Sí ✓        │ No ✗             │ No ✗             │
│ Aporte cliente     │ $62,550     │ $22,275          │ $0               │
│ Aporte AVIVIR      │ $0          │ $62,550          │ $107,100         │
│ Total programa     │ $62,550     │ $84,825          │ $107,100         │
│ Pago mensual (ej)  │ $3,200      │ $1,600 (cliente) │ $6,400 (AVIVIR)  │
│ Gestoría cliente   │ $18,000     │ $0               │ $0               │
│ Restricción edad   │ Ninguna     │ Ninguna          │ < 68 años        │
│ Presupuesto mín.   │ $62,550     │ $22,275          │ $0               │
└────────────────────┴─────────────┴──────────────────┴──────────────────┘
```

### Fórmula de Costos por Modalidad

```javascript
const COSTO_GESTORIA = 18000;
const PAGOS_BASE_14_MESES = 44550; // Para RETOMA
const FACTOR_F100 = 2; // Pagos en F100 son el doble

function calcularCostoPorModalidad(modalidad, numMeses = 14) {
  // Nota: Esta es una simplificación
  // Los pagos reales varían según año y mes
  
  switch(modalidad) {
    case 'RETOMA':
      return {
        pagosMensuales: PAGOS_BASE_14_MESES,
        gestoria: COSTO_GESTORIA,
        totalCliente: PAGOS_BASE_14_MESES + COSTO_GESTORIA,
        totalAVIVIR: 0,
        totalPrograma: PAGOS_BASE_14_MESES + COSTO_GESTORIA
      };
      
    case 'FINANCIADO_50':
      const pagoCliente = PAGOS_BASE_14_MESES / 2;
      return {
        pagosMensualesCliente: pagoCliente,
        pagosMensualesAVIVIR: PAGOS_BASE_14_MESES,
        gestoria: COSTO_GESTORIA,
        totalCliente: pagoCliente,
        totalAVIVIR: PAGOS_BASE_14_MESES + COSTO_GESTORIA,
        totalPrograma: pagoCliente + PAGOS_BASE_14_MESES + COSTO_GESTORIA
      };
      
    case 'FINANCIADO_100':
      const pagosF100 = PAGOS_BASE_14_MESES * FACTOR_F100;
      return {
        pagosMensuales: pagosF100,
        gestoria: COSTO_GESTORIA,
        totalCliente: 0,
        totalAVIVIR: pagosF100 + COSTO_GESTORIA,
        totalPrograma: pagosF100 + COSTO_GESTORIA
      };
      
    default:
      throw new Error('Modalidad no válida');
  }
}
```

---

## 5. VALIDACIONES CRUZADAS

### Validación Completa del Presupuesto

```javascript
function validarPresupuestoCompleto(datos) {
  const errores = [];
  const advertencias = [];
  const info = [];
  
  // ==========================================
  // 1. VALIDACIÓN DE SALDO AFORE
  // ==========================================
  
  if (datos.saldoAfore < 0) {
    errores.push({
      campo: 'saldoAfore',
      mensaje: 'El saldo AFORE no puede ser negativo'
    });
  }
  
  if (datos.saldoAfore > 0 && datos.modalidad !== 'RETOMA') {
    advertencias.push({
      campo: 'saldoAfore',
      mensaje: `Tiene $${datos.saldoAfore.toLocaleString()} en AFORE que NO se usará en ${datos.modalidad}. Solo aplica en RETOMA.`,
      sugerencia: 'Considere modalidad RETOMA para aprovechar su saldo AFORE'
    });
  }
  
  // ==========================================
  // 2. VALIDACIÓN DE PRÉSTAMO
  // ==========================================
  
  if (datos.prestamo < 0) {
    errores.push({
      campo: 'prestamo',
      mensaje: 'El préstamo no puede ser negativo'
    });
  }
  
  // ==========================================
  // 3. VALIDACIÓN DE MONTO TOTAL
  // ==========================================
  
  const montoCalculado = datos.modalidad === 'RETOMA'
    ? datos.saldoAfore + datos.prestamo
    : datos.prestamo;
  
  if (datos.montoTotal !== montoCalculado) {
    errores.push({
      campo: 'montoTotal',
      mensaje: `El monto total no coincide con el cálculo. Esperado: $${montoCalculado.toLocaleString()}, Actual: $${datos.montoTotal.toLocaleString()}`
    });
  }
  
  // ==========================================
  // 4. VALIDACIÓN CON MODALIDAD SELECCIONADA
  // ==========================================
  
  const requisitos = {
    'RETOMA': { minimo: 62550, usa_afore: true },
    'FINANCIADO_50': { minimo: 22275, usa_afore: false },
    'FINANCIADO_100': { minimo: 0, usa_afore: false }
  };
  
  const req = requisitos[datos.modalidad];
  const presupuestoDisponible = req.usa_afore 
    ? datos.saldoAfore + datos.prestamo 
    : datos.prestamo;
  
  if (presupuestoDisponible < req.minimo) {
    const faltante = req.minimo - presupuestoDisponible;
    errores.push({
      campo: 'modalidad',
      mensaje: `Presupuesto insuficiente para ${datos.modalidad}. Requiere $${req.minimo.toLocaleString()}, tiene $${presupuestoDisponible.toLocaleString()}`,
      faltante: faltante,
      critico: true
    });
  } else {
    const sobrante = presupuestoDisponible - req.minimo;
    info.push({
      campo: 'modalidad',
      mensaje: `✓ Presupuesto suficiente para ${datos.modalidad}. Sobrante: $${sobrante.toLocaleString()}`
    });
  }
  
  // ==========================================
  // 5. RESTRICCIÓN DE EDAD PARA F100
  // ==========================================
  
  if (datos.modalidad === 'FINANCIADO_100' && datos.edad >= 68) {
    errores.push({
      campo: 'modalidad',
      mensaje: '⚠️ RESTRICCIÓN: FINANCIADO 100% solo es viable para menores de 68 años',
      critico: true,
      bloqueante: true
    });
  }
  
  // ==========================================
  // 6. SUGERENCIAS DE MODALIDAD
  // ==========================================
  
  if (presupuestoDisponible === 0) {
    info.push({
      tipo: 'sugerencia',
      mensaje: 'Con presupuesto $0, la única opción es FINANCIADO 100%'
    });
  } else if (presupuestoDisponible < 22275) {
    info.push({
      tipo: 'sugerencia',
      mensaje: `Con $${presupuestoDisponible.toLocaleString()}, solo puede acceder a FINANCIADO 100%`
    });
  } else if (presupuestoDisponible >= 62550 && datos.saldoAfore > 0) {
    info.push({
      tipo: 'sugerencia',
      mensaje: 'Su presupuesto es suficiente para RETOMA y aprovecharía su saldo AFORE'
    });
  }
  
  return {
    valido: errores.length === 0,
    bloqueante: errores.some(e => e.bloqueante),
    errores,
    advertencias,
    info,
    presupuestoDisponible
  };
}
```

### Matriz de Validaciones

```
┌──────────────┬────────┬──────────┬─────────────┬────────────┐
│ Campo        │ AFORE  │ Préstamo │ Monto Total │ Modalidad  │
├──────────────┼────────┼──────────┼─────────────┼────────────┤
│ AFORE        │   -    │    -     │     ✓✓      │    ✓✓      │
│ Préstamo     │   -    │    -     │     ✓✓      │    ✓✓      │
│ Monto Total  │  ✓✓    │   ✓✓     │      -      │    ✓✓      │
│ Modalidad    │  ✓✓    │   ✓✓     │     ✓✓      │     -      │
│ Edad         │   -    │    -     │      -      │    ✓✓      │
└──────────────┴────────┴──────────┴─────────────┴────────────┘

Leyenda:
✓✓  = Validación crítica (obligatoria)
-   = No aplica validación directa
```

---

## 6. TABLA DE SUFICIENCIA PRESUPUESTARIA

### Determinación de Modalidades Viables

```javascript
function determinarModalidadesViables(saldoAfore, prestamo, edad) {
  const presupuestoConAfore = saldoAfore + prestamo;
  const presupuestoSinAfore = prestamo;
  
  const modalidades = [];
  
  // RETOMA
  if (presupuestoConAfore >= 62550) {
    modalidades.push({
      nombre: 'RETOMA',
      viable: true,
      presupuestoRequerido: 62550,
      presupuestoDisponible: presupuestoConAfore,
      sobrante: presupuestoConAfore - 62550,
      usaAfore: true,
      ventaja: 'Usa su saldo AFORE de $' + saldoAfore.toLocaleString()
    });
  }
  
  // FINANCIADO 50%
  if (presupuestoSinAfore >= 22275) {
    modalidades.push({
      nombre: 'FINANCIADO 50%',
      viable: true,
      presupuestoRequerido: 22275,
      presupuestoDisponible: presupuestoSinAfore,
      sobrante: presupuestoSinAfore - 22275,
      usaAfore: false,
      ventaja: 'Requiere menos presupuesto'
    });
  }
  
  // FINANCIADO 100%
  if (edad < 68) {
    modalidades.push({
      nombre: 'FINANCIADO 100%',
      viable: true,
      presupuestoRequerido: 0,
      presupuestoDisponible: 0,
      sobrante: 0,
      usaAfore: false,
      ventaja: 'No requiere aporte del cliente'
    });
  } else {
    modalidades.push({
      nombre: 'FINANCIADO 100%',
      viable: false,
      razonNoViable: 'Restricción de edad (>= 68 años)',
      presupuestoRequerido: 0
    });
  }
  
  return {
    modalidades,
    conteoViables: modalidades.filter(m => m.viable).length,
    recomendacion: obtenerRecomendacion(modalidades, saldoAfore)
  };
}

function obtenerRecomendacion(modalidades, saldoAfore) {
  const viables = modalidades.filter(m => m.viable);
  
  if (viables.length === 0) {
    return 'Ninguna modalidad es viable con el presupuesto actual';
  }
  
  if (viables.length === 1) {
    return `Solo viable: ${viables[0].nombre}`;
  }
  
  // Si tiene AFORE y RETOMA es viable, recomendar RETOMA
  if (saldoAfore > 0 && viables.some(m => m.nombre === 'RETOMA')) {
    return 'Recomendación: RETOMA para aprovechar su saldo AFORE';
  }
  
  // Si tiene poco presupuesto, recomendar F50 o F100
  if (viables.some(m => m.nombre === 'FINANCIADO 50%' && m.presupuestoDisponible < 40000)) {
    return 'Recomendación: FINANCIADO 50% o 100% según su capacidad de pago';
  }
  
  return 'Tiene múltiples opciones viables. Consulte con su asesor.';
}
```

### Tabla de Decisión

```
PRESUPUESTO TOTAL │ MODALIDADES VIABLES          │ RECOMENDACIÓN
──────────────────┼──────────────────────────────┼─────────────────────
$0                │ Solo FINANCIADO 100%         │ F100 (única opción)
$1 - $22,274      │ Solo FINANCIADO 100%         │ F100 (única opción)
$22,275 - $62,549 │ FINANCIADO 50% y 100%        │ F50 o F100 según edad
$62,550+          │ TODAS (si edad < 68)         │ RETOMA (si tiene AFORE)
                  │                              │ F50 o F100 (si no AFORE)
──────────────────┴──────────────────────────────┴─────────────────────

CASOS ESPECIALES:
- Edad >= 68: F100 NO viable, solo RETOMA o F50
- Sin AFORE: RETOMA requiere préstamo completo ($62,550)
- Con AFORE alto: RETOMA es óptima
```

---

## 7. FLUJO DE DECISIÓN DE MODALIDAD

### Algoritmo de Decisión

```javascript
function recomendarModalidad(datos) {
  const { saldoAfore, prestamo, edad, preferencia } = datos;
  
  // 1. Calcular presupuestos
  const presupuestoConAfore = saldoAfore + prestamo;
  const presupuestoSinAfore = prestamo;
  
  // 2. Verificar restricción de edad para F100
  const f100Viable = edad < 68;
  
  // 3. Determinar viabilidad
  const viabilidad = {
    retoma: presupuestoConAfore >= 62550,
    financiado50: presupuestoSinAfore >= 22275,
    financiado100: f100Viable
  };
  
  // 4. Lógica de decisión
  
  // Caso 1: Sin recursos
  if (presupuestoConAfore === 0) {
    if (f100Viable) {
      return {
        modalidad: 'FINANCIADO_100',
        razon: 'Única opción sin recursos propios',
        alternativas: []
      };
    } else {
      return {
        modalidad: null,
        razon: 'No tiene recursos y no califica para FINANCIADO 100% (edad >= 68)',
        sugerencia: 'Necesita conseguir al menos $22,275 para FINANCIADO 50%'
      };
    }
  }
  
  // Caso 2: Presupuesto bajo
  if (presupuestoSinAfore < 22275) {
    if (f100Viable) {
      return {
        modalidad: 'FINANCIADO_100',
        razon: `Presupuesto de $${presupuestoConAfore.toLocaleString()} es insuficiente para otras modalidades`,
        alternativas: []
      };
    } else {
      return {
        modalidad: null,
        razon: 'Presupuesto insuficiente y no califica para F100 por edad',
        sugerencia: `Necesita $${22275 - presupuestoSinAfore} más para FINANCIADO 50%`
      };
    }
  }
  
  // Caso 3: Presupuesto medio (22,275 - 62,549)
  if (presupuestoSinAfore >= 22275 && presupuestoConAfore < 62550) {
    return {
      modalidad: 'FINANCIADO_50',
      razon: 'Presupuesto suficiente para F50, insuficiente para RETOMA',
      alternativas: f100Viable ? ['FINANCIADO_100'] : []
    };
  }
  
  // Caso 4: Presupuesto alto (>= 62,550)
  if (presupuestoConAfore >= 62550) {
    // Si tiene AFORE, recomendar RETOMA
    if (saldoAfore > 0) {
      return {
        modalidad: 'RETOMA',
        razon: `Aprovechar saldo AFORE de $${saldoAfore.toLocaleString()}`,
        alternativas: viabilidad.financiado50 ? ['FINANCIADO_50'] : [],
        nota: f100Viable ? 'También viable FINANCIADO 100%' : null
      };
    }
    
    // Sin AFORE, ofrecer opciones
    return {
      modalidad: 'RETOMA',
      razon: 'Presupuesto suficiente para cualquier modalidad',
      alternativas: ['FINANCIADO_50', f100Viable ? 'FINANCIADO_100' : null].filter(Boolean),
      nota: 'Consulte con su asesor para elegir la mejor opción'
    };
  }
}
```

### Diagrama de Flujo

```
┌─────────────────────────┐
│ Inicio: Ingresar datos  │
│ - Saldo AFORE           │
│ - Préstamo              │
│ - Edad                  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Calcular presupuestos   │
│ Con AFORE / Sin AFORE   │
└────────┬────────────────┘
         │
         ▼
    ┌────────────┐
    │ Edad < 68? │
    └─┬────────┬─┘
      │ No     │ Sí
      │        │
      ▼        ▼
  F100 NO   F100 SÍ
  viable    viable
      │        │
      └────┬───┘
           │
           ▼
┌──────────────────────────┐
│ Presupuesto >= $62,550?  │
└─┬──────────────────────┬─┘
  │ Sí                   │ No
  │                      │
  ▼                      ▼
┌─────────────┐  ┌──────────────────────┐
│ AFORE > 0?  │  │ Presupuesto >= $22,275?│
└─┬─────────┬─┘  └─┬──────────────────┬─┘
  │Sí       │No    │ Sí               │ No
  │         │      │                  │
  ▼         ▼      ▼                  ▼
RETOMA    Todas   F50                F100
(usa      viables (o F100)           única
AFORE)    (elegir)                   opción
```

---

## EJEMPLOS COMPLETOS DE CASOS DE USO

### Caso 1: Cliente con recursos completos
```javascript
Datos:
  Saldo AFORE: $15,000
  Préstamo: $80,000
  Edad: 65 años
  
Cálculos:
  Presupuesto con AFORE: $95,000
  Presupuesto sin AFORE: $80,000
  
Modalidades viables:
  ✓ RETOMA: Sí ($95,000 > $62,550)
  ✓ FINANCIADO 50%: Sí ($80,000 > $22,275)
  ✓ FINANCIADO 100%: Sí (edad < 68)
  
Recomendación: RETOMA
Razón: Aprovecha saldo AFORE de $15,000
Sobrante: $32,450
```

### Caso 2: Cliente sin recursos
```javascript
Datos:
  Saldo AFORE: $0
  Préstamo: $0
  Edad: 62 años
  
Cálculos:
  Presupuesto total: $0
  
Modalidades viables:
  ✗ RETOMA: No ($0 < $62,550)
  ✗ FINANCIADO 50%: No ($0 < $22,275)
  ✓ FINANCIADO 100%: Sí (única opción)
  
Recomendación: FINANCIADO 100%
Razón: Única modalidad viable sin recursos
```

### Caso 3: Cliente mayor sin AFORE
```javascript
Datos:
  Saldo AFORE: $0
  Préstamo: $30,000
  Edad: 70 años
  
Cálculos:
  Presupuesto total: $30,000
  
Modalidades viables:
  ✗ RETOMA: No ($30,000 < $62,550)
  ✓ FINANCIADO 50%: Sí ($30,000 > $22,275)
  ✗ FINANCIADO 100%: No (edad >= 68)
  
Recomendación: FINANCIADO 50%
Razón: Única modalidad viable
Sobrante: $7,725
```

### Caso 4: Cliente con AFORE alto
```javascript
Datos:
  Saldo AFORE: $70,000
  Préstamo: $0
  Edad: 60 años
  
Cálculos:
  Presupuesto con AFORE: $70,000
  Presupuesto sin AFORE: $0
  
Modalidades viables:
  ✓ RETOMA: Sí ($70,000 > $62,550)
  ✗ FINANCIADO 50%: No ($0 < $22,275)
  ✓ FINANCIADO 100%: Sí (edad < 68)
  
Recomendación: RETOMA
Razón: AFORE cubre costo completo
Sobrante: $7,450
Alternativa: F100 si prefiere no usar AFORE
```

---

## RESUMEN DE REGLAS CRÍTICAS

### 🔴 REGLAS BLOQUEANTES

1. **Saldo AFORE negativo**
   - Error: "El saldo AFORE no puede ser negativo"

2. **Préstamo negativo**
   - Error: "El préstamo no puede ser negativo"

3. **Presupuesto insuficiente para modalidad**
   - Error: "Presupuesto insuficiente para [MODALIDAD]"
   - Acción: Cambiar modalidad o aumentar presupuesto

4. **Edad >= 68 con FINANCIADO 100%**
   - Error: "FINANCIADO 100% solo para menores de 68 años"
   - Bloqueante: SÍ

### 🟡 REGLAS IMPORTANTES (Advertencias)

1. **AFORE no se usa en modalidad seleccionada**
   - Advertencia: "Su AFORE no se usará en [MODALIDAD]"
   - Sugerencia: "Considere RETOMA"

2. **Presupuesto justo en el límite**
   - Advertencia: "Presupuesto exacto, sin margen de error"

3. **Múltiples modalidades viables**
   - Info: "Consulte con su asesor"

### 🟢 REGLAS INFORMATIVAS

1. **Desglose del presupuesto**
   - Info: Mostrar componentes (AFORE + Préstamo)

2. **Modalidades viables**
   - Info: Listar todas las opciones

3. **Sobrante presupuestario**
   - Info: Mostrar cuánto sobra

---

## IMPLEMENTACIÓN EN REACT

```jsx
const [presupuesto, setPresupuesto] = useState({
  saldoAfore: 0,
  prestamoFinanciero: 0,
  montoTotal: 0
});

// Auto-calcular monto total
useEffect(() => {
  const total = modalidad === 'RETOMA'
    ? presupuesto.saldoAfore + presupuesto.prestamoFinanciero
    : presupuesto.prestamoFinanciero;
    
  setPresupuesto(prev => ({
    ...prev,
    montoTotal: total
  }));
}, [presupuesto.saldoAfore, presupuesto.prestamoFinanciero, modalidad]);

// Validar suficiencia
const validarSuficiencia = () => {
  const requisitos = {
    'RETOMA': 62550,
    'FINANCIADO_50': 22275,
    'FINANCIADO_100': 0
  };
  
  return presupuesto.montoTotal >= requisitos[modalidad];
};
```

---

© 2026 Sistema de Recuperación de Pensiones - Grupo AVIVIR
