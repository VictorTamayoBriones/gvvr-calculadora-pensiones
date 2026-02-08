# Reglas, Flujos y Validaciones del Campo "Modalidad"

## 1. ¿Qué es el campo Modalidad?

El campo **Modalidad** es un selector desplegable (combo/dropdown) que define el esquema de financiamiento bajo el cual Grupo AVIVIR gestionará la recuperación de pensión de un cliente. No es un valor calculado automáticamente: el asesor debe elegir manualmente una de las opciones que el sistema le presenta. Sin embargo, **las opciones disponibles se generan dinámicamente** según las condiciones financieras del cliente.

---

## 2. Valores posibles del combo

El combo ofrece como máximo dos opciones, generadas por dos cálculos internos:

### Opción principal (siempre visible)

Se determina comparando la **capacidad financiera del cliente** contra el **costo total del trámite**:

- **"FINANCIADO 100"** → Cuando la suma del saldo AFORE del cliente más el monto del préstamo calculado **es igual o mayor** al costo total del trámite. Significa que los recursos disponibles (propios + financiados) cubren por completo el costo.

- **"FINANCIADO 1"** (con espacio al inicio, posiblemente un error tipográfico que debería ser "REACTIVA FINANCIADO 100") → Cuando la suma del saldo AFORE más el préstamo calculado **es menor** que el costo total del trámite. Significa que incluso con financiamiento adicional, los recursos no alcanzan a cubrir el costo total.

### Opción secundaria (condicionada)

- **"REACTIVA TRADICIONAL"** → Solo aparece como opción si la opción principal produjo exactamente el texto `"REACTIVA FINANCIADO 100"`. En cualquier otro caso, esta segunda posición del combo queda vacía (solo habría una opción real).

> **⚠️ Observación de inconsistencia:** Con la fórmula actual, la opción principal nunca produce la cadena exacta `"REACTIVA FINANCIADO 100"` (produce `" FINANCIADO 1"` o `"FINANCIADO 100"`), por lo que la opción "REACTIVA TRADICIONAL" **nunca se activa en la práctica**. Esto parece ser un defecto o una fórmula que fue modificada sin actualizar las dependencias.

---

## 3. Significado de cada modalidad según las reglas de negocio

Una vez seleccionada la modalidad, el sistema muestra un mensaje informativo:

- **REACTIVA TRADICIONAL**: "El cliente está obligado a pagar su inscripción y meses de contratación, solo GRUPO AVIVIR financiará la GESTIÓN." Es decir, el cliente paga de su bolsillo las mensualidades y la inscripción, y Grupo AVIVIR solo cubre el costo de gestoría.

- **REACTIVA FINANCIADO 100**: "GRUPO AVIVIR financiará el 100% de la inscripción, pagos mensuales y la gestión." Es decir, Grupo AVIVIR asume todos los costos del proceso y los cobra al final del trámite.

- **FINANCIADO 100** (sin "REACTIVA"): No tiene un mensaje asociado explícito, pero por contexto funciona de manera similar al financiado completo.

---

## 4. Datos de entrada que determinan las opciones del combo

Las opciones del combo dependen de una cadena de cálculos que se alimenta de estos datos capturados por el asesor:

### 4.1. Saldo AFORE del cliente

Es el monto disponible en las subcuentas de SAR 92, Retiro 97 y Vivienda. Tiene una **validación de mínimo $15,000**; si el monto es inferior, el sistema muestra un error indicando que el producto no es viable para ese cliente.

### 4.2. Fecha de inicio del contrato

Define cuándo arranca formalmente el proceso de recuperación. Es fundamental porque a partir de ella se calcula:

- La **duración del contrato en meses** (desde la fecha de inicio hasta la fecha estimada de resolución).
- El **año calendario** de cada pago mensual, lo que determina la tarifa aplicable según las tablas de precios anuales.

### 4.3. Semanas cotizadas

El número de semanas que el cliente cotizó ante el IMSS. Tiene una **validación de mínimo 430 semanas**; con menos semanas, el sistema rechaza el ingreso indicando que el producto no es viable. Las semanas cotizadas son clave para:

- Calcular la **pensión mensual estimada** del cliente (mediante una tabla de referencia).
- Determinar la **fecha estimada de resolución** del trámite.

### 4.4. CURP del cliente

Se usa para extraer la **fecha de nacimiento** (posiciones 5-10 del CURP) y, a partir de ella, calcular la **edad actual** del cliente. La edad tiene dos umbrales de validación:

- **Menor de 58 años y 6 meses**: El sistema marca al prospecto como no válido para este producto; no cumple con la edad mínima de contratación.
- **Mayor de 68 años**: El sistema advierte que solo aplica para la modalidad "Reactiva Tradicional"; para "Reactiva Financiado 100" solo son viables clientes menores de 68 años.

### 4.5. NSS (Número de Seguridad Social)

Se captura con una **validación de longitud exacta de 11 caracteres**. No interviene directamente en el cálculo de la modalidad, pero es un requisito obligatorio del expediente. Además, a partir del NSS se extrae información sobre la **ley aplicable** (Ley 73 o Ley 97), y si el cliente es de Ley 97, el sistema lo marca como "Prospecto no válido para este producto."

---

## 5. Flujo de decisión principal: ¿Qué opciones muestra el combo?

El flujo completo para determinar las opciones es el siguiente:

### Paso 1: Calcular la pensión mensual estimada

**Entradas:** semanas cotizadas, fecha de nacimiento (edad actual), fecha de inicio del contrato.

1. Se calcula la **edad proyectada del cliente** al momento de la resolución del trámite. Esto se hace sumando la edad actual más los años que transcurrirán desde la fecha de inicio del contrato hasta la fecha estimada de resolución.
2. Con esa edad proyectada, se busca en una **tabla de pensiones** el monto mensual estimado. La tabla tiene columnas por año de resolución (2024, 2025, 2026, 2027) y filas por edad (de 59 a 83 años). A mayor edad, la pensión tiende a un valor tope (por ejemplo, $10,900 para resolución en 2027). Para edades más jóvenes (menores de ~65), los montos son menores.

**Resultado:** Un monto de pensión mensual estimada (por ejemplo, $10,900).

*(Ver subflujo detallado en la sección 7.)*

### Paso 2: Calcular el monto del préstamo financiero

**Entradas:** saldo AFORE, costo total del trámite (aún por calcular), pensión mensual estimada.

1. Se compara el **saldo AFORE** contra el **costo total del trámite**.
2. Si el saldo AFORE **ya cubre** el costo total → el préstamo es **$0** (no necesita financiamiento).
3. Si el saldo AFORE **no cubre** el costo total → el préstamo se calcula como: **pensión mensual estimada × 7.5 − $10,000**. Es decir, se toman 7.5 meses de la pensión futura como base de crédito y se le descuentan $10,000.

**Ejemplo con valores reales:** Si la pensión estimada es $10,900, el préstamo sería: $10,900 × 7.5 − $10,000 = **$71,750**.

### Paso 3: Evaluar la capacidad financiera total del cliente

Se suma: **Saldo AFORE + Monto del préstamo**.

Se compara contra el **Costo total del trámite**.

- Si **(Saldo AFORE + Préstamo) ≥ Costo total** → La opción principal será **"FINANCIADO 100"**.
- Si **(Saldo AFORE + Préstamo) < Costo total** → La opción principal será **"FINANCIADO 1"** (que debería significar que se necesita un esquema de financiamiento especial por insuficiencia de fondos).

### Paso 4: Evaluar la opción secundaria

- Si la opción principal resultó ser exactamente `"REACTIVA FINANCIADO 100"`, entonces se agrega **"REACTIVA TRADICIONAL"** como segunda opción.
- En cualquier otro caso, el combo solo tiene una opción disponible.

### Paso 5: Si el préstamo es necesario y la modalidad resultante lo indica

El sistema muestra un mensaje adicional: **"NECESITA PRÉSTAMO FINANCIERO:"** junto con el monto estimado del préstamo (almacenado en un campo aparte, por ejemplo $80,000).

---

## 6. Subflujo: Cálculo del Costo Total del Trámite

El costo total es la suma de todos los pagos que se deben realizar durante la vida del contrato. Su cálculo depende de la **duración del contrato en meses** y de las **tarifas vigentes por año**.

### 6.1. Determinación de la duración del contrato

La duración se calcula como la diferencia en meses entre la **fecha de inicio del contrato** y la **fecha estimada de resolución**.

La fecha de resolución se calcula a partir de las **semanas cotizadas**:

- Si el cliente tiene más de 448 semanas (aprox. 8.6 años) → La resolución se estima en **63 semanas** (aprox. 441 días) después de la fecha de inicio.
- Si tiene 448 semanas o menos → La resolución se estima en **(510 − semanas cotizadas) × 7 días** después de la fecha de inicio.

El resultado típico es un contrato de **14 a 18 meses**.

### 6.2. Estructura de costos mensuales

Cada mes del contrato tiene un costo que se busca en una **tabla de precios por año**:

| Año  | Costo mensual unitario | Costo mensual Modalidad 100 (×2) | Costo doble (inscripción) |
|------|----------------------|----------------------------------|--------------------------|
| 2023 | $2,200               | $4,400                           | $4,400                   |
| 2024 | $2,400               | $4,800                           | $4,800                   |
| 2025 | $2,650               | $5,300                           | $5,300                   |
| 2026 | $3,200               | $6,400                           | $6,400                   |
| 2027 | $3,950               | $7,900                           | $7,900                   |

Para la modalidad Financiado 100, el costo mensual se multiplica por 2.

### 6.3. Costo de inscripción (primer mes)

El primer mes tiene un costo especial de inscripción que depende del año actual al momento del cálculo:

- Si la fecha actual es posterior al 31 de enero de 2023: **$3,500 × 2 = $7,000**
- Si la fecha actual es posterior al 31 de enero de 2024: **$3,800 × 2 = $7,600**
- Si la fecha actual es posterior al 31 de enero de 2025: **$4,200 × 2 = $8,400**
- Si la fecha actual es posterior al 31 de enero de 2026: **$4,650 × 2 = $9,300**

Se evalúan en orden; la primera condición verdadera es la que aplica (la lógica evalúa de más antiguo a más reciente, tomando la primera que se cumple).

### 6.4. Costo de gestoría

La gestoría es el costo del servicio de gestión ante las autoridades. Su valor depende de la duración:

- **Para contratos de 14 meses**: costo fijo de **$18,000**
- **Para contratos de 15 meses o más**: se calcula como **pensión mensual estimada × 2**. Ejemplo: con pensión de $10,900, la gestoría sería $21,800.

### 6.5. Cálculo del costo total según duración

| Duración | Costo total |
|----------|-------------|
| **14 meses** | Suma de los 14 pagos mensuales (inscripción + 13 meses) + Gestoría fija ($18,000) |
| **15 meses** | Valor fijo de $16,000 como total general (parece un caso especial simplificado) |
| **16 meses** | Suma de todos los pagos mensuales (16 meses) como cuerpo + Gestoría separada |
| **17 meses** | Suma de todos los pagos (inscripción + 16 meses + gestoría) |
| **18 meses** | Se busca en tabla de precios con VLOOKUP por año + Gestoría separada + Total |

Para contratos de **16 meses o más**, el desglose incluye subtotales parciales y la gestoría se calcula por separado como pensión × 2 y se suma al final.

---

## 7. Subflujo: Cálculo de la Pensión Mensual Estimada

### 7.1. Entradas necesarias

- **Edad proyectada del cliente**: Se calcula como la edad actual (derivada de la fecha de nacimiento extraída del CURP) más los años que faltan desde la fecha de inicio del contrato hasta la fecha de resolución.
- **Año de resolución**: El año calendario en que se espera que el trámite concluya.

### 7.2. Tabla de pensiones

El sistema contiene una tabla con las siguientes dimensiones:

- **Filas**: Edades de 59 a 83 años.
- **Columnas**: Año de resolución (2024, 2025, 2026, 2027).

Los valores representan la pensión mensual estimada en pesos. La tabla muestra un patrón donde:

- Para edades de **65 años en adelante**, la pensión alcanza valores máximos que varían por año: $7,003 (2024), $8,400 (2025), $9,400 (2026), $10,100 (2026), $10,900 (2027).
- Para edades **menores a 65**, los montos son progresivamente menores. Por ejemplo, a los 59 años la pensión base es de aproximadamente $4,937 y con ajuste $5,252.

### 7.3. Proceso de búsqueda

1. Se toma la **edad proyectada** del cliente.
2. Se identifica el **año de resolución** (derivado de la fecha estimada de resolución).
3. Se busca en la tabla la intersección edad/año para obtener el **monto de pensión mensual**.

Este monto alimenta tanto el cálculo del préstamo financiero (paso 2 del flujo principal) como el costo de gestoría (para contratos ≥ 15 meses).

---

## 8. Resumen de validaciones previas al combo

Antes de que el combo de modalidad sea funcional, el sistema valida:

| Validación | Regla | Mensaje de error |
|------------|-------|------------------|
| **Semanas cotizadas** | Mínimo 430 semanas | "El mínimo de semanas permitidas para este producto es de 430" |
| **Saldo AFORE** | Mínimo $15,000 | "El monto mínimo para este producto es de $15,000 (SAR 92, Retiro 97, Vivienda)" |
| **NSS** | Exactamente 11 caracteres | "Favor de ingresar el NSS a 11 posiciones" |
| **CURP** | Exactamente 18 caracteres | "Favor de ingresar la CURP a 18 posiciones" |
| **Edad mínima** | ≥ 58 años y 6 meses (702 meses) | "Prospecto no válido, edad mínima de contratación 58 años 6 meses" |
| **Edad máxima para Financiado 100** | < 68 años (816 meses) | "Solo aplica para Reactiva Tradicional; para Financiado 100 solo viables menores de 68 años" |
| **Ley aplicable** | Debe ser Ley 73 (cotización antes del 1 de julio de 1997) | "Prospecto no válido para este producto (Ley 97)" |

---

## 9. Diagrama de flujo resumido

```
INICIO
  │
  ├── Capturar: NSS, CURP, Semanas cotizadas, Saldo AFORE, Fecha inicio contrato
  │
  ├── Validar datos de entrada (semanas ≥ 430, saldo ≥ $15,000, edad entre 58.5 y 68, Ley 73)
  │
  ├── Calcular fecha estimada de resolución (basada en semanas cotizadas)
  │
  ├── Calcular duración del contrato en meses
  │
  ├── Calcular pensión mensual estimada (edad proyectada + año resolución → tabla de pensiones)
  │
  ├── Calcular costo total del trámite (pagos mensuales según tabla de precios + gestoría)
  │
  ├── Calcular préstamo financiero:
  │     ├── Si Saldo AFORE ≥ Costo total → Préstamo = $0
  │     └── Si Saldo AFORE < Costo total → Préstamo = Pensión × 7.5 − $10,000
  │
  ├── Evaluar opciones del combo:
  │     ├── Si (Saldo AFORE + Préstamo) ≥ Costo total → "FINANCIADO 100"
  │     └── Si (Saldo AFORE + Préstamo) < Costo total → "FINANCIADO 1"
  │
  └── Asesor selecciona modalidad del combo
```

---

## 10. Referencia circular detectada

Existe una dependencia circular entre la modalidad seleccionada y el cálculo del costo total:

1. El **costo total** depende de un campo de la hoja "Informe Costo Mensual" que consulta la modalidad seleccionada para determinar si el cálculo aplica (`"RETOMA"` o `"MODALIDAD 50"` produce `"N/A"`, de lo contrario calcula el costo).
2. La **modalidad** depende del costo total para generar sus opciones.

En la práctica, Excel resuelve esto con cálculo iterativo: primero calcula el costo asumiendo un valor inicial para la modalidad, luego evalúa la modalidad, y repite hasta estabilizarse. En una implementación web, será necesario definir un **valor por defecto** para la modalidad o **romper el ciclo** calculando el costo total sin depender de la modalidad seleccionada (ya que el cálculo solo se invalida cuando la modalidad es "RETOMA" o "MODALIDAD 50", valores que no se producen en el flujo de Financiado 100).
