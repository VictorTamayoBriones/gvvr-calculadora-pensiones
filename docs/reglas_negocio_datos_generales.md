# DOCUMENTO TÉCNICO: REGLAS DE NEGOCIO - DATOS GENERALES
## Sistema de Recuperación de Pensiones - Financiado 100

---

## 1. DESCRIPCIÓN GENERAL

La hoja "DATOS GENERALES" es el punto de entrada del sistema de cálculo para recuperación de pensiones bajo diferentes modalidades de financiamiento. Captura información básica del cliente, valida requisitos de elegibilidad y determina la modalidad de financiamiento apropiada.

---

## 2. CAMPOS DE ENTRADA

### 2.1 NOMBRE DEL ASESOR (C4)
- **Tipo**: String
- **Obligatorio**: Sí
- **Validaciones**: Ninguna específica
- **Descripción**: Identificador del asesor responsable del caso

### 2.2 NOMBRE CLIENTE (C6)
- **Tipo**: String
- **Obligatorio**: Sí
- **Formato**: Texto libre (nombre completo)
- **Validaciones**: Ninguna específica
- **Descripción**: Nombre completo del beneficiario

### 2.3 NSS - Número de Seguridad Social (C7)
- **Tipo**: String (texto)
- **Obligatorio**: Sí
- **Longitud**: Exactamente 11 caracteres
- **Formato**: Numérico con formato de texto (@)
- **Validación**:
  ```
  REGLA: textLength >= 11
  ERROR: "NSS INVALIDO - Favor de Ingresar el NSS a 11 posiciones. Vuelve a intentar."
  ```
- **Validación Adicional (E7)**:
  ```
  Referencia: 'INFORME COSTO MENSUAL'!D15
  Mensaje: "DEBE CONTAR CON COTIZACION ANTES DEL 1 DE JULIO DE 1997"
  ```
- **Descripción**: Identificador único del asegurado en el IMSS
- **Nota Implementación**: Almacenar como string para preservar ceros iniciales

### 2.4 CURP - Clave Única de Registro de Población (C8)
- **Tipo**: String (texto)
- **Obligatorio**: Sí
- **Longitud**: Exactamente 18 caracteres
- **Formato**: Alfanumérico con formato de texto (@)
- **Validación**:
  ```
  REGLA: textLength >= 18
  ERROR: "CURP INVALIDA - Favor de ingresar la CURP a 18 posiciones. Vuelve a intentar."
  ```
- **Validación Adicional (E8)**:
  ```
  Fórmula: =IFERROR('INFORME COSTO MENSUAL'!J7,"")
  Mensaje: "SOLO APLICA PARA REACTIVA TRADICIONAL, Para Reactiva financiado 100 solo son viables menores de 68 años"
  ```
- **Descripción**: Identificador único de población en México
- **Formato CURP**: 4 letras + 6 dígitos (fecha) + 1 letra (sexo) + 2 letras (estado) + 3 letras (nombre) + 2 caracteres (homoclave)

### 2.5 SEMANAS COTIZADAS (C10)
- **Tipo**: Integer
- **Obligatorio**: Sí
- **Valor Mínimo**: 430 semanas
- **Validación**:
  ```
  REGLA: valor >= 430
  ERROR: "SEMANAS INSUFICIENTES - El mínimo de semanas permitidas para este producto es de 430, de lo contrario se debe ofrecer otras alternativas."
  ```
- **Descripción**: Total de semanas cotizadas ante el IMSS
- **Nota de Negocio**: 430 semanas equivalen aproximadamente a 8.3 años de cotización

### 2.6 FECHA BAJA (C11)
- **Tipo**: Date
- **Obligatorio**: Sí
- **Formato**: mm-dd-yy
- **Validaciones**: Ninguna específica (pero debe ser fecha válida)
- **Descripción**: Fecha en que el trabajador causó baja del IMSS
- **Uso**: Se utiliza para calcular antigüedad y derechos

### 2.7 SALDO AFORE (C13)
- **Tipo**: Decimal (Currency)
- **Obligatorio**: Sí
- **Valor Mínimo**: $15,000.00 MXN
- **Formato**: Moneda mexicana (_-"$"* #,##0.00_-)
- **Validación**:
  ```
  REGLA: valor >= 15000
  ERROR: "MONTO EN AFORE INSUFICIENTE - El monto minimo para este producto es de $15,000, el cual se toma de las subcuentas de:
  - SAR 92
  - RETIRO 97
  - VIVIENDA"
  ```
- **Subcuentas Incluidas**:
  - SAR 92 (Sistema de Ahorro para el Retiro 1992)
  - RETIRO 97 (Subcuenta de Retiro Ley 1997)
  - VIVIENDA (Subcuenta de Vivienda)
- **Descripción**: Saldo total disponible en la cuenta AFORE del cliente
- **Nota Crítica**: Este saldo es fundamental para determinar la modalidad de financiamiento

### 2.8 PRÉSTAMO FINANCIERO (C14)
- **Tipo**: Decimal (Currency)
- **Formato**: Moneda mexicana (_-"$"* #,##0.00_-)
- **Calculado**: Sí (no es entrada directa del usuario en todos los casos)
- **Fórmula de Cálculo (G14)**:
  ```javascript
  // Pseudocódigo
  if (saldoAfore < montoMinimoRequerido) {
    prestamoFinanciero = (pensionMensual * 7.5) - 10000;
  } else {
    prestamoFinanciero = 0;
  }
  
  // Referencias Excel
  // montoMinimoRequerido: 'INFORME COSTO MENSUAL'!K25
  // pensionMensual: 'PROYECCIÓN DE PENSIÓN'!F44
  ```
- **Etiqueta Dinámica (B14)**:
  ```javascript
  // Pseudocódigo
  if (saldoAfore < montoMinimoRequerido && modalidadSugerida === "REACTIVA FINANCIADO 100") {
    etiqueta = "NECESITA PRESTAMO FINANCIERO: ";
  } else {
    etiqueta = "";
  }
  ```
- **Descripción**: Monto que Grupo Avivir financiará al cliente
- **Constantes**:
  - Multiplicador: 7.5 (meses de pensión)
  - Descuento fijo: $10,000.00 MXN

### 2.9 FECHA INICIO DE CONTRATO (C15)
- **Tipo**: Date
- **Obligatorio**: Sí
- **Formato**: mm-dd-yy
- **Validaciones**: Ninguna específica (pero debe ser fecha válida y posterior a fecha de baja)
- **Descripción**: Fecha en que inicia formalmente el contrato de recuperación de pensión

### 2.10 MODALIDAD (C17)
- **Tipo**: String (Lista de valores)
- **Obligatorio**: Sí
- **Valores Permitidos**: Definidos dinámicamente por celdas G16:G17
- **UI**: Dropdown list
- **Validación**:
  ```
  TIPO: list
  FUENTE: $G$16:$G$17
  ```
- **Descripción**: Modalidad de financiamiento seleccionada
- **Valores Posibles** (según lógica calculada):
  - "FINANCIADO 1" (parcialmente financiado)
  - "FINANCIADO 100" (totalmente financiado)
  - "REACTIVA TRADICIONAL"
  - "REACTIVA FINANCIADO 100"

---

## 3. CAMPOS CALCULADOS Y LÓGICA DE NEGOCIO

### 3.1 DETERMINACIÓN AUTOMÁTICA DE MODALIDAD (G16)

**Fórmula**:
```excel
=IF(C13+G14<'INFORME COSTO MENSUAL'!K25," FINANCIADO 1","FINANCIADO 100")
```

**Lógica en Pseudocódigo**:
```javascript
function calcularModalidadSugerida(saldoAfore, prestamoFinanciero, montoMinimoRequerido) {
  const totalDisponible = saldoAfore + prestamoFinanciero;
  
  if (totalDisponible < montoMinimoRequerido) {
    return "FINANCIADO 1"; // Nota: tiene espacio inicial en Excel
  } else {
    return "FINANCIADO 100";
  }
}

// Referencias:
// C13: saldoAfore
// G14: prestamoFinanciero (calculado)
// 'INFORME COSTO MENSUAL'!K25: montoMinimoRequerido
```

**Regla de Negocio**:
- Si el saldo en AFORE más el préstamo financiero es insuficiente → "FINANCIADO 1"
- Si el saldo en AFORE más el préstamo financiero es suficiente → "FINANCIADO 100"

### 3.2 MODALIDAD ALTERNATIVA (G17)

**Fórmula**:
```excel
=IFERROR(IF(G16="REACTIVA FINANCIADO 100","REACTIVA TRADICIONAL",""),"")
```

**Lógica en Pseudocódigo**:
```javascript
function calcularModalidadAlternativa(modalidadSugerida) {
  try {
    if (modalidadSugerida === "REACTIVA FINANCIADO 100") {
      return "REACTIVA TRADICIONAL";
    } else {
      return "";
    }
  } catch (error) {
    return "";
  }
}
```

**Regla de Negocio**:
- Solo ofrece alternativa cuando la modalidad sugerida es "REACTIVA FINANCIADO 100"
- La alternativa es "REACTIVA TRADICIONAL"

### 3.3 DESCRIPCIÓN DE MODALIDAD (B18)

**Fórmula**:
```excel
=IF(C17="REACTIVA TRADICIONAL",
  "El cliente esta obligado a pagar su inscripcion y meses de contratacion, solo GRUPO AVIVIR financiara la GESTION",
  IF(C17="REACTIVA FINANCIADO 100",
    "GRUPO AVIVIR financiara el 100% de la inscripcion, pagos mensuales y la gestion",
    ""))
```

**Lógica en Pseudocódigo**:
```javascript
function obtenerDescripcionModalidad(modalidadSeleccionada) {
  const descripciones = {
    "REACTIVA TRADICIONAL": 
      "El cliente esta obligado a pagar su inscripcion y meses de contratacion, " +
      "solo GRUPO AVIVIR financiara la GESTION",
    
    "REACTIVA FINANCIADO 100": 
      "GRUPO AVIVIR financiara el 100% de la inscripcion, pagos mensuales y la gestion"
  };
  
  return descripciones[modalidadSeleccionada] || "";
}
```

**Descripciones por Modalidad**:

1. **REACTIVA TRADICIONAL**:
   - Cliente paga: Inscripción + Meses de contratación
   - Grupo Avivir financia: Solo la GESTIÓN

2. **REACTIVA FINANCIADO 100**:
   - Cliente paga: Nada
   - Grupo Avivir financia: 100% (Inscripción + Pagos mensuales + Gestión)

3. **Otras modalidades**:
   - Sin descripción específica (string vacío)

---

## 4. DEPENDENCIAS ENTRE HOJAS

### 4.1 REFERENCIAS A "INFORME COSTO MENSUAL"

| Celda Referenciada | Uso en DATOS GENERALES | Descripción |
|-------------------|------------------------|-------------|
| `D15` | E7 (Validación NSS) | Mensaje de validación sobre cotización antes de julio 1997 |
| `J7` | E8 (Validación CURP) | Validación de edad y modalidad reactiva |
| `K25` | B14, G14, G16 (Cálculos críticos) | Monto mínimo requerido para determinar financiamiento |

### 4.2 REFERENCIAS A "PROYECCIÓN DE PENSIÓN"

| Celda Referenciada | Uso en DATOS GENERALES | Descripción |
|-------------------|------------------------|-------------|
| `F44` | G14 (Cálculo préstamo) | Monto de pensión mensual proyectada |

### 4.3 FLUJO DE DATOS

```
┌─────────────────┐
│ DATOS GENERALES │
└────────┬────────┘
         │
         ├──(Lee)──► INFORME COSTO MENSUAL (K25, D15, J7)
         │
         ├──(Lee)──► PROYECCIÓN DE PENSIÓN (F44)
         │
         └──(Usa)──► Cálculos internos (G14, G16, G17, B18)
```

---

## 5. REGLAS DE VALIDACIÓN CONSOLIDADAS

### 5.1 Validaciones de Formato

| Campo | Regla | Mensaje de Error |
|-------|-------|------------------|
| NSS (C7) | Longitud exacta = 11 | "NSS INVALIDO - Favor de Ingresar el NSS a 11 posiciones. Vuelve a intentar." |
| CURP (C8) | Longitud exacta = 18 | "CURP INVALIDA - Favor de ingresar la CURP a 18 posiciones. Vuelve a intentar." |

### 5.2 Validaciones de Negocio

| Campo | Regla | Mensaje de Error |
|-------|-------|------------------|
| Semanas Cotizadas (C10) | Valor >= 430 | "SEMANAS INSUFICIENTES - El mínimo de semanas permitidas para este producto es de 430, de lo contrario se debe ofrecer otras alternativas." |
| Saldo AFORE (C13) | Valor >= $15,000.00 | "MONTO EN AFORE INSUFICIENTE - El monto minimo para este producto es de $15,000, el cual se toma de las subcuentas de: SAR 92, RETIRO 97, VIVIENDA" |

### 5.3 Validaciones Condicionales

#### NSS - Cotización antes de Julio 1997 (E7)
```javascript
// Validación referenciada desde otra hoja
// Muestra: "DEBE CONTAR CON COTIZACION ANTES DEL 1 DE JULIO DE 1997"
// Fuente: 'INFORME COSTO MENSUAL'!D15
```

#### CURP - Restricciones por Edad y Modalidad (E8)
```javascript
// Validación referenciada desde otra hoja
// Muestra: "SOLO APLICA PARA REACTIVA TRADICIONAL, Para Reactiva financiado 100 solo son viables menores de 68 años"
// Fuente: 'INFORME COSTO MENSUAL'!J7
// Lógica: =IFERROR('INFORME COSTO MENSUAL'!J7,"")
```

**Interpretación**:
- REACTIVA TRADICIONAL: Sin restricción de edad
- REACTIVA FINANCIADO 100: Solo menores de 68 años

---

## 6. MODALIDADES DE FINANCIAMIENTO

### 6.1 Matriz de Decisión

```
┌───────────────────────────────────────────────────────────┐
│ DETERMINACIÓN DE MODALIDAD                                 │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  SI: SaldoAFORE + Préstamo < MontoMínimo                  │
│      → FINANCIADO 1 (parcial)                             │
│                                                            │
│  SI: SaldoAFORE + Préstamo >= MontoMínimo                 │
│      → FINANCIADO 100 (total)                             │
│                                                            │
│  Modalidades Especiales:                                   │
│  - REACTIVA TRADICIONAL (cliente paga inscripción)        │
│  - REACTIVA FINANCIADO 100 (todo financiado, <68 años)   │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

### 6.2 Características por Modalidad

| Modalidad | Cliente Paga | Grupo Avivir Financia | Restricciones |
|-----------|--------------|----------------------|---------------|
| **FINANCIADO 1** | Parte de los costos | Préstamo parcial | Saldo + Préstamo < Monto Mínimo |
| **FINANCIADO 100** | Nada | Todo (inscripción + mensualidades + gestión) | Saldo + Préstamo >= Monto Mínimo |
| **REACTIVA TRADICIONAL** | Inscripción + Mensualidades | Solo gestión | Sin restricción de edad |
| **REACTIVA FINANCIADO 100** | Nada | Todo | Solo menores de 68 años |

---

## 7. CONSTANTES Y VALORES DE REFERENCIA

### 7.1 Constantes Numéricas

| Constante | Valor | Uso |
|-----------|-------|-----|
| `MINIMO_SEMANAS` | 430 | Validación de elegibilidad |
| `MINIMO_SALDO_AFORE` | $15,000.00 | Validación de saldo mínimo |
| `MULTIPLICADOR_PENSION` | 7.5 | Cálculo de préstamo (meses de pensión) |
| `DESCUENTO_PRESTAMO` | $10,000.00 | Descuento fijo en cálculo de préstamo |
| `EDAD_MAXIMA_REACTIVA_F100` | 68 años | Restricción de edad para modalidad reactiva |

### 7.2 Fechas Críticas

| Fecha | Significado |
|-------|-------------|
| 1 de Julio de 1997 | Fecha límite para cotización bajo Ley 73 del IMSS |

---

## 8. IMPLEMENTACIÓN TÉCNICA

### 8.1 Modelo de Datos Sugerido (TypeScript/Java)

```typescript
interface DatosGenerales {
  // Información del Asesor
  nombreAsesor: string;
  
  // Información del Cliente
  nombreCliente: string;
  nss: string;              // 11 caracteres exactos
  curp: string;             // 18 caracteres exactos
  
  // Información Laboral
  semanasCotizadas: number; // >= 430
  fechaBaja: Date;
  
  // Información Financiera
  saldoAfore: number;       // >= 15000
  prestamoFinanciero?: number; // Calculado
  
  // Información Contractual
  fechaInicioContrato: Date;
  modalidad: ModalidadFinanciamiento;
  
  // Campos Calculados (no persisten)
  modalidadSugerida?: string;
  descripcionModalidad?: string;
}

enum ModalidadFinanciamiento {
  FINANCIADO_1 = "FINANCIADO 1",
  FINANCIADO_100 = "FINANCIADO 100",
  REACTIVA_TRADICIONAL = "REACTIVA TRADICIONAL",
  REACTIVA_FINANCIADO_100 = "REACTIVA FINANCIADO 100"
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

### 8.2 Validadores Reutilizables

```typescript
class DatosGeneralesValidator {
  
  // Validación de NSS
  static validarNSS(nss: string): ValidationResult {
    const errors: string[] = [];
    
    if (!nss || nss.length !== 11) {
      errors.push("NSS INVALIDO - Favor de Ingresar el NSS a 11 posiciones.");
    }
    
    if (!/^\d{11}$/.test(nss)) {
      errors.push("NSS debe contener solo dígitos.");
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
  
  // Validación de CURP
  static validarCURP(curp: string): ValidationResult {
    const errors: string[] = [];
    
    if (!curp || curp.length !== 18) {
      errors.push("CURP INVALIDA - Favor de ingresar la CURP a 18 posiciones.");
    }
    
    // Patrón básico de CURP
    const curpPattern = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
    if (curp && !curpPattern.test(curp)) {
      errors.push("CURP no cumple con el formato válido.");
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
  
  // Validación de Semanas Cotizadas
  static validarSemanasCotizadas(semanas: number): ValidationResult {
    const errors: string[] = [];
    const MINIMO_SEMANAS = 430;
    
    if (semanas < MINIMO_SEMANAS) {
      errors.push(
        "SEMANAS INSUFICIENTES - El mínimo de semanas permitidas para este " +
        "producto es de 430, de lo contrario se debe ofrecer otras alternativas."
      );
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
  
  // Validación de Saldo AFORE
  static validarSaldoAfore(saldo: number): ValidationResult {
    const errors: string[] = [];
    const MINIMO_SALDO = 15000;
    
    if (saldo < MINIMO_SALDO) {
      errors.push(
        "MONTO EN AFORE INSUFICIENTE - El monto minimo para este producto es " +
        "de $15,000, el cual se toma de las subcuentas de: SAR 92, RETIRO 97, VIVIENDA"
      );
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
  
  // Validación Completa
  static validarDatosGenerales(datos: DatosGenerales): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    
    const nssValidation = this.validarNSS(datos.nss);
    allErrors.push(...nssValidation.errors);
    
    const curpValidation = this.validarCURP(datos.curp);
    allErrors.push(...curpValidation.errors);
    
    const semanasValidation = this.validarSemanasCotizadas(datos.semanasCotizadas);
    allErrors.push(...semanasValidation.errors);
    
    const saldoValidation = this.validarSaldoAfore(datos.saldoAfore);
    allErrors.push(...saldoValidation.errors);
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
}
```

### 8.3 Motor de Cálculo

```typescript
class CalculadoraModalidad {
  
  // Calcula el préstamo financiero necesario
  static calcularPrestamoFinanciero(
    saldoAfore: number,
    pensionMensual: number,
    montoMinimoRequerido: number
  ): number {
    if (saldoAfore < montoMinimoRequerido) {
      const MULTIPLICADOR = 7.5;
      const DESCUENTO = 10000;
      return (pensionMensual * MULTIPLICADOR) - DESCUENTO;
    }
    return 0;
  }
  
  // Determina la modalidad sugerida
  static determinarModalidadSugerida(
    saldoAfore: number,
    prestamoFinanciero: number,
    montoMinimoRequerido: number
  ): string {
    const totalDisponible = saldoAfore + prestamoFinanciero;
    
    if (totalDisponible < montoMinimoRequerido) {
      return ModalidadFinanciamiento.FINANCIADO_1;
    } else {
      return ModalidadFinanciamiento.FINANCIADO_100;
    }
  }
  
  // Obtiene la modalidad alternativa
  static obtenerModalidadAlternativa(modalidadSugerida: string): string | null {
    if (modalidadSugerida === ModalidadFinanciamiento.REACTIVA_FINANCIADO_100) {
      return ModalidadFinanciamiento.REACTIVA_TRADICIONAL;
    }
    return null;
  }
  
  // Obtiene la descripción de la modalidad
  static obtenerDescripcionModalidad(modalidad: string): string {
    const descripciones: Record<string, string> = {
      [ModalidadFinanciamiento.REACTIVA_TRADICIONAL]:
        "El cliente esta obligado a pagar su inscripcion y meses de contratacion, " +
        "solo GRUPO AVIVIR financiara la GESTION",
      
      [ModalidadFinanciamiento.REACTIVA_FINANCIADO_100]:
        "GRUPO AVIVIR financiara el 100% de la inscripcion, pagos mensuales y la gestion"
    };
    
    return descripciones[modalidad] || "";
  }
  
  // Proceso completo de cálculo
  static procesarDatosGenerales(
    datos: DatosGenerales,
    pensionMensual: number,
    montoMinimoRequerido: number
  ): DatosGenerales {
    // Calcular préstamo
    datos.prestamoFinanciero = this.calcularPrestamoFinanciero(
      datos.saldoAfore,
      pensionMensual,
      montoMinimoRequerido
    );
    
    // Determinar modalidad sugerida
    datos.modalidadSugerida = this.determinarModalidadSugerida(
      datos.saldoAfore,
      datos.prestamoFinanciero,
      montoMinimoRequerido
    );
    
    // Obtener descripción de la modalidad seleccionada
    datos.descripcionModalidad = this.obtenerDescripcionModalidad(
      datos.modalidad
    );
    
    return datos;
  }
}
```

### 8.4 Ejemplo de Uso en React

```typescript
// Componente React con validación en tiempo real
import React, { useState, useEffect } from 'react';

interface FormErrors {
  [key: string]: string;
}

const DatosGeneralesForm: React.FC = () => {
  const [formData, setFormData] = useState<DatosGenerales>({
    nombreAsesor: '',
    nombreCliente: '',
    nss: '',
    curp: '',
    semanasCotizadas: 0,
    fechaBaja: new Date(),
    saldoAfore: 0,
    fechaInicioContrato: new Date(),
    modalidad: ModalidadFinanciamiento.FINANCIADO_100
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Validación en tiempo real
  const handleNSSChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, nss: value });
    
    const validation = DatosGeneralesValidator.validarNSS(value);
    if (!validation.isValid) {
      setErrors({ ...errors, nss: validation.errors[0] });
    } else {
      const newErrors = { ...errors };
      delete newErrors.nss;
      setErrors(newErrors);
    }
  };
  
  // Calcular campos derivados
  useEffect(() => {
    const pensionMensual = 12000; // Esto vendría de otra hoja
    const montoMinimo = 95000;     // Esto vendría de otra hoja
    
    const datosActualizados = CalculadoraModalidad.procesarDatosGenerales(
      formData,
      pensionMensual,
      montoMinimo
    );
    
    setFormData(datosActualizados);
  }, [formData.saldoAfore, formData.modalidad]);
  
  return (
    <form>
      {/* Campos del formulario con validación */}
      <div>
        <label>NSS:</label>
        <input
          type="text"
          value={formData.nss}
          onChange={handleNSSChange}
          maxLength={11}
          pattern="\d{11}"
        />
        {errors.nss && <span className="error">{errors.nss}</span>}
      </div>
      {/* ... más campos ... */}
    </form>
  );
};
```

---

## 9. CASOS DE PRUEBA RECOMENDADOS

### 9.1 Casos Válidos

```typescript
// Test Case 1: Cliente con saldo suficiente
{
  nombreAsesor: "HCM",
  nombreCliente: "GARCIA LOPEZ JUAN CARLOS",
  nss: "12345678901",
  curp: "GALJ850615HDFPXN01",
  semanasCotizadas: 520,
  fechaBaja: new Date("2010-05-15"),
  saldoAfore: 150000,
  fechaInicioContrato: new Date("2025-01-01"),
  modalidad: "FINANCIADO 100"
}
// Esperado: Sin errores, modalidad sugerida = "FINANCIADO 100"

// Test Case 2: Cliente con saldo insuficiente
{
  nombreAsesor: "ABC",
  nombreCliente: "MARTINEZ SANCHEZ MARIA ELENA",
  nss: "98765432109",
  curp: "MASM900320MDFRNR04",
  semanasCotizadas: 450,
  fechaBaja: new Date("2012-08-20"),
  saldoAfore: 25000,
  fechaInicioContrato: new Date("2025-02-01"),
  modalidad: "FINANCIADO 1"
}
// Esperado: Préstamo calculado, modalidad sugerida = "FINANCIADO 1"
```

### 9.2 Casos Inválidos

```typescript
// Test Case 3: NSS inválido
{
  nss: "123456789", // Solo 9 dígitos
  // Esperado: Error de validación
}

// Test Case 4: Semanas insuficientes
{
  semanasCotizadas: 400,
  // Esperado: Error "SEMANAS INSUFICIENTES"
}

// Test Case 5: Saldo AFORE insuficiente
{
  saldoAfore: 10000,
  // Esperado: Error "MONTO EN AFORE INSUFICIENTE"
}

// Test Case 6: CURP inválida
{
  curp: "MALFORMATCURP",
  // Esperado: Error de validación
}
```

---

## 10. CONSIDERACIONES DE SEGURIDAD

### 10.1 Validación del Lado del Servidor

**CRÍTICO**: Todas las validaciones deben replicarse en el backend. Las validaciones del frontend son solo para UX.

```typescript
// Ejemplo de validación en servidor (Node.js/Express)
app.post('/api/datos-generales', async (req, res) => {
  const datos: DatosGenerales = req.body;
  
  // Validar en servidor
  const validation = DatosGeneralesValidator.validarDatosGenerales(datos);
  
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors
    });
  }
  
  // Procesar datos
  // ...
});
```

### 10.2 Sanitización de Entradas

```typescript
// Sanitizar NSS y CURP antes de almacenar
function sanitizarNSS(nss: string): string {
  return nss.replace(/[^0-9]/g, '').substring(0, 11);
}

function sanitizarCURP(curp: string): string {
  return curp.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 18);
}
```

---

## 11. PRÓXIMOS PASOS DE IMPLEMENTACIÓN

### Fase 1: Backend (Recomendado primero)
1. Definir modelos de datos (interfaces/clases)
2. Implementar validadores
3. Implementar motor de cálculo
4. Crear endpoints API
5. Pruebas unitarias

### Fase 2: Frontend
1. Crear formulario con validación en tiempo real
2. Integrar con API backend
3. Implementar visualización de modalidades
4. Mostrar cálculos en tiempo real

### Fase 3: Integración
1. Conectar con "INFORME COSTO MENSUAL"
2. Conectar con "PROYECCIÓN DE PENSIÓN"
3. Implementar flujo completo
4. Pruebas de integración

---

## 12. GLOSARIO DE TÉRMINOS

| Término | Definición |
|---------|-----------|
| **NSS** | Número de Seguridad Social - Identificador único del IMSS |
| **CURP** | Clave Única de Registro de Población - Identificador único nacional |
| **AFORE** | Administradora de Fondos para el Retiro - Cuenta de ahorro para pensión |
| **SAR 92** | Sistema de Ahorro para el Retiro implementado en 1992 |
| **RETIRO 97** | Subcuenta de retiro bajo la Ley del Seguro Social de 1997 |
| **Ley 73** | Ley del Seguro Social de 1973 (anterior a reforma de 1997) |
| **Semanas Cotizadas** | Número de semanas con aportaciones al IMSS |
| **Modalidad** | Esquema de financiamiento del servicio de recuperación |

---

## 13. REFERENCIAS

- Hoja origen: `CALCULADORA_-_RECUPERACION_F100.xlsx`
- Hoja analizada: `DATOS GENERALES`
- Hojas relacionadas:
  - `INFORME COSTO MENSUAL`
  - `PROYECCIÓN DE PENSIÓN`

---

**Documento generado**: 2025-02-04
**Versión**: 1.0
**Autor**: Análisis técnico automatizado
**Estado**: Documentación completa de reglas de negocio
