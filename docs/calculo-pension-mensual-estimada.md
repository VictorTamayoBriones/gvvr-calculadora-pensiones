# Cálculo del Monto de Pensión Mensual Estimada

## Documento técnico para migración a React — Grupo AVIVIR

---

## 1. Propósito del cálculo

El monto de pensión mensual estimada es el dato central que alimenta prácticamente todos los demás cálculos del sistema. Representa cuánto recibirá el cliente mensualmente de pensión una vez que el trámite de recuperación sea resuelto. No es un dato capturado manualmente: se **calcula automáticamente** a partir de la edad proyectada del cliente y el año en que se espera la resolución del trámite.

Este valor se utiliza en al menos tres contextos diferentes:

- Como base para calcular el **monto del préstamo financiero** que el cliente puede recibir.
- Como base para calcular el **costo de gestoría** del trámite.
- Como dato de presentación en las **hojas de proyección de pensión** para el cliente.

---

## 2. Variables de entrada (datos que captura el asesor)

El cálculo de la pensión no recibe directamente un monto; lo deriva de cuatro datos que el asesor ingresa en la pantalla de Datos Generales:

### 2.1. CURP del cliente

Cadena alfanumérica de exactamente **18 caracteres**. De ella se extrae la **fecha de nacimiento**, que es indispensable para calcular la edad. La extracción se hace de la siguiente manera:

- **Posiciones 5 y 6** del CURP → Año de nacimiento (se antepone "19" para formar el año completo, asumiendo que todos los prospectos nacieron en el siglo XX).
- **Posiciones 7 y 8** → Mes de nacimiento.
- **Posiciones 9 y 10** → Día de nacimiento.

Por ejemplo, si el CURP es `GAHL521102HDFRRS02`, se extrae: año `52` → `1952`, mes `11`, día `02` → **2 de noviembre de 1952**.

> **⚠️ Consideración para la migración:** La lógica actual asume siglo XX ("19" fijo). Si en el futuro hubiera clientes nacidos después del año 2000, esta lógica fallaría. Para la migración a React, se recomienda implementar la decodificación estándar del CURP que considere ambos siglos.

### 2.2. Semanas cotizadas

Número entero que representa las semanas que el cliente cotizó ante el IMSS. Este dato determina la **fecha estimada de resolución del trámite** (ver sección 3).

Validación: mínimo **430 semanas**. Por debajo de ese umbral, el producto no es viable.

### 2.3. Fecha de inicio del contrato

Fecha en la que arranca formalmente el servicio de recuperación de pensión. Es el punto de partida para calcular cuándo se espera que el trámite se resuelva y cuántos meses durará el contrato.

### 2.4. NSS (Número de Seguridad Social)

Cadena de exactamente **11 caracteres**. Aunque no interviene directamente en el cálculo de la pensión, las posiciones 3 y 4 del NSS se usan para determinar la **ley aplicable** (Ley 73 o Ley 97) mediante una tabla de búsqueda. El producto solo es válido para clientes bajo **Ley 73** (cotización antes del 1 de julio de 1997).

---

## 3. Variables intermedias calculadas

A partir de los datos de entrada, el sistema calcula varias variables intermedias antes de poder obtener la pensión.

### 3.1. Fecha de nacimiento

Se construye a partir del CURP como se describió en la sección 2.1. El formato resultante es `DD/MM/AAAA`.

### 3.2. Edad actual del cliente

Se calcula como la diferencia en **años completos** entre la fecha de nacimiento y la fecha actual del sistema (equivalente a `TODAY()` en Excel). Esta es la edad cronológica al momento de la consulta.

Ejemplo: nacido el 02/11/1952 y consultado en 2025 → **73 años**.

**Validaciones sobre la edad:**

- **Menor de 58 años y 6 meses** (equivalente a menos de 702 meses de vida): El prospecto no es válido para este producto. Mensaje: *"Prospecto no válido, edad mínima de contratación 58 años 6 meses."*

- **Mayor de 68 años** (equivalente a más de 816 meses de vida): El sistema advierte que solo aplica para la modalidad "Reactiva Tradicional". Para "Reactiva Financiado 100" solo son viables clientes menores de 68 años.

> **Nota:** La validación de edad se hace en meses de vida (no en años), lo cual da mayor precisión. Se compara `DATEDIF(fecha_nacimiento, TODAY(), "M")` contra los umbrales 702 y 816.

### 3.3. Fecha estimada de resolución del trámite (fecha cruda)

Se calcula a partir de las **semanas cotizadas** y la **fecha de inicio del contrato** con la siguiente regla:

- Si las **semanas cotizadas son mayores a 448** → La resolución se estima sumando **63 semanas** (441 días) a la fecha de inicio del contrato.
- Si las **semanas cotizadas son 448 o menos** → La resolución se estima sumando **(510 − semanas cotizadas) × 7 días** a la fecha de inicio del contrato.

La lógica detrás de esto es que a mayor número de semanas cotizadas, el trámite tiene un plazo más predecible (63 semanas fijas). Con menos semanas, el plazo se extiende proporcionalmente porque se requiere completar semanas faltantes hasta un tope de 510.

Ejemplo: 860 semanas cotizadas (> 448), inicio el 01/11/2025 → resolución cruda = 01/11/2025 + 441 días = **16/01/2027**.

### 3.4. Fecha de resolución normalizada

La fecha cruda se ajusta al **primer día del mes** o al **primer día del mes siguiente**, dependiendo del día del mes en que caiga:

- Si el **día del mes de la fecha cruda es 15 o menor** → Se toma el **primer día de ese mismo mes**.
- Si el **día del mes es 16 o mayor** → Se toma el **primer día del mes siguiente**.

Esto es esencialmente un redondeo al mes más cercano para simplificar el cálculo de duración.

Ejemplo: fecha cruda = 16/01/2027, día = 16 (> 15) → fecha normalizada = **01/02/2027**... Pero según los datos cacheados, con día 16 y mes 1 (enero), `P7 < 16` es falso y `P7 > 15` es falso (P7=1, que es el mes, no el día). Revisemos:

> **⚠️ Corrección importante:** La variable `P7` es `MONTH(fecha_cruda)`, es decir el **número del mes** (no el día). Entonces la lógica real es:
> - Si el **mes** de la fecha cruda es **menor a 16** (siempre verdadero, ya que los meses van de 1 a 12) → Se toma `fecha_cruda − DÍA(fecha_cruda) + 1`, que es el **primer día de ese mes**.
>
> En la práctica, esta rama **siempre se ejecuta** porque ningún mes supera 15. La segunda rama (`P7 > 15`) parece ser código muerto o una validación residual. El resultado neto es que la fecha de resolución siempre se normaliza al **primer día del mes** en que cae la fecha cruda.

Ejemplo corregido: fecha cruda = 16/01/2027 → fecha normalizada = **01/01/2027**.

### 3.5. Duración del contrato en meses

Se calcula como la diferencia en **meses completos** entre la fecha de inicio del contrato y la fecha de resolución normalizada.

Ejemplo: inicio = 01/11/2025, resolución = 01/01/2027 → **14 meses**.

Los valores esperados están en el rango de **14 a 18 meses**.

### 3.6. Años hasta la resolución

Se calcula como la diferencia entre el **año** de la fecha de resolución y el **año** de la fecha de inicio del contrato. Este dato es un entero simple (no considera meses ni días, solo el año calendario).

Ejemplo: resolución en 2027, inicio en 2025 → **2 años**.

### 3.7. Edad proyectada del cliente

Se suma la **edad actual** más los **años hasta la resolución**.

Ejemplo: 73 años actuales + 2 años = **75 años proyectados**.

Esta es la edad que el sistema estima tendrá el cliente cuando se resuelva su trámite, y es la llave de búsqueda principal en la tabla de pensiones.

---

## 4. La tabla de pensiones

El corazón del cálculo es una tabla fija almacenada dentro de la hoja "INFORME COSTO MENSUAL" que contiene los montos de pensión mensual indexados por edad y año de resolución.

### 4.1. Estructura de la tabla

La tabla tiene **26 filas** (edades de 83 a 59, en orden descendente) y **5 columnas de años** (2023 a 2027), más una columna auxiliar de valores base originales.

| Edad | Base original | 2023 (ajustada) | 2024 | 2025 | 2026 | 2027 |
|------|--------------|-----------------|------|------|------|------|
| 83 | $7,003 | $7,003 | $8,400 | $9,400 | $10,100 | $10,900 |
| 82 | $7,003 | $7,003 | $8,400 | $9,400 | $10,100 | $10,900 |
| ... | ... | ... | ... | ... | ... | ... |
| 66 | $7,003 | $7,003 | $8,400 | $9,400 | $10,100 | $10,900 |
| **65** | **$7,003** | **$7,003** | **$8,400** | **$9,400** | **$10,100** | **$10,900** |
| 64 | $6,253 | $6,653 (95%) | $8,400 | $9,400 | $10,100 | $10,900 |
| 63 | $5,924 | $6,303 (90%) | $8,400 | $9,400 | $10,100 | $10,900 |
| 62 | $5,595 | $5,953 (85%) | $8,400 | $9,400 | $10,100 | $10,900 |
| 61 | $5,266 | $5,602 (80%) | $8,400 | $9,400 | $10,100 | $10,900 |
| 60 | $4,937 | $5,252 (75%) | $8,400 | $9,400 | $10,100 | $10,900 |
| 59 | $4,937 | $5,252 (75%) | $8,400 | $9,400 | $10,100 | $10,900 |

### 4.2. Comportamiento de los valores por año

**Columna 2023 (ajustada):**

- Para edades de **65 a 83**: valor fijo de **$7,003** (pensión garantizada completa).
- Para edades de **64 a 59**: se aplica un porcentaje decreciente sobre la base de $7,003:
  - 64 años → 95% = $6,652.85
  - 63 años → 90% = $6,302.70
  - 62 años → 85% = $5,952.55
  - 61 años → 80% = $5,602.40
  - 60 años → 75% = $5,252.25
  - 59 años → 75% = $5,252.25

Esto refleja que en 2023, la pensión se reduce proporcionalmente para quienes no han alcanzado los 65 años (edad de pensión plena).

**Columnas 2024 a 2027:**

Para **todas las edades** (59 a 83), los valores son **planos** (no varían por edad):

| Año | Monto (todas las edades) |
|-----|------------------------|
| 2024 | $8,400 |
| 2025 | $9,400 |
| 2026 | $10,100 |
| 2027 | $10,900 |

Estos valores planos sugieren que corresponden a la **Pensión Mínima Garantizada** establecida por ley, que se incrementa anualmente y aplica por igual independientemente de la edad. La diferenciación por edad solo existía en la columna 2023.

### 4.3. Columna de "Base original"

Existe una columna adicional con valores base que parecen ser los montos originales sin ajuste:

- 65+ años: $7,003
- 64: $6,253
- 63: $5,924
- 62: $5,595
- 61: $5,266
- 60–59: $4,937

Estos valores no se usan directamente en el cálculo de la pensión; la columna 2023 ajustada los reemplaza con los porcentajes descritos arriba. Para la migración, esta columna puede **ignorarse** a menos que se necesite reconstruir históricamente.

---

## 5. La fórmula de búsqueda

Con la **edad proyectada** y el **año de resolución** listos, la pensión se obtiene con una búsqueda simple en la tabla:

### 5.1. Selección de columna por año

La lógica selecciona qué columna de la tabla usar basándose en el año de la fecha de resolución normalizada:

- Año de resolución = **2024** → Se busca en la **5ª columna** del rango de la tabla (columna 2024)
- Año de resolución = **2025** → Se busca en la **6ª columna** (columna 2025)
- Año de resolución = **2026** → Se busca en la **7ª columna** (columna 2026)
- Año de resolución = **2027** → Se busca en la **8ª columna** (columna 2027)
- **Cualquier otro año** → No produce resultado (cadena vacía)

### 5.2. Búsqueda por edad

Se busca la edad proyectada en la primera columna de la tabla (AE, con edades de 83 a 59). La búsqueda es **exacta** (sin aproximación): si la edad no existe en la tabla, se produce un error.

### 5.3. Resultado

El cruce edad × año devuelve el monto de pensión mensual.

Ejemplo: edad proyectada = 75, año de resolución = 2027 → intersección = **$10,900**.

> **⚠️ Consideración para la migración:** La tabla solo cubre años de resolución 2024 a 2027. Si el sistema sigue operando en 2028 o más, será necesario agregar columnas nuevas a la tabla de referencia. Para React, se recomienda diseñar esta tabla como un **recurso configurable** (JSON, base de datos o archivo de configuración) que se pueda actualizar sin modificar el código.

---

## 6. Dónde se utiliza la pensión calculada

El monto de pensión mensual estimada es consumido en **6 puntos** del sistema:

### 6.1. Cálculo del préstamo financiero (DATOS GENERALES)

Si el saldo AFORE del cliente no alcanza a cubrir el costo total del trámite, se calcula un préstamo:

**Préstamo = Pensión mensual × 7.5 − $10,000**

Ejemplo: $10,900 × 7.5 − $10,000 = **$71,750**.

La lógica detrás del multiplicador 7.5 parece representar 7.5 meses de pensión como garantía del crédito, menos un descuento fijo de $10,000.

### 6.2. Cálculo del costo de gestoría (INFORME COSTO MENSUAL)

Para contratos de 15 meses o más, el costo de gestoría es:

**Gestoría = Pensión mensual × 2**

Ejemplo: $10,900 × 2 = **$21,800**.

Para contratos de exactamente 14 meses, la gestoría tiene un valor fijo de $18,000 que no depende de la pensión.

### 6.3. Hojas de Proyección de Pensión (3 variantes)

Las tres hojas de proyección (normal, \_1 y PLUS) usan la pensión en dos contextos:

**a) Presentación al cliente — "Pensión sin estrategia" y "Pensión con estrategia":**

- **Pensión mensual:** el valor directo ($10,900).
- **Aguinaldo:** pensión mensual × 90% ($9,810).
- **Pensión anual:** (pensión mensual × 12) + aguinaldo ($140,610).

**b) Cálculo del descuento por crédito financiero:**

Si el cliente recibe un préstamo, durante los primeros 60 meses se le descuenta el 30% de la pensión para pagar el crédito:

- **Descuento mensual congelado (60 meses):** Pensión mensual × 30% ($3,270).
- **Pensión temporal durante 60 meses:** Pensión mensual − descuento ($7,630).

Después de los 60 meses, el cliente recibe la pensión completa.

---

## 7. Dato complementario: Mes y año de presentación ante el IMSS

Junto con la pensión, el sistema calcula cuándo se debe presentar la solicitud ante el IMSS. Aunque no es parte del monto de pensión, se calcula en el mismo momento y con las mismas variables intermedias:

### 7.1. Mes de presentación

Se determina avanzando en un contador de meses desde el mes de inicio del contrato. El sistema cuenta los meses secuencialmente (noviembre → diciembre → enero → febrero...) y según la duración del contrato, selecciona el mes correspondiente:

- Contrato de **14 meses** → Se toma el **mes 15** en la secuencia (2 posiciones después del fin del contrato).
- Contrato de **15 meses** → Mes 16 en la secuencia.
- Contrato de **16 meses** → Mes 17 en la secuencia.
- Contrato de **17 meses** → Mes 18 en la secuencia.
- Contrato de **18 meses** → Mes 19 en la secuencia.

El número de mes se traduce a nombre usando una tabla de referencia (1 = ENERO, 2 = FEBRERO, ..., 12 = DICIEMBRE).

### 7.2. Año de presentación

Se toma el año de la fecha de resolución normalizada. Si la resolución cae en **noviembre o diciembre**, el año de presentación se recorre al **año siguiente** (se suma 1 año), porque la presentación efectiva ocurriría ya en el siguiente año calendario.

---

## 8. Cadena completa de dependencias (resumen visual)

```
DATOS DEL ASESOR
│
├── CURP ──────────────────────────► Fecha de nacimiento
│                                         │
│                                         ▼
│                                    Edad actual (años completos hasta hoy)
│                                         │
│                                         │   ┌─ Años hasta resolución ◄─────────┐
│                                         │   │  (año resolución − año contrato)  │
│                                         ▼   ▼                                   │
│                                    EDAD PROYECTADA ──────────────────┐          │
│                                    (edad actual + años)              │          │
│                                                                      │          │
├── Semanas cotizadas ────────► Fecha resolución cruda                 │          │
│                                    │                                 │          │
│                                    ▼                                 │          │
├── Fecha inicio contrato ──► Fecha resolución normalizada ────────────┤          │
│                                    │                                 │          │
│                                    ├──────────────────────────────────┘          │
│                                    │                                            │
│                                    ▼                                            │
│                               Año de resolución ──────────────────┐             │
│                                    │                              │             │
│                                    ├──────────────────────────────┼─────────────┘
│                                    │                              │
│                                    │                              ▼
│                                    │                     TABLA DE PENSIONES
│                                    │                     (edad × año → monto)
│                                    │                              │
│                                    │                              ▼
│                                    │                    ╔═══════════════════╗
│                                    │                    ║  PENSIÓN MENSUAL  ║
│                                    │                    ║    ESTIMADA       ║
│                                    │                    ╚═══════════════════╝
│                                    │                         │    │    │
│                                    ▼                         │    │    │
│                              Duración contrato               │    │    │
│                              (meses)                         │    │    │
│                                    │                         │    │    │
│                                    ▼                         ▼    │    ▼
│                              Costo total ◄──── Gestoría (×2) │    Préstamo (×7.5−10K)
│                              del trámite                     │
│                                                              ▼
│                                                     Proyecciones de pensión
│                                                     (anual, aguinaldo, descuentos)
│
└── NSS ──────────────────────────► Ley aplicable (73 o 97)
                                    (validación: solo Ley 73)
```

---

## 9. Reglas de negocio consolidadas

### 9.1. Validaciones que impiden el cálculo

| Regla | Condición de bloqueo | Mensaje |
|-------|---------------------|---------|
| CURP inválido | Longitud ≠ 18 caracteres | "Favor de ingresar la CURP a 18 posiciones" |
| NSS inválido | Longitud ≠ 11 caracteres | "Favor de ingresar el NSS a 11 posiciones" |
| Semanas insuficientes | Menos de 430 semanas | "El mínimo de semanas permitidas es de 430" |
| Saldo AFORE insuficiente | Menos de $15,000 | "El monto mínimo para este producto es de $15,000" |
| Edad muy joven | Menos de 58 años y 6 meses | "Prospecto no válido, edad mínima 58 años 6 meses" |
| Ley incorrecta | Ley 97 (cotización posterior al 01/07/1997) | "Prospecto no válido para este producto (Ley 97)" |

### 9.2. Validaciones que restringen opciones

| Regla | Condición | Efecto |
|-------|-----------|--------|
| Edad límite para financiamiento | Mayor de 68 años | Solo puede usar modalidad "Reactiva Tradicional", no "Financiado 100" |

### 9.3. Rangos válidos de las variables intermedias

| Variable | Rango esperado |
|----------|---------------|
| Edad actual | 58.5 a ~85 años |
| Edad proyectada | 59 a 83 años (rango de la tabla) |
| Año de resolución | 2024 a 2027 (columnas de la tabla) |
| Duración del contrato | 14 a 18 meses |
| Pensión mensual | $4,937 a $10,900 |

---

## 10. Consideraciones para la implementación en React

### 10.1. Tabla de pensiones como datos configurables

La tabla de pensiones debe tratarse como un **recurso externo** (JSON, API o base de datos), no como valores hardcoded. Esto porque:

- Se agregan columnas nuevas cada año (2028, 2029...).
- Los montos pueden actualizarse por decreto (Pensión Mínima Garantizada).
- La columna 2023 tiene lógica especial con porcentajes que podría repetirse en futuros años.

Estructura sugerida para la tabla en JSON:

```json
{
  "pensionTable": {
    "years": [2023, 2024, 2025, 2026, 2027],
    "rows": [
      { "age": 83, "values": [7003, 8400, 9400, 10100, 10900] },
      { "age": 82, "values": [7003, 8400, 9400, 10100, 10900] },
      ...
      { "age": 60, "values": [5252.25, 8400, 9400, 10100, 10900] },
      { "age": 59, "values": [5252.25, 8400, 9400, 10100, 10900] }
    ]
  }
}
```

### 10.2. Cálculo de fecha de nacimiento desde CURP

Se recomienda usar una función reutilizable que además valide la coherencia de la fecha:

```javascript
function extractBirthDateFromCURP(curp) {
  const yearStr = curp.substring(4, 6);
  const month = curp.substring(6, 8);
  const day = curp.substring(8, 10);
  // Considerar siglo: si el año es > 50, asumir 1900s; si no, 2000s
  const fullYear = parseInt(yearStr) > 50 ? `19${yearStr}` : `20${yearStr}`;
  return new Date(`${fullYear}-${month}-${day}`);
}
```

### 10.3. Cálculo de diferencia en meses y años

Se requieren funciones de diferencia de fechas equivalentes a `DATEDIF` de Excel:

```javascript
function diffInFullYears(dateFrom, dateTo) {
  let years = dateTo.getFullYear() - dateFrom.getFullYear();
  const monthDiff = dateTo.getMonth() - dateFrom.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && dateTo.getDate() < dateFrom.getDate())) {
    years--;
  }
  return years;
}

function diffInFullMonths(dateFrom, dateTo) {
  return (dateTo.getFullYear() - dateFrom.getFullYear()) * 12
    + (dateTo.getMonth() - dateFrom.getMonth());
}
```

### 10.4. Función principal de cálculo de pensión

```javascript
function calculateMonthlyPension({ curp, weeksCotizadas, contractStartDate, pensionTable }) {
  // 1. Fecha de nacimiento
  const birthDate = extractBirthDateFromCURP(curp);

  // 2. Edad actual
  const currentAge = diffInFullYears(birthDate, new Date());

  // 3. Fecha resolución cruda
  const daysToAdd = weeksCotizadas > 448
    ? 63 * 7   // 441 días
    : (510 - weeksCotizadas) * 7;
  const rawResolutionDate = addDays(contractStartDate, daysToAdd);

  // 4. Fecha resolución normalizada (primer día del mes)
  const normalizedResolution = new Date(
    rawResolutionDate.getFullYear(),
    rawResolutionDate.getMonth(),
    1
  );

  // 5. Años hasta resolución
  const yearsUntilResolution = normalizedResolution.getFullYear()
    - contractStartDate.getFullYear();

  // 6. Edad proyectada
  const projectedAge = currentAge + yearsUntilResolution;

  // 7. Año de resolución
  const resolutionYear = normalizedResolution.getFullYear();

  // 8. Búsqueda en tabla
  const yearIndex = pensionTable.years.indexOf(resolutionYear);
  if (yearIndex === -1) return null; // Año fuera de rango

  const row = pensionTable.rows.find(r => r.age === projectedAge);
  if (!row) return null; // Edad fuera de rango

  return {
    monthlyPension: row.values[yearIndex],
    projectedAge,
    resolutionYear,
    resolutionDate: normalizedResolution,
    contractMonths: diffInFullMonths(contractStartDate, normalizedResolution)
  };
}
```

### 10.5. Flujo de dependencias para el state management

En React, el cálculo de la pensión debería dispararse automáticamente cuando cambien cualquiera de estas cuatro entradas: CURP, semanas cotizadas, fecha de inicio del contrato, o la tabla de pensiones. Se recomienda usar un `useMemo` o `useEffect` que observe estos valores y recalcule toda la cadena cada vez que uno cambie.
