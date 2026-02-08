# Análisis Técnico — Migración Calculadora F100 a Sistema Web

---

## 1. Alcance y objetivo

La hoja `INFORME COSTO MENSUAL` dentro de `CALCULADORA_-_RECUPERACION_F100.xlsx` contiene tres responsabilidades funcionales que actualmente viven mezcladas en una sola interfaz:

1. **Motor de validación** — reglas de elegibilidad del cliente (edad, ley, restricciones por modalidad).
2. **Motor de cálculo** — generación de la tabla de pagos mensuales según modalidad, año calendario y cargos F100+.
3. **Motor de proyección** — estimación del monto mensual de pensión y fechas clave.

El objetivo de esta migración es separar estas responsabilidades en capas independientes, persistir las tablas de referencia en base de datos (actualmente embebidas en la hoja), y exponer toda la lógica mediante una API que cualquier frontend pueda consumir de forma consistente y auditable.

---

## 2. Entidades del dominio

### 2.1 Cliente

| Campo | Tipo | Ejemplo | Celda origen |
|---|---|---|---|
| nombre | string | GARCES HERNANDEZ JOSE LUIS | E10 |
| nss | string (11 chars) | 01705189114 | E11 |
| curp | string (18 chars) | GAHL521102HDFRRS02 | E12 |
| fechaNacimiento | date | 1952-11-02 | I12 |
| fechaBaja | date | 2009-04-16 | I14 |
| sinVigenciaDerechos | date | 2013-05-30 | L14 |
| semanaCotizadas | int | 860 | L12 |
| ley | enum `73 \| 97` | 73 | F14 |
| asesor | string | HCM | H8 |

**Regla de derivación:** `ley` se determina automáticamente en función de si la primera cotización fue anterior al 1° julio 1997. No debe ser editable por el usuario.

### 2.2 Contrato

| Campo | Tipo | Ejemplo | Origen |
|---|---|---|---|
| fechaFirma | date | 2026-01-30 | K2 |
| fechaAlta | date *(calculado)* | 2026-02-01 | Regla §4.2 |
| fechaInicio | date | 2025-11-01 | D18 |
| fechaFin | date *(calculado)* | 2027-01-01 | fechaInicio + totalMeses |
| totalMeses | int | 14 | I18 |
| semanasFinales | int *(calculado)* | 916 | §4.3 |
| modalidad | enum `1 \| 2 \| 3` | — | Selección del usuario |
| saldoAfore | decimal | 15,000 | D20 |
| prestamoFinanciero | decimal | 80,000 | D21 |

**Restricción:** `totalMeses` no puede ser menor a 14.

### 2.3 Modalidad de pago

No es una entidad persistida; es un parámetro que modifica los factores de cálculo:

| Modalidad | Nombre | Factor sobre costoBase | Usa saldo AFORE | Cargo F100+ | Restricción de edad |
|---|---|---|---|---|---|
| 1 | Retoma | ×1 | Sí | No | Sin restricción |
| 2 | Financiado 50% | ×0.5 | No | No | Sin restricción |
| 3 | Financiado 100% | ×2 | No | Sí | Edad ≤ 68 años |

### 2.4 Tablas de referencia

Estas tablas cambian raramente (probablemente anualmente). Deben vivir en la base de datos y ser editables por un rol administrador, nunca hardcoded en código de aplicación.

#### TablaCostos (origen: T1:W6)

| Año | costoBase | costoMitad | costoDuble |
|---|---|---|---|
| 2023 | 2,200 | 1,100 | 4,400 |
| 2024 | 2,400 | 1,200 | 4,800 |
| 2025 | 2,650 | 1,325 | 5,300 |
| 2026 | 3,200 | 1,600 | 6,400 |
| 2027 | 3,950 | 1,975 | 7,900 |
| 2028 | 4,700 | — | — |

> **Optimización:** `costoMitad` siempre es `costoBase / 2` y `costoDuble` siempre es `costoBase × 2`. En el sistema puedes almacenar únicamente `costoBase` y derivar los otros dos al momento del cálculo. Esto elimina la posibilidad de inconsistencia que existe hoy en Excel si alguien edita una columna sin actualizar las otras.

#### TablaPensiones (origen: AE6:AL31)

Monto mensual de pensión según edad del asegurado al momento de la resolución y año de resolución. Rango: edades 59–83, años 2023–2027.

> **Observación:** Las filas de edad 83 hasta aproximadamente 65 tienen valores idénticos por año, lo que indica la existencia de un tope superior por período. El sistema debe modelar esto con un campo `montoTope` por año en lugar de repetir filas redundantes.

#### CargoF100Plus (origen: columna L, filas 42–55)

| Posición en contrato | Cargo |
|---|---|
| Mes 1 | 11,850 |
| Mes 2 | 10,150 |
| Mes 3 a 14 | 11,250 (constante) |

> **Observación:** El cargo del mes 1 es más alto que los siguientes, lo cual sugiere un componente de activación. El mes 2 tiene un valor menor que el rango estable. Estos tres valores deben modelarse como una tabla simple indexada por posición dentro del contrato.

#### Mes 1 — Tasa especial

El primer mes del contrato siempre usa una tasa base de **3,500** independientemente del año calendario que corresponde a la fecha de inicio. Esto se refleja en la hoja: Nov 2025 debería usar el base de 2025 (2,650) pero en cambio muestra 3,500.

> **Pregunta para el área de producto:** ¿Es esta diferencia un cargo de activación fijo (850 = 3500 − 2650)? ¿O es un valor fijo absoluto para el primer mes? La respuesta determina cómo se modela en el sistema.

---

## 3. Esquema de base de datos

```sql
-- ============================================================
-- Tablas de referencia (editables por rol administrador)
-- ============================================================

CREATE TABLE tabla_costos (
    año            SMALLINT    PRIMARY KEY,
    costo_base     DECIMAL(10,2) NOT NULL
    -- costoMitad y costoDuble se calculan en capa de servicio
);

CREATE TABLE tabla_pensiones (
    año            SMALLINT    NOT NULL,
    edad           SMALLINT    NOT NULL,
    monto          DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (año, edad)
);

CREATE TABLE cargo_f100plus (
    posicion_mes   SMALLINT    PRIMARY KEY,  -- 1-based dentro del contrato
    cargo          DECIMAL(10,2) NOT NULL
);

CREATE TABLE config_general (
    clave          VARCHAR(50) PRIMARY KEY,
    valor          VARCHAR(100) NOT NULL,
    descripcion    TEXT
);
-- Ejemplo de seed:
-- ('tasa_mes_1', '3500', 'Tasa especial aplicada al primer mes de cualquier contrato')
-- ('monto_gestoria', '18000', 'Cargo de gestoría fijo al cierre del contrato')
-- ('edad_min_meses', '702', 'Edad mínima en meses para elegibilidad (58.5 años)')
-- ('edad_max_f100_meses', '816', 'Edad máxima en meses para modalidad F100+ (68 años)')
-- ('min_meses_contrato', '14', 'Duración mínima del contrato en meses')

-- ============================================================
-- Datos transaccionales
-- ============================================================

CREATE TABLE clientes (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre                  VARCHAR(150) NOT NULL,
    nss                     CHAR(11)    NOT NULL UNIQUE,
    curp                    CHAR(18)    NOT NULL,
    fecha_nacimiento        DATE        NOT NULL,
    fecha_baja              DATE,
    sin_vigencia_derechos   DATE,
    semanas_cotizadas       SMALLINT    NOT NULL,
    ley                     SMALLINT    NOT NULL CHECK (ley IN (73, 97)),
    asesor                  VARCHAR(50),
    created_at              TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE contratos (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id              UUID        NOT NULL REFERENCES clientes(id),
    fecha_firma             DATE        NOT NULL,
    fecha_alta              DATE        NOT NULL,       -- calculado al crear
    fecha_inicio            DATE        NOT NULL,
    fecha_fin               DATE        NOT NULL,       -- calculado
    total_meses             SMALLINT    NOT NULL CHECK (total_meses >= 14),
    semanas_finales         SMALLINT    NOT NULL,       -- calculado
    modalidad               SMALLINT    NOT NULL CHECK (modalidad IN (1, 2, 3)),
    saldo_afore             DECIMAL(10,2) DEFAULT 0,
    prestamo_financiero     DECIMAL(10,2) DEFAULT 0,
    estado                  VARCHAR(20) DEFAULT 'borrador',
    created_at              TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pagos_mensuales (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    contrato_id             UUID        NOT NULL REFERENCES contratos(id),
    numero_mes              SMALLINT    NOT NULL,       -- 1 a N
    fecha                   DATE        NOT NULL,
    nombre_mes              VARCHAR(10),                -- NOV, DIC, ENE...
    costo_base              DECIMAL(10,2) NOT NULL,
    cargo_f100plus          DECIMAL(10,2) DEFAULT 0,
    total                   DECIMAL(10,2) NOT NULL,
    UNIQUE (contrato_id, numero_mes)
);
```

---

## 4. Reglas de negocio

### 4.1 Validaciones de elegibilidad

Se ejecutan secuencialmente. Si cualquiera falla, el proceso se detiene y retorna un error descriptivo.

```
V1: edad_en_meses(cliente) >= config('edad_min_meses')   // 702 = 58.5 años
    → Error: "El asegurado no cumple la edad mínima de 58.5 años"

V2: cliente.ley == 73
    → Error: "Se requiere cotización previa al 01/07/1997 (Ley 73).
              El flujo para Ley 97 no está contemplado en este sistema."

V3: si contrato.modalidad == 3
        → edad_en_meses(cliente) <= config('edad_max_f100_meses')   // 816 = 68 años
    → Error: "La modalidad Financiado 100% solo aplica para edades ≤ 68 años"
```

### 4.2 Cálculo de fecha de alta

```
si dia(fechaFirma) entre 1 y 15:
    fechaAlta = primer día del mes de fechaFirma

si dia(fechaFirma) entre 16 y 31:
    fechaAlta = primer día del mes siguiente a fechaFirma
```

Ejemplo con los datos actuales: firma el 30 de enero → alta el 1° de febrero.

### 4.3 Cálculo de semanas finales

La hoja muestra 916 semanas (860 + 56). El valor 56 corresponde exactamente a 14 meses × 4 semanas. Sin embargo, un cálculo más preciso basado en días reales entre fechas da un resultado ligeramente diferente. Se recomienda usar las fechas reales:

```
semanasFinales = semanaCotizadas + floor(diffDays(fechaFin, fechaInicio) / 7)
```

> Esto debe validarse con el área de producto para confirmar qué método usa el sistema actual de IMSS al reconocer las semanas cotizadas.

### 4.4 Generación de pagos mensuales (núcleo del motor)

Este es el algoritmo central. Para cada mes del contrato se determina el año calendario correspondiente, se consulta el costo base de esa tabla, y se aplica el factor de la modalidad.

```
FUNCIÓN generarPagos(contrato, cliente):

    pagos = []

    PARA i = 1 hasta contrato.totalMeses:

        fechaMes = añadirMeses(contrato.fechaInicio, i - 1)
        año = year(fechaMes)

        // Mes 1 usa tasa especial
        SI i == 1:
            costoBase = config('tasa_mes_1')      // 3500
        SINO:
            costoBase = tablaCostos.lookup(año)   // ej: 2650, 3200...

        // Aplicar factor de modalidad
        SEGÚN contrato.modalidad:
            1 → monto = costoBase
            2 → monto = costoBase / 2
            3 → monto = costoBase × 2

        // Agregar cargo F100+ solo para MOD 3
        SI contrato.modalidad == 3:
            cargoF100 = cargoF100Plus.lookup(i)   // por posición en contrato
            total = monto + cargoF100
        SINO:
            cargoF100 = 0
            total = monto

        pagos.push({
            numero_mes: i,
            fecha: fechaMes,
            nombre_mes: formatMes(fechaMes),   // "NOV", "DIC"...
            costo_base: monto,
            cargo_f100plus: cargoF100,
            total: total
        })

    RETORNAR pagos
```

**Ejemplo de ejecución con datos actuales (MOD 1, 14 meses desde Nov 2025):**

| Mes | Fecha | Año | CostoBase | Monto MOD1 |
|---|---|---|---|---|
| 1 | Nov 2025 | 2025 | **3,500** (especial) | 3,500 |
| 2 | Dic 2025 | 2025 | 2,650 | 2,650 |
| 3 | Ene 2026 | 2026 | 3,200 | 3,200 |
| 4–14 | Feb–Dic 2026 | 2026 | 3,200 | 3,200 |
| **Total** | | | | **44,550** |

### 4.5 Resumen financiero

```
totalMensual   = SUM(pagos[].total)
gestoria       = config('monto_gestoria')              // 18,000
totalGeneral   = totalMensual + gestoria

// MOD 2 — desglose de inversión
inversionCliente  = SUM(pagos[].costo_base)            // lo que paga el cliente (50%)
inversionAvivir   = totalGeneral                       // lo que aporta el grupo (100% del costo total)

// MOD 3 — desglose con y sin F100+
totalSinF100Plus  = SUM(pagos[].costo_base)
totalConF100Plus  = totalGeneral
```

### 4.6 Proyección de pensión

```
fechaResolucion   = añadirMeses(contrato.fechaFin, 1)
edadAlResolucion  = calcularEdad(cliente.fechaNacimiento, fechaResolucion)
añoResolucion     = year(fechaResolucion)
montoPension      = tablaPensiones.lookup(añoResolucion, edadAlResolucion)
```

---

## 5. Diseño de la API

### 5.1 Endpoints

```
// Clientes
POST   /api/clientes                     → Crear cliente
GET    /api/clientes/:id                 → Obtener cliente por ID

// Contratos
POST   /api/contratos                    → Crear contrato (dispara validaciones + cálculos)
GET    /api/contratos/:id                → Obtener contrato con pagos generados
GET    /api/contratos/:id/comparador     → Retorna las 3 modalidades en un solo response

// Validaciones (para feedback en tiempo real en el form)
POST   /api/contratos/validar            → Ejecutar solo las validaciones, sin persistir

// Tablas de referencia (rol admin)
GET    /api/admin/costos                 → Listar tabla de costos por año
PUT    /api/admin/costos/:año            → Actualizar costo base de un año
GET    /api/admin/pensiones              → Listar tabla de pensiones
PUT    /api/admin/pensiones/:año/:edad   → Actualizar monto de pensión
GET    /api/admin/config                 → Listar configuración general
PUT    /api/admin/config/:clave          → Actualizar un valor de config
```

### 5.2 Ejemplo: POST /api/contratos

**Request:**
```json
{
  "clienteId": "a1b2c3d4-...",
  "fechaFirma": "2026-01-30",
  "fechaInicio": "2025-11-01",
  "totalMeses": 14,
  "modalidad": 1,
  "saldoAfore": 15000,
  "prestamoFinanciero": 80000
}
```

**Response 201:**
```json
{
  "id": "contrato-uuid",
  "fechaAlta": "2026-02-01",
  "fechaFin": "2027-01-01",
  "semanasFinales": 916,
  "pagos": [
    { "numero": 1,  "fecha": "2025-11-01", "mes": "NOV", "costoBase": 3500,  "cargoF100": 0, "total": 3500 },
    { "numero": 2,  "fecha": "2025-12-01", "mes": "DIC", "costoBase": 2650,  "cargoF100": 0, "total": 2650 },
    { "numero": 3,  "fecha": "2026-01-01", "mes": "ENE", "costoBase": 3200,  "cargoF100": 0, "total": 3200 },
    "...",
    { "numero": 14, "fecha": "2026-12-01", "mes": "DIC", "costoBase": 3200,  "cargoF100": 0, "total": 3200 }
  ],
  "resumen": {
    "totalMensual": 44550,
    "gestoria": 18000,
    "totalGeneral": 62550
  },
  "proyeccion": {
    "fechaIngresoPension": "2027-01-01",
    "fechaResolucionPension": "2027-02-01",
    "montoPension": 10900,
    "variacionEstimada": "±10%"
  }
}
```

### 5.3 Endpoint de comparador (alto valor para UX)

`GET /api/contratos/:id/comparador` retorna las tres modalidades simultáneamente, lo cual permite al frontend renderizar la vista side-by-side sin hacer tres llamadas separadas:

```json
{
  "mod1": {
    "nombre": "Retoma",
    "pagos": [...],
    "resumen": { "totalMensual": 44550, "gestoria": 18000, "totalGeneral": 62550 }
  },
  "mod2": {
    "nombre": "Financiado 50%",
    "pagos": [...],
    "resumen": {
      "totalMensual": 22275,
      "gestoria": 18000,
      "inversionCliente": 40275,
      "inversionAvivir": 62550,
      "totalGeneral": 62550
    }
  },
  "mod3": {
    "nombre": "Financiado 100%",
    "elegible": false,
    "motivo": "La edad del cliente (73 años) excede el máximo permitido (68 años)",
    "pagos": [...],
    "resumen": {
      "totalMensual": 89100,
      "totalF100Plus": 157000,
      "gestoria": 18000,
      "totalGeneral": 175000
    }
  }
}
```

> MOD 3 se retorna con sus datos calculados pero marcada como `elegible: false` con el motivo. El frontend puede mostrarla griseada con la explicación.

---

## 6. Estructura del frontend

### 6.1 Árbol de componentes

```
App
├── PaginaCliente
│   ├── FormCliente
│   │   ├── CampoNSS              → Validación formato 11 dígitos
│   │   ├── CampoCURP             → Validación formato CURP mexicano
│   │   └── CampoFechaNac         → Calcula edad en tiempo real
│   └── IndicadorElegibilidad     → Muestra V1, V2, V3 con estado pass/fail
│
├── PaginaContrato
│   ├── FormContrato
│   │   ├── SelectorModalidad     → Radio buttons con descripción de cada mod
│   │   ├── CampoFechas           → Calcula período y fecha de alta en tiempo real
│   │   └── CampoMonetarios       → Saldo AFORE, préstamo
│   └── VistaPrevia               → Muestra proyección rápida mientras llena el form
│
├── PaginaComparador
│   ├── ComparadorModalidades     → Layout side-by-side de las 3 modalidades
│   │   └── TarjetaModalidad (×3)
│   │       ├── ResumenFinanciero
│   │       └── TablaPagos        → Tabla scrollable con los 14 meses
│   └── TarjetaProyeccion         → Fecha pensión + monto estimado
│
└── PaginaReporte
    └── GeneradorPDF              → Genera informe para firma
```

### 6.2 Flujo de estados

```
ENTRADA_CLIENTE
    ↓  (validaciones V1, V2 pass)
ENTRADA_CONTRATO
    ↓  (POST /api/contratos → validaciones V3 + cálculos server-side)
VISUALIZACION_COMPARADOR
    ↓  (usuario selecciona modalidad final)
CONFIRMACION
    ↓
REPORTE_GENERADO
```

---

## 7. Consideraciones de implementación

### 7.1 Todos los cálculos monetarios en el backend

El frontend solo renderiza lo que retorna la API. Esto previene manipulación desde el browser y garantiza que los valores en la base de datos sean siempre consistentes con la lógica de negocio.

### 7.2 La tabla de fechas (AT:AU) no necesita migrar

La hoja tiene un calendario de 1,828 filas que mapea cada día a su primer día de mes, usado internamente por VLOOKUP. En el backend esto es una función pura trivial:

```javascript
function primerDiaMes(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}
```

No necesita existir como dato en ningún lugar.

### 7.3 Versionar los valores usados por cada contrato

Cuando se actualicen las tablas de referencia (costos, pensiones), los contratos ya existentes deben seguir usando los valores que vigentes al momento de su creación. El esquema actual ya maneja esto: los valores calculados se persisten en `pagos_mensuales` al crear el contrato, así que una actualización futura de `tabla_costos` no afecta contratos existentes.

### 7.4 La gestoría y otros valores "mágicos" deben salir del código

En la hoja la gestoría es un literal 18,000. En el sistema debe venir de `config_general`. Mismo aplica para la tasa especial del mes 1 (3,500), edades mínimas y máximas, y el mínimo de meses del contrato. La tabla `config_general` propuesta en §3 centraliza todos estos valores.

### 7.5 Precisión numérica

Todos los valores en la hoja son enteros o con máximo 2 decimales. Usar `DECIMAL(10,2)` en PostgreSQL y redondeo explícito en JavaScript (`Math.round(valor * 100) / 100`) evita errores de punto flotante.

---

## 8. Stack tecnológico recomendado

| Capa | Opción | Justificación |
|---|---|---|
| Backend | Node.js + NestJS | TypeScript nativo, módulos decoradores para separar responsabilidades, ecosistema maduro |
| ORM | Prisma | Experiencia DX superior, tipado fuerte, migrations declarativas |
| Base de datos | PostgreSQL | DECIMAL nativo, queries de fechas robustos, sin overhead de ORM pesado |
| Frontend | React + TypeScript | Componentes reutilizables, ecosistema amplio, buena integración con APIs REST |
| Generación PDF | Puppeteer o jsPDF | Replicar el formato del informe actual para firma |
| Autenticación | JWT con roles | Mínimo dos roles: `usuario` (crear/ver contratos) y `admin` (editar tablas de referencia) |

---

## 9. Plan de implementación

El orden respeta dependencias: el motor de cálculo debe estar probado antes de construir el frontend que lo consume.

**Fase 1 — Fundaciones**
Crear el esquema de BD y hacer seed de las tablas de referencia extraídas de la hoja. Implementar el motor de cálculo como un servicio interno con tests unitarios, validando cada output contra los valores actuales de la hoja.

**Fase 2 — API**
Exponer los endpoints de la API, empezando por `POST /contratos` y `GET /contratos/:id/comparador`. Agregar validaciones con respuestas descriptivas.

**Fase 3 — Frontend**
Construir el formulario de entrada (cliente + contrato) con validaciones de formato client-side. Construir la vista del comparador consumiendo el endpoint. Conectar el flujo completo de estados.

**Fase 4 — Reporte y admin**
Implementar la generación de PDF replicando el formato del informe actual. Agregar las pantallas de administración para editar tablas de referencia.

**Fase 5 — QA de regresión**
Comparar output del sistema contra la hoja para los casos de prueba definidos en §10. No hacer deploy a producción hasta que todos pasen.

---

## 10. Casos de prueba de regresión

Estos casos deben pasar antes de cualquier release. Los valores esperados se extraen directamente de la hoja actual.

| # | Edad cliente | Ley | Modalidad | Meses | Estado esperado | Valor total esperado |
|---|---|---|---|---|---|---|
| 1 | 73 años | 73 | MOD 1 | 14 | ✅ Permitido | 62,550 |
| 2 | 73 años | 73 | MOD 2 | 14 | ✅ Permitido | 62,550 (cliente: 40,275) |
| 3 | 73 años | 73 | MOD 3 | 14 | ❌ Rechazado | Edad > 68 años |
| 4 | 65 años | 73 | MOD 3 | 14 | ✅ Permitido | 175,000 |
| 5 | 58 años | 73 | MOD 1 | 14 | ❌ Rechazado | Edad < 58.5 años |
| 6 | 60 años | 97 | MOD 1 | 14 | ❌ Rechazado | Ley 97 fuera de scope |
| 7 | 68 años | 73 | MOD 3 | 14 | ✅ Permitido | Exactamente en el límite |
| 8 | 70 años | 73 | MOD 1 | 18 | ✅ Permitido | Calcular con 18 meses |
| 9 | 62 años | 73 | MOD 2 | 14 | ✅ Permitido | Verificar pensión según edad |
| 10 | 73 años | 73 | MOD 1 | 14 | ✅ Alta retroactiva | Firma día 10 → alta 1° mismo mes |
| 11 | 73 años | 73 | MOD 1 | 14 | ✅ Alta mes siguiente | Firma día 20 → alta 1° mes siguiente |
| 12 | 73 años | 73 | MOD 1 | 13 | ❌ Rechazado | Meses < 14 (mínimo) |

---

## 11. Preguntas pendientes para el área de producto

Antes de cerrar la implementación, estas ambigüedades extraídas de la hoja necesitan confirmación:

1. **Tasa especial mes 1:** ¿El valor 3,500 es un fijo absoluto para todo primer mes, o es el base del año más un cargo de activación (850 MXN)? Si es lo segundo, ¿el cargo de activación cambia cada año junto con la tabla de costos?

2. **Cálculo de semanas:** ¿El sistema IMSS usa el método de `(totalMeses × 4)` o calcula los días reales entre fechas y divide por 7? Esto afecta en hasta 4 semanas la proyección final.

3. **Ley 97:** La hoja actual solo contempla Ley 73. ¿Hay un plan para soportar Ley 97 en el futuro? Si es así, ¿cuál es el flujo diferente?

4. **Valores K60/K61 (21,800 y 196,800):** En la hoja aparecen estos valores adicionales debajo del resumen de MOD 3. ¿Representan un escenario alternativo, un tope máximo, o un cálculo de otra cosa?

5. **Variación ±10% en pensión:** ¿Es un disclaimer informativo siempre fijo en 10%, o se calcula basándose en algún factor del cliente?
