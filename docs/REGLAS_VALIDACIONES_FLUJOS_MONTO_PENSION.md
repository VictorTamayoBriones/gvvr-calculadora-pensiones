# Reglas de Negocio, Validaciones y Flujos - MONTO DE PENSIÓN

## 📋 ÍNDICE
1. [Reglas de Negocio](#1-reglas-de-negocio)
2. [Validaciones por Etapa](#2-validaciones-por-etapa)
3. [Flujos del Proceso](#3-flujos-del-proceso)
4. [Dependencias del Sistema](#4-dependencias-del-sistema)
5. [Casos Edge y Excepciones](#5-casos-edge-y-excepciones)
6. [Matriz de Validación](#6-matriz-de-validación)
7. [Manejo de Errores](#7-manejo-de-errores)
8. [Algoritmos de Cálculo](#8-algoritmos-de-cálculo)

---

## 1. REGLAS DE NEGOCIO

### RN-001: Campo de Solo Lectura
```
REGLA: El MONTO DE PENSIÓN es un campo CALCULADO automáticamente
TIPO: Restricción de entrada
PRIORIDAD: CRÍTICA

Descripción:
- El usuario NO puede ingresar el monto manualmente
- El campo se actualiza automáticamente cuando cambian las dependencias
- Cualquier cambio manual debe ser rechazado

Justificación:
- Garantizar consistencia con la tabla oficial de montos
- Evitar errores humanos en la captura
- Mantener trazabilidad del cálculo

Excepciones:
- NINGUNA. No hay casos donde se permita captura manual
```

### RN-002: Dependencia de Datos del Cliente
```
REGLA: Requiere datos completos del cliente para calcular
TIPO: Prerequisito
PRIORIDAD: CRÍTICA

Datos requeridos:
✓ Fecha de nacimiento (obligatorio)
✓ CURP (obligatorio - usado como bandera de validación)

Si falta alguno:
→ El campo quedará VACÍO
→ Mostrar mensaje: "Complete la información del cliente para calcular"

Validación:
if (fechaNacimiento == null || curp == null || curp == "") {
  montoPension = null;
  mostrarAdvertencia("Datos incompletos del cliente");
}
```

### RN-003: Dependencia de Datos del Contrato
```
REGLA: Requiere fechas del contrato para calcular
TIPO: Prerequisito
PRIORIDAD: CRÍTICA

Datos requeridos:
✓ Fecha de inicio del contrato (obligatorio)
✓ Fecha de fin del contrato (obligatorio)

Si falta alguno:
→ El campo quedará VACÍO
→ Mostrar mensaje: "Complete las fechas del contrato para calcular"

Validación:
if (fechaInicio == null || fechaFin == null) {
  montoPension = null;
  mostrarAdvertencia("Fechas del contrato incompletas");
}
```

### RN-004: Edad Mínima para Pensión
```
REGLA: El cliente debe tener al menos 60 años al pensionarse
TIPO: Validación de elegibilidad
PRIORIDAD: BLOQUEANTE

Cálculo:
edad_al_pensionarse = edad_actual + años_adicionales

Condición:
if (edad_al_pensionarse < 60) {
  ERROR CRÍTICO
  mensaje: "Cliente no alcanzará la edad mínima de pensión (60 años)"
  bloqueante: SÍ
}

Razón:
- La ley del IMSS establece 60 años como edad mínima de pensión
- La tabla de montos inicia en 60 años
- No hay pensiones para menores de 60 años en el sistema

Acción recomendada:
→ Aumentar la duración del contrato
→ O esperar más tiempo para iniciar el proceso
```

### RN-005: Edad Máxima en Tabla
```
REGLA: La edad al pensionarse no puede exceder 83 años
TIPO: Validación de rango
PRIORIDAD: ALTA

Condición:
if (edad_al_pensionarse > 83) {
  ADVERTENCIA
  mensaje: "Edad al pensionarse (${edad}) excede el máximo en tabla (83 años)"
  acción: Usar monto de 83 años como fallback
}

Razón:
- La tabla de montos solo llega hasta 83 años
- Edades superiores son extremadamente raras
- Sistema debe manejar el caso gracefully

Soluciones:
1. Usar monto de 83 años (más conservador)
2. Notificar a administrador para extender tabla
3. Solicitar aprobación manual
```

### RN-006: Año Disponible en Tabla
```
REGLA: El año de pensión debe estar en la tabla de montos
TIPO: Validación de disponibilidad
PRIORIDAD: CRÍTICA

Años soportados actualmente: 2024, 2025, 2026, 2027

Condición:
if (año_pension < 2024 || año_pension > 2027) {
  ERROR CRÍTICO
  mensaje: "Año de pensión (${año}) no disponible en tabla de montos"
  bloqueante: SÍ
}

Razón:
- La tabla de montos debe actualizarse anualmente
- Años futuros no tienen montos definidos aún
- Años pasados pueden estar desactualizados

Acción recomendada:
→ Contactar administrador para actualizar tabla
→ Ajustar fechas del contrato si es posible
→ Usar último año disponible con disclaimer
```

### RN-007: Coherencia de Fechas
```
REGLA: La fecha de fin debe ser posterior a la fecha de inicio
TIPO: Validación de lógica temporal
PRIORIDAD: CRÍTICA

Condición:
if (fecha_fin <= fecha_inicio) {
  ERROR CRÍTICO
  mensaje: "Fecha de fin debe ser posterior a fecha de inicio"
  bloqueante: SÍ
}

Razón:
- No se puede calcular años adicionales con fechas invertidas
- Indica error en captura de datos del contrato
- Puede causar resultados negativos o incorrectos

Acción:
→ Corregir fechas del contrato
→ Validar antes de permitir cálculo
```

### RN-008: Precisión de Edad
```
REGLA: La edad se calcula en años completos, no en meses
TIPO: Definición de cálculo
PRIORIDAD: INFORMATIVA

Descripción:
- Se usa diferencia de años, no diferencia exacta
- No se consideran meses o días específicos
- Puede haber diferencia de hasta 11 meses

Ejemplo:
Nacimiento: 15-Nov-1952
Hoy: 06-Feb-2026
Años: 2026 - 1952 = 74 años (pero podría tener 73 si no ha cumplido)

Implementación correcta:
edad = hoy.year - nacimiento.year
if (hoy.month < nacimiento.month) edad--;
if (hoy.month == nacimiento.month && hoy.day < nacimiento.day) edad--;

Nota: El Excel usa DATEDIF que considera mes y día
```

### RN-009: Años Adicionales
```
REGLA: Los años adicionales se calculan por diferencia de años
TIPO: Definición de cálculo
PRIORIDAD: CRÍTICA

Fórmula:
años_adicionales = YEAR(fecha_fin) - YEAR(fecha_inicio)

Ejemplos:
- Inicio: 01-Nov-2025, Fin: 01-Ene-2027 → 2027 - 2025 = 2 años
- Inicio: 01-Dic-2025, Fin: 01-Ene-2026 → 2026 - 2025 = 1 año
- Inicio: 01-Ene-2026, Fin: 31-Dic-2026 → 2026 - 2026 = 0 años

Consideración:
Un contrato de 14 meses puede resultar en:
- 0 años (si no cruza año)
- 1 año (si cruza 1 año)
- 2 años (si cruza 2 años)

Validación:
if (años_adicionales < 0) {
  ERROR: "Fechas del contrato inválidas"
}
```

### RN-010: Uniformidad de Montos a partir de 2025
```
REGLA: Desde 2025, todas las edades reciben el mismo monto
TIPO: Característica del sistema
PRIORIDAD: INFORMATIVA

Detalle:
Años 2023-2024:
- Edades 60-64: Montos diferenciados
- Edades 65+: Monto único ($7,003)

Años 2025+:
- Todas las edades 60-83: Mismo monto
- 2025: $8,400
- 2026: $9,400
- 2027: $10,900

Razón:
- Reforma de pensión mínima garantizada
- Simplifica el sistema a partir de 2025
- Protege a pensionados más jóvenes

Implicación:
La edad ya no afecta el monto desde 2025
Solo el año de pensión determina el monto
```

### RN-011: Incremento Anual de Montos
```
REGLA: Los montos de pensión aumentan cada año
TIPO: Característica del sistema
PRIORIDAD: INFORMATIVA

Histórico de incrementos:
2023 → 2024: +5% a +7%
2024 → 2025: +20% (salto significativo por reforma)
2025 → 2026: +$1,000 (~11.9%)
2026 → 2027: +$1,500 (~15.9%)

Razón:
- Ajuste por inflación
- Reformas de pensión
- Política gubernamental

Implicación:
→ Contratos más largos resultan en pensiones más altas
→ Cliente debe entender el trade-off tiempo vs. monto
→ Tabla debe actualizarse anualmente
```

### RN-012: Texto de Presentación
```
REGLA: El resultado se presenta como texto formateado
TIPO: Formato de salida
PRIORIDAD: MEDIA

Formato:
"MONTO DE PENSIÓN $[monto]"

Donde:
- Monto sin decimales
- Separador de miles con coma
- Símbolo $ de pesos mexicanos

Ejemplos:
✓ "MONTO DE PENSIÓN $10900"
✓ "MONTO DE PENSIÓN $8400"
✗ "MONTO DE PENSIÓN $10,900.00" (con decimales)
✗ "10900" (sin texto descriptivo)

Razón:
- Consistencia con formato del Excel
- Claridad para el usuario
- Facilita lectura del documento
```

---

## 2. VALIDACIONES POR ETAPA

### Etapa 1: Validación de Datos de Entrada

#### VAL-101: Validar Fecha de Nacimiento
```javascript
function validarFechaNacimiento(fechaNac) {
  // Validación 1: No nula
  if (!fechaNac) {
    return {
      valido: false,
      error: "La fecha de nacimiento es obligatoria",
      codigo: "VAL-101-001"
    };
  }
  
  // Validación 2: Formato válido
  const fecha = new Date(fechaNac);
  if (isNaN(fecha.getTime())) {
    return {
      valido: false,
      error: "Formato de fecha de nacimiento inválido",
      codigo: "VAL-101-002"
    };
  }
  
  // Validación 3: No puede ser futura
  const hoy = new Date();
  if (fecha > hoy) {
    return {
      valido: false,
      error: "La fecha de nacimiento no puede ser futura",
      codigo: "VAL-101-003"
    };
  }
  
  // Validación 4: Edad razonable (18-100 años)
  const edad = hoy.getFullYear() - fecha.getFullYear();
  if (edad < 18) {
    return {
      valido: false,
      error: "El cliente debe ser mayor de edad (18 años)",
      codigo: "VAL-101-004"
    };
  }
  
  if (edad > 100) {
    return {
      valido: false,
      error: "Edad no razonable (>100 años). Verifique la fecha",
      codigo: "VAL-101-005"
    };
  }
  
  return { valido: true };
}
```

#### VAL-102: Validar CURP
```javascript
function validarCURP(curp) {
  // Validación 1: No nulo
  if (!curp || curp.trim() === "") {
    return {
      valido: false,
      error: "El CURP es obligatorio para calcular pensión",
      codigo: "VAL-102-001"
    };
  }
  
  // Validación 2: Longitud exacta
  if (curp.length !== 18) {
    return {
      valido: false,
      error: "El CURP debe tener exactamente 18 caracteres",
      codigo: "VAL-102-002"
    };
  }
  
  // Validación 3: Formato válido
  const formatoCURP = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;
  if (!formatoCURP.test(curp)) {
    return {
      valido: false,
      error: "Formato de CURP inválido",
      codigo: "VAL-102-003"
    };
  }
  
  return { valido: true };
}
```

#### VAL-103: Validar Fecha de Inicio del Contrato
```javascript
function validarFechaInicio(fechaInicio) {
  // Validación 1: No nula
  if (!fechaInicio) {
    return {
      valido: false,
      error: "La fecha de inicio del contrato es obligatoria",
      codigo: "VAL-103-001"
    };
  }
  
  // Validación 2: Formato válido
  const fecha = new Date(fechaInicio);
  if (isNaN(fecha.getTime())) {
    return {
      valido: false,
      error: "Formato de fecha de inicio inválido",
      codigo: "VAL-103-002"
    };
  }
  
  // Validación 3: Debe ser día 1 del mes
  if (fecha.getDate() !== 1) {
    return {
      valido: false,
      error: "La fecha de inicio debe ser el día 1 del mes",
      codigo: "VAL-103-003",
      critico: true
    };
  }
  
  // Validación 4: No muy antigua (máx 6 meses antes de hoy)
  const hoy = new Date();
  const mesesAtras = (hoy - fecha) / (1000 * 60 * 60 * 24 * 30);
  if (mesesAtras > 6) {
    return {
      valido: true,
      warning: "La fecha de inicio es más de 6 meses anterior. Verifique si es correcta",
      codigo: "VAL-103-004"
    };
  }
  
  return { valido: true };
}
```

#### VAL-104: Validar Fecha de Fin del Contrato
```javascript
function validarFechaFin(fechaFin, fechaInicio) {
  // Validación 1: No nula
  if (!fechaFin) {
    return {
      valido: false,
      error: "La fecha de fin del contrato es obligatoria",
      codigo: "VAL-104-001"
    };
  }
  
  // Validación 2: Formato válido
  const fecha = new Date(fechaFin);
  if (isNaN(fecha.getTime())) {
    return {
      valido: false,
      error: "Formato de fecha de fin inválido",
      codigo: "VAL-104-002"
    };
  }
  
  // Validación 3: Debe ser día 1 del mes
  if (fecha.getDate() !== 1) {
    return {
      valido: false,
      error: "La fecha de fin debe ser el día 1 del mes",
      codigo: "VAL-104-003",
      critico: true
    };
  }
  
  // Validación 4: Debe ser posterior a fecha de inicio
  if (fechaInicio) {
    const inicio = new Date(fechaInicio);
    if (fecha <= inicio) {
      return {
        valido: false,
        error: "La fecha de fin debe ser posterior a la fecha de inicio",
        codigo: "VAL-104-004",
        critico: true
      };
    }
  }
  
  // Validación 5: No muy lejana (máx 5 años)
  const hoy = new Date();
  const añosDespues = (fecha - hoy) / (1000 * 60 * 60 * 24 * 365);
  if (añosDespues > 5) {
    return {
      valido: true,
      warning: "La fecha de fin es más de 5 años futura. Verifique si es correcta",
      codigo: "VAL-104-005"
    };
  }
  
  return { valido: true };
}
```

### Etapa 2: Validación de Cálculos Intermedios

#### VAL-201: Validar Edad Actual
```javascript
function validarEdadActual(fechaNacimiento) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = nacimiento.getMonth();
  
  // Ajustar si no ha cumplido años este año
  if (mesActual < mesNacimiento || 
      (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  // Validación 1: Edad mínima para pensión (50 años)
  if (edad < 50) {
    return {
      valido: false,
      error: "El cliente debe tener al menos 50 años para iniciar proceso de pensión",
      codigo: "VAL-201-001",
      edad: edad
    };
  }
  
  // Validación 2: Edad muy avanzada (>85 años)
  if (edad > 85) {
    return {
      valido: true,
      warning: "Cliente tiene edad muy avanzada. Verifique datos",
      codigo: "VAL-201-002",
      edad: edad
    };
  }
  
  return { 
    valido: true, 
    edad: edad 
  };
}
```

#### VAL-202: Validar Años Adicionales
```javascript
function validarAñosAdicionales(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  
  const añosAdicionales = fin.getFullYear() - inicio.getFullYear();
  
  // Validación 1: No puede ser negativo
  if (añosAdicionales < 0) {
    return {
      valido: false,
      error: "Años adicionales no pueden ser negativos. Verifique fechas del contrato",
      codigo: "VAL-202-001",
      añosAdicionales: añosAdicionales
    };
  }
  
  // Validación 2: Mínimo razonable (al menos 1 año)
  if (añosAdicionales < 1) {
    return {
      valido: true,
      warning: "Contrato muy corto (menos de 1 año). Verifique si es suficiente",
      codigo: "VAL-202-002",
      añosAdicionales: añosAdicionales
    };
  }
  
  // Validación 3: Máximo razonable (no más de 10 años)
  if (añosAdicionales > 10) {
    return {
      valido: true,
      warning: "Contrato muy largo (>10 años). Verifique si es correcto",
      codigo: "VAL-202-003",
      añosAdicionales: añosAdicionales
    };
  }
  
  return { 
    valido: true, 
    añosAdicionales: añosAdicionales 
  };
}
```

#### VAL-203: Validar Edad al Pensionarse
```javascript
function validarEdadAlPensionarse(edadActual, añosAdicionales) {
  const edadPension = edadActual + añosAdicionales;
  
  // Validación 1: Edad mínima de pensión (60 años) - BLOQUEANTE
  if (edadPension < 60) {
    return {
      valido: false,
      error: `Con ${edadPension} años al pensionarse, NO alcanza la edad mínima de 60 años`,
      codigo: "VAL-203-001",
      critico: true,
      bloqueante: true,
      edadPension: edadPension,
      faltante: 60 - edadPension
    };
  }
  
  // Validación 2: Edad máxima en tabla (83 años)
  if (edadPension > 83) {
    return {
      valido: true,
      warning: `Edad al pensionarse (${edadPension}) excede el máximo en tabla (83 años). Se usará monto de 83 años`,
      codigo: "VAL-203-002",
      edadPension: edadPension,
      edadAjustada: 83
    };
  }
  
  // Validación 3: Edad ideal (65-75 años)
  if (edadPension >= 65 && edadPension <= 75) {
    return {
      valido: true,
      info: "Edad de pensión en rango ideal (65-75 años)",
      codigo: "VAL-203-003",
      edadPension: edadPension
    };
  }
  
  return { 
    valido: true, 
    edadPension: edadPension 
  };
}
```

#### VAL-204: Validar Año de Pensión
```javascript
function validarAñoPension(fechaFin, tablaDisponible) {
  const año = new Date(fechaFin).getFullYear();
  
  // Validación 1: Año debe estar en tabla - BLOQUEANTE
  if (!tablaDisponible[año]) {
    const añosDisponibles = Object.keys(tablaDisponible).join(", ");
    return {
      valido: false,
      error: `Año de pensión (${año}) no disponible en tabla. Años disponibles: ${añosDisponibles}`,
      codigo: "VAL-204-001",
      critico: true,
      bloqueante: true,
      año: año,
      añosDisponibles: añosDisponibles
    };
  }
  
  // Validación 2: Año no muy lejano
  const hoy = new Date();
  const añosDiferencia = año - hoy.getFullYear();
  
  if (añosDiferencia > 5) {
    return {
      valido: true,
      warning: `Año de pensión (${año}) es muy lejano (${añosDiferencia} años). Los montos pueden cambiar`,
      codigo: "VAL-204-002",
      año: año
    };
  }
  
  return { 
    valido: true, 
    año: año 
  };
}
```

### Etapa 3: Validación de Resultado

#### VAL-301: Validar Monto Obtenido
```javascript
function validarMontoObtenido(monto, edad, año) {
  // Validación 1: Monto no nulo
  if (monto === null || monto === undefined) {
    return {
      valido: false,
      error: `No se encontró monto en tabla para edad ${edad} y año ${año}`,
      codigo: "VAL-301-001",
      critico: true
    };
  }
  
  // Validación 2: Monto positivo
  if (monto <= 0) {
    return {
      valido: false,
      error: `Monto inválido (${monto}). Debe ser positivo`,
      codigo: "VAL-301-002",
      critico: true
    };
  }
  
  // Validación 3: Monto en rango razonable ($4,000 - $20,000)
  if (monto < 4000) {
    return {
      valido: true,
      warning: `Monto muy bajo (${monto}). Verifique tabla de pensiones`,
      codigo: "VAL-301-003"
    };
  }
  
  if (monto > 20000) {
    return {
      valido: true,
      warning: `Monto muy alto (${monto}). Verifique tabla de pensiones`,
      codigo: "VAL-301-004"
    };
  }
  
  return { 
    valido: true, 
    monto: monto 
  };
}
```

#### VAL-302: Validar Coherencia con Año
```javascript
function validarCoherenciaConAño(monto, año) {
  // Montos esperados por año (aproximados)
  const rangosEsperados = {
    2023: { min: 4500, max: 7500 },
    2024: { min: 5000, max: 8000 },
    2025: { min: 8000, max: 9000 },
    2026: { min: 9000, max: 10000 },
    2027: { min: 10000, max: 11500 }
  };
  
  const rango = rangosEsperados[año];
  
  if (!rango) {
    return { valido: true }; // No hay rango definido
  }
  
  if (monto < rango.min || monto > rango.max) {
    return {
      valido: true,
      warning: `Monto $${monto} fuera del rango esperado para ${año} ($${rango.min}-$${rango.max})`,
      codigo: "VAL-302-001"
    };
  }
  
  return { valido: true };
}
```

---

## 3. FLUJOS DEL PROCESO

### Flujo Principal: Cálculo Exitoso

```
┌─────────────────────────────────────────────────────────────┐
│                    INICIO: Calcular Monto                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: Validar Datos de Entrada                            │
│ - Fecha de nacimiento                                        │
│ - CURP                                                       │
│ - Fecha inicio contrato                                      │
│ - Fecha fin contrato                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ¿Válidos? ────NO──> [Error: Datos incompletos]
                         │                      │
                        SÍ                      ▼
                         │                  [TERMINA]
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 2: Calcular Edad Actual                                │
│ edad_actual = AÑOS(fecha_nacimiento, HOY)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                ¿Edad >= 50? ────NO──> [Error: Muy joven]
                         │                      │
                        SÍ                      ▼
                         │                  [TERMINA]
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 3: Calcular Años Adicionales                           │
│ años_adicionales = AÑO(fecha_fin) - AÑO(fecha_inicio)      │
└────────────────────────┬────────────────────────────────────┘
                         │
            ¿Años >= 0? ────NO──> [Error: Fechas inválidas]
                         │                      │
                        SÍ                      ▼
                         │                  [TERMINA]
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 4: Calcular Edad al Pensionarse                        │
│ edad_pension = edad_actual + años_adicionales               │
└────────────────────────┬────────────────────────────────────┘
                         │
            ¿Edad >= 60? ────NO──> [Error: No alcanza edad mínima]
                         │                      │
                        SÍ                      ▼
                         │                  [TERMINA]
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 5: Determinar Año de Pensión                           │
│ año_pension = AÑO(fecha_fin)                                │
└────────────────────────┬────────────────────────────────────┘
                         │
       ¿Año en tabla? ────NO──> [Error: Año no disponible]
                         │                      │
                        SÍ                      ▼
                         │                  [TERMINA]
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 6: Buscar Monto en Tabla                               │
│ monto = TABLA[año_pension][edad_pension]                    │
└────────────────────────┬────────────────────────────────────┘
                         │
        ¿Encontrado? ────NO──> [Error: Monto no encontrado]
                         │                      │
                        SÍ                      ▼
                         │                  [TERMINA]
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 7: Formatear Resultado                                 │
│ texto = "MONTO DE PENSIÓN $" + monto.toLocaleString()      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 8: Mostrar Resultado                                   │
│ - Monto calculado                                            │
│ - Detalles del cálculo                                       │
│ - Información adicional                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                    [FIN EXITOSO]
```

### Flujo Alternativo 1: Datos Incompletos

```
INICIO
  │
  ▼
¿Tiene CURP? ──NO─> Mostrar: "Complete CURP del cliente"
  │                         │
 SÍ                        ▼
  │                    [TERMINA]
  ▼
¿Tiene Fecha Nacimiento? ──NO─> Mostrar: "Complete fecha de nacimiento"
  │                                      │
 SÍ                                     ▼
  │                                [TERMINA]
  ▼
¿Tiene Fecha Inicio? ──NO─> Mostrar: "Complete fecha de inicio del contrato"
  │                                  │
 SÍ                                 ▼
  │                            [TERMINA]
  ▼
¿Tiene Fecha Fin? ──NO─> Mostrar: "Complete fecha de fin del contrato"
  │                                │
 SÍ                               ▼
  │                          [TERMINA]
  ▼
Continuar con cálculo normal...
```

### Flujo Alternativo 2: Edad Insuficiente

```
INICIO: Calcular edad al pensionarse
  │
  ▼
edad_actual = 55 años
años_adicionales = 3 años
  │
  ▼
edad_pension = 55 + 3 = 58 años
  │
  ▼
¿58 >= 60? ──NO──> ERROR BLOQUEANTE
                       │
                       ▼
                   Mostrar mensaje:
                   "Con 58 años al pensionarse, NO alcanza
                    la edad mínima de 60 años.
                    Faltan 2 años."
                       │
                       ▼
                   Sugerencias:
                   1. Aumentar duración del contrato
                   2. Esperar más tiempo para iniciar
                       │
                       ▼
                   [TERMINA SIN RESULTADO]
```

### Flujo Alternativo 3: Año No Disponible

```
INICIO: Determinar año de pensión
  │
  ▼
fecha_fin = 2029-01-01
  │
  ▼
año_pension = 2029
  │
  ▼
¿2029 en tabla? ──NO──> ERROR BLOQUEANTE
                            │
                            ▼
                        Mostrar mensaje:
                        "Año de pensión (2029) no disponible
                         en tabla de montos.
                         Años disponibles: 2024-2027"
                            │
                            ▼
                        Opciones:
                        1. Ajustar fechas del contrato
                        2. Contactar administrador para actualizar tabla
                        3. Usar estimación del último año disponible
                            │
                            ▼
                        [TERMINA SIN RESULTADO]
```

### Flujo Alternativo 4: Usar Fallback para Edad Alta

```
INICIO: Calcular edad al pensionarse
  │
  ▼
edad_actual = 75 años
años_adicionales = 12 años
  │
  ▼
edad_pension = 75 + 12 = 87 años
  │
  ▼
¿87 <= 83? ──NO──> ADVERTENCIA
                       │
                       ▼
                   Mostrar mensaje:
                   "Edad al pensionarse (87) excede
                    el máximo en tabla (83 años).
                    Se usará monto de 83 años como fallback."
                       │
                       ▼
                   edad_ajustada = 83
                       │
                       ▼
                   Buscar monto con edad_ajustada
                       │
                       ▼
                   Mostrar resultado con disclaimer
                       │
                       ▼
                   [FIN CON ADVERTENCIA]
```

---

## 4. DEPENDENCIAS DEL SISTEMA

### Dependencias de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                 MONTO DE PENSIÓN                             │
│               (Campo Calculado)                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ DATOS        │ │ DATOS    │ │ TABLA DE     │
│ CLIENTE      │ │ CONTRATO │ │ PENSIONES    │
└──────┬───────┘ └────┬─────┘ └──────┬───────┘
       │              │              │
       │              │              │
       ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│- Fecha Nac.  │ │- F. Inicio│ │- Edad → Monto│
│- CURP        │ │- F. Fin   │ │- Año → Monto │
└──────────────┘ └──────────┘ └──────────────┘
```

### Matriz de Dependencias

| Campo Calculado | Depende de | Tipo Dependencia | Criticidad |
|-----------------|-----------|------------------|------------|
| Edad Actual | Fecha Nacimiento | Directa | CRÍTICA |
| Años Adicionales | Fecha Inicio, Fecha Fin | Directa | CRÍTICA |
| Edad al Pensionarse | Edad Actual, Años Adicionales | Calculada | CRÍTICA |
| Año de Pensión | Fecha Fin | Directa | CRÍTICA |
| Monto | Edad Pensión, Año Pensión, Tabla | Lookup | CRÍTICA |

### Orden de Cálculo (Secuencia Obligatoria)

```
1. Edad Actual
   └─> Requiere: Fecha Nacimiento
   
2. Años Adicionales
   └─> Requiere: Fecha Inicio, Fecha Fin
   
3. Edad al Pensionarse
   └─> Requiere: Edad Actual (#1), Años Adicionales (#2)
   
4. Año de Pensión
   └─> Requiere: Fecha Fin
   
5. Buscar Monto
   └─> Requiere: Edad al Pensionarse (#3), Año Pensión (#4), Tabla
   
6. Formatear Resultado
   └─> Requiere: Monto (#5)
```

---

## 5. CASOS EDGE Y EXCEPCIONES

### EDGE-001: Cliente Cumple Años Durante el Contrato

```
Escenario:
- Fecha Nacimiento: 15-Nov-1960
- Edad al iniciar: 65 años (si inicia en Oct-2025)
- Fecha Inicio: 01-Nov-2025
- Fecha Fin: 01-Ene-2027
- ¿Edad al pensionarse?

Análisis:
- Años adicionales: 2027 - 2025 = 2 años
- Edad calculada: 65 + 2 = 67 años

Consideración:
El cálculo NO considera que cumplirá 66 durante el contrato.
Solo usa la diferencia de años calendario.

Resultado: 67 años (correcto según la lógica del sistema)
```

### EDGE-002: Contrato que No Cruza Año

```
Escenario:
- Fecha Inicio: 01-Feb-2025
- Fecha Fin: 01-Nov-2025
- Total meses: 9 meses

Análisis:
- Años adicionales: 2025 - 2025 = 0 años
- Edad al pensionarse: edad_actual + 0

Problema:
- Contrato de 9 meses no agrega años a la edad
- Puede parecer que no hubo avance

Solución:
- Validar que años_adicionales >= 1
- Advertir si el contrato no cruza año completo
- Considerar usar cálculo por meses si es necesario
```

### EDGE-003: Fecha de Fin en Diciembre

```
Escenario:
- Fecha Inicio: 01-Ene-2026
- Fecha Fin: 01-Dic-2026
- Total meses: 11 meses

Análisis:
- Años adicionales: 2026 - 2026 = 0 años
- Año de pensión: 2026

Consideración:
- Aunque termina en diciembre, NO cruza a 2027
- El año de pensión es 2026
- Puede afectar el monto significativamente

Diferencia:
- Si termina en Dic-2026: Monto 2026 = $9,400
- Si termina en Ene-2027: Monto 2027 = $10,900
- Diferencia: $1,500/mes

Recomendación:
- Extender 1 mes más para cruzar año si conviene
```

### EDGE-004: Cliente Muy Joven (< 60 al pensionarse)

```
Escenario:
- Edad actual: 58 años
- Contrato: 1 año
- Edad al pensionarse: 59 años

Resultado:
ERROR BLOQUEANTE
"Con 59 años al pensionarse, NO alcanza la edad mínima de 60 años"

Soluciones:
1. Aumentar contrato a 2 años → 60 años ✓
2. Esperar 1 año más para iniciar → 59+1=60 ✓
3. Combinar: Esperar + contrato corto

Código:
if (edad_pension < 60) {
  const añosFaltantes = 60 - edad_pension;
  const mensaje = `Necesita ${añosFaltantes} año(s) adicional(es)`;
  return { error: mensaje, bloqueante: true };
}
```

### EDGE-005: Cliente Muy Mayor (> 83 al pensionarse)

```
Escenario:
- Edad actual: 78 años
- Contrato: 8 años
- Edad al pensionarse: 86 años

Resultado:
ADVERTENCIA (No bloqueante)
"Edad (86) excede máximo en tabla (83). Se usará monto de 83 años"

Acción del Sistema:
- Usar edad_ajustada = 83
- Buscar monto para 83 años
- Mostrar disclaimer

Código:
if (edad_pension > 83) {
  edad_ajustada = 83;
  mostrarAdvertencia("Usando monto de edad máxima (83 años)");
}
```

### EDGE-006: Año 2028 o Posterior (No en Tabla)

```
Escenario:
- Fecha Fin: 01-Ene-2028
- Año de pensión: 2028

Resultado:
ERROR BLOQUEANTE
"Año de pensión (2028) no disponible en tabla"

Soluciones:
1. Actualizar tabla con montos 2028
2. Ajustar contrato para terminar en 2027
3. Usar estimación:
   - Proyectar incremento: 2027 + 15% = $12,535
   - Con disclaimer de que es estimativo

Código:
if (!TABLA_PENSIONES[año]) {
  if (año === 2028) {
    // Proyección
    const monto2027 = TABLA_PENSIONES[2027][edad];
    const montoEstimado = Math.round(monto2027 * 1.15);
    return {
      monto: montoEstimado,
      estimado: true,
      disclaimer: "Monto estimado con incremento del 15%"
    };
  }
  return { error: "Año no disponible", bloqueante: true };
}
```

### EDGE-007: Nacimiento el 29 de Febrero (Año Bisiesto)

```
Escenario:
- Fecha Nacimiento: 29-Feb-2000
- Cálculo de edad en año no bisiesto

Consideración:
- En años no bisiestos, cumple el 28-Feb o 01-Mar?
- JavaScript considera 28-Feb

Código Robusto:
function calcularEdad(fechaNac) {
  const hoy = new Date();
  const nac = new Date(fechaNac);
  
  let edad = hoy.getFullYear() - nac.getFullYear();
  const mesNac = nac.getMonth();
  const diaNac = nac.getDate();
  
  // Si no ha llegado su cumpleaños este año
  if (hoy.getMonth() < mesNac) {
    edad--;
  } else if (hoy.getMonth() === mesNac && hoy.getDate() < diaNac) {
    edad--;
  }
  
  return edad;
}
```

### EDGE-008: Cambio de Horario de Verano

```
Escenario:
- Cálculo entre fechas que cruzan cambio de horario

Consideración:
- JavaScript maneja automáticamente
- Usar solo fechas (sin horas) para evitar problemas

Código Seguro:
// Normalizar a medianoche
const fecha = new Date(fechaString);
fecha.setHours(0, 0, 0, 0);

// O mejor: usar solo año-mes-día
const año = fecha.getFullYear();
const mes = fecha.getMonth();
const dia = fecha.getDate();
```

### EDGE-009: Tabla con Valores Nulos o Indefinidos

```
Escenario:
- Buscar edad 70, año 2026
- Valor en tabla es null o undefined

Código Defensivo:
function buscarMonto(edad, año) {
  if (!TABLA_PENSIONES[año]) {
    throw new Error(`Año ${año} no existe en tabla`);
  }
  
  const monto = TABLA_PENSIONES[año][edad];
  
  if (monto === null || monto === undefined || monto === 0) {
    throw new Error(`Monto no definido para edad ${edad}, año ${año}`);
  }
  
  if (typeof monto !== 'number' || isNaN(monto)) {
    throw new Error(`Monto inválido: ${monto}`);
  }
  
  return monto;
}
```

### EDGE-010: Múltiples Cálculos Concurrentes

```
Escenario:
- Usuario cambia fecha de nacimiento
- Sistema calcula edad
- Usuario cambia fecha de fin
- Sistema recalcula
- Ambos cálculos se ejecutan al mismo tiempo

Solución: Debounce o cancelación de cálculos previos

Código con Debounce:
let timeoutId;

function calcularConDebounce(datos) {
  clearTimeout(timeoutId);
  
  timeoutId = setTimeout(() => {
    const resultado = calcularMontoPension(datos);
    mostrarResultado(resultado);
  }, 300); // Esperar 300ms de inactividad
}
```

---

## 6. MATRIZ DE VALIDACIÓN

### Matriz Completa de Validaciones

| ID | Validación | Tipo | Momento | Bloqueante | Acción en Error |
|----|-----------|------|---------|------------|-----------------|
| VAL-101-001 | Fecha nac. no nula | Datos | Entrada | SÍ | Mostrar error |
| VAL-101-002 | Fecha nac. válida | Datos | Entrada | SÍ | Mostrar error |
| VAL-101-003 | Fecha nac. no futura | Datos | Entrada | SÍ | Mostrar error |
| VAL-101-004 | Edad >= 18 años | Datos | Entrada | SÍ | Mostrar error |
| VAL-101-005 | Edad <= 100 años | Datos | Entrada | SÍ | Mostrar error |
| VAL-102-001 | CURP no nulo | Datos | Entrada | SÍ | Mostrar error |
| VAL-102-002 | CURP 18 chars | Datos | Entrada | SÍ | Mostrar error |
| VAL-102-003 | Formato CURP | Datos | Entrada | SÍ | Mostrar error |
| VAL-103-001 | Fecha inicio no nula | Datos | Entrada | SÍ | Mostrar error |
| VAL-103-002 | Fecha inicio válida | Datos | Entrada | SÍ | Mostrar error |
| VAL-103-003 | Fecha inicio día 1 | Datos | Entrada | SÍ | Mostrar error |
| VAL-103-004 | Fecha inicio razonable | Datos | Entrada | NO | Mostrar warning |
| VAL-104-001 | Fecha fin no nula | Datos | Entrada | SÍ | Mostrar error |
| VAL-104-002 | Fecha fin válida | Datos | Entrada | SÍ | Mostrar error |
| VAL-104-003 | Fecha fin día 1 | Datos | Entrada | SÍ | Mostrar error |
| VAL-104-004 | Fecha fin > inicio | Datos | Entrada | SÍ | Mostrar error |
| VAL-104-005 | Fecha fin razonable | Datos | Entrada | NO | Mostrar warning |
| VAL-201-001 | Edad actual >= 50 | Cálculo | Intermedio | SÍ | Mostrar error |
| VAL-201-002 | Edad actual <= 85 | Cálculo | Intermedio | NO | Mostrar warning |
| VAL-202-001 | Años adic. >= 0 | Cálculo | Intermedio | SÍ | Mostrar error |
| VAL-202-002 | Años adic. >= 1 | Cálculo | Intermedio | NO | Mostrar warning |
| VAL-202-003 | Años adic. <= 10 | Cálculo | Intermedio | NO | Mostrar warning |
| VAL-203-001 | Edad pensión >= 60 | Cálculo | Intermedio | SÍ | Mostrar error + sugerencias |
| VAL-203-002 | Edad pensión <= 83 | Cálculo | Intermedio | NO | Usar fallback + warning |
| VAL-203-003 | Edad ideal 65-75 | Cálculo | Intermedio | NO | Mostrar info |
| VAL-204-001 | Año en tabla | Cálculo | Intermedio | SÍ | Mostrar error + opciones |
| VAL-204-002 | Año no muy lejano | Cálculo | Intermedio | NO | Mostrar warning |
| VAL-301-001 | Monto no nulo | Resultado | Final | SÍ | Mostrar error |
| VAL-301-002 | Monto > 0 | Resultado | Final | SÍ | Mostrar error |
| VAL-301-003 | Monto >= 4000 | Resultado | Final | NO | Mostrar warning |
| VAL-301-004 | Monto <= 20000 | Resultado | Final | NO | Mostrar warning |
| VAL-302-001 | Monto en rango/año | Resultado | Final | NO | Mostrar warning |

---

## 7. MANEJO DE ERRORES

### Estrategia de Manejo de Errores

```javascript
class ErrorCalculoPension extends Error {
  constructor(codigo, mensaje, datos = {}) {
    super(mensaje);
    this.codigo = codigo;
    this.datos = datos;
    this.timestamp = new Date();
  }
}

// Tipos de errores
const TiposError = {
  DATOS_INCOMPLETOS: 'DATOS_INCOMPLETOS',
  VALIDACION_FALLIDA: 'VALIDACION_FALLIDA',
  EDAD_INSUFICIENTE: 'EDAD_INSUFICIENTE',
  AÑO_NO_DISPONIBLE: 'AÑO_NO_DISPONIBLE',
  MONTO_NO_ENCONTRADO: 'MONTO_NO_ENCONTRADO',
  CALCULO_FALLIDO: 'CALCULO_FALLIDO'
};
```

### Estructura de Respuesta de Error

```javascript
{
  success: false,
  error: {
    codigo: "VAL-203-001",
    tipo: "EDAD_INSUFICIENTE",
    mensaje: "Con 58 años al pensionarse, NO alcanza la edad mínima de 60 años",
    detalles: {
      edadActual: 56,
      añosAdicionales: 2,
      edadAlPensionarse: 58,
      edadMinima: 60,
      faltante: 2
    },
    sugerencias: [
      "Aumentar la duración del contrato en 2 años",
      "Esperar 2 años más antes de iniciar el proceso"
    ],
    bloqueante: true,
    timestamp: "2026-02-06T19:45:00.000Z"
  }
}
```

### Niveles de Severidad

```javascript
const NivelesError = {
  BLOQUEANTE: {
    nivel: 1,
    color: 'red',
    icono: '🚫',
    accion: 'Detener proceso',
    ejemplos: [
      'Edad insuficiente',
      'Año no disponible',
      'Datos obligatorios faltantes'
    ]
  },
  CRITICO: {
    nivel: 2,
    color: 'orange',
    icono: '⚠️',
    accion: 'Advertir fuertemente',
    ejemplos: [
      'Edad muy alta (usar fallback)',
      'Fecha muy lejana',
      'Monto fuera de rango esperado'
    ]
  },
  ADVERTENCIA: {
    nivel: 3,
    color: 'yellow',
    icono: '⚡',
    accion: 'Informar al usuario',
    ejemplos: [
      'Contrato muy corto',
      'Contrato muy largo',
      'Fecha retroactiva'
    ]
  },
  INFO: {
    nivel: 4,
    color: 'blue',
    icono: 'ℹ️',
    accion: 'Mostrar información',
    ejemplos: [
      'Edad en rango ideal',
      'Monto calculado correctamente',
      'Proceso completado'
    ]
  }
};
```

### Función de Manejo de Errores

```javascript
function manejarError(error) {
  const { codigo, tipo, mensaje, detalles, bloqueante } = error;
  
  // Log del error
  console.error(`[${codigo}] ${tipo}: ${mensaje}`, detalles);
  
  // Determinar acción según tipo
  switch(tipo) {
    case TiposError.DATOS_INCOMPLETOS:
      return {
        mostrar: 'modal',
        titulo: 'Datos Incompletos',
        mensaje: mensaje,
        icono: 'warning',
        acciones: [
          { texto: 'Completar Datos', accion: 'volver_formulario' }
        ]
      };
      
    case TiposError.EDAD_INSUFICIENTE:
      return {
        mostrar: 'modal',
        titulo: 'Edad Insuficiente para Pensión',
        mensaje: mensaje,
        icono: 'error',
        detalles: [
          `Edad actual: ${detalles.edadActual} años`,
          `Edad al pensionarse: ${detalles.edadAlPensionarse} años`,
          `Edad mínima requerida: ${detalles.edadMinima} años`,
          `Faltan: ${detalles.faltante} año(s)`
        ],
        sugerencias: detalles.sugerencias,
        acciones: [
          { texto: 'Ajustar Contrato', accion: 'abrir_editor_contrato' },
          { texto: 'Cancelar', accion: 'cerrar' }
        ]
      };
      
    case TiposError.AÑO_NO_DISPONIBLE:
      return {
        mostrar: 'modal',
        titulo: 'Año de Pensión No Disponible',
        mensaje: mensaje,
        icono: 'error',
        detalles: [
          `Año de pensión: ${detalles.añoPension}`,
          `Años disponibles: ${detalles.añosDisponibles}`
        ],
        acciones: [
          { texto: 'Ajustar Fechas', accion: 'abrir_editor_fechas' },
          { texto: 'Contactar Soporte', accion: 'contactar_soporte' },
          { texto: 'Cancelar', accion: 'cerrar' }
        ]
      };
      
    case TiposError.MONTO_NO_ENCONTRADO:
      return {
        mostrar: 'toast',
        tipo: 'error',
        mensaje: 'No se pudo calcular el monto. Verifique los datos.',
        duracion: 5000
      };
      
    default:
      return {
        mostrar: 'toast',
        tipo: 'error',
        mensaje: 'Error al calcular monto de pensión',
        duracion: 3000
      };
  }
}
```

---

## 8. ALGORITMOS DE CÁLCULO

### Algoritmo Principal Completo

```javascript
/**
 * Calcula el monto de pensión mensual estimado
 * @param {Object} cliente - Datos del cliente
 * @param {Object} contrato - Datos del contrato
 * @returns {Object} Resultado del cálculo o error
 */
function calcularMontoPension(cliente, contrato) {
  try {
    // ================================================
    // FASE 1: VALIDACIÓN DE DATOS DE ENTRADA
    // ================================================
    
    const validaciones = {
      fechaNacimiento: validarFechaNacimiento(cliente.fechaNacimiento),
      curp: validarCURP(cliente.curp),
      fechaInicio: validarFechaInicio(contrato.fechaInicio),
      fechaFin: validarFechaFin(contrato.fechaFin, contrato.fechaInicio)
    };
    
    // Verificar si hay errores bloqueantes
    const erroresBloqueantes = Object.entries(validaciones)
      .filter(([campo, resultado]) => !resultado.valido)
      .map(([campo, resultado]) => ({
        campo,
        error: resultado.error,
        codigo: resultado.codigo
      }));
    
    if (erroresBloqueantes.length > 0) {
      return {
        success: false,
        error: {
          tipo: TiposError.VALIDACION_FALLIDA,
          mensaje: 'Errores en los datos de entrada',
          errores: erroresBloqueantes,
          bloqueante: true
        }
      };
    }
    
    // ================================================
    // FASE 2: CÁLCULO DE EDAD ACTUAL
    // ================================================
    
    const validacionEdad = validarEdadActual(cliente.fechaNacimiento);
    
    if (!validacionEdad.valido) {
      throw new ErrorCalculoPension(
        validacionEdad.codigo,
        validacionEdad.error,
        { edad: validacionEdad.edad }
      );
    }
    
    const edadActual = validacionEdad.edad;
    
    // ================================================
    // FASE 3: CÁLCULO DE AÑOS ADICIONALES
    // ================================================
    
    const validacionAños = validarAñosAdicionales(
      contrato.fechaInicio,
      contrato.fechaFin
    );
    
    if (!validacionAños.valido) {
      throw new ErrorCalculoPension(
        validacionAños.codigo,
        validacionAños.error,
        { añosAdicionales: validacionAños.añosAdicionales }
      );
    }
    
    const añosAdicionales = validacionAños.añosAdicionales;
    
    // ================================================
    // FASE 4: CÁLCULO DE EDAD AL PENSIONARSE
    // ================================================
    
    const edadPension = edadActual + añosAdicionales;
    
    const validacionEdadPension = validarEdadAlPensionarse(
      edadActual,
      añosAdicionales
    );
    
    if (!validacionEdadPension.valido) {
      throw new ErrorCalculoPension(
        validacionEdadPension.codigo,
        validacionEdadPension.error,
        {
          edadActual,
          añosAdicionales,
          edadPension: validacionEdadPension.edadPension,
          faltante: validacionEdadPension.faltante
        }
      );
    }
    
    // Ajustar edad si excede máximo (fallback)
    const edadParaBusqueda = validacionEdadPension.edadAjustada || edadPension;
    const usaFallback = validacionEdadPension.edadAjustada !== undefined;
    
    // ================================================
    // FASE 5: DETERMINAR AÑO DE PENSIÓN
    // ================================================
    
    const añoPension = new Date(contrato.fechaFin).getFullYear();
    
    const validacionAño = validarAñoPension(
      contrato.fechaFin,
      TABLA_PENSIONES
    );
    
    if (!validacionAño.valido) {
      throw new ErrorCalculoPension(
        validacionAño.codigo,
        validacionAño.error,
        {
          añoPension: validacionAño.año,
          añosDisponibles: validacionAño.añosDisponibles
        }
      );
    }
    
    // ================================================
    // FASE 6: BUSCAR MONTO EN TABLA
    // ================================================
    
    let monto;
    try {
      monto = buscarMontoPension(edadParaBusqueda, añoPension);
    } catch (error) {
      throw new ErrorCalculoPension(
        'VAL-301-001',
        `No se encontró monto para edad ${edadParaBusqueda} y año ${añoPension}`,
        { edad: edadParaBusqueda, año: añoPension }
      );
    }
    
    const validacionMonto = validarMontoObtenido(
      monto,
      edadParaBusqueda,
      añoPension
    );
    
    if (!validacionMonto.valido) {
      throw new ErrorCalculoPension(
        validacionMonto.codigo,
        validacionMonto.error,
        { monto }
      );
    }
    
    // Validar coherencia con año
    const validacionCoherencia = validarCoherenciaConAño(monto, añoPension);
    
    // ================================================
    // FASE 7: CONSTRUIR RESULTADO
    // ================================================
    
    const resultado = {
      success: true,
      datos: {
        // Datos de entrada
        cliente: {
          fechaNacimiento: cliente.fechaNacimiento,
          curp: cliente.curp
        },
        contrato: {
          fechaInicio: contrato.fechaInicio,
          fechaFin: contrato.fechaFin
        },
        
        // Cálculos intermedios
        calculos: {
          edadActual,
          añosAdicionales,
          edadAlPensionarse: edadPension,
          edadParaBusqueda,
          añoPension
        },
        
        // Resultado final
        resultado: {
          montoPension: monto,
          textoCompleto: `MONTO DE PENSIÓN $${monto.toLocaleString('es-MX')}`,
          moneda: 'MXN',
          frecuencia: 'mensual'
        }
      },
      
      // Advertencias y notas
      advertencias: [],
      notas: []
    };
    
    // Agregar advertencias si existen
    if (usaFallback) {
      resultado.advertencias.push({
        tipo: 'fallback',
        mensaje: `Edad real (${edadPension}) excede máximo. Usando monto de ${edadParaBusqueda} años`,
        severidad: 'media'
      });
    }
    
    if (validacionCoherencia.warning) {
      resultado.advertencias.push({
        tipo: 'coherencia',
        mensaje: validacionCoherencia.warning,
        severidad: 'baja'
      });
    }
    
    if (validacionEdad.warning) {
      resultado.advertencias.push({
        tipo: 'edad',
        mensaje: validacionEdad.warning,
        severidad: 'baja'
      });
    }
    
    // Agregar nota sobre estimación
    resultado.notas.push({
      tipo: 'disclaimer',
      mensaje: 'Los montos son estimativos y pueden variar ±10% en la resolución final del IMSS'
    });
    
    return resultado;
    
  } catch (error) {
    // Manejo de errores
    if (error instanceof ErrorCalculoPension) {
      return {
        success: false,
        error: {
          codigo: error.codigo,
          tipo: TiposError.CALCULO_FALLIDO,
          mensaje: error.message,
          detalles: error.datos,
          bloqueante: true,
          timestamp: error.timestamp
        }
      };
    }
    
    // Error no esperado
    console.error('Error inesperado en cálculo de pensión:', error);
    return {
      success: false,
      error: {
        tipo: TiposError.CALCULO_FALLIDO,
        mensaje: 'Error inesperado al calcular monto de pensión',
        detalles: { error: error.message },
        bloqueante: true
      }
    };
  }
}
```

### Algoritmo de Búsqueda en Tabla

```javascript
/**
 * Busca el monto de pensión en la tabla
 * @param {number} edad - Edad al pensionarse
 * @param {number} año - Año de pensión
 * @returns {number} Monto mensual de pensión
 * @throws {Error} Si no se encuentra el monto
 */
function buscarMontoPension(edad, año) {
  // Validar que el año exista
  if (!TABLA_PENSIONES[año]) {
    const añosDisponibles = Object.keys(TABLA_PENSIONES).join(', ');
    throw new Error(
      `Año ${año} no disponible. Años disponibles: ${añosDisponibles}`
    );
  }
  
  // Validar rango de edad
  if (edad < 60) {
    throw new Error(`Edad ${edad} menor al mínimo (60 años)`);
  }
  
  if (edad > 83) {
    throw new Error(`Edad ${edad} mayor al máximo (83 años)`);
  }
  
  // Buscar monto
  const monto = TABLA_PENSIONES[año][edad];
  
  if (monto === null || monto === undefined) {
    throw new Error(
      `Monto no definido para edad ${edad} y año ${año}`
    );
  }
  
  if (typeof monto !== 'number' || isNaN(monto) || monto <= 0) {
    throw new Error(
      `Monto inválido (${monto}) para edad ${edad} y año ${año}`
    );
  }
  
  return monto;
}
```

### Algoritmo de Cálculo de Edad Preciso

```javascript
/**
 * Calcula la edad en años completos considerando mes y día
 * @param {string|Date} fechaNacimiento - Fecha de nacimiento
 * @returns {number} Edad en años completos
 */
function calcularEdadPrecisa(fechaNacimiento) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  
  // Normalizar a medianoche para evitar problemas de hora
  hoy.setHours(0, 0, 0, 0);
  nacimiento.setHours(0, 0, 0, 0);
  
  // Calcular diferencia de años
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  
  // Ajustar si no ha llegado su cumpleaños este año
  const mesActual = hoy.getMonth();
  const mesNacimiento = nacimiento.getMonth();
  const diaActual = hoy.getDate();
  const diaNacimiento = nacimiento.getDate();
  
  if (mesActual < mesNacimiento) {
    // Mes de cumpleaños aún no ha llegado
    edad--;
  } else if (mesActual === mesNacimiento && diaActual < diaNacimiento) {
    // Es el mes de cumpleaños pero el día aún no llega
    edad--;
  }
  
  return edad;
}
```

---

## RESUMEN DE REGLAS CRÍTICAS

### 🔴 BLOQUEANTES (Detienen el proceso)

1. **Datos incompletos**: Falta fecha nacimiento, CURP, o fechas contrato
2. **Edad insuficiente**: Cliente no alcanzará 60 años al pensionarse
3. **Año no disponible**: El año de pensión no está en la tabla
4. **Fechas inválidas**: Fecha fin anterior o igual a fecha inicio
5. **Monto no encontrado**: No existe monto en tabla para edad/año

### 🟡 ADVERTENCIAS (Permiten continuar con disclaimer)

1. **Edad muy alta**: Usar fallback de 83 años
2. **Contrato muy corto**: Menos de 1 año adicional
3. **Contrato muy largo**: Más de 10 años
4. **Monto fuera de rango esperado**: Verificar tabla

### 🟢 INFORMATIVAS

1. **Edad en rango ideal**: 65-75 años
2. **Cálculo exitoso**: Mostrar detalles
3. **Estimación**: Disclaimer de ±10%

---

© 2026 Sistema de Recuperación de Pensiones - Grupo AVIVIR
