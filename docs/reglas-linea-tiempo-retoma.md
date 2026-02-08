# Línea de Tiempo — Modalidad RETOMA
## Reglas de Negocio, Validaciones y Flujos para Componente React

---

## 1. Interfaces TypeScript

```typescript
/** Tabla de precios por año — viene de T1:U4 */
interface PrecioAnual {
  year: number;
  montoMensual: number;
}

/** Tabla de precios del primer mes basado en fecha actual — viene de C42 */
interface PrecioPrimerMes {
  despuesDe: string; // fecha ISO "YYYY-MM-DD"
  monto: number;
}

/** Entrada principal — datos que alimentan la tabla */
interface LineaTiempoInput {
  fechaAlta: Date | null;           // DATOS GENERALES!C15
  fechaFin: Date | null;            // F18 calculado
  tablaPreciosAnuales: PrecioAnual[];
  tablaPreciosPrimerMes: PrecioPrimerMes[];
  montoGestoria14Meses: number;     // $18,000
  montoGestoria15Meses: number;     // $16,000 (o $18,000 si siempre es fijo)
}

/** Cada fila visible de la tabla */
interface FilaPago {
  numero: number | null;            // Columna A: 1..18 o null si es TOTAL/GESTORIA
  mes: string;                      // Columna B: "ENE", "FEB", ... "TOTAL", "GESTORIA", "TOTAL GENERAL"
  monto: number;                    // Columna C: pago mensual o subtotal
  tipo: 'pago' | 'total' | 'gestoria' | 'total_general';
}

/** Salida completa del cálculo */
interface LineaTiempoOutput {
  modalidad: 'RETOMA';
  yearInicio: number;
  filas: FilaPago[];
  subtotal: number;
  gestoria: number;
  totalGeneral: number;
  duracionMeses: number;
}
```

---

## 2. Constantes y Catálogos

```typescript
/** Catálogo de meses — W54:X65 */
const CATALOGO_MESES: Record<number, string> = {
  1: 'ENE', 2: 'FEB', 3: 'MAR', 4: 'ABR',
  5: 'MAY', 6: 'JUN', 7: 'JUL', 8: 'AGO',
  9: 'SEP', 10: 'OCT', 11: 'NOV', 12: 'DIC',
};

/** Precios por año — T1:U4 (configurable/dinámica) */
const PRECIOS_ANUALES: PrecioAnual[] = [
  { year: 2023, montoMensual: 2200 },
  { year: 2024, montoMensual: 2400 },
  { year: 2025, montoMensual: 2650 },
  { year: 2026, montoMensual: 3200 },
];

/**
 * Precios del primer mes según fecha actual — C42
 * IMPORTANTE: Evaluar de la fecha MÁS RECIENTE a la MÁS ANTIGUA
 * (corrige el bug del Excel original que evalúa en orden ascendente)
 */
const PRECIOS_PRIMER_MES: PrecioPrimerMes[] = [
  { despuesDe: '2026-01-31', monto: 4650 },
  { despuesDe: '2025-01-31', monto: 4200 },
  { despuesDe: '2024-01-31', monto: 3800 },
  { despuesDe: '2023-01-31', monto: 3500 },
];

/** Montos de gestoría por duración de plan */
const GESTORIA: Record<number, number> = {
  14: 18000,
  15: 16000,
};

/** Límites del plan */
const MESES_MINIMOS = 14;
const MESES_MAXIMOS = 18;
```

---

## 3. Validaciones de Entrada

### 3.1 Validación Principal (Guard Clause)

```
REGLA: Si fechaAlta es null o vacía → la tabla completa se muestra vacía.
       Ningún cálculo debe ejecutarse.
```

| # | Campo | Validación | Mensaje / Acción |
|---|-------|-----------|-----------------|
| V1 | `fechaAlta` | No puede ser null/undefined/vacía | No renderizar tabla, mostrar placeholder |
| V2 | `fechaAlta` | Debe ser una fecha válida (Date válido) | Mostrar error de formato |
| V3 | `fechaFin` | No puede ser null si `fechaAlta` existe | Error: falta fecha de finalización |
| V4 | `fechaFin` | Debe ser posterior a `fechaAlta` | Error: fecha fin anterior a fecha alta |
| V5 | Duración (meses) | Debe estar entre 14 y 18 | Advertencia: plan fuera de rango soportado |
| V6 | `tablaPreciosAnuales` | Debe contener entrada para cada año del plan | Error: año sin precio configurado |

### 3.2 Validación de Negocio

```
REGLA: La duración del plan se calcula como la diferencia en meses
       entre fechaAlta y fechaFin.
       - 14 meses: flujo estándar (14 pagos + gestoría $18,000)
       - 15 meses: flujo extendido (15 pagos + gestoría $16,000)
       - 16-18 meses: flujo largo (N pagos, gestoría sin fila predefinida)
```

---

## 4. Flujo Principal de Cálculo

```
┌─────────────────────────────────┐
│   ENTRADA: fechaAlta, fechaFin  │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  V1: ¿fechaAlta es válida?      │──── NO ──▶ Retornar tabla vacía
└──────────────┬──────────────────┘
               │ SÍ
               ▼
┌─────────────────────────────────┐
│  PASO 1: Calcular duracionMeses │
│  = diffEnMeses(fechaAlta,       │
│                fechaFin)        │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  PASO 2: Generar secuencia de   │
│  meses y años                   │
│  (S8:S25, T8:T25, U8:U25)      │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  PASO 3: Calcular pago de       │
│  cada mes (C42:C55+)            │
│  - Mes 1: lógica especial       │
│  - Mes 2+: precio por año       │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  PASO 4: Resolver filas         │
│  dinámicas (56-59) según        │
│  duracionMeses                  │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  PASO 5: Agregar TOTAL,         │
│  GESTORIA y TOTAL GENERAL       │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  SALIDA: LineaTiempoOutput      │
└─────────────────────────────────┘
```

---

## 5. Detalle de Cada Paso

### PASO 1 — Calcular duración en meses

```
duracionMeses = diffEnMeses(fechaAlta, fechaFin)
```

Equivale a `DATEDIF(C15, F18, "M")` del Excel.

**Implementación sugerida:**

```typescript
function diffEnMeses(inicio: Date, fin: Date): number {
  return (fin.getFullYear() - inicio.getFullYear()) * 12
       + (fin.getMonth() - inicio.getMonth());
}
```

---

### PASO 2 — Generar secuencia de meses y años

Genera N entradas (donde N = `duracionMeses`), cada una con:
- `numeroMes`: 1–12 cíclico
- `year`: año real del pago
- `nombreMes`: "ENE", "FEB", etc.

**Lógica de la secuencia:**

```
mesInicial = MONTH(fechaAlta + 16 días)   ← offset de 16 días (S8)
fechaBase  = fechaAlta + 30 días          ← primer pago (U8)

Para i = 0 hasta duracionMeses - 1:
  fechaPago[i] = fechaBase + (i * 30 días)
  numeroMes[i] = (mesInicial + i - 1) % 12 + 1
  year[i]      = YEAR(fechaPago[i])
  nombreMes[i] = CATALOGO_MESES[numeroMes[i]]
```

**Implementación sugerida:**

```typescript
interface MesPago {
  index: number;        // 0-based
  numero: number;       // 1-based secuencial para la tabla
  mesDelAnio: number;   // 1-12
  nombreMes: string;    // "ENE"..."DIC"
  year: number;
  fechaPago: Date;
}

function generarSecuenciaMeses(
  fechaAlta: Date,
  duracionMeses: number
): MesPago[] {
  const offsetDias = 16;
  const intervaloDias = 30;

  const fechaConOffset = addDays(fechaAlta, offsetDias);
  const mesInicial = fechaConOffset.getMonth() + 1; // 1-12

  const fechaBase = addDays(fechaAlta, intervaloDias);

  return Array.from({ length: duracionMeses }, (_, i) => {
    const fechaPago = addDays(fechaBase, i * intervaloDias);
    const mesDelAnio = ((mesInicial - 1 + i) % 12) + 1;

    return {
      index: i,
      numero: i + 1,
      mesDelAnio,
      nombreMes: CATALOGO_MESES[mesDelAnio],
      year: fechaPago.getFullYear(),
      fechaPago,
    };
  });
}
```

---

### PASO 3 — Calcular monto de pago por mes

```
┌──────────────────────────┐
│  ¿Es el primer mes?      │
│  (index === 0)            │
└─────────┬────────────────┘
          │
    ┌─────┴─────┐
    │ SÍ        │ NO
    ▼           ▼
┌──────────┐  ┌──────────────────────────┐
│ Precio   │  │ VLOOKUP año del pago     │
│ primer   │  │ en tablaPreciosAnuales   │
│ mes      │  │                          │
│ (basado  │  │ Buscar year en la tabla  │
│ en hoy)  │  │ y retornar montoMensual  │
└──────────┘  └──────────────────────────┘
```

#### 3a. Precio del primer mes (solo C42)

```
Evaluar de la fecha MÁS RECIENTE a la MÁS ANTIGUA:

SI hoy > 2026-01-31 → $4,650
SI hoy > 2025-01-31 → $4,200
SI hoy > 2024-01-31 → $3,800
SI hoy > 2023-01-31 → $3,500
SI NO               → "" (sin precio configurado)
```

> **⚠️ BUG CORREGIDO:** El Excel original evalúa en orden ascendente,
> lo que causa que SIEMPRE devuelva $3,500. La implementación en React
> DEBE evaluar en orden DESCENDENTE (fecha más reciente primero).

```typescript
function calcularPrecioPrimerMes(
  hoy: Date,
  tabla: PrecioPrimerMes[]
): number {
  // tabla ya está ordenada desc por despuesDe
  const entrada = tabla.find(p => hoy > new Date(p.despuesDe));
  if (!entrada) {
    throw new Error('No hay precio configurado para la fecha actual');
  }
  return entrada.monto;
}
```

#### 3b. Precio meses 2 en adelante (C43:C55+)

```
monto = tablaPreciosAnuales.find(p => p.year === mesPago.year)?.montoMensual
```

Tabla de referencia:

| Año  | Monto   |
|------|---------|
| 2023 | $2,200  |
| 2024 | $2,400  |
| 2025 | $2,650  |
| 2026 | $3,200  |

```typescript
function calcularPrecioMes(
  mesPago: MesPago,
  tabla: PrecioAnual[]
): number {
  const entrada = tabla.find(p => p.year === mesPago.year);
  if (!entrada) {
    throw new Error(`No hay precio configurado para el año ${mesPago.year}`);
  }
  return entrada.montoMensual;
}
```

---

### PASO 4 — Resolver filas dinámicas (56–59)

Las filas después de la 14 (index 55 en Excel) son condicionales según `duracionMeses`:

```
┌───────────────────────────────────────┐
│         duracionMeses = ?             │
└───────────────┬───────────────────────┘
                │
    ┌───────────┼───────────┬───────────┐
    │           │           │           │
    ▼           ▼           ▼           ▼
  = 14        = 15        = 16        = 17+
    │           │           │           │
    ▼           ▼           ▼           ▼
 14 pagos    15 pagos    16 pagos    17-18 pagos
 TOTAL       TOTAL       TOTAL       TOTAL
 GESTORIA    GESTORIA    GESTORIA    GESTORIA*
 $18,000     $16,000     (ver nota)  (ver nota)
 TOT.GRAL    TOT.GRAL    TOT.GRAL    TOT.GRAL
```

**Pseudocódigo unificado:**

```
filasPago = meses[0..duracionMeses-1] mapeados a FilaPago con tipo 'pago'

subtotal = SUM(filasPago.monto)

SI duracionMeses == 14:
    gestoria = 18000
SI duracionMeses == 15:
    gestoria = 16000
SI duracionMeses >= 16:
    gestoria = montoGestoriaPorDefecto  // definir regla de negocio

totalGeneral = subtotal + gestoria

Agregar filas:
  { tipo: 'total',         mes: 'TOTAL',         monto: subtotal }
  { tipo: 'gestoria',      mes: 'GESTORIA',      monto: gestoria }
  { tipo: 'total_general', mes: 'TOTAL GENERAL',  monto: totalGeneral }
```

---

### PASO 5 — Ensamblar salida final

```typescript
function calcularLineaTiempo(input: LineaTiempoInput): LineaTiempoOutput | null {
  // === GUARD CLAUSE (V1) ===
  if (!input.fechaAlta || !input.fechaFin) return null;

  const duracionMeses = diffEnMeses(input.fechaAlta, input.fechaFin);
  const secuencia = generarSecuenciaMeses(input.fechaAlta, duracionMeses);
  const hoy = new Date();

  // === GENERAR FILAS DE PAGO ===
  const filasPago: FilaPago[] = secuencia.map((mes, i) => ({
    numero: mes.numero,
    mes: mes.nombreMes,
    monto: i === 0
      ? calcularPrecioPrimerMes(hoy, input.tablaPreciosPrimerMes)
      : calcularPrecioMes(mes, input.tablaPreciosAnuales),
    tipo: 'pago' as const,
  }));

  // === SUBTOTAL ===
  const subtotal = filasPago.reduce((sum, f) => sum + f.monto, 0);

  // === GESTORIA ===
  const gestoria = duracionMeses <= 14
    ? input.montoGestoria14Meses
    : input.montoGestoria15Meses;

  // === TOTAL GENERAL ===
  const totalGeneral = subtotal + gestoria;

  // === FILAS FINALES ===
  const filas: FilaPago[] = [
    ...filasPago,
    { numero: null, mes: 'TOTAL',         monto: subtotal,    tipo: 'total' },
    { numero: null, mes: 'GESTORIA',      monto: gestoria,    tipo: 'gestoria' },
    { numero: null, mes: 'TOTAL GENERAL', monto: totalGeneral, tipo: 'total_general' },
  ];

  return {
    modalidad: 'RETOMA',
    yearInicio: input.fechaAlta.getFullYear(),
    filas,
    subtotal,
    gestoria,
    totalGeneral,
    duracionMeses,
  };
}
```

---

## 6. Reglas para el Componente React

### 6.1 Renderizado condicional

| Condición | Comportamiento del componente |
|-----------|------------------------------|
| `fechaAlta` es null | No renderizar tabla, mostrar mensaje "Ingrese fecha de alta" |
| `duracionMeses < 14` | Mostrar advertencia "Plan menor a 14 meses" |
| `duracionMeses > 18` | Mostrar advertencia "Plan excede los 18 meses" |
| Año sin precio configurado | Mostrar error inline en la fila afectada |
| Cálculo exitoso | Renderizar tabla completa |

### 6.2 Formato de montos

- Formato: `$#,##0.00` (pesos mexicanos, 2 decimales)
- Locale sugerido: `es-MX`
- Usar `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })`

### 6.3 Estilos por tipo de fila

| Tipo | Estilo sugerido |
|------|----------------|
| `pago` | Fila normal |
| `total` | Fondo gris, texto bold |
| `gestoria` | Fondo azul claro, texto bold |
| `total_general` | Fondo oscuro, texto blanco bold |

### 6.4 Props sugeridas del componente

```typescript
interface LineaTiempoProps {
  fechaAlta: Date | null;
  fechaFin: Date | null;
  preciosAnuales?: PrecioAnual[];       // default: PRECIOS_ANUALES
  preciosPrimerMes?: PrecioPrimerMes[];  // default: PRECIOS_PRIMER_MES
  montoGestoria14?: number;             // default: 18000
  montoGestoria15?: number;             // default: 16000
}
```

---

## 7. Funciones Utilitarias Reutilizables

```typescript
/** Sumar días a una fecha */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Diferencia en meses entre dos fechas */
function diffEnMeses(inicio: Date, fin: Date): number {
  return (fin.getFullYear() - inicio.getFullYear()) * 12
       + (fin.getMonth() - inicio.getMonth());
}

/** Formatear monto en pesos mexicanos */
function formatMXN(monto: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(monto);
}
```

---

## 8. Casos de Prueba Recomendados

| # | Escenario | fechaAlta | fechaFin | Resultado esperado |
|---|-----------|-----------|----------|-------------------|
| 1 | Caso base 14 meses | 2025-11-01 | 2027-01-01 | 14 pagos, subtotal $44,550, gestoría $18,000, total $62,550 |
| 2 | Plan 15 meses | 2025-06-01 | 2026-09-01 | 15 pagos, gestoría $16,000 |
| 3 | Cruce de año | 2025-10-01 | 2027-01-01 | Meses oct-dic a $2,650, ene+ a $3,200 |
| 4 | Sin fecha de alta | null | — | Tabla vacía |
| 5 | Primer mes en 2026 | 2026-02-15 | 2027-05-01 | Primer mes = $4,650 (si se corrige bug) |
| 6 | Año sin precio | 2027-01-01 | 2028-03-01 | Error: sin precio para 2027/2028 |

---

## 9. Decisiones Pendientes para el Equipo

| # | Tema | Opciones |
|---|------|----------|
| D1 | Bug de C42 (precio primer mes) | ¿Corregir evaluación a orden descendente o mantener comportamiento actual? |
| D2 | Gestoría para 16+ meses | ¿Qué monto aplica? ¿$18,000, $16,000, u otro? |
| D3 | Tabla de precios | ¿Se alimenta desde BD/API o se hardcodea como constantes? |
| D4 | Offset de 16 días | ¿Es una regla de negocio fija o debe ser configurable? |
| D5 | Intervalo de 30 días | ¿Siempre son 30 días o debería ser "mes calendario siguiente"? |
