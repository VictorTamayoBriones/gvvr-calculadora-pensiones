# Reglas y Operaciones — Tabla "Línea de Tiempo" (Costo Mensual F100)

> **Prerrequisito:** Leer `01_ESTRUCTURA_TABLA_COSTO_MENSUAL.md` para conocer la estructura base de la tabla.

---

## 1. Validación Global (Guard Clause)

Toda celda calculada en las columnas J, K y L evalúa primero:

```
SI fechaInicioContrato está vacía → retornar ""
```

- **Origen:** `'DATOS GENERALES'!C15`
- **Efecto:** Si no hay fecha de contrato, la tabla completa se muestra vacía.

---

## 2. Generación de la Secuencia de Meses (Columna J)

### 2.1 Datos auxiliares requeridos

Se necesita una secuencia numérica de meses y su año correspondiente. Estas se calculan así:

**Mes inicial (`mesInicial`):**

```
mesInicial = MONTH(fechaInicioContrato + 16 días)
```

> Los +16 días son un offset para ajustar al periodo de facturación. Si la fecha es 2025-11-01, el mes resultante es 11 (noviembre).

**Secuencia de meses (`meses[]`):**

```
meses[0] = mesInicial
meses[i] = meses[i-1] + 1    (si meses[i-1] < 12)
meses[i] = 1                  (si meses[i-1] = 12)   // Reset en enero
```

**Fechas auxiliares (`fechasAux[]`):**

```
fechasAux[0] = fechaInicioContrato + 30 días
fechasAux[i] = fechasAux[i-1] + 30 días
```

**Año de cada mes (`años[]`):**

```
años[i] = YEAR(fechasAux[i])
```

### 2.2 Traducción a nombre de mes

Se emplea un catálogo fijo:

```typescript
const CATALOGO_MESES: Record<number, string> = {
  1: "ENE",  2: "FEB",  3: "MAR",  4: "ABR",
  5: "MAY",  6: "JUN",  7: "JUL",  8: "AGO",
  9: "SEP", 10: "OCT", 11: "NOV", 12: "DIC"
};
```

**Regla para cada fila `i` (0-indexed, fila 42 = i=0):**

```
columnaJ[i] = CATALOGO_MESES[ meses[i] ]
```

---

## 3. Cálculo del Costo Base F.100% (Columna K)

### 3.1 Tabla de tarifas anuales

```typescript
const TARIFAS_ANUALES: Record<number, number> = {
  2023: 2200,
  2024: 2400,
  2025: 2650,
  2026: 3200,
  2027: 3950,  // = 3200 + 250 + 500
  2028: 4700   // = 3950 + 250 + 500
};
```

**Regla de proyección para años futuros:**

```
tarifa[año] = tarifa[año - 1] + 750
```

### 3.2 Primer mes (fila 42) — Lógica especial basada en TODAY()

El primer mes usa una tabla de tarifas escalonadas evaluadas contra la fecha actual del sistema:

```typescript
const TARIFAS_PRIMER_MES = [
  { despuesDe: new Date("2026-01-31"), tarifaBase: 4650 },
  { despuesDe: new Date("2025-01-31"), tarifaBase: 4200 },
  { despuesDe: new Date("2024-01-31"), tarifaBase: 3800 },
  { despuesDe: new Date("2023-01-31"), tarifaBase: 3500 },
];
```

**Regla:**

```
PARA cada umbral en TARIFAS_PRIMER_MES (de más reciente a más antiguo):
  SI hoy > umbral.despuesDe:
    costoBase[0] = umbral.tarifaBase × 2
    BREAK
```

> **¿Por qué × 2?** El primer pago cubre un periodo doble (inscripción + primer mes).

**Ejemplo:** Si hoy es 2025-03-06, entonces `hoy > 2025-01-31` → tarifa = 4200, resultado = **8,400**. Pero el Excel muestra 7,000 porque fue evaluado cuando `hoy > 2024-01-31` era la condición activa (tarifa 3,500 × 2).

### 3.3 Meses subsiguientes (filas 43–55) — Lookup por año

**Regla:**

```
costoBase[i] = TARIFAS_ANUALES[ años[i] ] × 2
```

**Ejemplo:** Si `años[2] = 2026`, entonces `costoBase[2] = 3200 × 2 = 6,400`.

> El multiplicador ×2 se aplica a todos los meses, no solo al primero.

---

## 4. Cálculo del Costo F100+ (Columna L)

**Regla (aplica a todas las filas 42–55):**

```
costoPlus[i] = 4850 + costoBase[i]
```

- **$4,850** es un cargo fijo mensual adicional por el plan premium "F100+".
- Este valor es constante y no varía por año ni por mes.

---

## 5. Duración del Contrato (`totalMeses`)

Este valor determina cuántas filas de meses se muestran y cómo se organizan las filas de cierre.

**Cálculo:**

```
totalMeses = DATEDIF(fechaInicioContrato, fechaFinProceso, "M")
```

Donde `fechaFinProceso` se calcula a partir de datos del expediente del cliente (celda F18), que involucra el día de corte IMSS:

```
SI díaCorte < 16:
  fechaFinProceso = primerDíaDelMes(fechaResolucion)
SI díaCorte > 15:
  fechaFinProceso = primerDíaDelMesSiguiente(fechaResolucion)
```

**Valores típicos:** 14, 15, 16, 17, 18 meses.

---

## 6. Sección de Cierre — Reglas por Duración

Las filas 56–61 se comportan de forma diferente según `totalMeses`. La tabla usa un sistema de "cascada" donde cada fila verifica si le toca ser mes adicional, TOTAL, GESTORÍA o TOTAL GENERAL.

### 6.1 Caso `totalMeses = 14` (base)

| Fila | J | K | L |
|------|---|---|---|
| 56 | `"TOTAL"` | `SUM(costoBase[0..13])` | `SUM(costoPlus[0..13])` |
| 57 | `""` | `""` | `""` |
| 58 | `"GESTORIA"` | `18000` | `= K58` |
| 59 | `"TOTAL GENERAL"` | `totalK + gestoriaK` | `totalL + gestoriaL` |
| 60 | `""` | `= cargoProyeccion` | `= PROY_PENSION_PLUS.F26 × 2` |
| 61 | `""` | `totalGeneralK + cargoProyeccion` | `totalGeneralL + cargoProyeccion` |

### 6.2 Caso `totalMeses = 15`

| Fila | J | K | L |
|------|---|---|---|
| 56 | `meses[14]` | `TARIFAS_ANUALES[años[14]] × 2` | `4850 + K56` |
| 57 | `"TOTAL"` | `SUM(K42:K56)` | `SUM(L42:L56)` |
| 58 | `"GESTORIA"` | `16000` ⚠️ | `= K58` |
| 59 | `"TOTAL GENERAL"` | `totalK + gestoriaK` | `totalL + gestoriaL` |
| 60–61 | *(igual que caso 14, filas 60–61)* | | |

> ⚠️ **Nota:** Cuando `totalMeses = 15`, la gestoría cambia a **$16,000** en lugar de $18,000.

### 6.3 Caso `totalMeses = 16`

Las filas 56 y 57 se convierten en meses 15 y 16, el TOTAL pasa a fila 58, GESTORÍA a 59, y así sucesivamente.

### 6.4 Caso `totalMeses ≥ 17`

Se continúa el mismo patrón de desplazamiento. Para contratos muy largos, se usan VLOOKUP adicionales en la tabla de tarifas extendida (`$T$1:$W$4`, columna 4) para obtener valores de la columna W que representa `tarifa × 2` directamente.

### 6.5 Regla general de cascada

```
PARA cada fila de cierre (56 a 61):
  SI totalMeses > filasMesesYaMostradas:
    → Mostrar mes adicional (nombre + costo)
  SI totalMeses == filasMesesYaMostradas:
    → Mostrar "TOTAL"
  SI fila anterior es TOTAL:
    → Mostrar "GESTORIA"
  SI fila anterior es GESTORIA:
    → Mostrar "TOTAL GENERAL"
```

---

## 7. Costo de Gestoría

| Condición | Monto |
|-----------|-------|
| `totalMeses = 14` | $18,000 |
| `totalMeses = 15` | $16,000 |
| `totalMeses ≥ 16` | Se obtiene por VLOOKUP en tabla de tarifas extendida |

La gestoría es un costo fijo por la tramitación del expediente ante IMSS. El valor en **columna L siempre es igual a columna K** para este concepto (`L58 = K58`).

---

## 8. Cargo de Proyección de Pensión (Fila 60)

**Regla:**

```
cargoProyeccion = PROYECCION_PENSION_PLUS.F26 × 2
```

Donde `PROYECCION_PENSION_PLUS.F26` a su vez referencia `INFORME_COSTO_MENSUAL.AE36`, que se calcula así:

```
AE36 = VLOOKUP(
  identificadorCliente,   // AD2
  tablaProyeccion,        // AE6:AL31
  columnaSegunAño,        // 5 si 2024, 6 si 2025, 7 si 2026, 8 si 2027
  FALSE
)
```

**La columna de la tabla se selecciona según el año de fin del proceso:**

| Año fin (`YEAR(fechaFinProceso)`) | Columna |
|-----------------------------------|---------|
| 2024 | 5 |
| 2025 | 6 |
| 2026 | 7 |
| 2027 | 8 |

**Nota:** `K60 = L60` (columna K refleja columna L en esta fila).

---

## 9. Gran Total (Fila 61)

```
granTotalK = totalGeneralK + cargoProyeccion
granTotalL = totalGeneralL + cargoProyeccion
```

---

## 10. Validación de Modalidad

La celda `F67` determina si el cliente es tipo "RETOMA" o "MODALIDAD 100":

```
SI modalidad == "REACTIVA TRADICIONAL" → F67 = "RETOMA"
SI modalidad == "REACTIVA FINANCIADO 100" → F67 = "MODALIDAD 100"
```

Cuando `F67 = "RETOMA"` o `F67 = "MODALIDAD 100"`, algunas columnas paralelas (H) se anulan. Esto no afecta directamente a las columnas J-L pero es contexto relevante para la tabla hermana.

---

## 11. Resumen de Constantes

| Constante | Valor | Uso |
|-----------|-------|-----|
| Offset días inicio | +16 | Cálculo del mes inicial |
| Incremento fecha auxiliar | +30 días | Secuencia de fechas/años |
| Multiplicador costo | ×2 | Aplicado a todas las tarifas |
| Cargo fijo F100+ | $4,850 | Sumado al costo base para columna L |
| Gestoría (14 meses) | $18,000 | Costo fijo de tramitación |
| Gestoría (15 meses) | $16,000 | Costo reducido |
| Incremento tarifa anual | +750 | Para proyectar tarifas futuras |

---

## 12. Diagrama de Dependencias

```
DATOS GENERALES
├── C15 (fechaInicioContrato) ──→ Guard clause + secuencia meses + totalMeses
├── C17 (modalidad) ──→ F67 (validación tipo)
└── C13 (saldoAfore) ──→ Determina si es "FINANCIADO 100"

INFORME COSTO MENSUAL (auxiliares)
├── S8:S25 ──→ Secuencia numérica de meses
├── T8:T25 ──→ Año de cada mes
├── U8:U25 ──→ Fechas auxiliares (+30 días)
├── T1:U6  ──→ Tabla de tarifas por año
├── W54:X65 ──→ Catálogo mes número → nombre
├── I18 ──→ totalMeses (DATEDIF)
├── E30 ──→ añoInicio
└── AE36 ──→ Cargo proyección pensión

PROYECCIÓN DE PENSIÓN PLUS
└── F26 ──→ Valor base del cargo de proyección
```
