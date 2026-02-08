# Cálculo del Monto de Gestoría - Sistema de Recuperación de Pensiones

## 📋 RESUMEN EJECUTIVO

La gestoría se calcula de **DOS formas diferentes** dependiendo de la duración del contrato:

```
┌─────────────────────────────────────────────────────────────┐
│ Contrato de 14 meses (ESTÁNDAR)                             │
│ → Gestoría = $18,000 (VALOR FIJO)                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Contrato ≠ 14 meses (VARIABLE)                              │
│ → Gestoría = Pago Mensual × Número de Meses                │
│   Donde: Pago Mensual depende de Año y Modalidad           │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. GESTORÍA PARA CONTRATO DE 14 MESES (ESTÁNDAR)

### Regla General
```
SI total_meses = 14 ENTONCES
  GESTORIA = $18,000 (para TODAS las modalidades)
```

### Aplicación por Modalidad

#### MODALIDAD 1: RETOMA
```
Total Meses: 14
Gestoría: $18,000 (fijo)
Quién paga: CLIENTE (100%)
```

#### MODALIDAD 2: FINANCIADO 50%
```
Total Meses: 14
Gestoría: $18,000 (fijo)
Quién paga: GRUPO AVIVIR (100%)
Nota: El cliente NO paga gestoría en esta modalidad
```

#### MODALIDAD 3: FINANCIADO 100%
```
Total Meses: 14
Gestoría: $18,000 (fijo)
Quién paga: GRUPO AVIVIR (100%)
Nota: El cliente NO paga nada
```

### Fórmula en Excel

```excel
// MOD 1. RETOMA (Celda C58)
=IF(B58="GESTORIA", 18000, ...)

// MOD 2. FINANCIADO 50% (Celda H58)
=IF(F58="GESTORIA", 18000, ...)

// MOD 3. FINANCIADO 100% (Celda K58)
=IF(I18=14, 18000, ...)
```

### Justificación del Valor Fijo
- $18,000 es el monto estándar de gestoría
- Se aplica para el contrato más común (14 meses)
- Simplifica el cálculo y la presentación al cliente
- Es el mínimo de meses permitido para recuperar derechos

---

## 2. GESTORÍA PARA CONTRATOS ≠ 14 MESES (VARIABLE)

### Regla General
```
SI total_meses ≠ 14 ENTONCES
  pago_mensual = TABLA_GESTORIA[año_inicio][modalidad]
  GESTORIA = pago_mensual × total_meses
```

### Tabla de Pagos Mensuales de Gestoría

#### Tabla Completa (2023-2026)

```
┌──────┬─────────────────┬─────────────────┬─────────────────┐
│ Año  │ RETOMA          │ FINANCIADO 50%  │ FINANCIADO 100% │
│      │ (Pago/mes)      │ (Pago/mes)      │ (Pago/mes)      │
├──────┼─────────────────┼─────────────────┼─────────────────┤
│ 2023 │ $2,200          │ $1,100          │ $4,400          │
│ 2024 │ $2,400          │ $1,200          │ $4,800          │
│ 2025 │ $2,650          │ $1,325          │ $5,300          │
│ 2026 │ $3,200          │ $1,600          │ $6,400          │
└──────┴─────────────────┴─────────────────┴─────────────────┘
```

#### Proporciones Entre Modalidades

```
FINANCIADO 50% = RETOMA × 0.5 (50%)
FINANCIADO 100% = RETOMA × 2.0 (200%)

Ejemplo 2026:
RETOMA:          $3,200/mes
FINANCIADO 50%:  $1,600/mes (50% de $3,200)
FINANCIADO 100%: $6,400/mes (200% de $3,200)
```

### Incremento Anual

```
┌──────────────┬──────────────┬─────────────────┐
│ Período      │ Incremento   │ Comentario      │
├──────────────┼──────────────┼─────────────────┤
│ 2023 → 2024  │ +9.1%        │ Bajo            │
│ 2024 → 2025  │ +10.4%       │ Medio           │
│ 2025 → 2026  │ +20.8%       │ Alto            │
└──────────────┴──────────────┴─────────────────┘

Promedio: ~13.4% anual
```

### Proyección para 2027 (Estimada)

```
Método: Aplicar incremento promedio del 20.8% (último año conocido)

RETOMA:          $3,200 × 1.208 = $3,866/mes
FINANCIADO 50%:  $1,600 × 1.208 = $1,933/mes
FINANCIADO 100%: $6,400 × 1.208 = $7,731/mes
```

---

## 3. EJEMPLOS DE CÁLCULO

### Ejemplo 1: Contrato Estándar de 14 Meses (2027)

```javascript
Datos:
  Modalidad: RETOMA
  Fecha Inicio: 01-Nov-2025
  Fecha Fin: 01-Ene-2027
  Total Meses: 14

Cálculo:
  IF (total_meses == 14) {
    gestoria = 18000;
  }

Resultado:
  Gestoría = $18,000 ✓
  
Composición del costo total RETOMA:
  Pagos mensuales: $44,550
  Gestoría:        $18,000
  ────────────────────────
  TOTAL:           $62,550
```

### Ejemplo 2: Contrato Largo de 16 Meses (2027)

```javascript
Datos:
  Modalidad: RETOMA
  Fecha Inicio: 01-Nov-2025
  Fecha Fin: 01-Mar-2027
  Total Meses: 16
  Año Inicio: 2025

Cálculo:
  IF (total_meses != 14) {
    // Buscar en tabla
    año = YEAR(fecha_inicio) = 2025
    pago_mensual = TABLA_GESTORIA[2025]['RETOMA'] = 2650
    
    gestoria = pago_mensual × total_meses
    gestoria = 2650 × 16 = 42400
  }

Resultado:
  Gestoría = $42,400 ✓
  
Comparación con estándar:
  Gestoría 14 meses: $18,000
  Gestoría 16 meses: $42,400
  Diferencia: +$24,400 (más del doble)
```

### Ejemplo 3: Contrato Corto de 15 Meses (2026)

```javascript
Datos:
  Modalidad: FINANCIADO 50%
  Fecha Inicio: 01-Oct-2025
  Fecha Fin: 01-Ene-2027
  Total Meses: 15
  Año Inicio: 2025

Cálculo:
  año = YEAR(fecha_inicio) = 2025
  pago_mensual = TABLA_GESTORIA[2025]['FINANCIADO_50'] = 1325
  
  gestoria = 1325 × 15 = 19875

Resultado:
  Gestoría Total: $19,875
  Quién paga: GRUPO AVIVIR (100%)
  Cliente paga: $0 de gestoría ✓
```

### Ejemplo 4: Contrato Muy Largo de 24 Meses (2026)

```javascript
Datos:
  Modalidad: FINANCIADO 100%
  Fecha Inicio: 01-Jan-2026
  Fecha Fin: 01-Ene-2028
  Total Meses: 24
  Año Inicio: 2026

Cálculo:
  año = YEAR(fecha_inicio) = 2026
  pago_mensual = TABLA_GESTORIA[2026]['FINANCIADO_100'] = 6400
  
  gestoria = 6400 × 24 = 153600

Resultado:
  Gestoría Total: $153,600
  Quién paga: GRUPO AVIVIR (100%)
  Cliente paga: $0 de gestoría ✓
  
Nota:
  Este monto es MUY alto comparado con el estándar ($18,000)
  Contrato de 24 meses es poco común y muy costoso
```

---

## 4. REGLAS DE NEGOCIO

### RN-GEST-001: Determinación del Tipo de Cálculo
```
REGLA: El tipo de cálculo depende exclusivamente del total de meses

IF (total_meses == 14) THEN
  tipo_calculo = "FIJO"
  gestoria = 18000
ELSE
  tipo_calculo = "VARIABLE"
  gestoria = calcular_por_tabla(año_inicio, modalidad, total_meses)
END IF
```

### RN-GEST-002: Año de Referencia para Tabla
```
REGLA: Se usa el año de INICIO del contrato, no el de fin

Razón:
  - Los costos se fijan al momento de firmar el contrato
  - El año de inicio determina la tarifa aplicable
  - Evita confusión en contratos que cruzan años

Ejemplo:
  Inicio: 01-Nov-2025
  Fin: 01-Mar-2027
  Año de referencia: 2025 ✓ (no 2027)
```

### RN-GEST-003: Modalidad Determina Pago
```
REGLA: Cada modalidad tiene su propio pago mensual

Relaciones:
  FINANCIADO_50 = RETOMA × 0.5
  FINANCIADO_100 = RETOMA × 2.0

Justificación:
  - FINANCIADO 50%: Cliente paga la mitad, gestoría también la mitad
  - FINANCIADO 100%: Financiamiento total requiere gestión más intensiva
```

### RN-GEST-004: Quién Paga la Gestoría
```
REGLA: La gestoría la paga quien financia

RETOMA:
  - Cliente paga: 100% de pagos + 100% de gestoría
  
FINANCIADO 50%:
  - Cliente paga: 50% de pagos + 0% de gestoría
  - Grupo AVIVIR paga: 50% de pagos + 100% de gestoría
  
FINANCIADO 100%:
  - Cliente paga: 0% de pagos + 0% de gestoría
  - Grupo AVIVIR paga: 100% de pagos + 100% de gestoría
```

### RN-GEST-005: Años No Disponibles en Tabla
```
REGLA: Si el año no está en la tabla, proyectar o usar último año

Para 2027+ (no en tabla):
  OPCIÓN 1: Proyectar con incremento promedio
    año_2027 = año_2026 × 1.208
    
  OPCIÓN 2: Usar último año conocido (conservador)
    año_2027 = año_2026
    
  OPCIÓN 3: Solicitar actualización de tabla
    Contactar administrador
```

---

## 5. VALIDACIONES

### VAL-GEST-001: Validar Total de Meses
```javascript
function validarTotalMeses(totalMeses) {
  // 1. Mínimo 14 meses
  if (totalMeses < 14) {
    return {
      valido: false,
      error: 'El contrato debe ser de al menos 14 meses',
      critico: true
    };
  }
  
  // 2. Máximo razonable 60 meses (5 años)
  if (totalMeses > 60) {
    return {
      valido: true,
      warning: `Contrato muy largo (${totalMeses} meses). Gestoría será muy alta`,
      sugerencia: 'Verifique si es correcto'
    };
  }
  
  return { valido: true };
}
```

### VAL-GEST-002: Validar Año en Tabla
```javascript
function validarAñoEnTabla(año) {
  const AÑOS_DISPONIBLES = [2023, 2024, 2025, 2026];
  
  if (!AÑOS_DISPONIBLES.includes(año)) {
    return {
      valido: false,
      warning: `Año ${año} no está en tabla de gestoría`,
      accion: 'PROYECTAR o USAR_2026',
      critico: false
    };
  }
  
  return { valido: true };
}
```

### VAL-GEST-003: Validar Monto Calculado
```javascript
function validarMontoGestoria(monto, totalMeses) {
  // 1. Monto debe ser positivo
  if (monto <= 0) {
    return {
      valido: false,
      error: 'El monto de gestoría debe ser positivo',
      critico: true
    };
  }
  
  // 2. Rango razonable según duración
  const montoMinEsperado = 18000; // Estándar 14 meses
  const montoMaxEsperado = 200000; // ~30 meses con tarifa alta
  
  if (monto < montoMinEsperado) {
    return {
      valido: true,
      warning: `Gestoría muy baja (${monto}). Verifique cálculo`
    };
  }
  
  if (monto > montoMaxEsperado) {
    return {
      valido: true,
      warning: `Gestoría muy alta ($${monto.toLocaleString()}). Contrato muy largo o error en tabla`,
      sugerencia: 'Revise duración del contrato'
    };
  }
  
  return { valido: true };
}
```

---

## 6. ALGORITMO DE CÁLCULO

### Algoritmo Completo

```javascript
function calcularGestoria(datos) {
  const {
    totalMeses,
    fechaInicio,
    modalidad,
    tablaGestoria
  } = datos;
  
  // ================================================
  // PASO 1: Validar total de meses
  // ================================================
  const valMeses = validarTotalMeses(totalMeses);
  if (!valMeses.valido) {
    throw new Error(valMeses.error);
  }
  
  // ================================================
  // PASO 2: Determinar tipo de cálculo
  // ================================================
  if (totalMeses === 14) {
    // CASO: Contrato estándar → Gestoría fija
    return {
      monto: 18000,
      tipo: 'FIJO',
      detalle: 'Gestoría estándar para contrato de 14 meses',
      pagoMensual: null,
      totalMeses: 14
    };
  }
  
  // ================================================
  // PASO 3: Cálculo variable por tabla
  // ================================================
  
  // 3.1. Extraer año de inicio
  const añoInicio = new Date(fechaInicio).getFullYear();
  
  // 3.2. Validar año en tabla
  const valAño = validarAñoEnTabla(añoInicio);
  if (!valAño.valido) {
    // Proyectar o usar último año
    console.warn(valAño.warning);
    añoInicio = 2026; // Usar último año disponible
  }
  
  // 3.3. Buscar pago mensual en tabla
  let pagoMensual;
  
  if (!tablaGestoria[añoInicio]) {
    throw new Error(`Año ${añoInicio} no encontrado en tabla de gestoría`);
  }
  
  switch(modalidad) {
    case 'RETOMA':
      pagoMensual = tablaGestoria[añoInicio].retoma;
      break;
    case 'FINANCIADO_50':
      pagoMensual = tablaGestoria[añoInicio].financiado50;
      break;
    case 'FINANCIADO_100':
      pagoMensual = tablaGestoria[añoInicio].financiado100;
      break;
    default:
      throw new Error(`Modalidad ${modalidad} no reconocida`);
  }
  
  if (!pagoMensual) {
    throw new Error(`No se encontró pago mensual para ${modalidad} en año ${añoInicio}`);
  }
  
  // 3.4. Calcular gestoría total
  const montoGestoria = pagoMensual * totalMeses;
  
  // ================================================
  // PASO 4: Validar resultado
  // ================================================
  const valMonto = validarMontoGestoria(montoGestoria, totalMeses);
  if (!valMonto.valido) {
    throw new Error(valMonto.error);
  }
  
  // ================================================
  // PASO 5: Retornar resultado
  // ================================================
  return {
    monto: montoGestoria,
    tipo: 'VARIABLE',
    detalle: `${totalMeses} meses × $${pagoMensual.toLocaleString()}/mes`,
    pagoMensual: pagoMensual,
    totalMeses: totalMeses,
    añoReferencia: añoInicio,
    modalidad: modalidad,
    warnings: valMonto.warning ? [valMonto.warning] : []
  };
}
```

### Tabla de Gestoría (Objeto JavaScript)

```javascript
const TABLA_GESTORIA = {
  2023: {
    retoma: 2200,
    financiado50: 1100,
    financiado100: 4400
  },
  2024: {
    retoma: 2400,
    financiado50: 1200,
    financiado100: 4800
  },
  2025: {
    retoma: 2650,
    financiado50: 1325,
    financiado100: 5300
  },
  2026: {
    retoma: 3200,
    financiado50: 1600,
    financiado100: 6400
  }
};

// Función auxiliar para proyectar años futuros
function proyectarAño(añoBase, añoObjetivo) {
  const datos = TABLA_GESTORIA[añoBase];
  const añosDiferencia = añoObjetivo - añoBase;
  
  // Usar incremento promedio del 20.8%
  const factor = Math.pow(1.208, añosDiferencia);
  
  return {
    retoma: Math.round(datos.retoma * factor),
    financiado50: Math.round(datos.financiado50 * factor),
    financiado100: Math.round(datos.financiado100 * factor)
  };
}

// Extender tabla para 2027
TABLA_GESTORIA[2027] = proyectarAño(2026, 2027);
```

---

## 7. IMPLEMENTACIÓN EN REACT

```jsx
import React, { useState, useEffect } from 'react';

const CalculadoraGestoria = ({ contrato }) => {
  const [gestoria, setGestoria] = useState(null);
  
  const TABLA_GESTORIA = {
    2023: { retoma: 2200, financiado50: 1100, financiado100: 4400 },
    2024: { retoma: 2400, financiado50: 1200, financiado100: 4800 },
    2025: { retoma: 2650, financiado50: 1325, financiado100: 5300 },
    2026: { retoma: 3200, financiado50: 1600, financiado100: 6400 }
  };
  
  useEffect(() => {
    if (!contrato?.totalMeses || !contrato?.fechaInicio || !contrato?.modalidad) {
      setGestoria(null);
      return;
    }
    
    const resultado = calcularGestoria({
      totalMeses: contrato.totalMeses,
      fechaInicio: contrato.fechaInicio,
      modalidad: contrato.modalidad,
      tablaGestoria: TABLA_GESTORIA
    });
    
    setGestoria(resultado);
  }, [contrato?.totalMeses, contrato?.fechaInicio, contrato?.modalidad]);
  
  if (!gestoria) {
    return (
      <div className="p-4 bg-gray-100 rounded">
        <p>Complete los datos del contrato para calcular la gestoría</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Gestoría</h3>
      
      {/* Monto principal */}
      <div className="text-3xl font-bold text-green-700 mb-4">
        ${gestoria.monto.toLocaleString('es-MX')}
      </div>
      
      {/* Tipo de cálculo */}
      <div className="mb-4">
        <span className={`px-3 py-1 rounded text-sm font-semibold ${
          gestoria.tipo === 'FIJO' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
        }`}>
          {gestoria.tipo}
        </span>
      </div>
      
      {/* Detalles */}
      <div className="space-y-2 text-sm">
        <p className="text-gray-700">{gestoria.detalle}</p>
        
        {gestoria.tipo === 'VARIABLE' && (
          <>
            <p>
              <span className="font-semibold">Pago mensual:</span>{' '}
              ${gestoria.pagoMensual.toLocaleString('es-MX')}/mes
            </p>
            <p>
              <span className="font-semibold">Total meses:</span>{' '}
              {gestoria.totalMeses}
            </p>
            <p>
              <span className="font-semibold">Año de referencia:</span>{' '}
              {gestoria.añoReferencia}
            </p>
          </>
        )}
        
        {/* Quién paga */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
          <p className="font-semibold text-yellow-900">
            {contrato.modalidad === 'RETOMA' 
              ? '💰 Cliente paga 100% de gestoría'
              : '💰 Grupo AVIVIR paga 100% de gestoría'}
          </p>
        </div>
        
        {/* Advertencias */}
        {gestoria.warnings && gestoria.warnings.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-300 rounded">
            {gestoria.warnings.map((warning, idx) => (
              <p key={idx} className="text-orange-800 text-sm">
                ⚠️ {warning}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculadoraGestoria;
```

---

## 8. CASOS ESPECIALES

### Caso 1: Contrato de 15 Meses (Poco Común)
```
Situación: Cliente necesita 15 meses exactos

Cálculo:
  - NO usa gestoría fija ($18,000)
  - USA tabla variable
  - Año 2025, RETOMA: $2,650/mes × 15 = $39,750
  
Comparación:
  - 14 meses: $18,000
  - 15 meses: $39,750
  - Incremento: +$21,750 (más del doble)
  
Recomendación:
  Si es posible, ajustar a 14 meses para aprovechar tarifa fija
```

### Caso 2: Contrato de 13 Meses (Inválido)
```
Situación: Error de captura o mal cálculo

Validación:
  ERROR: "El contrato debe ser de al menos 14 meses"
  
Acción:
  - Rechazar el cálculo
  - Solicitar corrección de fechas
  - Mostrar mensaje de error bloqueante
```

### Caso 3: Año 2027 No en Tabla
```
Situación: Contrato inicia en 2027 (año futuro)

Solución 1 - Proyectar:
  - Usar incremento del 20.8%
  - 2027 RETOMA: $3,200 × 1.208 = $3,866/mes
  
Solución 2 - Usar 2026:
  - Conservador
  - 2026 RETOMA: $3,200/mes
  
Solución 3 - Actualizar tabla:
  - Contactar administrador
  - Solicitar tarifa oficial 2027
```

---

## RESUMEN DE REGLAS CRÍTICAS

### 🔴 REGLAS BLOQUEANTES
1. Total de meses < 14 → ERROR
2. Modalidad no reconocida → ERROR
3. Año no en tabla Y no proyectable → ERROR

### 🟡 REGLAS DE ADVERTENCIA
1. Total de meses > 60 → WARNING (contrato muy largo)
2. Año no en tabla → WARNING (usar proyección)
3. Gestoría > $200,000 → WARNING (verificar cálculo)

### 🟢 REGLAS INFORMATIVAS
1. Total meses = 14 → Usa tarifa fija ($18,000)
2. Total meses ≠ 14 → Usa tarifa variable (tabla)
3. Quién paga varía por modalidad

---

© 2026 Sistema de Recuperación de Pensiones - Grupo AVIVIR
