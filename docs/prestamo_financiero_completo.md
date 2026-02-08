# PRÉSTAMO FINANCIERO - ANÁLISIS TÉCNICO COMPLETO
## Sistema de Recuperación de Pensiones - Grupo Avivir

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [¿Qué es el Préstamo Financiero?](#qué-es-el-préstamo-financiero)
3. [Reglas de Cálculo](#reglas-de-cálculo)
4. [Componentes del Sistema](#componentes-del-sistema)
5. [Flujo de Decisión](#flujo-de-decisión)
6. [Escenarios Completos](#escenarios-completos)
7. [Implementación Técnica](#implementación-técnica)
8. [Validaciones y Edge Cases](#validaciones-y-edge-cases)
9. [Integración con Otras Hojas](#integración-con-otras-hojas)

---

## 1. RESUMEN EJECUTIVO

### ¿Qué es?
El **Préstamo Financiero** es un monto que **Grupo Avivir** otorga al cliente cuando su **Saldo AFORE es insuficiente** para cubrir los costos totales del proceso de recuperación de pensión bajo la modalidad "FINANCIADO 100".

### Objetivo
Permitir que clientes con saldo AFORE bajo puedan acceder al servicio de recuperación de pensión sin desembolsar dinero de su bolsillo.

### Ubicación
- **Campo de entrada manual**: Celda `C14` en hoja "DATOS GENERALES"
- **Cálculo sugerido**: Celda `G14` en hoja "DATOS GENERALES"
- **Uso posterior**: Celda `D21` en hoja "INFORME COSTO MENSUAL"

### Valores Clave del Caso Ejemplo
```
Saldo AFORE:              $15,000.00
Préstamo Sugerido (G14):  $71,750.00
Préstamo Real (C14):      $80,000.00  ← Valor ingresado manualmente
Total Disponible:         $95,000.00
Monto Mínimo Requerido:   $107,100.00
Diferencia:               -$12,100.00 (INSUFICIENTE)
```

---

## 2. ¿QUÉ ES EL PRÉSTAMO FINANCIERO?

### 2.1 Definición

El préstamo financiero es un **financiamiento otorgado por Grupo Avivir** que cubre:

1. ✅ **Inscripción al IMSS** (primer mes)
2. ✅ **Pagos mensuales durante el proceso** (meses subsecuentes)
3. ✅ **Gestoría administrativa** (trámites legales)

### 2.2 ¿Cuándo se Necesita?

El préstamo se requiere cuando:

```
SI: Saldo AFORE < Monto Mínimo Requerido
   → ENTONCES: Se calcula un préstamo sugerido
```

**En el caso actual**:
- Saldo AFORE: $15,000 < $107,100 (Mínimo) ✓ **Requiere préstamo**

### 2.3 Características del Préstamo

| Característica | Detalle |
|---------------|---------|
| **Tipo** | Financiamiento empresarial |
| **Plazo** | Según duración del proceso (14-18 meses) |
| **Garantía** | Futura pensión del beneficiario |
| **Desembolso** | Pagos directos a IMSS y gestoría |
| **Recuperación** | Mediante descuentos de la pensión mensual |

---

## 3. REGLAS DE CÁLCULO

### 3.1 Fórmula del Préstamo Sugerido (G14)

```excel
=IF(C13 < 'INFORME COSTO MENSUAL'!K25,
    'PROYECCIÓN DE PENSIÓN'!F44 * 7.5 - 10000,
    0
)
```

### 3.2 Traducción a Lógica de Negocio

```javascript
function calcularPrestamoSugerido(saldoAfore, pensionMensual, montoMinimo) {
  if (saldoAfore < montoMinimo) {
    // Cliente necesita préstamo
    const prestamo = (pensionMensual * 7.5) - 10000;
    return prestamo;
  } else {
    // Cliente tiene saldo suficiente
    return 0;
  }
}
```

### 3.3 Constantes Críticas

| Constante | Valor | Significado |
|-----------|-------|-------------|
| **MULTIPLICADOR** | `7.5` | Equivalente a 7.5 meses de pensión |
| **DESCUENTO_FIJO** | `$10,000` | Descuento aplicado al cálculo |
| **TIEMPO_PROCESO** | `14-18 meses` | Duración típica del trámite |

### 3.4 Desglose del Cálculo Actual

```
CASO EJEMPLO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Datos de entrada:
  Saldo AFORE (C13):           $15,000.00
  Pensión Mensual (F44):       $10,900.00
  Monto Mínimo (K25):          $107,100.00

Paso 1: ¿Necesita préstamo?
  $15,000 < $107,100 → SÍ ✓

Paso 2: Calcular préstamo sugerido
  Préstamo = ($10,900 × 7.5) - $10,000
  Préstamo = $81,750 - $10,000
  Préstamo = $71,750.00

Resultado:
  G14 (Sugerido): $71,750.00
  C14 (Real):     $80,000.00 ← Valor manual del usuario
```

---

## 4. COMPONENTES DEL SISTEMA

### 4.1 Variables Principales

#### A) Saldo AFORE (C13)
```typescript
interface SaldoAfore {
  monto: number;        // Mínimo: $15,000
  subcuentas: {
    sar92: number;      // SAR 92
    retiro97: number;   // RETIRO 97
    vivienda: number;   // VIVIENDA
  };
}
```

**Validación**: Debe ser ≥ $15,000

#### B) Pensión Mensual (F44)
- **Fuente**: `'PROYECCIÓN DE PENSIÓN'!F44`
- **Referencia secundaria**: `'INFORME COSTO MENSUAL'!AE36`
- **Descripción**: Monto mensual proyectado de la pensión
- **Caso actual**: $10,900

#### C) Monto Mínimo Requerido (K25)
- **Fuente**: `'INFORME COSTO MENSUAL'!K25`
- **Descripción**: Total de inversión necesaria para el proceso
- **Caso actual**: $107,100

### 4.2 Cálculo del Monto Mínimo (K25)

El monto mínimo varía según la **duración del proceso**:

```excel
=IF(I18=15, 16000,
    IF(I18=14, K56+K58,
        IF(I18=17, SUM(K42:K58),
            VLOOKUP(T25,$T$1:$W$4,4,0)
        )
    )
)
```

**Tabla de Montos según Duración**:

| Duración (meses) | Variable | Monto Total | Composición |
|------------------|----------|-------------|-------------|
| **14 meses** | `I18=14` | **$107,100** | $89,100 (mensualidades) + $18,000 (gestoría) |
| **15 meses** | `I18=15` | $21,800 | Caso especial |
| **16 meses** | `I18=16` | $128,900 | Cálculo extendido |
| **17 meses** | `I18=17` | Variable | SUM(K42:K58) |
| **18 meses** | `I18=18` | Variable | Búsqueda en tabla |

### 4.3 Desglose de Costos (14 meses - Caso Actual)

```
┌─────────────────────────────────────────────────┐
│  COSTOS MODALIDAD FINANCIADO 100 (14 MESES)    │
├─────────────────────────────────────────────────┤
│                                                  │
│  MENSUALIDADES:                                  │
│    NOV 2025         $7,000.00  (Inscripción)   │
│    DIC 2025         $5,300.00                   │
│    ENE 2026         $6,400.00                   │
│    FEB 2026         $6,400.00                   │
│    MAR 2026         $6,400.00                   │
│    ABR 2026         $6,400.00                   │
│    MAY 2026         $6,400.00                   │
│    JUN 2026         $6,400.00                   │
│    JUL 2026         $6,400.00                   │
│    AGO 2026         $6,400.00                   │
│    SEP 2026         $6,400.00                   │
│    OCT 2026         $6,400.00                   │
│    NOV 2026         $6,400.00                   │
│    DIC 2026         $6,400.00                   │
│                    ──────────                    │
│  SUBTOTAL          $89,100.00                   │
│                                                  │
│  GESTORÍA          $18,000.00                   │
│                    ──────────                    │
│  TOTAL GENERAL    $107,100.00                   │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Notas**:
- Primer mes (NOV): $7,000 incluye inscripción
- Segundo mes (DIC): $5,300 (ajuste)
- Meses 3-14: $6,400 constantes
- Gestoría: Cargo único de $18,000

### 4.4 Duración del Proceso (I18)

```excel
=DATEDIF('DATOS GENERALES'!C15, F18, "M")
```

**Cálculo**:
- `C15`: Fecha inicio de contrato
- `F18`: Fecha de finalización proyectada
- Función: `DATEDIF` calcula meses entre fechas

**Caso actual**:
- Inicio: 01-Nov-2025
- Fin: 01-Ene-2027
- Duración: **14 meses**

---

## 5. FLUJO DE DECISIÓN

### 5.1 Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    INICIO DEL PROCESO                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Ingresar Saldo AFORE │
              │       (C13)          │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Obtener Pensión     │
              │  Mensual (F44)       │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Calcular Monto      │
              │  Mínimo (K25)        │
              └──────────┬───────────┘
                         │
                         ▼
         ┌───────────────────────────────────┐
         │ ¿Saldo AFORE < Monto Mínimo?      │
         └───────┬───────────────────┬───────┘
                 │                   │
             SÍ  │                   │  NO
                 │                   │
                 ▼                   ▼
    ┌────────────────────┐  ┌───────────────────┐
    │  CALCULAR PRÉSTAMO │  │ Préstamo = $0     │
    │  G14 = (F44 × 7.5) │  │ (No se necesita)  │
    │        - 10,000    │  └────────┬──────────┘
    └────────┬───────────┘           │
             │                       │
             ▼                       │
    ┌────────────────────┐           │
    │ Mostrar sugerencia │           │
    │ al usuario         │           │
    └────────┬───────────┘           │
             │                       │
             ▼                       │
    ┌────────────────────┐           │
    │ Usuario ingresa    │           │
    │ monto en C14       │           │
    │ (puede diferir de  │           │
    │  la sugerencia)    │           │
    └────────┬───────────┘           │
             │                       │
             └───────────┬───────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │ Total Disponible =     │
            │ Saldo AFORE + Préstamo │
            └────────┬───────────────┘
                     │
                     ▼
      ┌──────────────────────────────────────┐
      │ ¿Total Disponible >= Monto Mínimo?   │
      └────┬─────────────────────────┬───────┘
           │                         │
       SÍ  │                         │  NO
           │                         │
           ▼                         ▼
 ┌──────────────────┐      ┌─────────────────────┐
 │ FINANCIADO 100   │      │  FINANCIADO 1       │
 │ (Todo cubierto)  │      │  (Insuficiente)     │
 └──────────────────┘      └─────────────────────┘
```

### 5.2 Etiqueta Dinámica (B14)

```excel
=IFERROR(
  IF(
    AND(
      C13 < 'INFORME COSTO MENSUAL'!K25,
      G16 = "REACTIVA FINANCIADO 100"
    ),
    "NECESITA PRESTAMO FINANCIERO: ",
    ""
  ),
  ""
)
```

**Traducción**:
```javascript
function mostrarEtiquetaPrestamo(saldoAfore, montoMinimo, modalidadSugerida) {
  try {
    if (saldoAfore < montoMinimo && modalidadSugerida === "REACTIVA FINANCIADO 100") {
      return "NECESITA PRESTAMO FINANCIERO: ";
    }
    return "";
  } catch (error) {
    return "";
  }
}
```

**Regla**: La etiqueta solo aparece si:
1. Saldo AFORE es insuficiente
2. **Y** la modalidad sugerida es "REACTIVA FINANCIADO 100"

### 5.3 Determinación de Modalidad (G16)

```excel
=IF(C13 + G14 < 'INFORME COSTO MENSUAL'!K25,
    " FINANCIADO 1",
    "FINANCIADO 100"
)
```

**Nota**: Usa **G14** (préstamo sugerido), NO C14 (préstamo real)

**Implicación Importante**:
- La modalidad sugerida se basa en el cálculo automático
- El usuario puede ingresar un préstamo diferente en C14
- El sistema usa C14 para los cálculos posteriores reales

---

## 6. ESCENARIOS COMPLETOS

### Escenario 1: Saldo Bajo - Requiere Préstamo Alto
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATOS:
  Saldo AFORE:           $15,000.00
  Pensión Mensual:       $10,900.00
  Monto Mínimo:          $107,100.00

CÁLCULOS:
  Préstamo Sugerido:     ($10,900 × 7.5) - $10,000 = $71,750.00
  Total Disponible:      $15,000 + $71,750 = $86,750.00
  
RESULTADO:
  Faltante:              $107,100 - $86,750 = $20,350.00
  Modalidad:             FINANCIADO 1 ❌ (INSUFICIENTE)
  
ACCIÓN REQUERIDA:
  ⚠️  El cliente necesita aportar $20,350 adicionales, O
  ⚠️  Negociar un préstamo mayor con Grupo Avivir
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Escenario 2: Saldo Medio - Préstamo Suficiente
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATOS:
  Saldo AFORE:           $50,000.00
  Pensión Mensual:       $10,900.00
  Monto Mínimo:          $107,100.00

CÁLCULOS:
  Préstamo Sugerido:     ($10,900 × 7.5) - $10,000 = $71,750.00
  Total Disponible:      $50,000 + $71,750 = $121,750.00
  
RESULTADO:
  Sobrante:              $121,750 - $107,100 = $14,650.00
  Modalidad:             FINANCIADO 100 ✅ (SUFICIENTE)
  
ACCIÓN:
  ✓  Proceder con la modalidad FINANCIADO 100
  ✓  El sobrante queda en la cuenta del cliente
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Escenario 3: Saldo Alto - Sin Préstamo
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATOS:
  Saldo AFORE:           $110,000.00
  Pensión Mensual:       $10,900.00
  Monto Mínimo:          $107,100.00

CÁLCULOS:
  Préstamo Sugerido:     $0.00 (no se necesita)
  Total Disponible:      $110,000 + $0 = $110,000.00
  
RESULTADO:
  Sobrante:              $110,000 - $107,100 = $2,900.00
  Modalidad:             FINANCIADO 100 ✅ (SUFICIENTE)
  
ACCIÓN:
  ✓  Cliente cubre todo con su AFORE
  ✓  No requiere préstamo de Grupo Avivir
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Escenario 4: Pensión Baja - Préstamo Insuficiente
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATOS:
  Saldo AFORE:           $15,000.00
  Pensión Mensual:       $8,000.00  ⚠️ (Baja)
  Monto Mínimo:          $107,100.00

CÁLCULOS:
  Préstamo Sugerido:     ($8,000 × 7.5) - $10,000 = $50,000.00
  Total Disponible:      $15,000 + $50,000 = $65,000.00
  
RESULTADO:
  Faltante:              $107,100 - $65,000 = $42,100.00
  Modalidad:             FINANCIADO 1 ❌ (MUY INSUFICIENTE)
  
ACCIÓN REQUERIDA:
  ⚠️  Caso NO VIABLE con pensión baja
  ⚠️  Considerar aumentar semanas cotizadas
  ⚠️  O buscar modalidad alternativa (RETOMA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Escenario 5: Saldo Alto, Pensión Alta
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATOS:
  Saldo AFORE:           $80,000.00
  Pensión Mensual:       $10,900.00
  Monto Mínimo:          $107,100.00

CÁLCULOS:
  Préstamo Sugerido:     ($10,900 × 7.5) - $10,000 = $71,750.00
  Total Disponible:      $80,000 + $71,750 = $151,750.00
  
RESULTADO:
  Sobrante:              $151,750 - $107,100 = $44,650.00
  Modalidad:             FINANCIADO 100 ✅ (MUY SUFICIENTE)
  
ACCIÓN:
  ✓  Caso IDEAL
  ✓  Gran margen de seguridad
  ✓  Cliente puede considerar préstamo menor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 6.1 Tabla Comparativa de Escenarios

| # | Saldo AFORE | Pensión | Préstamo Sug. | Total Disp. | Faltante | Modalidad | Viable |
|---|-------------|---------|---------------|-------------|----------|-----------|--------|
| 1 | $15,000 | $10,900 | $71,750 | $86,750 | $20,350 | FINANCIADO 1 | ⚠️ Requiere acción |
| 2 | $50,000 | $10,900 | $71,750 | $121,750 | $0 | FINANCIADO 100 | ✅ Viable |
| 3 | $110,000 | $10,900 | $0 | $110,000 | $0 | FINANCIADO 100 | ✅ Óptimo |
| 4 | $15,000 | $8,000 | $50,000 | $65,000 | $42,100 | FINANCIADO 1 | ❌ No viable |
| 5 | $80,000 | $10,900 | $71,750 | $151,750 | $0 | FINANCIADO 100 | ✅ Ideal |

---

## 7. IMPLEMENTACIÓN TÉCNICA

### 7.1 Modelos de Datos (TypeScript)

```typescript
// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface PrestamoFinanciero {
  montoSugerido: number;      // Calculado (G14)
  montoReal: number;          // Ingresado por usuario (C14)
  esNecesario: boolean;       // Si se requiere préstamo
  etiqueta: string;           // Texto para mostrar (B14)
}

interface CalculoPrestamoParams {
  saldoAfore: number;
  pensionMensual: number;
  montoMinimo: number;
  modalidadSugerida?: string;
}

interface ResultadoCalculo {
  prestamo: PrestamoFinanciero;
  totalDisponible: number;
  esSuficiente: boolean;
  faltante: number;
  modalidad: Modalidad;
}

enum Modalidad {
  FINANCIADO_1 = "FINANCIADO 1",
  FINANCIADO_100 = "FINANCIADO 100",
  REACTIVA_TRADICIONAL = "REACTIVA TRADICIONAL",
  REACTIVA_FINANCIADO_100 = "REACTIVA FINANCIADO 100"
}

// Constantes del sistema
const CONSTANTES = {
  MULTIPLICADOR_PENSION: 7.5,
  DESCUENTO_FIJO: 10000,
  SALDO_AFORE_MINIMO: 15000,
  SEMANAS_MINIMAS: 430
} as const;
```

### 7.2 Motor de Cálculo del Préstamo

```typescript
// ============================================================================
// CALCULADORA DE PRÉSTAMO FINANCIERO
// ============================================================================

class CalculadoraPrestamo {
  
  /**
   * Calcula el préstamo financiero sugerido
   */
  static calcularPrestamoSugerido(
    saldoAfore: number,
    pensionMensual: number,
    montoMinimo: number
  ): number {
    // Regla: Solo calcular si el saldo es insuficiente
    if (saldoAfore >= montoMinimo) {
      return 0;
    }
    
    // Fórmula: (Pensión × 7.5) - 10,000
    const prestamo = (pensionMensual * CONSTANTES.MULTIPLICADOR_PENSION) 
                     - CONSTANTES.DESCUENTO_FIJO;
    
    // No puede ser negativo
    return Math.max(0, prestamo);
  }
  
  /**
   * Determina si se debe mostrar la etiqueta del préstamo
   */
  static necesitaEtiquetaPrestamo(
    saldoAfore: number,
    montoMinimo: number,
    modalidadSugerida: string
  ): boolean {
    return (
      saldoAfore < montoMinimo &&
      modalidadSugerida === Modalidad.REACTIVA_FINANCIADO_100
    );
  }
  
  /**
   * Genera la etiqueta del préstamo
   */
  static generarEtiqueta(
    saldoAfore: number,
    montoMinimo: number,
    modalidadSugerida: string
  ): string {
    try {
      if (this.necesitaEtiquetaPrestamo(saldoAfore, montoMinimo, modalidadSugerida)) {
        return "NECESITA PRESTAMO FINANCIERO: ";
      }
      return "";
    } catch (error) {
      return "";
    }
  }
  
  /**
   * Determina la modalidad basada en saldo + préstamo
   */
  static determinarModalidad(
    saldoAfore: number,
    prestamoSugerido: number,
    montoMinimo: number
  ): Modalidad {
    const totalDisponible = saldoAfore + prestamoSugerido;
    
    if (totalDisponible >= montoMinimo) {
      return Modalidad.FINANCIADO_100;
    } else {
      return Modalidad.FINANCIADO_1;
    }
  }
  
  /**
   * Proceso completo de cálculo
   */
  static procesarPrestamo(params: CalculoPrestamoParams): ResultadoCalculo {
    const { saldoAfore, pensionMensual, montoMinimo, modalidadSugerida } = params;
    
    // Calcular préstamo sugerido
    const montoSugerido = this.calcularPrestamoSugerido(
      saldoAfore,
      pensionMensual,
      montoMinimo
    );
    
    // Determinar si es necesario
    const esNecesario = montoSugerido > 0;
    
    // Generar etiqueta
    const etiqueta = this.generarEtiqueta(
      saldoAfore,
      montoMinimo,
      modalidadSugerida || ""
    );
    
    // Por defecto, el monto real es igual al sugerido
    // (el usuario puede modificarlo después)
    const montoReal = montoSugerido;
    
    // Crear objeto de préstamo
    const prestamo: PrestamoFinanciero = {
      montoSugerido,
      montoReal,
      esNecesario,
      etiqueta
    };
    
    // Calcular total disponible
    const totalDisponible = saldoAfore + montoReal;
    
    // Determinar si es suficiente
    const esSuficiente = totalDisponible >= montoMinimo;
    
    // Calcular faltante
    const faltante = Math.max(0, montoMinimo - totalDisponible);
    
    // Determinar modalidad
    const modalidad = this.determinarModalidad(
      saldoAfore,
      montoSugerido,
      montoMinimo
    );
    
    return {
      prestamo,
      totalDisponible,
      esSuficiente,
      faltante,
      modalidad
    };
  }
}
```

### 7.3 Componente React para UI

```tsx
// ============================================================================
// COMPONENTE REACT - PRÉSTAMO FINANCIERO
// ============================================================================

import React, { useState, useEffect } from 'react';

interface PrestamoFinancieroFormProps {
  saldoAfore: number;
  pensionMensual: number;
  montoMinimo: number;
  onChange: (prestamo: number) => void;
}

const PrestamoFinancieroForm: React.FC<PrestamoFinancieroFormProps> = ({
  saldoAfore,
  pensionMensual,
  montoMinimo,
  onChange
}) => {
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [montoManual, setMontoManual] = useState<number>(0);
  
  // Calcular al cargar o cambiar datos
  useEffect(() => {
    const calc = CalculadoraPrestamo.procesarPrestamo({
      saldoAfore,
      pensionMensual,
      montoMinimo
    });
    
    setResultado(calc);
    setMontoManual(calc.prestamo.montoSugerido);
    onChange(calc.prestamo.montoSugerido);
  }, [saldoAfore, pensionMensual, montoMinimo]);
  
  // Manejar cambio manual
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = parseFloat(e.target.value) || 0;
    setMontoManual(valor);
    onChange(valor);
  };
  
  if (!resultado) return <div>Cargando...</div>;
  
  const { prestamo, totalDisponible, esSuficiente, faltante, modalidad } = resultado;
  
  return (
    <div className="prestamo-financiero-container">
      {/* Resumen de situación */}
      <div className="resumen-saldo">
        <h3>Resumen Financiero</h3>
        <div className="row">
          <span>Saldo AFORE:</span>
          <strong>${saldoAfore.toLocaleString('es-MX')}</strong>
        </div>
        <div className="row">
          <span>Monto Mínimo Requerido:</span>
          <strong>${montoMinimo.toLocaleString('es-MX')}</strong>
        </div>
        <div className={`row ${esSuficiente ? 'suficiente' : 'insuficiente'}`}>
          <span>Estado:</span>
          <strong>
            {esSuficiente ? '✅ Suficiente' : '⚠️ Insuficiente'}
          </strong>
        </div>
      </div>
      
      {/* Etiqueta si se necesita */}
      {prestamo.etiqueta && (
        <div className="alerta-prestamo">
          ⚠️ {prestamo.etiqueta}
        </div>
      )}
      
      {/* Campo de préstamo */}
      {prestamo.esNecesario && (
        <div className="campo-prestamo">
          <label htmlFor="prestamo">Préstamo Financiero</label>
          
          {/* Mostrar sugerencia */}
          <div className="sugerencia">
            <span className="icono">💡</span>
            <span>
              Monto sugerido: <strong>${prestamo.montoSugerido.toLocaleString('es-MX')}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setMontoManual(prestamo.montoSugerido);
                onChange(prestamo.montoSugerido);
              }}
              className="btn-aplicar-sugerencia"
            >
              Aplicar
            </button>
          </div>
          
          {/* Input para monto manual */}
          <div className="input-wrapper">
            <span className="prefijo">$</span>
            <input
              id="prestamo"
              type="number"
              value={montoManual}
              onChange={handleMontoChange}
              min="0"
              step="1000"
              className="input-monto"
            />
          </div>
          
          {/* Cálculo del préstamo */}
          <details className="calculo-detalle">
            <summary>¿Cómo se calcula?</summary>
            <div className="formula">
              <p>Fórmula: (Pensión Mensual × 7.5) - $10,000</p>
              <p>
                Cálculo: (${pensionMensual.toLocaleString('es-MX')} × 7.5) - $10,000 = 
                ${prestamo.montoSugerido.toLocaleString('es-MX')}
              </p>
            </div>
          </details>
        </div>
      )}
      
      {/* Resultado del cálculo */}
      <div className="resultado-calculo">
        <h4>Resultado</h4>
        <div className="tabla-resultado">
          <div className="row">
            <span>Saldo AFORE:</span>
            <span>${saldoAfore.toLocaleString('es-MX')}</span>
          </div>
          <div className="row">
            <span>+ Préstamo Financiero:</span>
            <span>${montoManual.toLocaleString('es-MX')}</span>
          </div>
          <div className="row total">
            <span>= Total Disponible:</span>
            <strong>${(saldoAfore + montoManual).toLocaleString('es-MX')}</strong>
          </div>
          <div className="row separator"></div>
          <div className="row">
            <span>Monto Requerido:</span>
            <span>${montoMinimo.toLocaleString('es-MX')}</span>
          </div>
          {esSuficiente ? (
            <div className="row exito">
              <span>Sobrante:</span>
              <strong className="verde">
                ${((saldoAfore + montoManual) - montoMinimo).toLocaleString('es-MX')}
              </strong>
            </div>
          ) : (
            <div className="row alerta">
              <span>Faltante:</span>
              <strong className="rojo">
                ${(montoMinimo - (saldoAfore + montoManual)).toLocaleString('es-MX')}
              </strong>
            </div>
          )}
        </div>
        
        {/* Modalidad determinada */}
        <div className={`modalidad-badge ${esSuficiente ? 'suficiente' : 'insuficiente'}`}>
          <strong>Modalidad: {modalidad}</strong>
        </div>
        
        {/* Mensaje de acción */}
        {!esSuficiente && (
          <div className="mensaje-accion">
            <p>⚠️ <strong>Acción requerida:</strong></p>
            <ul>
              <li>El cliente necesita aportar ${faltante.toLocaleString('es-MX')} adicionales, o</li>
              <li>Negociar un préstamo mayor con Grupo Avivir</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrestamoFinancieroForm;
```

### 7.4 Estilos CSS

```css
/* ========================================================================== */
/* ESTILOS - PRÉSTAMO FINANCIERO */
/* ========================================================================== */

.prestamo-financiero-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.resumen-saldo {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.resumen-saldo h3 {
  margin-top: 0;
  color: #495057;
}

.resumen-saldo .row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.resumen-saldo .row:last-child {
  border-bottom: none;
}

.resumen-saldo .row.suficiente strong {
  color: #28a745;
}

.resumen-saldo .row.insuficiente strong {
  color: #dc3545;
}

.alerta-prestamo {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  color: #856404;
  font-weight: 500;
}

.campo-prestamo {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.campo-prestamo label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: #495057;
}

.sugerencia {
  display: flex;
  align-items: center;
  background: #e7f3ff;
  border: 1px solid #b3d7ff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  gap: 8px;
}

.sugerencia .icono {
  font-size: 20px;
}

.sugerencia span {
  flex: 1;
  color: #004085;
}

.btn-aplicar-sugerencia {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-aplicar-sugerencia:hover {
  background: #0056b3;
}

.input-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.input-wrapper .prefijo {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-weight: 600;
}

.input-monto {
  width: 100%;
  padding: 12px 12px 12px 32px;
  border: 2px solid #ced4da;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  transition: border-color 0.15s;
}

.input-monto:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.calculo-detalle {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.calculo-detalle summary {
  cursor: pointer;
  color: #007bff;
  font-weight: 500;
}

.calculo-detalle .formula {
  margin-top: 12px;
  padding: 12px;
  background: white;
  border-left: 3px solid #007bff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.resultado-calculo {
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
}

.resultado-calculo h4 {
  margin-top: 0;
  color: #495057;
}

.tabla-resultado {
  margin-bottom: 16px;
}

.tabla-resultado .row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
}

.tabla-resultado .row.total {
  font-size: 18px;
  border-top: 2px solid #495057;
  border-bottom: 2px solid #495057;
  padding: 14px 0;
}

.tabla-resultado .row.separator {
  height: 8px;
  border-bottom: none;
}

.tabla-resultado .row.exito strong {
  color: #28a745;
}

.tabla-resultado .row.alerta strong {
  color: #dc3545;
}

.modalidad-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 16px;
}

.modalidad-badge.suficiente {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.modalidad-badge.insuficiente {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.mensaje-accion {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 16px;
  border-radius: 4px;
}

.mensaje-accion p {
  margin-top: 0;
  color: #856404;
}

.mensaje-accion ul {
  margin-bottom: 0;
  padding-left: 20px;
}

.mensaje-accion li {
  color: #856404;
  margin-bottom: 8px;
}
```

### 7.5 Ejemplo de Uso en Angular

```typescript
// ============================================================================
// SERVICIO ANGULAR - CALCULADORA DE PRÉSTAMO
// ============================================================================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrestamoService {
  
  private resultadoSubject = new BehaviorSubject<ResultadoCalculo | null>(null);
  public resultado$: Observable<ResultadoCalculo | null> = this.resultadoSubject.asObservable();
  
  calcularPrestamo(params: CalculoPrestamoParams): ResultadoCalculo {
    const resultado = CalculadoraPrestamo.procesarPrestamo(params);
    this.resultadoSubject.next(resultado);
    return resultado;
  }
  
  actualizarMontoReal(montoReal: number): void {
    const actual = this.resultadoSubject.value;
    if (actual) {
      actual.prestamo.montoReal = montoReal;
      actual.totalDisponible = actual.prestamo.montoReal + /* saldoAfore */;
      this.resultadoSubject.next({...actual});
    }
  }
}

// ============================================================================
// COMPONENTE ANGULAR
// ============================================================================

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-prestamo-financiero',
  templateUrl: './prestamo-financiero.component.html',
  styleUrls: ['./prestamo-financiero.component.css']
})
export class PrestamoFinancieroComponent implements OnInit {
  
  @Input() saldoAfore!: number;
  @Input() pensionMensual!: number;
  @Input() montoMinimo!: number;
  
  @Output() prestamoChange = new EventEmitter<number>();
  
  resultado: ResultadoCalculo | null = null;
  montoManual = 0;
  
  constructor(private prestamoService: PrestamoService) {}
  
  ngOnInit(): void {
    this.calcular();
  }
  
  ngOnChanges(): void {
    this.calcular();
  }
  
  calcular(): void {
    this.resultado = this.prestamoService.calcularPrestamo({
      saldoAfore: this.saldoAfore,
      pensionMensual: this.pensionMensual,
      montoMinimo: this.montoMinimo
    });
    
    this.montoManual = this.resultado.prestamo.montoSugerido;
    this.prestamoChange.emit(this.montoManual);
  }
  
  onMontoChange(valor: number): void {
    this.montoManual = valor;
    this.prestamoChange.emit(valor);
  }
  
  aplicarSugerencia(): void {
    if (this.resultado) {
      this.montoManual = this.resultado.prestamo.montoSugerido;
      this.prestamoChange.emit(this.montoManual);
    }
  }
}
```

---

## 8. VALIDACIONES Y EDGE CASES

### 8.1 Validaciones Críticas

```typescript
class ValidadorPrestamo {
  
  /**
   * Valida que el préstamo no sea negativo
   */
  static validarMontoPositivo(monto: number): ValidationResult {
    if (monto < 0) {
      return {
        isValid: false,
        error: "El préstamo no puede ser negativo"
      };
    }
    return { isValid: true };
  }
  
  /**
   * Valida que el préstamo no exceda un máximo razonable
   */
  static validarMontoMaximo(monto: number, pensionMensual: number): ValidationResult {
    const maximoPermitido = pensionMensual * 12; // 12 meses de pensión
    
    if (monto > maximoPermitido) {
      return {
        isValid: false,
        error: `El préstamo no puede exceder ${maximoPermitido.toLocaleString('es-MX')} (12 meses de pensión)`,
        warning: true
      };
    }
    return { isValid: true };
  }
  
  /**
   * Valida que los parámetros sean válidos
   */
  static validarParametros(params: CalculoPrestamoParams): ValidationResult {
    const errors: string[] = [];
    
    if (params.saldoAfore < 0) {
      errors.push("El saldo AFORE no puede ser negativo");
    }
    
    if (params.pensionMensual <= 0) {
      errors.push("La pensión mensual debe ser mayor a cero");
    }
    
    if (params.montoMinimo <= 0) {
      errors.push("El monto mínimo debe ser mayor a cero");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

### 8.2 Edge Cases

#### Edge Case 1: Pensión muy alta

```typescript
// Caso: Pensión mensual de $50,000
const resultado = CalculadoraPrestamo.procesarPrestamo({
  saldoAfore: 15000,
  pensionMensual: 50000,
  montoMinimo: 107100
});

// Resultado:
// Préstamo sugerido = (50000 × 7.5) - 10000 = $365,000
// Total disponible = 15,000 + 365,000 = $380,000
// Modalidad: FINANCIADO 100 (muy por encima del mínimo)

// ⚠️ VALIDACIÓN: Préstamo muy alto, requiere aprobación especial
```

#### Edge Case 2: Saldo AFORE exactamente igual al mínimo

```typescript
const resultado = CalculadoraPrestamo.procesarPrestamo({
  saldoAfore: 107100,  // Exactamente el mínimo
  pensionMensual: 10900,
  montoMinimo: 107100
});

// Resultado:
// Préstamo sugerido = 0 (no se necesita)
// Total disponible = 107,100
// Modalidad: FINANCIADO 100
// ✓ Caso perfecto, sin préstamo
```

#### Edge Case 3: Préstamo calculado negativo

```typescript
// Caso: Pensión muy baja
const resultado = CalculadoraPrestamo.procesarPrestamo({
  saldoAfore: 15000,
  pensionMensual: 1000,  // Muy baja
  montoMinimo: 107100
});

// Cálculo:
// (1000 × 7.5) - 10000 = 7,500 - 10,000 = -2,500
// ⚠️ Se debe retornar 0, no negativo

// Protección en el código:
return Math.max(0, prestamo);
```

#### Edge Case 4: Valores null o undefined

```typescript
// Protección contra valores nulos
function calcularPrestamoSeguro(
  saldoAfore?: number,
  pensionMensual?: number,
  montoMinimo?: number
): ResultadoCalculo {
  
  // Valores por defecto
  const saldo = saldoAfore ?? 0;
  const pension = pensionMensual ?? 0;
  const minimo = montoMinimo ?? 0;
  
  // Validar antes de calcular
  const validacion = ValidadorPrestamo.validarParametros({
    saldoAfore: saldo,
    pensionMensual: pension,
    montoMinimo: minimo
  });
  
  if (!validacion.isValid) {
    throw new Error(`Parámetros inválidos: ${validacion.errors?.join(', ')}`);
  }
  
  return CalculadoraPrestamo.procesarPrestamo({
    saldoAfore: saldo,
    pensionMensual: pension,
    montoMinimo: minimo
  });
}
```

### 8.3 Matriz de Edge Cases

| Caso | Saldo | Pensión | Mínimo | Préstamo Calculado | Acción |
|------|-------|---------|--------|-------------------|--------|
| Pensión muy alta | $15k | $50k | $107k | $365k | ⚠️ Revisar |
| Saldo = Mínimo | $107k | $10.9k | $107k | $0 | ✅ Perfecto |
| Pensión muy baja | $15k | $1k | $107k | $0 (protegido) | ❌ No viable |
| Saldo muy alto | $500k | $10.9k | $107k | $0 | ✅ Exceso |
| Todos cero | $0 | $0 | $0 | Error | ❌ Inválido |

---

## 9. INTEGRACIÓN CON OTRAS HOJAS

### 9.1 Flujo de Datos Completo

```
┌─────────────────────────────────────────────────────────┐
│                   DATOS GENERALES                        │
│                                                          │
│  ENTRADAS:                                               │
│   C13: Saldo AFORE ($15,000)                            │
│   C14: Préstamo Real ($80,000) ← MANUAL                 │
│                                                          │
│  CÁLCULOS:                                               │
│   G14: Préstamo Sugerido ($71,750) ← AUTOMÁTICO        │
│   B14: Etiqueta (si aplica)                             │
│   G16: Modalidad sugerida                               │
│                                                          │
└──────────┬──────────────────────────────────────────────┘
           │
           │ C13, C14 →
           ▼
┌──────────────────────────────────────────────────────────┐
│              INFORME COSTO MENSUAL                       │
│                                                          │
│  RECIBE:                                                 │
│   D20: ='DATOS GENERALES'!C13 ($15,000)                │
│   D21: ='DATOS GENERALES'!C14 ($80,000)                │
│                                                          │
│  CALCULA:                                                │
│   D22: =D20 + D21 ($95,000)                             │
│   K25: Monto Mínimo Requerido ($107,100)                │
│                                                          │
│  VALIDA:                                                 │
│   F20: Verifica si D22 < K25                            │
│        Muestra: "*SOLO APLICA PARA MOD 1 RETOMA*"       │
│                                                          │
└──────────┬───────────────────────────────────────────────┘
           │
           │ AE36 (pensión) →
           ▼
┌──────────────────────────────────────────────────────────┐
│              PROYECCIÓN DE PENSIÓN                       │
│                                                          │
│  CALCULA:                                                │
│   F44: Pensión mensual ($10,900)                        │
│   AE36: ='INFORME COSTO MENSUAL' (usado en bucle)      │
│                                                          │
│  USA EN:                                                 │
│   Cálculo de préstamo en G14 (DATOS GENERALES)          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 9.2 Referencias Cruzadas

| Celda | Hoja Origen | Hoja Destino | Propósito |
|-------|-------------|--------------|-----------|
| `C13` | DATOS GENERALES | INFORME COSTO MENSUAL (D20) | Saldo AFORE |
| `C14` | DATOS GENERALES | INFORME COSTO MENSUAL (D21) | Préstamo real |
| `K25` | INFORME COSTO MENSUAL | DATOS GENERALES (G14, B14, G16) | Monto mínimo |
| `F44` | PROYECCIÓN DE PENSIÓN | DATOS GENERALES (G14) | Pensión para préstamo |
| `AE36` | INFORME COSTO MENSUAL | PROYECCIÓN DE PENSIÓN (F44) | Pensión calculada |

### 9.3 Dependencias Circulares

**⚠️ ALERTA**: Existe una potencial referencia circular:

```
DATOS GENERALES (G14) 
  ↓
usa PROYECCIÓN DE PENSIÓN (F44)
  ↓
usa INFORME COSTO MENSUAL (AE36)
  ↓
(podría referenciar de vuelta a DATOS GENERALES)
```

**Solución**: El sistema Excel maneja esto mediante cálculos iterativos. En la implementación web, asegúrate de:

1. Calcular en el orden correcto
2. Usar valores cacheados
3. Detectar y prevenir loops infinitos

```typescript
class CalculadoraSegura {
  private static calculandoPrestamo = false;
  
  static calcularConProteccion(params: CalculoPrestamoParams): ResultadoCalculo {
    if (this.calculandoPrestamo) {
      throw new Error("Referencia circular detectada");
    }
    
    this.calculandoPrestamo = true;
    
    try {
      return CalculadoraPrestamo.procesarPrestamo(params);
    } finally {
      this.calculandoPrestamo = false;
    }
  }
}
```

---

## 10. RESUMEN Y CONCLUSIONES

### 10.1 Puntos Clave

1. ✅ **Préstamo es OPCIONAL**: Solo se calcula si el saldo es insuficiente
2. ✅ **Cálculo automático en G14**: Es una SUGERENCIA, no obligatorio
3. ✅ **Usuario decide en C14**: Puede aceptar, modificar o rechazar la sugerencia
4. ✅ **Fórmula simple**: `(Pensión × 7.5) - 10,000`
5. ✅ **Depende de 3 variables**: Saldo AFORE, Pensión Mensual, Monto Mínimo

### 10.2 Reglas de Oro

| # | Regla | Impacto |
|---|-------|---------|
| 1 | Si `Saldo AFORE >= Monto Mínimo` → Préstamo = $0 | ⭐⭐⭐ |
| 2 | Préstamo nunca puede ser negativo | ⭐⭐⭐ |
| 3 | Usuario puede modificar el préstamo sugerido | ⭐⭐ |
| 4 | El cálculo real usa C14, NO G14 | ⭐⭐⭐ |
| 5 | Modalidad se determina DESPUÉS del préstamo | ⭐⭐ |

### 10.3 Checklist de Implementación

- [ ] Crear interfaces y tipos TypeScript
- [ ] Implementar CalculadoraPrestamo con todas las fórmulas
- [ ] Crear validadores para edge cases
- [ ] Diseñar UI con campo sugerido + campo manual
- [ ] Implementar cálculo en tiempo real
- [ ] Mostrar desglose visual del cálculo
- [ ] Validar integración con otras hojas
- [ ] Manejar referencias circulares
- [ ] Crear pruebas unitarias para todos los escenarios
- [ ] Documentar API para otros desarrolladores

### 10.4 Próximos Pasos

1. **Implementar Backend**:
   - API endpoint para calcular préstamo
   - Validaciones server-side
   - Almacenamiento de préstamos históricos

2. **Mejorar Frontend**:
   - Calculadora interactiva
   - Gráficos de comparación
   - Simulador de escenarios

3. **Optimizaciones**:
   - Cache de cálculos frecuentes
   - Precarga de valores de referencia
   - Modo offline con Service Workers

---

**Fecha**: 2025-02-04  
**Versión**: 1.0  
**Autor**: Análisis Técnico Completo  
**Estado**: Documentación Lista para Implementación
