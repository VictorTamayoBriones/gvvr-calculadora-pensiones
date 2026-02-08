# Reglas de Negocio y Validaciones - Sección: Información del Cliente

## 📋 ÍNDICE
1. [Nombre Completo](#1-nombre-completo)
2. [NSS (Número de Seguridad Social)](#2-nss-número-de-seguridad-social)
3. [CURP](#3-curp)
4. [Fecha de Nacimiento](#4-fecha-de-nacimiento)
5. [Semanas Cotizadas](#5-semanas-cotizadas)
6. [Edad](#6-edad)
7. [Ley Aplicable](#7-ley-aplicable-ley-73--ley-97)
8. [Fecha de Baja](#8-fecha-de-baja)
9. [Sin Vigencia de Derechos](#9-sin-vigencia-de-derechos)
10. [Validaciones Cruzadas](#10-validaciones-cruzadas)

---

## 1. NOMBRE COMPLETO

### Reglas de Negocio
- Campo obligatorio
- Debe contener al menos apellido paterno, apellido materno y nombre(s)
- Debe coincidir con el nombre registrado en el IMSS
- Se utiliza para generar documentos oficiales

### Validaciones
```javascript
Validaciones:
✓ No puede estar vacío
✓ Longitud mínima: 10 caracteres
✓ Longitud máxima: 150 caracteres
✓ Solo letras, espacios, guiones y apóstrofes
✓ No debe contener números
✓ No debe contener caracteres especiales (@, #, $, etc.)
✓ Formato sugerido: APELLIDO_PATERNO APELLIDO_MATERNO NOMBRE(S)
✓ Debe contener al menos 3 palabras (dos apellidos + nombre)

Expresión Regular:
^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){2,}$

Ejemplos Válidos:
- "GARCES HERNANDEZ JOSE LUIS"
- "LÓPEZ GARCÍA MARÍA FERNANDA"
- "DE LA CRUZ MARTÍNEZ JUAN CARLOS"

Ejemplos Inválidos:
- "JUAN" (incompleto)
- "LOPEZ123" (contiene números)
- "garcía" (debe iniciar con mayúscula)
```

### Mensajes de Error
- "El nombre completo es obligatorio"
- "El nombre debe incluir apellido paterno, apellido materno y nombre(s)"
- "El nombre solo puede contener letras y espacios"
- "El nombre ingresado es demasiado corto"

---

## 2. NSS (Número de Seguridad Social)

### Reglas de Negocio
- Campo obligatorio
- Identificador único del trabajador ante el IMSS
- Debe existir en la base de datos del IMSS
- Se requiere para tramitar la pensión
- **CRÍTICO**: Debe tener registro de cotización antes del 1 de julio de 1997

### Validaciones
```javascript
Validaciones:
✓ No puede estar vacío
✓ Longitud exacta: 11 dígitos
✓ Solo números
✓ No debe contener espacios ni guiones
✓ Debe existir en la base de datos del IMSS (validación externa)
✓ Primeros 2 dígitos: subdelegación (01-99)
✓ Siguientes 2 dígitos: año de registro (00-99)
✓ Últimos 7 dígitos: número consecutivo y dígito verificador

Expresión Regular:
^[0-9]{11}$

Formato Completo:
XX XX XX XXXXX
│  │  │  └─ Número consecutivo (5 dígitos)
│  │  └──── Año de registro (2 dígitos)
│  └─────── Mes de registro (2 dígitos)
└────────── Subdelegación (2 dígitos)

Ejemplos Válidos:
- "01705189114"
- "02938456781"
- "12456789012"

Ejemplos Inválidos:
- "0170518911" (10 dígitos - incompleto)
- "017051891145" (12 dígitos - excedido)
- "01-70-51-89114" (contiene guiones)
- "01A0518911C" (contiene letras)
```

### Validaciones de Negocio Adicionales
```javascript
Validación de Existencia:
- Consultar API del IMSS para verificar existencia del NSS
- Validar que el NSS corresponda al nombre del cliente

Validación de Fecha de Primera Cotización:
- REQUERIMIENTO CRÍTICO: Debe tener cotización antes del 1 de julio de 1997
- Si la primera cotización es posterior a julio 1997 → NO ELEGIBLE
- Mensaje: "El NSS debe tener cotización antes del 1 de julio de 1997 para ser elegible"
```

### Mensajes de Error
- "El NSS es obligatorio"
- "El NSS debe tener exactamente 11 dígitos"
- "El NSS solo puede contener números"
- "El NSS ingresado no existe en el sistema del IMSS"
- "⚠️ CRÍTICO: El NSS no tiene cotización antes del 1 de julio de 1997. No es elegible para este programa"

---

## 3. CURP

### Reglas de Negocio
- Campo obligatorio
- Clave Única de Registro de Población
- Debe coincidir con el nombre y fecha de nacimiento del cliente
- Debe ser válida según el algoritmo de RENAPO

### Validaciones
```javascript
Validaciones:
✓ No puede estar vacío
✓ Longitud exacta: 18 caracteres alfanuméricos
✓ Formato específico: 4 letras + 6 números + 6 alfanuméricos + 1 número
✓ Sin espacios ni caracteres especiales
✓ Primera letra debe coincidir con apellido paterno
✓ Letras 5-6 deben corresponder al año de nacimiento
✓ Dígito verificador válido (posición 18)

Expresión Regular:
^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2}$

Estructura Detallada:
XXXX XXXXXX X XXXXX XX
│    │      │ │     └─ Dígito verificador (2 números)
│    │      │ └─────── Estado de nacimiento y consonantes (5 letras)
│    │      └───────── Sexo: H=Hombre, M=Mujer (1 letra)
│    └──────────────── Fecha nacimiento: AAMMDD (6 números)
└───────────────────── Iniciales: Apellido Pat + Apellido Mat + Nombre (4 letras)

Validación de Consonantes Internas:
Posición 15: Primera consonante interna del apellido paterno
Posición 16: Primera consonante interna del apellido materno
Posición 17: Primera consonante interna del nombre

Ejemplos Válidos:
- "GAHL521102HDFRRS02" (Garces Hernandez Jose Luis, H=Hombre, Hidalgo)
- "LOMF850315MDFPRR09"
- "CACJ900512HDFLRN08"

Ejemplos Inválidos:
- "GAHL521102" (incompleto)
- "gahl521102hdfrrs02" (minúsculas no permitidas)
- "GAHL521102XDFRRS02" (sexo inválido - debe ser H o M)
- "GAHL999999HDFRRS02" (fecha inválida)
```

### Validaciones de Consistencia
```javascript
Validación con Nombre:
- Primera letra del CURP debe coincidir con primera letra del apellido paterno
- Segunda letra debe ser primera vocal interna del apellido paterno
- Tercera letra debe ser primera letra del apellido materno
- Cuarta letra debe ser primera letra del nombre

Validación con Fecha de Nacimiento:
- Dígitos 5-10 del CURP deben coincidir con fecha de nacimiento (AAMMDD)
- Ejemplo: "52/11/02" → 1952-11-02

Validación de Sexo:
- Posición 11: H (Hombre) o M (Mujer)
```

### Mensajes de Error
- "La CURP es obligatoria"
- "La CURP debe tener exactamente 18 caracteres"
- "Formato de CURP inválido"
- "La CURP no coincide con el nombre del cliente"
- "La CURP no coincide con la fecha de nacimiento"
- "El dígito verificador de la CURP es incorrecto"

---

## 4. FECHA DE NACIMIENTO

### Reglas de Negocio
- Campo obligatorio
- Debe ser coherente con la edad calculada
- Debe coincidir con la fecha en CURP
- Se utiliza para calcular edad y determinar elegibilidad

### Validaciones
```javascript
Validaciones:
✓ No puede estar vacía
✓ Debe ser una fecha válida
✓ No puede ser fecha futura
✓ Cliente debe tener entre 55 y 80 años
✓ Debe coincidir con CURP (posiciones 5-10)
✓ Formato: DD/MM/AAAA o AAAA-MM-DD

Rango de Edad Permitido:
- Edad mínima: 55 años (para preparar pensión a los 60)
- Edad máxima: 80 años (límite del programa)
- Edad ideal para pensión: 60 años en adelante

Validación con CURP:
CURP: GAHL521102...
      ↓
      521102 = 52/11/02 = 2 de noviembre de 1952
      
Debe coincidir: fecha_nacimiento = 1952-11-02

Ejemplos Válidos:
- "1952-11-02" (73 años en 2026)
- "1960-05-15" (65 años en 2026)
- "1966-03-20" (60 años en 2026)

Ejemplos Inválidos:
- "2000-01-01" (26 años - muy joven)
- "1940-01-01" (86 años - excede límite)
- "2026-12-31" (fecha futura)
- "1952-10-02" (no coincide con CURP que indica 02/11/1952)
```

### Cálculo de Edad
```javascript
Función para calcular edad:

function calcularEdad(fechaNacimiento) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
}

function calcularEdadDetallada(fechaNacimiento) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  
  let años = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();
  
  if (meses < 0) {
    años--;
    meses += 12;
  }
  
  return `${años} AÑOS ${meses} MESES`;
}

// Ejemplo: "1952-11-02" → "73 AÑOS 2 MESES" (en enero 2026)
```

### Mensajes de Error
- "La fecha de nacimiento es obligatoria"
- "La fecha de nacimiento no puede ser futura"
- "El cliente debe tener al menos 55 años para ser elegible"
- "El cliente no puede tener más de 80 años para este programa"
- "La fecha de nacimiento no coincide con la CURP"
- "Fecha inválida"

---

## 5. SEMANAS COTIZADAS

### Reglas de Negocio
- Campo obligatorio
- Debe ser un número entero positivo
- Debe cumplir con el mínimo según la Ley aplicable
- Se acumulan durante la vida laboral del trabajador
- **LEY 73**: Mínimo 500 semanas (≈9.6 años)
- **LEY 97**: Mínimo 1,250 semanas (≈24 años) para pensión completa

### Validaciones
```javascript
Validaciones Básicas:
✓ No puede estar vacío
✓ Debe ser un número entero positivo
✓ Rango mínimo: 1 semana
✓ Rango máximo: 2,500 semanas (≈48 años de trabajo)
✓ No puede tener decimales

Validaciones según Ley:

LEY 73 (anterior a julio 1997):
- Mínimo requerido: 500 semanas
- Recomendado para mejor pensión: 750+ semanas
- Mensaje si < 500: "No cumple con el mínimo de 500 semanas para LEY 73"

LEY 97 (posterior a julio 1997):
- Mínimo absoluto para pensión: 1,250 semanas (a partir de 2031)
- Transición gradual:
  * 2024: 1,000 semanas
  * 2025: 1,025 semanas
  * 2026: 1,050 semanas
  * 2027: 1,075 semanas
  * ...
  * 2031: 1,250 semanas (definitivo)

Validación de Rango:
MIN_SEMANAS_LEY_73 = 500
MIN_SEMANAS_LEY_97 = 1250
MAX_SEMANAS_RAZONABLE = 2500

if (semanas < 1) {
  error: "Las semanas cotizadas deben ser al menos 1"
}
if (semanas > MAX_SEMANAS_RAZONABLE) {
  warning: "El número de semanas parece excesivo, verifique el dato"
}
if (ley === "LEY 73" && semanas < MIN_SEMANAS_LEY_73) {
  error: "No cumple el mínimo de 500 semanas para LEY 73"
}
if (ley === "LEY 97" && semanas < MIN_SEMANAS_LEY_97) {
  error: "No cumple el mínimo de 1,250 semanas para LEY 97"
}

Ejemplos Válidos:
- 860 semanas (≈16.5 años) - Válido para LEY 73
- 1300 semanas (≈25 años) - Válido para ambas leyes
- 1850 semanas (≈35.5 años) - Excelente para ambas leyes

Ejemplos Inválidos:
- 450 semanas - Insuficiente para LEY 73
- 800 semanas - Insuficiente para LEY 97
- 0 semanas - Valor no válido
- -100 semanas - Número negativo no válido
```

### Cálculo de Años Equivalentes
```javascript
Conversión semanas a años:
años_trabajados = semanas_cotizadas / 52

Ejemplo:
860 semanas ÷ 52 = 16.5 años aproximadamente

Mostrar al usuario:
"860 semanas equivalen aproximadamente a 16 años y 6 meses de trabajo"
```

### Validaciones Adicionales
```javascript
Consistencia con Edad:
- Las semanas cotizadas no pueden exceder años disponibles para trabajar
- Años trabajables = Edad actual - 16 (edad mínima laboral)
- Max semanas posibles = (Edad - 16) * 52

Ejemplo:
Edad: 73 años
Años trabajables: 73 - 16 = 57 años
Max semanas: 57 × 52 = 2,964 semanas

if (semanas > (edad - 16) * 52) {
  warning: "Las semanas cotizadas exceden los años trabajables posibles"
}
```

### Mensajes de Error
- "Las semanas cotizadas son obligatorias"
- "Las semanas deben ser un número entero positivo"
- "No cumple con el mínimo de 500 semanas para LEY 73"
- "No cumple con el mínimo de 1,250 semanas para LEY 97"
- "Las semanas cotizadas parecen excesivas para la edad del cliente"
- "Las semanas cotizadas deben ser al menos 1"

---

## 6. EDAD

### Reglas de Negocio
- Campo derivado (se calcula automáticamente de fecha de nacimiento)
- Formato: "XX AÑOS XX MESES"
- Determina elegibilidad para diferentes modalidades
- **CRÍTICO**: Para Modalidad Financiado 100% → Máximo 67 años
- Edad mínima general para pensión: 60 años

### Validaciones
```javascript
Validaciones:
✓ Se calcula automáticamente (no editable directamente)
✓ Debe estar en el rango: 55-80 años
✓ Para pensión inmediata: mínimo 60 años
✓ Para Modalidad Financiado 100%: máximo 67 años

Rangos de Edad y Elegibilidad:

1. 55-59 años:
   Status: "En preparación"
   Modalidades permitidas: Retoma, Financiado 50%
   Nota: Aún no puede pensionarse, pero puede prepararse

2. 60-64 años:
   Status: "Elegible - Edad ideal"
   Modalidades permitidas: Todas
   Nota: Edad óptima para iniciar pensión

3. 65-67 años:
   Status: "Elegible - Requiere verificación"
   Modalidades permitidas: Todas (con revisión)
   Nota: Verificar requisitos adicionales

4. 68-80 años:
   Status: "Elegible - Modalidad limitada"
   Modalidades permitidas: SOLO Retoma y Financiado 50%
   RESTRICCIÓN: NO elegible para Financiado 100%
   Nota: "Para Reactiva financiado 100 solo son viables menores de 68 años"

Validación Específica por Modalidad:

if (modalidad === "FINANCIADO_100" && edad >= 68) {
  error: "⚠️ RESTRICCIÓN: La modalidad Financiado 100% solo es viable para menores de 68 años"
  suggestion: "Considere las modalidades Retoma o Financiado 50%"
}

Formato de Presentación:
- Cálculo automático: "73 AÑOS 2 MESES"
- Solo lectura (no editable por usuario)
- Se actualiza automáticamente al cambiar fecha de nacimiento

Ejemplos Válidos:
- "60 AÑOS 0 MESES" → Elegible para todas las modalidades
- "65 AÑOS 6 MESES" → Elegible para todas las modalidades
- "67 AÑOS 11 MESES" → Elegible para todas las modalidades
- "68 AÑOS 1 MES" → NO elegible para Financiado 100%
- "73 AÑOS 2 MESES" → NO elegible para Financiado 100%
```

### Tabla de Elegibilidad por Edad
```
┌──────────────┬────────────────┬──────────────────────────────────────┐
│ Edad         │ Status         │ Modalidades Permitidas               │
├──────────────┼────────────────┼──────────────────────────────────────┤
│ 55-59 años   │ Preparación    │ Retoma, Financiado 50%               │
│ 60-64 años   │ Ideal          │ Retoma, Financiado 50%, Financiado 100%│
│ 65-67 años   │ Elegible       │ Retoma, Financiado 50%, Financiado 100%│
│ 68-80 años   │ Limitado       │ Retoma, Financiado 50% ÚNICAMENTE    │
│ > 80 años    │ No elegible    │ Ninguna                              │
└──────────────┴────────────────┴──────────────────────────────────────┘
```

### Mensajes de Error/Advertencia
- "El cliente debe tener al menos 55 años"
- "El cliente aún no alcanza la edad mínima de pensión (60 años)"
- "⚠️ IMPORTANTE: Con 68 años o más, no es elegible para Modalidad Financiado 100%"
- "El cliente excede la edad máxima del programa (80 años)"

---

## 7. LEY APLICABLE (LEY 73 / LEY 97)

### Reglas de Negocio
- Campo obligatorio
- Determina qué régimen de pensiones aplica
- **LEY 73**: Trabajadores con primera cotización ANTES del 1 julio 1997
- **LEY 97**: Trabajadores con primera cotización DESPUÉS del 1 julio 1997
- Los trabajadores pueden elegir la ley más favorable

### Validaciones
```javascript
Validaciones:
✓ Debe seleccionar una opción: "LEY 73" o "LEY 97"
✓ Debe ser consistente con fecha de primera cotización
✓ Determina requisitos de semanas mínimas

Criterio de Selección:

LEY 73 (Ley del Seguro Social de 1973):
Elegibles:
- Primera cotización ANTES del 1 de julio de 1997
- Pueden elegir esta ley si les conviene más
Requisitos:
- Mínimo: 500 semanas cotizadas
- Edad mínima: 60 años (pensión por cesantía)
- Edad para pensión completa: 65 años
Ventajas:
- Menos semanas requeridas
- Pensión calculada con base en salario promedio últimos 5 años
- Generalmente más favorable para trabajadores antiguos

LEY 97 (Ley del Seguro Social de 1997):
Elegibles:
- Primera cotización DESPUÉS del 1 de julio de 1997
- Sistema de cuenta individual (AFORE)
Requisitos:
- Mínimo: 1,250 semanas cotizadas (gradual hasta 2031)
- Edad mínima: 60-65 años según modalidad
Características:
- Pensión basada en saldo acumulado en AFORE
- Requiere más semanas cotizadas
- Sistema de capitalización individual

Validación Cruzada con Fecha de Primera Cotización:

REGLA CRÍTICA:
"DEBE CONTAR CON COTIZACION ANTES DEL 1 DE JULIO DE 1997"

if (primera_cotizacion >= "1997-07-01") {
  // Solo puede ser LEY 97
  if (ley_seleccionada === "LEY 73") {
    error: "No puede seleccionar LEY 73 si su primera cotización fue después de julio 1997"
  }
}

if (primera_cotizacion < "1997-07-01") {
  // Puede elegir LEY 73 o LEY 97
  info: "Puede elegir la ley que le resulte más favorable"
}

Validación con Semanas Cotizadas:

if (ley === "LEY 73") {
  SEMANAS_MINIMAS = 500
  if (semanas_cotizadas < 500) {
    error: "No cumple con el mínimo de 500 semanas para LEY 73"
  }
}

if (ley === "LEY 97") {
  SEMANAS_MINIMAS = 1250
  if (semanas_cotizadas < 1250) {
    error: "No cumple con el mínimo de 1,250 semanas para LEY 97"
  }
}

Tabla Comparativa:

┌──────────────────────┬─────────────┬─────────────┐
│ Característica       │ LEY 73      │ LEY 97      │
├──────────────────────┼─────────────┼─────────────┤
│ Semanas mínimas      │ 500         │ 1,250       │
│ Edad mínima          │ 60 años     │ 60-65 años  │
│ Base de cálculo      │ Salario     │ Saldo AFORE │
│ Primera cotización   │ Antes jul97 │ Después jul97│
│ Puede elegir         │ Sí*         │ Obligatorio │
└──────────────────────┴─────────────┴─────────────┘
* Si cumple requisitos temporales
```

### Mensajes de Error
- "Debe seleccionar una ley aplicable (LEY 73 o LEY 97)"
- "No puede seleccionar LEY 73 si su primera cotización fue posterior a julio 1997"
- "No cumple con el mínimo de semanas para la ley seleccionada"

### Recomendaciones al Usuario
```javascript
Mostrar recomendación:

if (primera_cotizacion < "1997-07-01" && semanas >= 500 && semanas < 1250) {
  recomendacion: "Recomendamos seleccionar LEY 73, ya que cumple con los requisitos y "
    + "generalmente ofrece mejores beneficios para su perfil"
}

if (semanas >= 1250) {
  recomendacion: "Cumple con ambas leyes. Se recomienda hacer un cálculo comparativo "
    + "para determinar cuál ofrece mejor pensión en su caso"
}
```

---

## 8. FECHA DE BAJA

### Reglas de Negocio
- Campo obligatorio
- Fecha en que dejó de cotizar al IMSS
- Determina cuándo perdió vigencia de derechos
- Debe ser anterior a la fecha de firma del contrato
- Afecta el cálculo de "Sin Vigencia de Derechos"

### Validaciones
```javascript
Validaciones:
✓ No puede estar vacía
✓ Debe ser una fecha válida
✓ Debe ser posterior a fecha de nacimiento + 16 años (edad laboral mínima)
✓ Debe ser anterior a fecha actual
✓ Debe ser anterior a fecha de firma de contrato
✓ Debe ser posterior a fecha de primera cotización

Rango Temporal:
- Fecha mínima: fecha_nacimiento + 16 años
- Fecha máxima: fecha actual (hoy)

Validaciones Cruzadas:

1. Con Fecha de Nacimiento:
if (fecha_baja < fecha_nacimiento + 16_años) {
  error: "La fecha de baja no puede ser anterior a los 16 años de edad"
}

2. Con Fecha Actual:
if (fecha_baja > fecha_actual) {
  error: "La fecha de baja no puede ser futura"
}

3. Con Fecha de Contrato:
if (fecha_baja >= fecha_firma_contrato) {
  error: "La fecha de baja debe ser anterior a la fecha de firma del contrato"
}

4. Coherencia Temporal:
if (fecha_baja < fecha_primera_cotizacion) {
  error: "La fecha de baja no puede ser anterior a la fecha de primera cotización"
}

Ejemplos Válidos:
- "2009-04-16" → Cliente nacido en 1952, dio de baja en 2009 (57 años)
- "2015-12-31" → Baja en 2015, firma contrato en 2026
- "2020-06-15" → Baja reciente

Ejemplos Inválidos:
- "2026-12-31" → Fecha futura
- "1960-01-01" → Cliente tenía 8 años (menor de edad laboral)
- "2027-01-01" → Posterior a firma de contrato
```

### Cálculo de Tiempo sin Cotizar
```javascript
Cálculo de años sin cotizar:

function calcularTiempoSinCotizar(fechaBaja) {
  const hoy = new Date();
  const baja = new Date(fechaBaja);
  const diff = hoy - baja;
  const años = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  return años;
}

Ejemplo:
Fecha de Baja: 2009-04-16
Fecha Actual: 2026-01-30
Tiempo sin cotizar: 16 años, 9 meses

Mostrar advertencia si:
if (tiempo_sin_cotizar > 10_años) {
  warning: "Han transcurrido más de 10 años sin cotizar. "
    + "Se requiere proceso de recuperación de derechos"
}
```

### Mensajes de Error
- "La fecha de baja es obligatoria"
- "La fecha de baja no puede ser futura"
- "La fecha de baja debe ser posterior al cumplir 16 años"
- "La fecha de baja debe ser anterior a la fecha de firma del contrato"
- "Fecha inválida"

---

## 9. SIN VIGENCIA DE DERECHOS

### Reglas de Negocio
- Campo obligatorio
- Fecha en que expira el derecho a pensión sin reactivar cotizaciones
- **CÁLCULO**: Fecha de Baja + 5 años
- Después de esta fecha, se debe "recuperar derechos" cotizando nuevamente
- Es la razón principal del servicio de recuperación de pensión

### Validaciones
```javascript
Validaciones:
✓ No puede estar vacía
✓ Debe ser calculada automáticamente
✓ Fórmula: fecha_baja + 5 años
✓ Si fecha actual > sin_vigencia_derechos → Requiere recuperación

Cálculo Automático:

function calcularSinVigenciaDerechos(fechaBaja) {
  const baja = new Date(fechaBaja);
  const sinVigencia = new Date(baja);
  sinVigencia.setFullYear(sinVigencia.getFullYear() + 5);
  return sinVigencia;
}

Ejemplo:
Fecha de Baja: 2009-04-16
Sin Vigencia: 2009-04-16 + 5 años = 2014-04-16

Si hoy es 2026-01-30:
- Han pasado 16 años, 9 meses desde la baja
- Han pasado 11 años, 9 meses desde que perdió vigencia
- REQUIERE recuperación de derechos (proceso de este sistema)

Estados del Cliente:

1. VIGENTE (fecha_actual <= sin_vigencia_derechos):
   Status: "Derechos vigentes"
   Acción: "No requiere recuperación, puede pensionarse directamente"
   Color: Verde

2. VENCIDO (fecha_actual > sin_vigencia_derechos):
   Status: "Sin vigencia de derechos"
   Acción: "REQUIERE RECUPERACIÓN DE DERECHOS mediante cotización"
   Color: Rojo
   Nota: Este es el propósito principal del programa

Validación de Estado:

function validarVigenciaDerechos(fechaBaja, fechaActual) {
  const sinVigencia = calcularSinVigenciaDerechos(fechaBaja);
  
  if (fechaActual <= sinVigencia) {
    return {
      status: "VIGENTE",
      mensaje: "El cliente mantiene vigencia de derechos",
      requiereRecuperacion: false
    };
  } else {
    const tiempoVencido = Math.floor(
      (fechaActual - sinVigencia) / (365.25 * 24 * 60 * 60 * 1000)
    );
    return {
      status: "VENCIDO",
      mensaje: `Sin vigencia desde hace ${tiempoVencido} años`,
      requiereRecuperacion: true
    };
  }
}

Ejemplo Completo:
Fecha de Baja: 2009-04-16
Sin Vigencia: 2014-04-16
Fecha Actual: 2026-01-30

Cálculos:
- Años desde baja: 16 años, 9 meses
- Años desde pérdida de vigencia: 11 años, 9 meses
- Status: VENCIDO
- Acción requerida: Recuperación mediante programa

Presentación al Usuario:
"⚠️ ATENCIÓN: El cliente perdió vigencia de derechos el 16/04/2014
Hace 11 años, 9 meses que no tiene vigencia
REQUIERE recuperación de derechos mediante cotización al IMSS"
```

### Tabla de Estados
```
┌────────────────────────┬──────────┬──────────────────────────┐
│ Situación              │ Status   │ Acción Requerida         │
├────────────────────────┼──────────┼──────────────────────────┤
│ < 5 años desde baja    │ VIGENTE  │ Pensión directa          │
│ > 5 años desde baja    │ VENCIDO  │ Recuperación requerida   │
│ > 10 años desde baja   │ VENCIDO  │ Recuperación + revisión  │
└────────────────────────┴──────────┴──────────────────────────┘
```

### Mensajes de Error/Advertencia
- "La fecha de sin vigencia de derechos es obligatoria"
- "⚠️ El cliente no tiene vigencia de derechos desde [fecha]"
- "✓ El cliente mantiene vigencia de derechos hasta [fecha]"
- "❌ Se requiere recuperación de derechos mediante cotización al IMSS"

---

## 10. VALIDACIONES CRUZADAS

### Coherencia General entre Campos

```javascript
// ==========================================
// VALIDACIÓN 1: NSS - CURP - NOMBRE
// ==========================================
function validarCoherenciaNssCurpNombre(nss, curp, nombre) {
  // El nombre debe corresponder con las iniciales del CURP
  const iniciales_curp = curp.substring(0, 4);
  const nombre_partes = nombre.split(' ');
  
  if (nombre_partes.length < 3) {
    return {
      valido: false,
      error: "El nombre debe incluir apellido paterno, materno y nombre"
    };
  }
  
  const apellido_pat = nombre_partes[0];
  const apellido_mat = nombre_partes[1];
  const primer_nombre = nombre_partes[2];
  
  // Verificar coincidencia básica
  if (!apellido_pat.startsWith(iniciales_curp[0]) ||
      !apellido_mat.startsWith(iniciales_curp[2])) {
    return {
      valido: false,
      warning: "Las iniciales del CURP no coinciden con el nombre. Verifique los datos"
    };
  }
  
  return { valido: true };
}

// ==========================================
// VALIDACIÓN 2: FECHA NACIMIENTO - CURP
// ==========================================
function validarFechaNacimientoCurp(fechaNac, curp) {
  // Extraer fecha del CURP (posiciones 5-10: AAMMDD)
  const fecha_curp = curp.substring(4, 10);
  const año_curp = fecha_curp.substring(0, 2);
  const mes_curp = fecha_curp.substring(2, 4);
  const dia_curp = fecha_curp.substring(4, 6);
  
  // Determinar siglo (asumiendo que > 50 = 1900s, <= 50 = 2000s)
  const año_completo = parseInt(año_curp) > 50 
    ? `19${año_curp}` 
    : `20${año_curp}`;
  
  const fecha_desde_curp = `${año_completo}-${mes_curp}-${dia_curp}`;
  
  if (fechaNac !== fecha_desde_curp) {
    return {
      valido: false,
      error: `La fecha de nacimiento (${fechaNac}) no coincide con la CURP (${fecha_desde_curp})`
    };
  }
  
  return { valido: true };
}

// ==========================================
// VALIDACIÓN 3: EDAD - MODALIDAD
// ==========================================
function validarEdadModalidad(edad, modalidad) {
  if (modalidad === "FINANCIADO_100" && edad >= 68) {
    return {
      valido: false,
      error: "⚠️ RESTRICCIÓN CRÍTICA: La modalidad Financiado 100% solo aplica para menores de 68 años",
      sugerencia: "Considere cambiar a modalidad Retoma o Financiado 50%"
    };
  }
  
  if (edad < 55) {
    return {
      valido: false,
      error: "El cliente debe tener al menos 55 años para participar en el programa"
    };
  }
  
  if (edad < 60) {
    return {
      valido: true,
      warning: "El cliente aún no cumple 60 años (edad mínima de pensión). Puede preparar su caso."
    };
  }
  
  return { valido: true };
}

// ==========================================
// VALIDACIÓN 4: SEMANAS - LEY
// ==========================================
function validarSemanasLey(semanas, ley) {
  const requisitos = {
    "LEY 73": { minimo: 500, nombre: "LEY 73" },
    "LEY 97": { minimo: 1250, nombre: "LEY 97" }
  };
  
  const req = requisitos[ley];
  
  if (semanas < req.minimo) {
    return {
      valido: false,
      error: `No cumple el mínimo de ${req.minimo} semanas requeridas para ${req.nombre}`
    };
  }
  
  return { valido: true };
}

// ==========================================
// VALIDACIÓN 5: FECHA BAJA - VIGENCIA
// ==========================================
function validarFechaBajaVigencia(fechaBaja, sinVigencia) {
  const fecha_calculada = new Date(fechaBaja);
  fecha_calculada.setFullYear(fecha_calculada.getFullYear() + 5);
  
  const vigencia_date = new Date(sinVigencia);
  
  if (fecha_calculada.getTime() !== vigencia_date.getTime()) {
    return {
      valido: false,
      error: "La fecha de sin vigencia debe ser exactamente 5 años después de la fecha de baja",
      calculada: fecha_calculada.toISOString().split('T')[0]
    };
  }
  
  return { valido: true };
}

// ==========================================
// VALIDACIÓN 6: COHERENCIA TEMPORAL
// ==========================================
function validarCoherenciaTemporal(fechaNac, fechaBaja, fechaContrato) {
  const nac = new Date(fechaNac);
  const baja = new Date(fechaBaja);
  const contrato = new Date(fechaContrato);
  const hoy = new Date();
  
  // Fecha de baja debe ser al menos 16 años después de nacer
  const edad_baja = (baja - nac) / (365.25 * 24 * 60 * 60 * 1000);
  if (edad_baja < 16) {
    return {
      valido: false,
      error: "La fecha de baja no puede ser cuando el cliente era menor de 16 años"
    };
  }
  
  // Fecha de baja debe ser anterior a hoy
  if (baja > hoy) {
    return {
      valido: false,
      error: "La fecha de baja no puede ser futura"
    };
  }
  
  // Fecha de baja debe ser anterior al contrato
  if (baja >= contrato) {
    return {
      valido: false,
      error: "La fecha de baja debe ser anterior a la fecha del contrato"
    };
  }
  
  return { valido: true };
}

// ==========================================
// VALIDACIÓN 7: REQUISITO CRÍTICO - 1997
// ==========================================
function validarRequisitoCotizacion1997(fechaPrimeraCotizacion) {
  const fecha_limite = new Date("1997-07-01");
  const primera = new Date(fechaPrimeraCotizacion);
  
  if (primera >= fecha_limite) {
    return {
      valido: false,
      error: "❌ REQUISITO NO CUMPLIDO: Debe tener cotización antes del 1 de julio de 1997",
      critico: true,
      elegible: false
    };
  }
  
  return { 
    valido: true,
    mensaje: "✓ Cumple con el requisito de cotización antes de julio 1997"
  };
}

// ==========================================
// VALIDACIÓN 8: SEMANAS vs EDAD
// ==========================================
function validarSemanasVsEdad(semanas, edad) {
  const años_trabajables = edad - 16;
  const max_semanas_posibles = años_trabajables * 52;
  
  if (semanas > max_semanas_posibles) {
    return {
      valido: false,
      warning: `Las semanas cotizadas (${semanas}) exceden las posibles según edad (máx: ${max_semanas_posibles})`
    };
  }
  
  return { valido: true };
}

// ==========================================
// FUNCIÓN MAESTRA DE VALIDACIÓN
// ==========================================
function validarSeccionCliente(datos) {
  const errores = [];
  const advertencias = [];
  
  // Ejecutar todas las validaciones
  const validaciones = [
    validarCoherenciaNssCurpNombre(datos.nss, datos.curp, datos.nombre),
    validarFechaNacimientoCurp(datos.fechaNacimiento, datos.curp),
    validarEdadModalidad(datos.edad, datos.modalidad),
    validarSemanasLey(datos.semanas, datos.ley),
    validarFechaBajaVigencia(datos.fechaBaja, datos.sinVigencia),
    validarCoherenciaTemporal(datos.fechaNacimiento, datos.fechaBaja, datos.fechaContrato),
    validarRequisitoCotizacion1997(datos.fechaPrimeraCotizacion),
    validarSemanasVsEdad(datos.semanas, datos.edad)
  ];
  
  validaciones.forEach(resultado => {
    if (!resultado.valido) {
      if (resultado.critico) {
        errores.push({ tipo: 'CRITICO', mensaje: resultado.error });
      } else if (resultado.error) {
        errores.push({ tipo: 'ERROR', mensaje: resultado.error });
      }
    }
    if (resultado.warning) {
      advertencias.push({ tipo: 'ADVERTENCIA', mensaje: resultado.warning });
    }
  });
  
  return {
    valido: errores.length === 0,
    errores,
    advertencias
  };
}
```

### Matriz de Validaciones Cruzadas
```
┌─────────────────┬────────┬──────┬──────┬────────┬─────────┬──────┬─────┬───────┐
│ Campo           │ NSS    │ CURP │ F.Nac│ Semanas│ Edad    │ Ley  │ F.Baja│ Vigenc│
├─────────────────┼────────┼──────┼──────┼────────┼─────────┼──────┼───────┼───────┤
│ NSS             │   -    │  ✓   │  ✓   │   ✓    │   ✓     │  ✓   │   ✓   │   ✓   │
│ CURP            │   ✓    │  -   │  ✓✓  │   -    │   -     │  -   │   -   │   -   │
│ Fecha Nac       │   ✓    │  ✓✓  │  -   │   -    │   ✓✓    │  -   │   ✓   │   -   │
│ Semanas         │   ✓    │  -   │  -   │   -    │   ✓     │  ✓✓  │   -   │   -   │
│ Edad            │   ✓    │  -   │  ✓✓  │   ✓    │   -     │  -   │   ✓   │   -   │
│ Ley             │   ✓    │  -   │  -   │   ✓✓   │   -     │  -   │   -   │   -   │
│ Fecha Baja      │   ✓    │  -   │  ✓   │   -    │   ✓     │  -   │   -   │   ✓✓  │
│ Vigencia        │   ✓    │  -   │  -   │   -    │   -     │  -   │   ✓✓  │   -   │
└─────────────────┴────────┴──────┴──────┴────────┴─────────┴──────┴───────┴───────┘

Leyenda:
✓   = Validación recomendada
✓✓  = Validación crítica (obligatoria)
-   = No aplica validación directa
```

---

## RESUMEN DE PRIORIDADES

### 🔴 VALIDACIONES CRÍTICAS (Bloquean el proceso)
1. **Cotización antes de 1997**: Debe tener registro antes del 1 de julio de 1997
2. **NSS válido**: 11 dígitos, formato correcto, existe en IMSS
3. **CURP válida**: 18 caracteres, formato correcto, coincide con nombre/fecha
4. **Edad para Financiado 100%**: Menor de 68 años si elige esta modalidad
5. **Semanas mínimas**: Cumple con mínimo según ley (500 o 1,250)

### 🟡 VALIDACIONES IMPORTANTES (Advertencias)
1. **Edad de pensión**: Menor de 60 años (puede preparar pero no pensionarse aún)
2. **Coherencia temporal**: Fechas lógicas entre nacimiento, baja y contrato
3. **Vigencia de derechos**: Estado vencido (requiere recuperación)
4. **Semanas vs edad**: Proporción razonable

### 🟢 VALIDACIONES RECOMENDADAS (Información)
1. **Formato de nombre**: Consistencia con documentos oficiales
2. **Estado de vigencia**: Tiempo sin cotizar
3. **Modalidad sugerida**: Según perfil del cliente

---

## IMPLEMENTACIÓN EN REACT

```jsx
// Ejemplo de implementación en el formulario React
const [validationErrors, setValidationErrors] = useState({});
const [validationWarnings, setValidationWarnings] = useState({});

const validateCliente = (datos) => {
  const errors = {};
  const warnings = {};
  
  // Validación NSS
  if (!datos.nss || datos.nss.length !== 11) {
    errors.nss = "El NSS debe tener exactamente 11 dígitos";
  }
  
  // Validación CURP
  const curpRegex = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2}$/;
  if (!curpRegex.test(datos.curp)) {
    errors.curp = "Formato de CURP inválido";
  }
  
  // Validación edad vs modalidad
  if (datos.modalidad === 'FINANCIADO_100' && datos.edad >= 68) {
    errors.modalidad = "Modalidad Financiado 100% no disponible para mayores de 68 años";
  }
  
  // Validación semanas vs ley
  if (datos.ley === 'LEY 73' && datos.semanas < 500) {
    errors.semanas = "No cumple el mínimo de 500 semanas para LEY 73";
  }
  
  setValidationErrors(errors);
  setValidationWarnings(warnings);
  
  return Object.keys(errors).length === 0;
};
```

---

## FLUJO DE VALIDACIÓN RECOMENDADO

```
1. Usuario ingresa datos básicos (Nombre, NSS, CURP)
   └─> Validar formato inmediato
   
2. Usuario ingresa fecha de nacimiento
   └─> Calcular edad automáticamente
   └─> Validar contra CURP
   
3. Usuario ingresa semanas cotizadas
   └─> Validar contra edad (coherencia)
   
4. Usuario selecciona ley
   └─> Validar semanas mínimas según ley
   
5. Usuario ingresa fecha de baja
   └─> Calcular "Sin vigencia" automáticamente
   └─> Mostrar estado de vigencia
   
6. Usuario selecciona modalidad
   └─> Validar restricciones de edad
   └─> Mostrar advertencias si aplica
   
7. Validación final al enviar formulario
   └─> Validaciones cruzadas completas
   └─> Generar reporte de elegibilidad
```

---

© 2026 Sistema de Recuperación de Pensiones - Grupo AVIVIR
