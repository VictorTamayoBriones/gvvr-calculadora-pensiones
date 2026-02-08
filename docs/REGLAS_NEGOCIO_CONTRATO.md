# Reglas de Negocio y Validaciones - Sección: Información del Contrato

## 📋 ÍNDICE
1. [Fecha de Firma del Contrato](#1-fecha-de-firma-del-contrato)
2. [Fecha de Inicio](#2-fecha-de-inicio)
3. [Fecha de Fin](#3-fecha-de-fin)
4. [Total de Meses](#4-total-de-meses-mínimo-14)
5. [Semanas al Final del Ejercicio](#5-semanas-al-final-del-ejercicio)
6. [Validaciones Cruzadas](#6-validaciones-cruzadas)
7. [Flujo de Trabajo Completo](#7-flujo-de-trabajo-completo)

---

## CONTEXTO GENERAL

### Propósito del Contrato
El contrato de recuperación de pensión tiene como objetivo que el cliente **retome sus cotizaciones al IMSS** durante un período mínimo para recuperar su vigencia de derechos y poder acceder a su pensión.

### Flujo Temporal
```
Fecha Firma    Fecha Inicio      Cotización        Fecha Fin       Resolución
  (Firma)    (Inicia cotizar)   (14+ meses)    (Deja cotizar)     (Pensión)
    │              │                 │                │                 │
    │◄─────────────┤                 │                │                 │
    │  Retroactivo │◄────────────────┤                │                 │
    │              │   14 meses min  │◄───────────────┤                 │
    │              │                 │                │◄────────────────┤
    │              │                 │                │    1-2 meses    │
    ▼              ▼                 ▼                ▼                 ▼
  Ene-2026     Nov-2025          Nov-2025         Ene-2027         Feb-2027
                                  a Dic-2026
```

---

## 1. FECHA DE FIRMA DEL CONTRATO

### Definición
Fecha en la cual el cliente firma físicamente el contrato de recuperación de pensión con Grupo AVIVIR.

### Reglas de Negocio

#### Regla Principal
```
La fecha de firma determina cuándo puede iniciar la cotización según el día del mes:

- DÍA 1-15: Alta retroactiva al 1ro del MES CORRIENTE
- DÍA 16-31: Alta al 1ro del MES SIGUIENTE
- EXCEPCIÓN: Puede solicitar fecha EXPRES (anterior o personalizada)
```

#### Validaciones Básicas
```javascript
Validaciones:
✓ No puede estar vacía
✓ Debe ser una fecha válida
✓ Debe ser <= fecha actual (no puede ser futura)
✓ Debe ser >= fecha de nacimiento + 18 años (edad legal)
✓ Formato: YYYY-MM-DD

Rango Temporal:
- Fecha mínima: fecha_nacimiento + 18 años
- Fecha máxima: fecha actual (hoy)
```

### Cálculo de Fecha de Alta

```javascript
function calcularFechaAlta(fechaFirma, expres = false, fechaExpres = null) {
  if (expres && fechaExpres) {
    // Cliente solicita fecha específica
    return fechaExpres;
  }
  
  const dia = fechaFirma.getDate();
  
  if (dia <= 15) {
    // Alta retroactiva al 1ro del mes corriente
    return new Date(fechaFirma.getFullYear(), fechaFirma.getMonth(), 1);
  } else {
    // Alta al 1ro del mes siguiente
    const mesAlta = fechaFirma.getMonth() + 1;
    const añoAlta = mesAlta > 11 ? fechaFirma.getFullYear() + 1 : fechaFirma.getFullYear();
    const mesFinal = mesAlta > 11 ? 0 : mesAlta;
    return new Date(añoAlta, mesFinal, 1);
  }
}

// Ejemplos:
// Firma: 05-Ene-2026 (día 5)  → Alta: 01-Ene-2026 (mismo mes)
// Firma: 12-Feb-2026 (día 12) → Alta: 01-Feb-2026 (mismo mes)
// Firma: 16-Mar-2026 (día 16) → Alta: 01-Abr-2026 (siguiente mes)
// Firma: 30-Ene-2026 (día 30) → Alta: 01-Feb-2026 (siguiente mes)
```

### Regla de Alta EXPRES
```
SOLICITUD EXPRES:
El cliente puede solicitar que su alta sea en una fecha específica,
incluso ANTERIOR a la fecha de firma.

Ejemplo:
- Fecha Firma: 30-Ene-2026
- Fecha Alta Sugerida: 01-Feb-2026 (por regla del día 16+)
- Fecha Alta Expres Solicitada: 01-Nov-2025 (3 meses antes)
- RESULTADO: Se acepta y el contrato inicia retroactivamente

Restricciones:
- La fecha expres no puede ser más de 6 meses anterior a la firma
- Debe ser siempre el día 1 del mes
- Requiere justificación y aprobación especial
```

### Nota Importante
```
TEXTO ORIGINAL DEL SISTEMA:
"Los contratos firmados del 1ro al 15 del mes corriente, se contemplan 
para fecha de alta retroactiva al 1ro del mes corriente.

A partir del día 16 del mes en adelante se solicitará el alta al 1ro 
del mes siguiente, a menos que sea solicitado de manera EXPRÉS."
```

### Ejemplos Completos

```javascript
// Ejemplo 1: Firma día 8
Fecha Firma: 08-Ene-2026
Día: 8 (≤ 15)
Fecha Alta Sugerida: 01-Ene-2026 (mismo mes)
Resultado: ✓ Válido

// Ejemplo 2: Firma día 20
Fecha Firma: 20-Feb-2026
Día: 20 (> 15)
Fecha Alta Sugerida: 01-Mar-2026 (siguiente mes)
Resultado: ✓ Válido

// Ejemplo 3: Firma día 30 con expres
Fecha Firma: 30-Ene-2026
Día: 30 (> 15)
Fecha Alta Normal: 01-Feb-2026
Cliente solicita EXPRES: 01-Nov-2025
Resultado: ✓ Válido (con aprobación)

// Ejemplo 4: Firma día 15 (límite)
Fecha Firma: 15-Mar-2026
Día: 15 (= 15)
Fecha Alta Sugerida: 01-Mar-2026 (mismo mes)
Resultado: ✓ Válido
```

### Mensajes de Error
- "La fecha de firma del contrato es obligatoria"
- "La fecha de firma no puede ser futura"
- "La fecha de firma debe ser posterior al cumplir 18 años"
- "Fecha inválida"

### Mensajes Informativos
```javascript
if (dia <= 15) {
  info: `Firma realizada el día ${dia}. Alta retroactiva al 1° del mes corriente: ${fechaAlta}`
} else {
  info: `Firma realizada el día ${dia}. Alta programada para el 1° del mes siguiente: ${fechaAlta}`
  suggestion: "Si requiere iniciar antes, puede solicitar alta EXPRES"
}
```

---

## 2. FECHA DE INICIO

### Definición
Fecha en la cual el cliente **inicia efectivamente a cotizar** al IMSS. Es el primer día del contrato de recuperación.

### Reglas de Negocio

#### Características Principales
```
- SIEMPRE debe ser el día 1 de algún mes
- Puede ser ANTERIOR a la fecha de firma (retroactiva)
- Puede ser POSTERIOR a la fecha de firma (programada)
- Determina el primer mes de cotización
- Es el punto de partida para calcular los 14 meses mínimos
```

#### Validaciones Básicas
```javascript
Validaciones:
✓ No puede estar vacía
✓ Debe ser una fecha válida
✓ DEBE SER DÍA 1 del mes (CRÍTICO)
✓ No puede ser más de 6 meses anterior a fecha de firma
✓ No puede ser más de 2 meses posterior a fecha de firma
✓ Debe ser posterior a la fecha de baja del IMSS
✓ Formato: YYYY-MM-DD

Restricción de día del mes:
if (fecha_inicio.getDate() !== 1) {
  error: "La fecha de inicio DEBE ser el día 1 del mes"
}

Ejemplo válido: 2025-11-01 ✓
Ejemplo inválido: 2025-11-15 ✗ (día 15, debe ser día 1)
```

#### Relación con Fecha de Firma
```javascript
function validarFechaInicio(fechaInicio, fechaFirma) {
  // Debe ser día 1
  if (fechaInicio.getDate() !== 1) {
    return {
      valido: false,
      error: "La fecha de inicio debe ser el día 1 del mes"
    };
  }
  
  // Diferencia en meses
  const diffMeses = (fechaFirma.getFullYear() - fechaInicio.getFullYear()) * 12
                    + (fechaFirma.getMonth() - fechaInicio.getMonth());
  
  // No puede ser más de 6 meses antes
  if (diffMeses > 6) {
    return {
      valido: false,
      error: "La fecha de inicio no puede ser más de 6 meses anterior a la firma"
    };
  }
  
  // No puede ser más de 2 meses después
  if (diffMeses < -2) {
    return {
      valido: false,
      error: "La fecha de inicio no puede ser más de 2 meses posterior a la firma"
    };
  }
  
  return { valido: true };
}
```

#### Relación con Fecha de Baja
```javascript
function validarInicioVsBaja(fechaInicio, fechaBaja) {
  if (fechaInicio <= fechaBaja) {
    return {
      valido: false,
      error: "La fecha de inicio debe ser posterior a la fecha de baja del IMSS"
    };
  }
  
  // Validar que hayan pasado al menos 5 años (sin vigencia)
  const añosDiferencia = (fechaInicio - fechaBaja) / (365.25 * 24 * 60 * 60 * 1000);
  
  if (añosDiferencia < 5) {
    return {
      valido: true,
      warning: "El cliente aún tiene vigencia de derechos. Considere si realmente necesita recuperación."
    };
  }
  
  return { valido: true };
}
```

### Cálculo Automático Sugerido
```javascript
function sugerirFechaInicio(fechaFirma, solicitudExpres = false, fechaExpresDeseada = null) {
  if (solicitudExpres && fechaExpresDeseada) {
    // Validar que sea día 1
    if (fechaExpresDeseada.getDate() === 1) {
      return fechaExpresDeseada;
    } else {
      throw new Error("La fecha expres debe ser día 1 del mes");
    }
  }
  
  const dia = fechaFirma.getDate();
  
  if (dia <= 15) {
    // Alta retroactiva al inicio del mes corriente
    return new Date(fechaFirma.getFullYear(), fechaFirma.getMonth(), 1);
  } else {
    // Alta al inicio del mes siguiente
    const mesSiguiente = new Date(fechaFirma);
    mesSiguiente.setMonth(mesSiguiente.getMonth() + 1);
    mesSiguiente.setDate(1);
    return mesSiguiente;
  }
}
```

### Ejemplos Completos

```javascript
// Ejemplo 1: Fecha calculada normal (día 1-15)
Fecha Firma: 2026-01-10
Fecha Inicio Sugerida: 2026-01-01
Validación: ✓ Mismo mes, día 1

// Ejemplo 2: Fecha calculada normal (día 16+)
Fecha Firma: 2026-01-30
Fecha Inicio Sugerida: 2026-02-01
Validación: ✓ Mes siguiente, día 1

// Ejemplo 3: Fecha EXPRES retroactiva
Fecha Firma: 2026-01-30
Fecha Inicio Solicitada: 2025-11-01
Validación: ✓ 3 meses antes, día 1, dentro del límite de 6 meses

// Ejemplo 4: INVÁLIDO - No es día 1
Fecha Firma: 2026-01-10
Fecha Inicio: 2026-01-15
Validación: ✗ ERROR: Debe ser día 1 del mes

// Ejemplo 5: INVÁLIDO - Muy anterior
Fecha Firma: 2026-01-30
Fecha Inicio: 2025-06-01
Validación: ✗ ERROR: 7 meses antes (límite 6 meses)
```

### Mensajes de Error
- "La fecha de inicio es obligatoria"
- "La fecha de inicio DEBE ser el día 1 del mes"
- "La fecha de inicio no puede ser más de 6 meses anterior a la fecha de firma"
- "La fecha de inicio no puede ser más de 2 meses posterior a la fecha de firma"
- "La fecha de inicio debe ser posterior a la fecha de baja del IMSS"

### Mensajes Informativos
```javascript
if (fechaInicio < fechaFirma) {
  info: "Contrato con inicio RETROACTIVO al 1° de " + mesNombre(fechaInicio)
} else if (fechaInicio.getMonth() === fechaFirma.getMonth()) {
  info: "Alta el mismo mes de la firma"
} else {
  info: "Alta programada para el mes siguiente"
}
```

---

## 3. FECHA DE FIN

### Definición
Fecha en la cual **finaliza el período de cotización** del contrato. Es el último día que el cliente cotiza al IMSS bajo este esquema de recuperación.

### Reglas de Negocio

#### Características Principales
```
- SIEMPRE debe ser el día 1 de algún mes
- Marca el fin del período de cotización
- Debe permitir completar al menos 14 meses
- Debe estar alineada con el objetivo de resolución de pensión
- Determina el mes final del cronograma de pagos
```

#### Validaciones Básicas
```javascript
Validaciones:
✓ No puede estar vacía
✓ Debe ser una fecha válida
✓ DEBE SER DÍA 1 del mes (CRÍTICO)
✓ Debe ser posterior a fecha de inicio
✓ Debe permitir al menos 14 meses de diferencia con inicio
✓ No debe exceder 36 meses (3 años) de diferencia
✓ Formato: YYYY-MM-DD

Restricción de día del mes:
if (fecha_fin.getDate() !== 1) {
  error: "La fecha de fin DEBE ser el día 1 del mes"
}

Ejemplo válido: 2027-01-01 ✓
Ejemplo inválido: 2027-01-31 ✗ (día 31, debe ser día 1)
```

#### Cálculo a partir de Fecha de Inicio y Total de Meses
```javascript
function calcularFechaFin(fechaInicio, totalMeses) {
  // Verificar que fecha inicio sea día 1
  if (fechaInicio.getDate() !== 1) {
    throw new Error("Fecha de inicio debe ser día 1 del mes");
  }
  
  // Agregar los meses
  const fechaFin = new Date(fechaInicio);
  fechaFin.setMonth(fechaFin.getMonth() + totalMeses);
  
  // Asegurar que sea día 1
  fechaFin.setDate(1);
  
  return fechaFin;
}

// Ejemplo:
// Fecha Inicio: 2025-11-01
// Total Meses: 14
// Cálculo: Nov-2025 + 14 meses = Ene-2027
// Fecha Fin: 2027-01-01
```

#### Relación con Total de Meses
```javascript
function validarFechaFinConMeses(fechaInicio, fechaFin, totalMeses) {
  const mesesCalculados = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12
                         + (fechaFin.getMonth() - fechaInicio.getMonth());
  
  if (mesesCalculados !== totalMeses) {
    return {
      valido: false,
      error: `La diferencia entre fecha inicio y fin (${mesesCalculados} meses) no coincide con total de meses (${totalMeses})`
    };
  }
  
  return { valido: true };
}
```

#### Alineación con Resolución de Pensión
```
REGLA DE NEGOCIO:
La fecha fin debe programarse considerando que:
- Después del fin del contrato, el cliente solicita su pensión
- El trámite de resolución toma aproximadamente 1-2 meses
- La resolución debe emitirse en un mes específico objetivo

Ejemplo:
Objetivo: Resolución en Febrero 2027
Fecha Fin requerida: 01-Enero-2027
Razón: Termina cotización en Dic-2026, solicita en Ene-2027, resuelve en Feb-2027
```

### Validaciones Avanzadas

```javascript
function validarFechaFin(fechaInicio, fechaFin) {
  // Debe ser día 1
  if (fechaFin.getDate() !== 1) {
    return {
      valido: false,
      error: "La fecha de fin debe ser el día 1 del mes"
    };
  }
  
  // Debe ser posterior a inicio
  if (fechaFin <= fechaInicio) {
    return {
      valido: false,
      error: "La fecha de fin debe ser posterior a la fecha de inicio"
    };
  }
  
  // Calcular meses
  const meses = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12
               + (fechaFin.getMonth() - fechaInicio.getMonth());
  
  // Mínimo 14 meses
  if (meses < 14) {
    return {
      valido: false,
      error: `El contrato debe ser de al menos 14 meses. Actualmente: ${meses} meses`
    };
  }
  
  // Máximo recomendado 36 meses
  if (meses > 36) {
    return {
      valido: true,
      warning: `El contrato es muy largo (${meses} meses). Considere si es necesario.`
    };
  }
  
  return { valido: true, meses };
}
```

### Ejemplos Completos

```javascript
// Ejemplo 1: Contrato de 14 meses
Fecha Inicio: 2025-11-01
Total Meses: 14
Fecha Fin Calculada: 2027-01-01
Validación: ✓ 14 meses, día 1

// Ejemplo 2: Contrato de 18 meses
Fecha Inicio: 2025-06-01
Total Meses: 18
Fecha Fin Calculada: 2026-12-01
Validación: ✓ 18 meses, día 1

// Ejemplo 3: INVÁLIDO - Menos de 14 meses
Fecha Inicio: 2026-01-01
Fecha Fin: 2026-12-01
Meses: 11
Validación: ✗ ERROR: Mínimo 14 meses requeridos

// Ejemplo 4: INVÁLIDO - No es día 1
Fecha Inicio: 2025-11-01
Fecha Fin: 2027-01-15
Validación: ✗ ERROR: Debe ser día 1 del mes

// Ejemplo 5: Contrato largo
Fecha Inicio: 2025-01-01
Fecha Fin: 2028-01-01
Meses: 36
Validación: ✓ Válido pero ⚠️ Advertencia de contrato largo
```

### Cronograma de Ejemplo
```
CRONOGRAMA (14 MESES):
Inicio: Nov-2025 → Fin: Ene-2027

Mes  1: Nov-2025 → Pago #1
Mes  2: Dic-2025 → Pago #2
Mes  3: Ene-2026 → Pago #3
Mes  4: Feb-2026 → Pago #4
Mes  5: Mar-2026 → Pago #5
Mes  6: Abr-2026 → Pago #6
Mes  7: May-2026 → Pago #7
Mes  8: Jun-2026 → Pago #8
Mes  9: Jul-2026 → Pago #9
Mes 10: Ago-2026 → Pago #10
Mes 11: Sep-2026 → Pago #11
Mes 12: Oct-2026 → Pago #12
Mes 13: Nov-2026 → Pago #13
Mes 14: Dic-2026 → Pago #14
────────────────────────────
FIN: Ene-2027 (deja de cotizar)
SOLICITUD: Ene-2027
RESOLUCIÓN: Feb-2027 ✓
```

### Mensajes de Error
- "La fecha de fin es obligatoria"
- "La fecha de fin DEBE ser el día 1 del mes"
- "La fecha de fin debe ser posterior a la fecha de inicio"
- "El contrato no cumple con el mínimo de 14 meses"
- "La diferencia entre fechas no coincide con el total de meses especificado"

### Mensajes Informativos
```javascript
const objetivo = new Date(fechaFin);
objetivo.setMonth(objetivo.getMonth() + 1); // Mes siguiente

info: `Fecha fin: ${formatearFecha(fechaFin)}`
info: `Último mes de cotización: ${mesNombre(fechaFin.getMonth() - 1)}-${fechaFin.getFullYear()}`
info: `Resolución estimada: ${mesNombre(objetivo.getMonth())}-${objetivo.getFullYear()}`
```

---

## 4. TOTAL DE MESES (Mínimo 14)

### Definición
Número de meses que el cliente estará cotizando al IMSS bajo el contrato de recuperación de pensión.

### Reglas de Negocio

#### Regla CRÍTICA
```
MÍNIMO ABSOLUTO: 14 MESES

Razón oficial del sistema:
"EL CONTRATO NO PODRÁ SER MENOR A 14 MESES, PARA RECUPERAR 
DERECHOS ANTE EL INSTITUTO"

Justificación:
- 14 meses × 4 semanas/mes = 56 semanas mínimas de cotización
- Permite alcanzar el umbral necesario para reactivar derechos
- Es el período que el IMSS requiere para reconocer vigencia
```

#### Validaciones Básicas
```javascript
Validaciones:
✓ No puede estar vacío
✓ Debe ser un número entero
✓ MÍNIMO: 14 meses (CRÍTICO)
✓ MÁXIMO RECOMENDADO: 36 meses (3 años)
✓ MÁXIMO ABSOLUTO: 60 meses (5 años)
✓ Debe coincidir con diferencia entre fecha_inicio y fecha_fin

Regla de mínimo:
const MESES_MINIMO = 14;

if (totalMeses < MESES_MINIMO) {
  error: `El contrato debe ser de al menos ${MESES_MINIMO} meses. Actualmente: ${totalMeses} meses`
  critico: true
  bloqueante: true
}
```

#### Cálculo Automático
```javascript
function calcularTotalMeses(fechaInicio, fechaFin) {
  // Verificar que sean día 1
  if (fechaInicio.getDate() !== 1 || fechaFin.getDate() !== 1) {
    throw new Error("Ambas fechas deben ser día 1 del mes");
  }
  
  // Calcular diferencia en meses
  const meses = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12
               + (fechaFin.getMonth() - fechaInicio.getMonth());
  
  return meses;
}

// Ejemplo:
// Inicio: 2025-11-01 (Nov-2025)
// Fin: 2027-01-01 (Ene-2027)
// Cálculo: (2027-2025)*12 + (1-11) = 24 + (-10) = 14 meses
```

#### Rangos Recomendados
```
┌──────────────┬─────────────┬──────────────────────────────────┐
│ Meses        │ Status      │ Descripción                      │
├──────────────┼─────────────┼──────────────────────────────────┤
│ < 14         │ INVÁLIDO    │ No cumple mínimo del IMSS        │
│ 14-18        │ ÓPTIMO      │ Período recomendado estándar     │
│ 19-24        │ BUENO       │ Aceptable, cubre necesidades     │
│ 25-36        │ LARGO       │ Funciona pero es extenso         │
│ 37-60        │ MUY LARGO   │ Solo en casos especiales         │
│ > 60         │ RECHAZADO   │ Fuera de política                │
└──────────────┴─────────────┴──────────────────────────────────┘
```

### Impacto en Otros Campos

#### 1. Impacto en Semanas al Final
```javascript
// Fórmula directa
semanas_al_final = semanas_iniciales + (total_meses × 4)

// Ejemplo:
Semanas Iniciales: 860
Total Meses: 14
Semanas Agregadas: 14 × 4 = 56
Semanas al Final: 860 + 56 = 916
```

#### 2. Impacto en Cronograma de Pagos
```javascript
// Cada mes requiere un pago
numero_de_pagos = total_meses

// Ejemplo: 14 meses = 14 pagos mensuales
```

#### 3. Impacto en Costo Total
```javascript
// El costo depende del número de meses
// Más meses = Mayor inversión

Ejemplo con precios 2025-2027:
- Nov-2025: $3,500
- Dic-2025: $2,650
- Ene-2026: $3,200
- ... (11 meses más)
Total 14 meses: $44,550 (pagos) + $18,000 (gestoría) = $62,550
```

### Validaciones Cruzadas

```javascript
function validarTotalMeses(fechaInicio, fechaFin, totalMeses) {
  const errores = [];
  const advertencias = [];
  
  // 1. Validar mínimo
  if (totalMeses < 14) {
    errores.push({
      campo: 'totalMeses',
      mensaje: 'El contrato debe ser de al menos 14 meses para recuperar derechos ante el IMSS',
      critico: true
    });
  }
  
  // 2. Validar coherencia con fechas
  const mesesCalculados = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12
                         + (fechaFin.getMonth() - fechaInicio.getMonth());
  
  if (mesesCalculados !== totalMeses) {
    errores.push({
      campo: 'totalMeses',
      mensaje: `Total de meses (${totalMeses}) no coincide con diferencia de fechas (${mesesCalculados})`
    });
  }
  
  // 3. Advertencias para contratos largos
  if (totalMeses > 24) {
    advertencias.push({
      campo: 'totalMeses',
      mensaje: `Contrato de ${totalMeses} meses es más largo que el promedio. Verifique si es necesario.`
    });
  }
  
  // 4. Rechazar contratos excesivos
  if (totalMeses > 60) {
    errores.push({
      campo: 'totalMeses',
      mensaje: 'Contratos de más de 60 meses están fuera de política'
    });
  }
  
  return {
    valido: errores.length === 0,
    errores,
    advertencias
  };
}
```

### Ejemplos Completos

```javascript
// Ejemplo 1: Contrato mínimo
Total Meses: 14
Validación: ✓ Cumple mínimo exacto
Semanas Agregadas: 56
Status: ÓPTIMO

// Ejemplo 2: Contrato estándar
Total Meses: 16
Validación: ✓ Dentro de rango óptimo
Semanas Agregadas: 64
Status: ÓPTIMO

// Ejemplo 3: Contrato extendido
Total Meses: 24
Validación: ✓ Válido pero largo
Semanas Agregadas: 96
Status: LARGO ⚠️

// Ejemplo 4: INVÁLIDO - Menos de 14
Total Meses: 12
Validación: ✗ ERROR CRÍTICO
Razón: No cumple mínimo del IMSS
Bloqueante: SÍ

// Ejemplo 5: INVÁLIDO - Inconsistencia
Fecha Inicio: 2025-11-01
Fecha Fin: 2027-01-01
Total Meses capturado: 16
Total Meses calculado: 14
Validación: ✗ ERROR
Razón: Inconsistencia entre fechas y total
```

### Cálculo de Desglose

```javascript
function desglosarMeses(fechaInicio, totalMeses) {
  const meses = [];
  const fechaActual = new Date(fechaInicio);
  
  for (let i = 0; i < totalMeses; i++) {
    meses.push({
      numero: i + 1,
      mes: fechaActual.toLocaleString('es-MX', { month: 'short' }).toUpperCase(),
      año: fechaActual.getFullYear(),
      fecha: new Date(fechaActual)
    });
    
    fechaActual.setMonth(fechaActual.getMonth() + 1);
  }
  
  return meses;
}

// Ejemplo de uso:
Fecha Inicio: 2025-11-01
Total Meses: 14

Resultado:
[
  { numero: 1, mes: 'NOV', año: 2025, fecha: 2025-11-01 },
  { numero: 2, mes: 'DIC', año: 2025, fecha: 2025-12-01 },
  { numero: 3, mes: 'ENE', año: 2026, fecha: 2026-01-01 },
  ...
  { numero: 14, mes: 'DIC', año: 2026, fecha: 2026-12-01 }
]
```

### Mensajes de Error
- "El total de meses es obligatorio"
- "El total de meses debe ser un número entero positivo"
- "❌ CRÍTICO: El contrato debe ser de al menos 14 meses para recuperar derechos ante el IMSS"
- "El total de meses no coincide con la diferencia entre fecha inicio y fin"
- "Contratos de más de 60 meses están fuera de política"

### Mensajes Informativos
```javascript
if (totalMeses === 14) {
  info: "✓ Contrato con duración mínima (14 meses)"
} else if (totalMeses <= 18) {
  info: `✓ Contrato óptimo de ${totalMeses} meses`
} else if (totalMeses <= 24) {
  info: `Contrato de ${totalMeses} meses - Rango aceptable`
  warning: "Considere si una duración más corta sería suficiente"
} else {
  warning: `⚠️ Contrato largo de ${totalMeses} meses`
  suggestion: "Verifique la justificación para esta duración"
}
```

---

## 5. SEMANAS AL FINAL DEL EJERCICIO

### Definición
Número total de semanas cotizadas que tendrá el cliente **al finalizar el contrato de recuperación**.

### Reglas de Negocio

#### Fórmula de Cálculo
```javascript
semanas_al_final = semanas_cotizadas_iniciales + (total_meses × 4)

Donde:
- semanas_cotizadas_iniciales: Semanas que ya tiene el cliente (ej: 860)
- total_meses: Duración del contrato (mínimo 14)
- Factor 4: Se agregan 4 semanas por cada mes de cotización

Ejemplo:
Semanas Iniciales: 860
Total Meses: 14
Cálculo: 860 + (14 × 4) = 860 + 56 = 916 semanas
```

#### Validaciones Básicas
```javascript
Validaciones:
✓ Debe ser calculado automáticamente (no editable)
✓ Debe ser mayor que semanas_cotizadas_iniciales
✓ Diferencia debe ser exactamente (total_meses × 4)
✓ Resultado debe ser número entero positivo
✓ Debe cumplir mínimo según ley aplicable

Cálculo automático:
function calcularSemanasAlFinal(semanasIniciales, totalMeses) {
  return parseInt(semanasIniciales) + (parseInt(totalMeses) * 4);
}

// Campo de solo lectura en formulario
<input 
  type="number" 
  value={semanasAlFinal} 
  readOnly 
  disabled
  className="bg-gray-100 font-bold"
/>
```

#### Validación de Incremento
```javascript
function validarIncrementoSemanas(semanasIniciales, semanasFinales, totalMeses) {
  const incrementoEsperado = totalMeses * 4;
  const incrementoReal = semanasFinales - semanasIniciales;
  
  if (incrementoReal !== incrementoEsperado) {
    return {
      valido: false,
      error: `El incremento de semanas (${incrementoReal}) no coincide con el esperado (${incrementoEsperado}). Fórmula: ${totalMeses} meses × 4 = ${incrementoEsperado} semanas`
    };
  }
  
  return { valido: true };
}
```

### Importancia del Campo

#### 1. Determina Elegibilidad Final
```
El número de semanas al final determina si el cliente:
- Cumple con el mínimo de la ley aplicable
- Puede acceder a su pensión
- Tiene derecho a cierto monto de pensión

LEY 73: Requiere mínimo 500 semanas
LEY 97: Requiere mínimo 1,250 semanas

Si semanas_al_final < mínimo_requerido:
  → Cliente AÚN NO ES ELEGIBLE para pensión
  → Requiere MÁS MESES de cotización
```

#### 2. Validación con Ley Aplicable
```javascript
function validarSemanasConLey(semanasAlFinal, ley) {
  const requisitos = {
    'LEY 73': 500,
    'LEY 97': 1250
  };
  
  const minimo = requisitos[ley];
  
  if (semanasAlFinal < minimo) {
    return {
      valido: false,
      error: `Con ${semanasAlFinal} semanas al final, NO cumple el mínimo de ${minimo} semanas para ${ley}`,
      critico: true,
      sugerencia: `Necesita ${minimo - semanasAlFinal} semanas adicionales (${Math.ceil((minimo - semanasAlFinal) / 4)} meses más)`
    };
  }
  
  return { 
    valido: true,
    info: `✓ Cumple con el mínimo de ${minimo} semanas para ${ley}`
  };
}
```

### Escenarios de Validación

#### Escenario 1: Cliente con LEY 73
```javascript
Cliente:
  Semanas Iniciales: 860
  Ley: LEY 73
  Mínimo Requerido: 500

Contrato:
  Total Meses: 14
  Semanas a Agregar: 56
  Semanas al Final: 916

Validación:
  916 > 500 ✓
  Status: ELEGIBLE para pensión
  Margen: 416 semanas sobre el mínimo
```

#### Escenario 2: Cliente con LEY 97 (insuficiente)
```javascript
Cliente:
  Semanas Iniciales: 1,100
  Ley: LEY 97
  Mínimo Requerido: 1,250

Contrato:
  Total Meses: 14
  Semanas a Agregar: 56
  Semanas al Final: 1,156

Validación:
  1,156 < 1,250 ✗
  Status: NO ELEGIBLE aún
  Faltante: 94 semanas
  Meses adicionales necesarios: 24 meses (94 ÷ 4 = 23.5 ≈ 24)
  
Error Crítico:
  "Con 1,156 semanas al final, NO cumple el mínimo de 1,250 para LEY 97.
   Necesita 94 semanas más (24 meses adicionales de cotización)"
```

#### Escenario 3: Cliente con LEY 97 (ajustado)
```javascript
Cliente:
  Semanas Iniciales: 1,100
  Ley: LEY 97
  Mínimo Requerido: 1,250

Contrato ajustado:
  Total Meses: 38 (14 + 24)
  Semanas a Agregar: 152
  Semanas al Final: 1,252

Validación:
  1,252 > 1,250 ✓
  Status: ELEGIBLE para pensión
  Margen: 2 semanas sobre el mínimo
```

### Tabla de Conversión
```
┌─────────┬──────────┬─────────────┐
│ Meses   │ Semanas  │ Años Equiv. │
├─────────┼──────────┼─────────────┤
│   14    │    56    │    1.08     │
│   18    │    72    │    1.38     │
│   24    │    96    │    1.85     │
│   36    │   144    │    2.77     │
│   48    │   192    │    3.69     │
│   60    │   240    │    4.62     │
└─────────┴──────────┴─────────────┘

Fórmula de conversión:
años = (semanas / 52)
```

### Cálculo Inverso (Meses necesarios)

```javascript
function calcularMesesNecesarios(semanasIniciales, semanasObjetivo) {
  const semanasFaltantes = semanasObjetivo - semanasIniciales;
  
  if (semanasFaltantes <= 0) {
    return {
      necesita: false,
      mensaje: "Ya cumple con el objetivo de semanas"
    };
  }
  
  const mesesNecesarios = Math.ceil(semanasFaltantes / 4);
  
  return {
    necesita: true,
    semanasFaltantes,
    mesesNecesarios,
    mensaje: `Necesita ${mesesNecesarios} meses adicionales para alcanzar ${semanasObjetivo} semanas`
  };
}

// Ejemplo de uso:
const resultado = calcularMesesNecesarios(1100, 1250);
// Resultado:
// {
//   necesita: true,
//   semanasFaltantes: 150,
//   mesesNecesarios: 38,
//   mensaje: "Necesita 38 meses adicionales para alcanzar 1250 semanas"
// }
```

### Presentación al Usuario

```javascript
function presentarSemanasAlFinal(semanasIniciales, totalMeses, semanasFinales, ley) {
  const incremento = semanasFinales - semanasIniciales;
  const años = (incremento / 52).toFixed(2);
  
  const requisitos = {
    'LEY 73': 500,
    'LEY 97': 1250
  };
  
  const minimo = requisitos[ley];
  const cumple = semanasFinales >= minimo;
  const diferencia = semanasFinales - minimo;
  
  return {
    resumen: `${semanasFinales} semanas totales`,
    detalle: `Inicio: ${semanasIniciales} + Agregadas: ${incremento} (${años} años)`,
    status: cumple ? 'ELEGIBLE' : 'NO ELEGIBLE',
    mensaje: cumple 
      ? `✓ Cumple ${ley} con ${diferencia} semanas de margen`
      : `✗ Faltan ${Math.abs(diferencia)} semanas para cumplir ${ley}`,
    color: cumple ? 'green' : 'red'
  };
}
```

### Ejemplos Completos

```javascript
// Ejemplo 1: LEY 73 - Suficiente
Semanas Iniciales: 860
Total Meses: 14
Semanas Agregadas: 56
Semanas al Final: 916
Ley: LEY 73 (mínimo 500)
Validación: ✓ Cumple (916 > 500)
Presentación: "✓ 916 semanas totales - Cumple LEY 73 con 416 semanas de margen"

// Ejemplo 2: LEY 97 - Insuficiente
Semanas Iniciales: 1,100
Total Meses: 14
Semanas Agregadas: 56
Semanas al Final: 1,156
Ley: LEY 97 (mínimo 1,250)
Validación: ✗ No cumple (1,156 < 1,250)
Error: "Faltan 94 semanas. Necesita 24 meses adicionales"

// Ejemplo 3: LEY 97 - Justo en el mínimo
Semanas Iniciales: 1,194
Total Meses: 14
Semanas Agregadas: 56
Semanas al Final: 1,250
Ley: LEY 97 (mínimo 1,250)
Validación: ✓ Cumple exacto (1,250 = 1,250)
Advertencia: "Cumple el mínimo exacto. Considere agregar meses de margen"

// Ejemplo 4: Cálculo incorrecto
Semanas Iniciales: 860
Total Meses: 14
Semanas al Final: 920 (debería ser 916)
Validación: ✗ Error de cálculo
Error: "El incremento (60) no coincide con esperado (56)"
```

### Mensajes de Error
- "Las semanas al final deben ser calculadas automáticamente"
- "El incremento de semanas no coincide con el total de meses"
- "❌ Con [X] semanas al final, NO cumple el mínimo de [Y] semanas para [LEY]"
- "Necesita [X] semanas adicionales ([Y] meses más) para ser elegible"

### Mensajes Informativos
```javascript
const info = {
  calculo: `${semanasIniciales} + (${totalMeses} × 4) = ${semanasFinales}`,
  equivalencia: `Incremento de ${incremento} semanas ≈ ${(incremento/52).toFixed(2)} años`,
  status: cumpleMinimo 
    ? `✓ Elegible para pensión bajo ${ley}`
    : `✗ Requiere más meses de cotización`,
  margen: cumpleMinimo 
    ? `${diferencia} semanas sobre el mínimo`
    : `${Math.abs(diferencia)} semanas faltantes`
};
```

---

## 6. VALIDACIONES CRUZADAS

### Matriz de Dependencias
```
┌──────────────┬────────┬────────┬──────────┬───────────┬────────────┐
│ Campo        │ Firma  │ Inicio │ Fin      │ T. Meses  │ Semanas F. │
├──────────────┼────────┼────────┼──────────┼───────────┼────────────┤
│ Fecha Firma  │   -    │  ✓✓    │    -     │     -     │      -     │
│ Fecha Inicio │  ✓✓    │   -    │   ✓✓     │    ✓✓     │     ✓      │
│ Fecha Fin    │   -    │  ✓✓    │    -     │    ✓✓     │     ✓      │
│ Total Meses  │   -    │  ✓✓    │   ✓✓     │     -     │    ✓✓      │
│ Semanas Fin  │   -    │   ✓    │    ✓     │    ✓✓     │      -     │
└──────────────┴────────┴────────┴──────────┴───────────┴────────────┘

Leyenda:
✓✓  = Validación crítica (obligatoria)
✓   = Validación recomendada
-   = No aplica validación directa
```

### Validación Completa del Formulario

```javascript
function validarSeccionContrato(datos) {
  const errores = [];
  const advertencias = [];
  const info = [];
  
  // ============================================
  // 1. FECHA DE FIRMA
  // ============================================
  
  // Fecha firma no puede ser futura
  if (datos.fechaFirma > new Date()) {
    errores.push({
      campo: 'fechaFirma',
      mensaje: 'La fecha de firma no puede ser futura'
    });
  }
  
  // Calcular fecha de alta sugerida
  const diaFirma = datos.fechaFirma.getDate();
  let fechaAltaSugerida;
  
  if (diaFirma <= 15) {
    fechaAltaSugerida = new Date(
      datos.fechaFirma.getFullYear(),
      datos.fechaFirma.getMonth(),
      1
    );
    info.push({
      campo: 'fechaFirma',
      mensaje: `Firma día ${diaFirma} → Alta retroactiva al ${formatearFecha(fechaAltaSugerida)}`
    });
  } else {
    const mesSiguiente = new Date(datos.fechaFirma);
    mesSiguiente.setMonth(mesSiguiente.getMonth() + 1);
    fechaAltaSugerida = new Date(
      mesSiguiente.getFullYear(),
      mesSiguiente.getMonth(),
      1
    );
    info.push({
      campo: 'fechaFirma',
      mensaje: `Firma día ${diaFirma} → Alta programada al ${formatearFecha(fechaAltaSugerida)}`
    });
  }
  
  // ============================================
  // 2. FECHA DE INICIO
  // ============================================
  
  // Debe ser día 1
  if (datos.fechaInicio.getDate() !== 1) {
    errores.push({
      campo: 'fechaInicio',
      mensaje: 'La fecha de inicio DEBE ser el día 1 del mes',
      critico: true
    });
  }
  
  // Relación con fecha firma
  const diffMesesFirmaInicio = 
    (datos.fechaFirma.getFullYear() - datos.fechaInicio.getFullYear()) * 12
    + (datos.fechaFirma.getMonth() - datos.fechaInicio.getMonth());
  
  if (diffMesesFirmaInicio > 6) {
    errores.push({
      campo: 'fechaInicio',
      mensaje: 'La fecha de inicio no puede ser más de 6 meses anterior a la firma'
    });
  }
  
  if (diffMesesFirmaInicio < -2) {
    errores.push({
      campo: 'fechaInicio',
      mensaje: 'La fecha de inicio no puede ser más de 2 meses posterior a la firma'
    });
  }
  
  // Si es retroactiva, informar
  if (datos.fechaInicio < datos.fechaFirma) {
    info.push({
      campo: 'fechaInicio',
      mensaje: 'Contrato con inicio RETROACTIVO (requiere solicitud expres)'
    });
  }
  
  // ============================================
  // 3. FECHA DE FIN
  // ============================================
  
  // Debe ser día 1
  if (datos.fechaFin.getDate() !== 1) {
    errores.push({
      campo: 'fechaFin',
      mensaje: 'La fecha de fin DEBE ser el día 1 del mes',
      critico: true
    });
  }
  
  // Debe ser posterior a inicio
  if (datos.fechaFin <= datos.fechaInicio) {
    errores.push({
      campo: 'fechaFin',
      mensaje: 'La fecha de fin debe ser posterior a la fecha de inicio',
      critico: true
    });
  }
  
  // ============================================
  // 4. TOTAL DE MESES
  // ============================================
  
  // Calcular meses entre inicio y fin
  const mesesCalculados = 
    (datos.fechaFin.getFullYear() - datos.fechaInicio.getFullYear()) * 12
    + (datos.fechaFin.getMonth() - datos.fechaInicio.getMonth());
  
  // Mínimo 14 meses
  if (datos.totalMeses < 14) {
    errores.push({
      campo: 'totalMeses',
      mensaje: 'El contrato debe ser de al menos 14 meses para recuperar derechos ante el IMSS',
      critico: true,
      bloqueante: true
    });
  }
  
  // Coherencia con fechas
  if (datos.totalMeses !== mesesCalculados) {
    errores.push({
      campo: 'totalMeses',
      mensaje: `Total de meses (${datos.totalMeses}) no coincide con diferencia de fechas (${mesesCalculados})`
    });
  }
  
  // Advertencia para contratos largos
  if (datos.totalMeses > 24) {
    advertencias.push({
      campo: 'totalMeses',
      mensaje: `Contrato de ${datos.totalMeses} meses es más largo que el promedio`
    });
  }
  
  // ============================================
  // 5. SEMANAS AL FINAL
  // ============================================
  
  // Calcular semanas esperadas
  const semanasEsperadas = datos.semanasIniciales + (datos.totalMeses * 4);
  
  if (datos.semanasAlFinal !== semanasEsperadas) {
    errores.push({
      campo: 'semanasAlFinal',
      mensaje: `Semanas al final (${datos.semanasAlFinal}) no coincide con el cálculo esperado (${semanasEsperadas})`
    });
  }
  
  // Validar con ley aplicable
  const requisitos = {
    'LEY 73': 500,
    'LEY 97': 1250
  };
  
  const minimoRequerido = requisitos[datos.ley];
  
  if (datos.semanasAlFinal < minimoRequerido) {
    const semanasFaltantes = minimoRequerido - datos.semanasAlFinal;
    const mesesAdicionales = Math.ceil(semanasFaltantes / 4);
    
    errores.push({
      campo: 'semanasAlFinal',
      mensaje: `Con ${datos.semanasAlFinal} semanas NO cumple el mínimo de ${minimoRequerido} para ${datos.ley}. Necesita ${mesesAdicionales} meses más`,
      critico: true
    });
  } else {
    const margen = datos.semanasAlFinal - minimoRequerido;
    info.push({
      campo: 'semanasAlFinal',
      mensaje: `✓ Cumple ${datos.ley} con ${margen} semanas de margen`
    });
  }
  
  // ============================================
  // RESULTADO
  // ============================================
  
  return {
    valido: errores.length === 0,
    bloqueante: errores.some(e => e.bloqueante),
    errores,
    advertencias,
    info
  };
}
```

### Ejemplo de Uso Completo

```javascript
const datosContrato = {
  fechaFirma: new Date('2026-01-30'),
  fechaInicio: new Date('2025-11-01'),
  fechaFin: new Date('2027-01-01'),
  totalMeses: 14,
  semanasIniciales: 860,
  semanasAlFinal: 916,
  ley: 'LEY 73'
};

const validacion = validarSeccionContrato(datosContrato);

// Resultado:
{
  valido: true,
  bloqueante: false,
  errores: [],
  advertencias: [],
  info: [
    {
      campo: 'fechaFirma',
      mensaje: 'Firma día 30 → Alta programada al 01-Feb-2026'
    },
    {
      campo: 'fechaInicio',
      mensaje: 'Contrato con inicio RETROACTIVO (requiere solicitud expres)'
    },
    {
      campo: 'semanasAlFinal',
      mensaje: '✓ Cumple LEY 73 con 416 semanas de margen'
    }
  ]
}
```

---

## 7. FLUJO DE TRABAJO COMPLETO

### Secuencia Recomendada de Llenado

```
1. Ingresar FECHA DE FIRMA
   └─> Sistema calcula fecha de alta sugerida
   └─> Muestra mensaje según día (1-15 vs 16-31)

2. Confirmar/Ajustar FECHA DE INICIO
   └─> Por defecto usa fecha sugerida
   └─> Usuario puede solicitar expres
   └─> Validar que sea día 1

3. Ingresar TOTAL DE MESES
   └─> Mínimo 14
   └─> Validar contra semanas necesarias

4. Calcular FECHA DE FIN
   └─> Auto-calcular: inicio + total_meses
   └─> Verificar que sea día 1
   └─> Mostrar mes de resolución estimado

5. Calcular SEMANAS AL FINAL
   └─> Auto-calcular: iniciales + (meses × 4)
   └─> Validar contra requisitos de ley
   └─> Mostrar status de elegibilidad

6. Validación final completa
   └─> Todas las validaciones cruzadas
   └─> Generar resumen
   └─> Permitir o bloquear submit
```

### Código de Implementación Sugerido

```javascript
const [contratoData, setContratoData] = useState({
  fechaFirma: '',
  fechaInicio: '',
  fechaFin: '',
  totalMeses: 14,
  semanasIniciales: 860, // Del cliente
  semanasAlFinal: 0,
  ley: 'LEY 73'
});

// Auto-calcular fecha de inicio sugerida
useEffect(() => {
  if (contratoData.fechaFirma) {
    const sugerida = calcularFechaAlta(contratoData.fechaFirma);
    setContratoData(prev => ({
      ...prev,
      fechaInicio: sugerida
    }));
  }
}, [contratoData.fechaFirma]);

// Auto-calcular fecha de fin
useEffect(() => {
  if (contratoData.fechaInicio && contratoData.totalMeses) {
    const fin = calcularFechaFin(
      contratoData.fechaInicio,
      contratoData.totalMeses
    );
    setContratoData(prev => ({
      ...prev,
      fechaFin: fin
    }));
  }
}, [contratoData.fechaInicio, contratoData.totalMeses]);

// Auto-calcular semanas al final
useEffect(() => {
  if (contratoData.totalMeses) {
    const semanas = calcularSemanasAlFinal(
      contratoData.semanasIniciales,
      contratoData.totalMeses
    );
    setContratoData(prev => ({
      ...prev,
      semanasAlFinal: semanas
    }));
  }
}, [contratoData.semanasIniciales, contratoData.totalMeses]);
```

---

## RESUMEN DE REGLAS CRÍTICAS

### 🔴 REGLAS BLOQUEANTES (Detienen el proceso)

1. **Fecha de inicio NO es día 1 del mes**
   - Error: "La fecha de inicio DEBE ser el día 1 del mes"
   - Acción: Corregir fecha

2. **Fecha de fin NO es día 1 del mes**
   - Error: "La fecha de fin DEBE ser el día 1 del mes"
   - Acción: Corregir fecha

3. **Total de meses < 14**
   - Error: "El contrato debe ser de al menos 14 meses"
   - Acción: Aumentar duración del contrato

4. **Semanas al final < mínimo de la ley**
   - Error: "No cumple el mínimo de [X] semanas para [LEY]"
   - Acción: Aumentar meses del contrato

### 🟡 REGLAS IMPORTANTES (Advertencias)

1. **Fecha inicio muy anterior a firma (>6 meses)**
   - Advertencia: "Requiere justificación especial"
   
2. **Total de meses > 24**
   - Advertencia: "Contrato más largo que el promedio"
   
3. **Semanas al final cerca del mínimo**
   - Advertencia: "Considere agregar meses de margen"

### 🟢 REGLAS INFORMATIVAS

1. **Alta retroactiva vs alta normal**
   - Info según día de firma

2. **Mes estimado de resolución**
   - Info basado en fecha fin

3. **Margen de semanas sobre mínimo**
   - Info para tranquilidad del cliente

---

© 2026 Sistema de Recuperación de Pensiones - Grupo AVIVIR
