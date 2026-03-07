# Estructura Base — Tabla "Línea de Tiempo" (Costo Mensual F100)

## Ubicación

- **Hoja:** INFORME COSTO MENSUAL
- **Rango:** J38:L61

## Propósito

Presenta el desglose mensual de costos que el cliente debe cubrir durante la vigencia de su contrato de recuperación de pensión bajo la modalidad **"MOD. 3 FINANCIADO 100"**. Incluye dos variantes de costo (F.100% y F100+), totales parciales, cargo de gestoría y un total general.

---

## Encabezados

| Fila | Columna J | Columna K | Columna L |
|------|-----------|-----------|-----------|
| 38   | LINEA DE TIEMPO | *(merge/vacío)* | *(merge/vacío)* |
| 39   | MOD. 3 FINANCIADO 100 | *(vacío)* | F100+ |
| 40   | AÑO INICIO : | `{añoInicio}` | *(vacío)* |
| 41   | MES | F. 100% | *(vacío)* |

- `{añoInicio}` → Año extraído de la fecha de inicio de contrato.

---

## Cuerpo de la Tabla (filas 42–55)

Cada fila representa un mes del contrato. La tabla soporta **hasta 14 filas de meses** en su forma base (filas 42 a 55). Si la duración del contrato excede 14 meses, las filas de cierre (56+) se convierten en meses adicionales y las secciones de totales se desplazan.

| Fila | Col J — Mes | Col K — Costo F.100% | Col L — Costo F100+ |
|------|-------------|----------------------|---------------------|
| 42   | `{mes_1}`   | `{costoBase_1}`      | `{costoPlus_1}`     |
| 43   | `{mes_2}`   | `{costoBase_2}`      | `{costoPlus_2}`     |
| 44   | `{mes_3}`   | `{costoBase_3}`      | `{costoPlus_3}`     |
| 45   | `{mes_4}`   | `{costoBase_4}`      | `{costoPlus_4}`     |
| 46   | `{mes_5}`   | `{costoBase_5}`      | `{costoPlus_5}`     |
| 47   | `{mes_6}`   | `{costoBase_6}`      | `{costoPlus_6}`     |
| 48   | `{mes_7}`   | `{costoBase_7}`      | `{costoPlus_7}`     |
| 49   | `{mes_8}`   | `{costoBase_8}`      | `{costoPlus_8}`     |
| 50   | `{mes_9}`   | `{costoBase_9}`      | `{costoPlus_9}`     |
| 51   | `{mes_10}`  | `{costoBase_10}`     | `{costoPlus_10}`    |
| 52   | `{mes_11}`  | `{costoBase_11}`     | `{costoPlus_11}`    |
| 53   | `{mes_12}`  | `{costoBase_12}`     | `{costoPlus_12}`    |
| 54   | `{mes_13}`  | `{costoBase_13}`     | `{costoPlus_13}`    |
| 55   | `{mes_14}`  | `{costoBase_14}`     | `{costoPlus_14}`    |

---

## Sección de Cierre (filas 56–61)

La disposición de estas filas depende de la duración del contrato (`totalMeses`). A continuación se muestra la estructura para el caso base de **14 meses**:

| Fila | Col J | Col K | Col L |
|------|-------|-------|-------|
| 56   | TOTAL | `{sumaK}` | `{sumaL}` |
| 57   | *(vacío)* | *(vacío)* | *(vacío)* |
| 58   | GESTORIA | `{costoGestoria}` | `{costoGestoria}` |
| 59   | TOTAL GENERAL | `{totalGeneralK}` | `{totalGeneralL}` |
| 60   | *(vacío)* | `{cargoProyeccion}` | `{cargoProyeccion}` |
| 61   | *(vacío)* | `{granTotalK}` | `{granTotalL}` |

---

## Tipos de Dato por Columna

| Columna | Tipo | Formato |
|---------|------|---------|
| J       | `string` | Nombre de mes abreviado (ENE, FEB, ..., DIC) o etiqueta fija (TOTAL, GESTORIA, TOTAL GENERAL) |
| K       | `number` | Moneda MXN sin decimales |
| L       | `number` | Moneda MXN sin decimales |

---

## Datos de Entrada Requeridos

Para construir esta tabla se necesitan los siguientes valores de entrada:

| Campo | Tipo | Origen | Ejemplo |
|-------|------|--------|---------|
| `fechaInicioContrato` | `Date` | DATOS GENERALES → C15 | 2025-11-01 |
| `totalMeses` | `number` | Calculado (I18) | 14 |
| `modalidad` | `string` | DATOS GENERALES → C17 | "FINANCIADO 100" |

---

## Interfaz TypeScript Sugerida

```typescript
interface FilaCostoMensual {
  mes: string;          // "ENE", "FEB", ..., "DIC"
  costoBase: number;    // Columna K — F.100%
  costoPlus: number;    // Columna L — F100+
}

interface SeccionCierre {
  totalBase: number;
  totalPlus: number;
  gestoria: number;
  totalGeneralBase: number;
  totalGeneralPlus: number;
  cargoProyeccion: number;
  granTotalBase: number;
  granTotalPlus: number;
}

interface TablaCostoMensual {
  titulo: string;               // "MOD. 3 FINANCIADO 100"
  añoInicio: number;
  filasMensuales: FilaCostoMensual[];
  cierre: SeccionCierre;
}
```

---

## Notas para Implementación

1. La tabla se renderiza **solo si** `fechaInicioContrato` tiene valor. Si está vacía, toda la tabla queda en blanco.
2. Los nombres de mes se obtienen de un catálogo fijo de 12 elementos (1→ENE ... 12→DIC).
3. La cantidad de filas mensuales es dinámica (entre 14 y 18), determinada por `totalMeses`.
4. La columna L siempre es la columna K más un cargo fijo.
5. Las reglas de cálculo de cada celda se documentan en el archivo complementario `02_REGLAS_OPERACIONES_COSTO_MENSUAL.md`.
