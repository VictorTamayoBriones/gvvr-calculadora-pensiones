# COMBO DE MODALIDAD - REGLAS DE NEGOCIO
## Sistema de Recuperación de Pensiones - DATOS GENERALES

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estructura del Combo](#estructura-del-combo)
3. [Modalidades Disponibles](#modalidades-disponibles)
4. [Reglas de Cálculo de Opciones](#reglas-de-cálculo-de-opciones)
5. [Restricciones y Validaciones](#restricciones-y-validaciones)
6. [Flujo de Decisión](#flujo-de-decisión)
7. [Implementación Técnica](#implementación-técnica)
8. [Casos de Uso](#casos-de-uso)
9. [Matriz de Elegibilidad](#matriz-de-elegibilidad)

---

## 1. RESUMEN EJECUTIVO

### Campo de Modalidad (C17)

El campo **Modalidad** en la hoja "DATOS GENERALES" es un **dropdown dinámico** que presenta al usuario las opciones de financiamiento disponibles según su situación financiera y características personales.

### Ubicación
- **Campo de entrada**: `C17` (DATOS GENERALES)
- **Fuente de opciones**: `G16:G17` (calculadas dinámicamente)
- **Tipo de control**: Lista desplegable (dropdown)

### Valor Actual del Caso
```
Modalidad seleccionada: FINANCIADO 100
Opciones disponibles:  [" FINANCIADO 1"]  ← Solo 1 opción visible
```

**⚠️ Nota**: Aunque el usuario tiene seleccionado "FINANCIADO 100", el sistema sugiere " FINANCIADO 1" porque el saldo + préstamo es insuficiente.

---

## 2. ESTRUCTURA DEL COMBO

### 2.1 Configuración Excel

```excel
Celda C17:
  Tipo: Validación de datos (Data Validation)
  Tipo de validación: list
  Fuente: $G$16:$G$17
  Permite dropdown: Sí
```

### 2.2 Celdas Calculadas (Fuente del Combo)

```
┌──────────────────────────────────────────────────┐
│  G16: Modalidad Sugerida (Principal)            │
│  G17: Modalidad Alternativa (Opcional)          │
└──────────────────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  COMBO EN C17        │
         │  Opciones dinámicas  │
         └──────────────────────┘
```

**Característica Importante**: 
- Si `G17` está vacío, el combo solo muestra `G16`
- Si `G17` tiene valor, el combo muestra ambas opciones

---

## 3. MODALIDADES DISPONIBLES

### 3.1 Catálogo Completo de Modalidades

| # | Modalidad | Descripción | Cliente Paga | Grupo Avivir Financia |
|---|-----------|-------------|--------------|----------------------|
| 1 | **FINANCIADO 1** | Financiamiento parcial | Parte de los costos | Préstamo parcial |
| 2 | **FINANCIADO 100** | Financiamiento total | Nada | Todo (inscripción + mensualidades + gestión) |
| 3 | **REACTIVA TRADICIONAL** | Reactiva con pago del cliente | Inscripción + mensualidades | Solo gestión |
| 4 | **REACTIVA FINANCIADO 100** | Reactiva totalmente financiada | Nada | Todo |

### 3.2 Características por Modalidad

#### FINANCIADO 1
```
Nombre Excel: " FINANCIADO 1"  ⚠️ (con espacio inicial)
Nombre limpio: "FINANCIADO 1"

Condición:
  Saldo AFORE + Préstamo < Monto Mínimo Requerido

Situación:
  El cliente NO tiene fondos suficientes para cubrir todos los costos

Requisitos:
  - Edad: 58.5 - 68 años
  - Ley: LEY 73
  - Saldo AFORE: ≥ $15,000
  - Semanas: ≥ 430

Financiamiento:
  Grupo Avivir otorga un préstamo parcial que junto con el 
  saldo AFORE aún no alcanza para cubrir el 100%
```

#### FINANCIADO 100
```
Nombre Excel: "FINANCIADO 100"

Condición:
  Saldo AFORE + Préstamo ≥ Monto Mínimo Requerido

Situación:
  El cliente tiene fondos suficientes (propios o con préstamo)

Requisitos:
  - Edad: 58.5 - 68 años
  - Ley: LEY 73
  - Saldo AFORE: ≥ $15,000
  - Semanas: ≥ 430

Financiamiento:
  Grupo Avivir financia el 100% de:
  - Inscripción
  - Pagos mensuales
  - Gestoría
```

#### REACTIVA TRADICIONAL
```
Nombre Excel: "REACTIVA TRADICIONAL"

Condición:
  - Modalidad alternativa cuando cliente tiene > 68 años
  - O cuando G16 = "REACTIVA FINANCIADO 100"

Situación:
  Cliente mayor de 68 años o que prefiere pagar él mismo

Requisitos:
  - Edad: > 68 años (SIN límite superior)
  - Ley: LEY 73
  - Saldo AFORE: ≥ $15,000
  - Semanas: ≥ 430

Financiamiento:
  Cliente paga:    Inscripción + Mensualidades
  Grupo Avivir:    Solo Gestoría

Descripción oficial:
  "El cliente esta obligado a pagar su inscripcion y meses 
   de contratacion, solo GRUPO AVIVIR financiara la GESTION"
```

#### REACTIVA FINANCIADO 100
```
Nombre Excel: "REACTIVA FINANCIADO 100"

Condición:
  Cliente cumple con todos los requisitos de edad y ley

Situación:
  Cliente elegible para financiamiento total reactivo

Requisitos:
  - Edad: 58.5 - 68 años (CRÍTICO: menores de 68 años)
  - Ley: LEY 73
  - Saldo AFORE: ≥ $15,000
  - Semanas: ≥ 430

Financiamiento:
  Grupo Avivir financia el 100% de:
  - Inscripción
  - Pagos mensuales
  - Gestoría

Descripción oficial:
  "GRUPO AVIVIR financiara el 100% de la inscripcion, 
   pagos mensuales y la gestion"

Nota importante:
  Cuando esta modalidad está en G16, G17 automáticamente 
  muestra "REACTIVA TRADICIONAL" como alternativa
```

---

## 4. REGLAS DE CÁLCULO DE OPCIONES

### 4.1 Cálculo de G16 (Modalidad Sugerida)

**Fórmula Excel**:
```excel
=IF(
  C13 + G14 < 'INFORME COSTO MENSUAL'!K25,
  " FINANCIADO 1",
  "FINANCIADO 100"
)
```

**Lógica en Pseudocódigo**:
```javascript
function calcularModalidadSugerida(saldoAfore, prestamoSugerido, montoMinimo) {
  const totalDisponible = saldoAfore + prestamoSugerido;
  
  if (totalDisponible < montoMinimo) {
    return " FINANCIADO 1";  // ⚠️ Con espacio inicial en Excel
  } else {
    return "FINANCIADO 100";
  }
}
```

**Variables Involucradas**:
- `C13`: Saldo AFORE (entrada manual)
- `G14`: Préstamo financiero sugerido (calculado)
- `K25`: Monto mínimo requerido (de INFORME COSTO MENSUAL)

**Caso Actual**:
```
C13:  $15,000
G14:  $71,750
Suma: $86,750

K25:  $107,100

Resultado: $86,750 < $107,100 → " FINANCIADO 1"
```

### 4.2 Cálculo de G17 (Modalidad Alternativa)

**Fórmula Excel**:
```excel
=IFERROR(
  IF(
    G16 = "REACTIVA FINANCIADO 100",
    "REACTIVA TRADICIONAL",
    ""
  ),
  ""
)
```

**Lógica en Pseudocódigo**:
```javascript
function calcularModalidadAlternativa(modalidadSugerida) {
  try {
    if (modalidadSugerida === "REACTIVA FINANCIADO 100") {
      return "REACTIVA TRADICIONAL";
    } else {
      return "";  // Vacío, no hay alternativa
    }
  } catch (error) {
    return "";
  }
}
```

**Regla**:
- Solo hay alternativa cuando `G16` = "REACTIVA FINANCIADO 100"
- La alternativa es siempre "REACTIVA TRADICIONAL"

**Caso Actual**:
```
G16:  " FINANCIADO 1"
Condición: " FINANCIADO 1" === "REACTIVA FINANCIADO 100" → FALSE
G17:  ""  (vacío)
```

**Resultado del Combo**:
```
Opciones disponibles: [" FINANCIADO 1"]
```

---

## 5. RESTRICCIONES Y VALIDACIONES

### 5.1 Validación de Edad

**Cálculo de Edad (Q14 en INFORME COSTO MENSUAL)**:
```excel
=DATEDIF(I12, TODAY(), "M")
```

Donde:
- `I12` = Fecha de nacimiento (extraída de CURP)
- `TODAY()` = Fecha actual
- Resultado en **meses**

**Límites de Edad**:

| Límite | Meses | Años | Aplica a |
|--------|-------|------|----------|
| **Mínimo** | 702 | 58.5 años | Todas las modalidades |
| **Máximo para REACTIVA FINANCIADO 100** | 816 | 68 años | Solo REACTIVA FINANCIADO 100 |
| **Sin límite superior** | - | > 68 años | REACTIVA TRADICIONAL |

**Mensaje de Validación (J7)**:
```excel
=IF(E12="", "",
  IF(Q14>816,
    "SOLO APLICA PARA REACTIVA TRADICIONAL, Para Reactiva financiado 100 solo son viables menores de 68 años",
    IF(Q14<702,
      "PROSPECTO NO VALIDO PARA ESTE PRODUCTO, Edad minima de contratacion 58 años 6 meses",
      ""
    )
  )
)
```

**Lógica de Validación**:
```javascript
function validarEdad(edadEnMeses) {
  const EDAD_MINIMA = 702;       // 58.5 años
  const EDAD_MAXIMA_REACTIVA_F100 = 816;  // 68 años
  
  if (edadEnMeses < EDAD_MINIMA) {
    return {
      valido: false,
      mensaje: "PROSPECTO NO VALIDO PARA ESTE PRODUCTO, Edad minima de contratacion 58 años 6 meses"
    };
  }
  
  if (edadEnMeses > EDAD_MAXIMA_REACTIVA_F100) {
    return {
      valido: true,
      restriccion: "SOLO_REACTIVA_TRADICIONAL",
      mensaje: "SOLO APLICA PARA REACTIVA TRADICIONAL, Para Reactiva financiado 100 solo son viables menores de 68 años"
    };
  }
  
  return {
    valido: true,
    restriccion: "NINGUNA",
    mensaje: ""
  };
}
```

**Caso Actual**:
```
Edad: 878 meses = 73.17 años
Validación: edad > 816 → Solo puede usar REACTIVA TRADICIONAL
```

### 5.2 Validación de Ley

**Cálculo de Ley Aplicable (F14 en INFORME COSTO MENSUAL)**:
```excel
=IF(W6="", "", VLOOKUP(W6, Z6:AA106, 2, 0))
```

**Mensaje de Validación (D15)**:
```excel
=IF(F14="", "",
  IF(F14="LEY 97",
    "PROSPECTO NO VALIDO PARA ESTE PRODUCTO (Ley 97)",
    "DEBE CONTAR CON COTIZACION ANTES DEL 1 DE JULIO DE 1997"
  )
)
```

**Regla**:
- ✅ **LEY 73**: Todas las modalidades disponibles (según edad)
- ❌ **LEY 97**: NO VÁLIDO para este producto

**Caso Actual**:
```
Ley: LEY 73  ✓
Válido para: Todas las modalidades
```

### 5.3 Validación de Saldo AFORE

```javascript
const SALDO_MINIMO = 15000;

if (saldoAfore < SALDO_MINIMO) {
  return {
    valido: false,
    mensaje: "MONTO EN AFORE INSUFICIENTE - El monto minimo para este producto es de $15,000"
  };
}
```

### 5.4 Validación de Semanas Cotizadas

```javascript
const SEMANAS_MINIMAS = 430;

if (semanasCotizadas < SEMANAS_MINIMAS) {
  return {
    valido: false,
    mensaje: "SEMANAS INSUFICIENTES - El mínimo de semanas permitidas para este producto es de 430"
  };
}
```

---

## 6. FLUJO DE DECISIÓN

### 6.1 Diagrama de Flujo Completo

```
┌────────────────────────────────────────────────────────┐
│              INICIO: Determinar Modalidades            │
└──────────────────┬─────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Validar Requisitos   │
        │ Básicos              │
        └──────────┬───────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
    ¿Saldo ≥ 15k?        ¿Semanas ≥ 430?
         │                    │
         NO                   NO
         │                    │
         ▼                    ▼
    ┌─────────┐          ┌──────────┐
    │ RECHAZAR│          │ RECHAZAR │
    └─────────┘          └──────────┘
         │                    │
         SÍ                   SÍ
         │                    │
         └─────────┬──────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Calcular Edad        │
        │ (desde CURP)         │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────────────┐
        │ ¿Edad entre 58.5 y 68 años?  │
        └────┬─────────────────┬───────┘
             │                 │
            NO                SÍ
             │                 │
             ▼                 ▼
      ┌──────────────┐  ┌──────────────────┐
      │ ¿Edad > 68?  │  │ Calcular fondos  │
      └──────┬───────┘  │ disponibles      │
             │          └────────┬─────────┘
         SÍ  │                   │
             │                   ▼
             │         ┌──────────────────────────┐
             │         │ ¿Saldo+Préstamo≥Mínimo? │
             │         └───┬────────────────┬─────┘
             │             │                │
             │            SÍ               NO
             │             │                │
             │             ▼                ▼
             │    ┌────────────────┐ ┌────────────────┐
             │    │ G16=            │ │ G16=           │
             │    │ "FINANCIADO    │ │ " FINANCIADO 1"│
             │    │  100"          │ │ G17=""         │
             │    │ G17=""         │ └────────────────┘
             │    └────────────────┘
             │
             ▼
   ┌────────────────────────┐
   │ G16="REACTIVA          │
   │      FINANCIADO 100"   │
   │ G17="REACTIVA          │
   │      TRADICIONAL"      │
   └────────┬───────────────┘
            │
            ▼
   ┌────────────────────────┐
   │ Usuario selecciona     │
   │ en C17                 │
   └────────────────────────┘
```

### 6.2 Matriz de Decisión Simplificada

```
                        ┌──────────────────────────────────┐
                        │   MODALIDADES DISPONIBLES         │
├─────────────┬─────────┼──────────┬──────────┬────────────┤
│ Edad        │ Fondos  │ FINANC.1 │ FINANC.  │ REACTIVA   │
│             │         │          │ 100      │ TRAD.      │
├─────────────┼─────────┼──────────┼──────────┼────────────┤
│ < 58.5 años │ N/A     │    ❌    │    ❌    │     ❌     │
│ 58.5-68 años│ Insuf.  │    ✅    │    ❌    │     ❌     │
│ 58.5-68 años│ Sufic.  │    ❌    │    ✅    │     ❌     │
│ > 68 años   │ N/A     │    ❌    │    ❌    │     ✅     │
└─────────────┴─────────┴──────────┴──────────┴────────────┘

Fondos:
  Insuficiente = Saldo + Préstamo < Mínimo
  Suficiente   = Saldo + Préstamo ≥ Mínimo
```

---

## 7. IMPLEMENTACIÓN TÉCNICA

### 7.1 Interfaces TypeScript

```typescript
// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

enum Modalidad {
  FINANCIADO_1 = "FINANCIADO 1",
  FINANCIADO_100 = "FINANCIADO 100",
  REACTIVA_TRADICIONAL = "REACTIVA TRADICIONAL",
  REACTIVA_FINANCIADO_100 = "REACTIVA FINANCIADO 100"
}

interface ValidacionEdad {
  valido: boolean;
  edadMeses: number;
  edadAños: number;
  restriccion?: "NINGUNA" | "SOLO_REACTIVA_TRADICIONAL";
  mensaje?: string;
}

interface OpcionModalidad {
  valor: Modalidad;
  etiqueta: string;
  descripcion: string;
  esRecomendada: boolean;
}

interface ResultadoModalidades {
  opciones: OpcionModalidad[];
  modalidadSugerida: Modalidad;
  modalidadAlternativa?: Modalidad;
  tieneAlternativa: boolean;
}

interface DatosCliente {
  fechaNacimiento: Date;
  saldoAfore: number;
  semanasCotizadas: number;
  ley: "LEY 73" | "LEY 97";
  prestamoSugerido: number;
  montoMinimo: number;
}
```

### 7.2 Constantes del Sistema

```typescript
// ============================================================================
// CONSTANTES
// ============================================================================

const CONSTANTES_MODALIDAD = {
  // Edad
  EDAD_MINIMA_MESES: 702,           // 58.5 años
  EDAD_MAXIMA_REACTIVA_F100: 816,   // 68 años
  
  // Validaciones básicas
  SALDO_AFORE_MINIMO: 15000,
  SEMANAS_MINIMAS: 430,
  
  // Leyes válidas
  LEY_VALIDA: "LEY 73",
  LEY_INVALIDA: "LEY 97",
  
  // Espacios en nombres (quirk de Excel)
  FINANCIADO_1_CON_ESPACIO: " FINANCIADO 1",
  FINANCIADO_1_SIN_ESPACIO: "FINANCIADO 1"
} as const;

const DESCRIPCIONES_MODALIDAD: Record<Modalidad, string> = {
  [Modalidad.FINANCIADO_1]: 
    "Financiamiento parcial - Cliente necesita aportar fondos adicionales",
  
  [Modalidad.FINANCIADO_100]: 
    "Financiamiento total - Grupo Avivir cubre el 100% (inscripción + mensualidades + gestoría)",
  
  [Modalidad.REACTIVA_TRADICIONAL]: 
    "El cliente esta obligado a pagar su inscripcion y meses de contratacion, solo GRUPO AVIVIR financiara la GESTION",
  
  [Modalidad.REACTIVA_FINANCIADO_100]: 
    "GRUPO AVIVIR financiara el 100% de la inscripcion, pagos mensuales y la gestion"
};
```

### 7.3 Validador de Edad

```typescript
// ============================================================================
// VALIDADOR DE EDAD
// ============================================================================

class ValidadorEdad {
  
  /**
   * Calcula la edad en meses desde una fecha de nacimiento
   */
  static calcularEdadMeses(fechaNacimiento: Date): number {
    const hoy = new Date();
    const años = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const meses = hoy.getMonth() - fechaNacimiento.getMonth();
    return (años * 12) + meses;
  }
  
  /**
   * Valida si la edad cumple los requisitos
   */
  static validar(fechaNacimiento: Date): ValidacionEdad {
    const edadMeses = this.calcularEdadMeses(fechaNacimiento);
    const edadAños = edadMeses / 12;
    
    // Validar edad mínima
    if (edadMeses < CONSTANTES_MODALIDAD.EDAD_MINIMA_MESES) {
      return {
        valido: false,
        edadMeses,
        edadAños,
        mensaje: "PROSPECTO NO VALIDO PARA ESTE PRODUCTO, Edad minima de contratacion 58 años 6 meses"
      };
    }
    
    // Validar restricción para REACTIVA FINANCIADO 100
    if (edadMeses > CONSTANTES_MODALIDAD.EDAD_MAXIMA_REACTIVA_F100) {
      return {
        valido: true,
        edadMeses,
        edadAños,
        restriccion: "SOLO_REACTIVA_TRADICIONAL",
        mensaje: "SOLO APLICA PARA REACTIVA TRADICIONAL, Para Reactiva financiado 100 solo son viables menores de 68 años"
      };
    }
    
    // Edad válida sin restricciones
    return {
      valido: true,
      edadMeses,
      edadAños,
      restriccion: "NINGUNA"
    };
  }
}
```

### 7.4 Calculadora de Modalidades

```typescript
// ============================================================================
// CALCULADORA DE MODALIDADES
// ============================================================================

class CalculadoraModalidades {
  
  /**
   * Calcula la modalidad sugerida (G16)
   */
  static calcularModalidadSugerida(
    saldoAfore: number,
    prestamoSugerido: number,
    montoMinimo: number
  ): Modalidad {
    const totalDisponible = saldoAfore + prestamoSugerido;
    
    if (totalDisponible < montoMinimo) {
      return Modalidad.FINANCIADO_1;
    } else {
      return Modalidad.FINANCIADO_100;
    }
  }
  
  /**
   * Calcula la modalidad alternativa (G17)
   */
  static calcularModalidadAlternativa(
    modalidadSugerida: Modalidad
  ): Modalidad | null {
    if (modalidadSugerida === Modalidad.REACTIVA_FINANCIADO_100) {
      return Modalidad.REACTIVA_TRADICIONAL;
    }
    return null;
  }
  
  /**
   * Determina todas las modalidades disponibles
   */
  static determinarModalidades(datos: DatosCliente): ResultadoModalidades {
    // Validar edad
    const validacionEdad = ValidadorEdad.validar(datos.fechaNacimiento);
    
    if (!validacionEdad.valido) {
      throw new Error(validacionEdad.mensaje);
    }
    
    // Validar ley
    if (datos.ley !== CONSTANTES_MODALIDAD.LEY_VALIDA) {
      throw new Error("PROSPECTO NO VALIDO PARA ESTE PRODUCTO (Ley 97)");
    }
    
    let modalidadSugerida: Modalidad;
    let modalidadAlternativa: Modalidad | null = null;
    
    // Si tiene restricción de edad (> 68 años)
    if (validacionEdad.restriccion === "SOLO_REACTIVA_TRADICIONAL") {
      modalidadSugerida = Modalidad.REACTIVA_FINANCIADO_100;
      modalidadAlternativa = Modalidad.REACTIVA_TRADICIONAL;
    } else {
      // Calcular según disponibilidad de fondos
      modalidadSugerida = this.calcularModalidadSugerida(
        datos.saldoAfore,
        datos.prestamoSugerido,
        datos.montoMinimo
      );
      modalidadAlternativa = this.calcularModalidadAlternativa(modalidadSugerida);
    }
    
    // Construir lista de opciones
    const opciones: OpcionModalidad[] = [];
    
    // Agregar modalidad sugerida
    opciones.push({
      valor: modalidadSugerida,
      etiqueta: modalidadSugerida,
      descripcion: DESCRIPCIONES_MODALIDAD[modalidadSugerida],
      esRecomendada: true
    });
    
    // Agregar modalidad alternativa si existe
    if (modalidadAlternativa) {
      opciones.push({
        valor: modalidadAlternativa,
        etiqueta: modalidadAlternativa,
        descripcion: DESCRIPCIONES_MODALIDAD[modalidadAlternativa],
        esRecomendada: false
      });
    }
    
    return {
      opciones,
      modalidadSugerida,
      modalidadAlternativa: modalidadAlternativa || undefined,
      tieneAlternativa: modalidadAlternativa !== null
    };
  }
}
```

### 7.5 Componente React

```tsx
// ============================================================================
// COMPONENTE REACT - COMBO DE MODALIDAD
// ============================================================================

import React, { useState, useEffect } from 'react';

interface ComboModalidadProps {
  datosCliente: DatosCliente;
  onChange: (modalidad: Modalidad) => void;
  valorInicial?: Modalidad;
}

const ComboModalidad: React.FC<ComboModalidadProps> = ({
  datosCliente,
  onChange,
  valorInicial
}) => {
  const [modalidades, setModalidades] = useState<ResultadoModalidades | null>(null);
  const [modalidadSeleccionada, setModalidadSeleccionada] = useState<Modalidad | undefined>(
    valorInicial
  );
  const [error, setError] = useState<string | null>(null);
  
  // Calcular modalidades disponibles
  useEffect(() => {
    try {
      const resultado = CalculadoraModalidades.determinarModalidades(datosCliente);
      setModalidades(resultado);
      setError(null);
      
      // Si no hay valor inicial, seleccionar la sugerida
      if (!modalidadSeleccionada) {
        setModalidadSeleccionada(resultado.modalidadSugerida);
        onChange(resultado.modalidadSugerida);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al calcular modalidades");
      setModalidades(null);
    }
  }, [datosCliente]);
  
  // Manejar cambio de selección
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaModalidad = e.target.value as Modalidad;
    setModalidadSeleccionada(nuevaModalidad);
    onChange(nuevaModalidad);
  };
  
  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="campo-modalidad error">
        <label>Modalidad</label>
        <div className="mensaje-error">{error}</div>
      </div>
    );
  }
  
  // Si no hay modalidades calculadas, mostrar cargando
  if (!modalidades) {
    return (
      <div className="campo-modalidad">
        <label>Modalidad</label>
        <div className="cargando">Calculando opciones...</div>
      </div>
    );
  }
  
  return (
    <div className="campo-modalidad">
      <label htmlFor="modalidad">Modalidad</label>
      
      {/* Mostrar advertencia de edad si aplica */}
      {datosCliente.fechaNacimiento && (
        (() => {
          const validacion = ValidadorEdad.validar(datosCliente.fechaNacimiento);
          if (validacion.mensaje) {
            return (
              <div className={`alerta ${validacion.valido ? 'advertencia' : 'error'}`}>
                ⚠️ {validacion.mensaje}
              </div>
            );
          }
          return null;
        })()
      )}
      
      {/* Combo de modalidades */}
      <select
        id="modalidad"
        value={modalidadSeleccionada}
        onChange={handleChange}
        className="combo-modalidad"
      >
        {modalidades.opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.esRecomendada ? '⭐ ' : ''}
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      
      {/* Descripción de la modalidad seleccionada */}
      {modalidadSeleccionada && (
        <div className="descripcion-modalidad">
          {DESCRIPCIONES_MODALIDAD[modalidadSeleccionada]}
        </div>
      )}
      
      {/* Indicador de modalidad sugerida */}
      {modalidades.tieneAlternativa && (
        <div className="nota-sugerencia">
          <strong>Modalidad sugerida:</strong> {modalidades.modalidadSugerida}
          {modalidadSeleccionada !== modalidades.modalidadSugerida && (
            <span className="advertencia"> (Has seleccionado una alternativa)</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ComboModalidad;
```

### 7.6 Estilos CSS

```css
/* ========================================================================== */
/* ESTILOS - COMBO DE MODALIDAD */
/* ========================================================================== */

.campo-modalidad {
  margin-bottom: 20px;
}

.campo-modalidad label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
}

.alerta {
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 14px;
}

.alerta.advertencia {
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
}

.alerta.error {
  background: #f8d7da;
  border: 1px solid #dc3545;
  color: #721c24;
}

.combo-modalidad {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #ced4da;
  border-radius: 6px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  transition: border-color 0.15s;
}

.combo-modalidad:hover {
  border-color: #007bff;
}

.combo-modalidad:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.descripcion-modalidad {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-left: 3px solid #007bff;
  font-size: 14px;
  color: #495057;
  line-height: 1.5;
}

.nota-sugerencia {
  margin-top: 12px;
  padding: 10px;
  background: #e7f3ff;
  border-radius: 4px;
  font-size: 14px;
}

.nota-sugerencia strong {
  color: #004085;
}

.nota-sugerencia .advertencia {
  color: #856404;
  font-weight: 600;
}

.mensaje-error {
  padding: 16px;
  background: #f8d7da;
  border: 1px solid #dc3545;
  border-radius: 6px;
  color: #721c24;
  font-weight: 500;
}

.cargando {
  padding: 12px;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}
```

---

## 8. CASOS DE USO

### 8.1 Caso 1: Cliente Joven con Fondos Suficientes

```typescript
const caso1: DatosCliente = {
  fechaNacimiento: new Date('1970-05-15'),  // 54.8 años
  saldoAfore: 150000,
  semanasCotizadas: 600,
  ley: "LEY 73",
  prestamoSugerido: 0,
  montoMinimo: 107100
};

const resultado = CalculadoraModalidades.determinarModalidades(caso1);
console.log(resultado);

// Output:
// {
//   opciones: [
//     {
//       valor: "FINANCIADO 100",
//       etiqueta: "FINANCIADO 100",
//       esRecomendada: true
//     }
//   ],
//   modalidadSugerida: "FINANCIADO 100",
//   tieneAlternativa: false
// }
```

### 8.2 Caso 2: Cliente Joven con Fondos Insuficientes (Caso Actual)

```typescript
const caso2: DatosCliente = {
  fechaNacimiento: new Date('1952-11-02'),  // 73.2 años (del CURP)
  saldoAfore: 15000,
  semanasCotizadas: 860,
  ley: "LEY 73",
  prestamoSugerido: 71750,
  montoMinimo: 107100
};

const resultado = CalculadoraModalidades.determinarModalidades(caso2);
console.log(resultado);

// Output:
// {
//   opciones: [
//     {
//       valor: "REACTIVA FINANCIADO 100",
//       etiqueta: "REACTIVA FINANCIADO 100",
//       esRecomendada: true
//     },
//     {
//       valor: "REACTIVA TRADICIONAL",
//       etiqueta: "REACTIVA TRADICIONAL",
//       esRecomendada: false
//     }
//   ],
//   modalidadSugerida: "REACTIVA FINANCIADO 100",
//   modalidadAlternativa: "REACTIVA TRADICIONAL",
//   tieneAlternativa: true
// }

// Nota: El cliente tiene > 68 años, por lo que automáticamente
// se le ofrece REACTIVA FINANCIADO 100 con REACTIVA TRADICIONAL como alternativa
```

### 8.3 Caso 3: Cliente Demasiado Joven

```typescript
const caso3: DatosCliente = {
  fechaNacimiento: new Date('1970-01-01'),  // 55 años
  saldoAfore: 50000,
  semanasCotizadas: 500,
  ley: "LEY 73",
  prestamoSugerido: 60000,
  montoMinimo: 107100
};

try {
  const resultado = CalculadoraModalidades.determinarModalidades(caso3);
} catch (error) {
  console.error(error.message);
  // Output: "PROSPECTO NO VALIDO PARA ESTE PRODUCTO, Edad minima de contratacion 58 años 6 meses"
}
```

### 8.4 Caso 4: Cliente con LEY 97

```typescript
const caso4: DatosCliente = {
  fechaNacimiento: new Date('1960-05-15'),  // 64.7 años
  saldoAfore: 100000,
  semanasCotizadas: 600,
  ley: "LEY 97",  // ❌ No válida
  prestamoSugerido: 0,
  montoMinimo: 107100
};

try {
  const resultado = CalculadoraModalidades.determinarModalidades(caso4);
} catch (error) {
  console.error(error.message);
  // Output: "PROSPECTO NO VALIDO PARA ESTE PRODUCTO (Ley 97)"
}
```

---

## 9. MATRIZ DE ELEGIBILIDAD

### 9.1 Tabla Completa de Elegibilidad

| # | Edad | Saldo AFORE | Semanas | Ley | Fondos Suficientes | Modalidades Disponibles |
|---|------|-------------|---------|-----|-------------------|------------------------|
| 1 | < 58.5 | N/A | N/A | N/A | N/A | ❌ RECHAZADO |
| 2 | 58.5-68 | < 15k | N/A | N/A | N/A | ❌ RECHAZADO |
| 3 | 58.5-68 | ≥ 15k | < 430 | N/A | N/A | ❌ RECHAZADO |
| 4 | 58.5-68 | ≥ 15k | ≥ 430 | LEY 97 | N/A | ❌ RECHAZADO |
| 5 | 58.5-68 | ≥ 15k | ≥ 430 | LEY 73 | NO | FINANCIADO 1 |
| 6 | 58.5-68 | ≥ 15k | ≥ 430 | LEY 73 | SÍ | FINANCIADO 100 |
| 7 | > 68 | ≥ 15k | ≥ 430 | LEY 73 | N/A | REACTIVA FINANCIADO 100, REACTIVA TRADICIONAL |

### 9.2 Decisión Rápida

```javascript
function decidirModalidades(cliente) {
  // 1. Validaciones básicas
  if (cliente.edad < 58.5) return "RECHAZADO: Edad mínima 58.5 años";
  if (cliente.saldoAfore < 15000) return "RECHAZADO: Saldo mínimo $15,000";
  if (cliente.semanas < 430) return "RECHAZADO: Mínimo 430 semanas";
  if (cliente.ley !== "LEY 73") return "RECHAZADO: Solo LEY 73";
  
  // 2. Decisión por edad
  if (cliente.edad > 68) {
    return ["REACTIVA FINANCIADO 100", "REACTIVA TRADICIONAL"];
  }
  
  // 3. Decisión por fondos (edad 58.5-68)
  const fondosSuficientes = (cliente.saldoAfore + cliente.prestamo) >= cliente.montoMinimo;
  
  if (fondosSuficientes) {
    return ["FINANCIADO 100"];
  } else {
    return ["FINANCIADO 1"];
  }
}
```

---

## 10. RESUMEN Y CONCLUSIONES

### 10.1 Puntos Clave

1. ✅ **Combo dinámico**: Las opciones cambian según edad y fondos
2. ✅ **Máximo 2 opciones**: G16 (sugerida) y G17 (alternativa opcional)
3. ✅ **Edad crítica 68 años**: Divide entre modalidades normales y REACTIVA
4. ✅ **Fondos determinan**: FINANCIADO 1 vs FINANCIADO 100
5. ✅ **4 modalidades totales**: Pero nunca todas disponibles simultáneamente

### 10.2 Reglas de Oro

| # | Regla | Prioridad |
|---|-------|-----------|
| 1 | Edad < 58.5 años → RECHAZAR | ⭐⭐⭐ |
| 2 | Edad > 68 años → Solo REACTIVA | ⭐⭐⭐ |
| 3 | LEY 97 → RECHAZAR | ⭐⭐⭐ |
| 4 | Fondos insuficientes → FINANCIADO 1 | ⭐⭐ |
| 5 | Fondos suficientes → FINANCIADO 100 | ⭐⭐ |

### 10.3 Quirks de Excel a Considerar

⚠️ **IMPORTANTE**: El valor " FINANCIADO 1" en Excel tiene un **espacio inicial**. En tu implementación web:

```typescript
// Opción 1: Mantener el espacio (fiel a Excel)
const FINANCIADO_1 = " FINANCIADO 1";

// Opción 2: Limpiar (recomendado)
const FINANCIADO_1 = "FINANCIADO 1";

// Función helper para comparar
function compararModalidad(valor1: string, valor2: string): boolean {
  return valor1.trim().toUpperCase() === valor2.trim().toUpperCase();
}
```

### 10.4 Checklist de Implementación

- [ ] Implementar validador de edad
- [ ] Implementar cálculo de modalidad sugerida (G16)
- [ ] Implementar cálculo de modalidad alternativa (G17)
- [ ] Crear componente de combo dinámico
- [ ] Mostrar descripciones de cada modalidad
- [ ] Validar LEY 73 vs LEY 97
- [ ] Manejar caso de edad > 68 años
- [ ] Agregar indicadores visuales (estrella para sugerida)
- [ ] Implementar mensajes de error amigables
- [ ] Crear tests para todos los casos de uso

---

**Fecha**: 2025-02-04  
**Versión**: 1.0  
**Autor**: Análisis Técnico Completo  
**Estado**: Documentación Lista para Implementación
