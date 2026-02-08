# 📊 DOCUMENTACIÓN TÉCNICA - FORMULARIO DATOS GENERALES

## 🎯 Resumen Ejecutivo

Este documento detalla la lógica de negocio del formulario "DATOS GENERALES" utilizado para la calculadora de recuperación F100. El formulario evalúa la capacidad financiera del cliente y determina el tipo de financiamiento requerido para su proceso de pensión.

---

## 📋 Campos de Entrada del Usuario

### Datos Personales y Laborales
| Campo | Celda | Tipo | Descripción |
|-------|-------|------|-------------|
| Nombre del Asesor | C4 | Texto | Identificador del asesor asignado |
| Nombre Cliente | C6 | Texto | Nombre completo del cliente |
| NSS | C7 | Número | Número de Seguridad Social |
| CURP | C8 | Texto | Clave Única de Registro de Población |
| Semanas Cotizadas | C10 | Número | Total de semanas cotizadas en IMSS |
| Fecha de Baja | C11 | Fecha | Última fecha de baja laboral |
| Saldo AFORE | C13 | Moneda | Saldo disponible en AFORE |
| Fecha Inicio Contrato | C15 | Fecha | Inicio del contrato de servicios |

---

## 🔄 Lógica de Cálculo Automático

### 1️⃣ Cálculo de Préstamo Financiero (G14)

**Fórmula:**
```excel
=IF(C13<'INFORME COSTO MENSUAL'!K25,'PROYECCIÓN DE PENSIÓN'!F44*7.5-10000,0)
```

**Lógica:**
- **Condición:** Saldo AFORE (C13) < Valor de Referencia (K25)
- **Resultado SI:** Préstamo = (Factor Pensión F44 × 7.5) - 10,000
- **Resultado NO:** Préstamo = 0

**Casos de Uso:**
- Cliente con saldo insuficiente → Calcula préstamo necesario
- Cliente con saldo suficiente → No requiere préstamo

---

### 2️⃣ Determinación de Tipo de Financiamiento (G16)

**Fórmula:**
```excel
=IF(C13+G14<'INFORME COSTO MENSUAL'!K25," FINANCIADO 1","FINANCIADO 100")
```

**Lógica:**
- **Condición:** (Saldo AFORE + Préstamo) < Valor de Referencia
- **Resultado SI:** "FINANCIADO 1" (Insuficiente)
- **Resultado NO:** "FINANCIADO 100" (Suficiente)

**Interpretación:**
- **FINANCIADO 1:** El cliente necesita financiamiento adicional
- **FINANCIADO 100:** El cliente puede cubrir el 100% de los costos

---

### 3️⃣ Evaluación de Modalidad Reactiva (G17)

**Fórmula:**
```excel
=IFERROR(IF(G16="REACTIVA FINANCIADO 100","REACTIVA TRADICIONAL",""),"")
```

**Lógica:**
- **Condición:** G16 = "REACTIVA FINANCIADO 100"
- **Resultado SI:** "REACTIVA TRADICIONAL"
- **Resultado NO:** Vacío

**Propósito:** Sugerir modalidad reactiva cuando se detecta necesidad específica

---

### 4️⃣ Mensaje de Alerta de Préstamo (B14)

**Fórmula:**
```excel
=IFERROR(IF(AND(C13<'INFORME COSTO MENSUAL'!K25,G16="REACTIVA FINANCIADO 100"),"NECESITA PRESTAMO FINANCIERO: ",""),"")
```

**Lógica:**
- **Condiciones combinadas:**
  1. Saldo AFORE < Valor de Referencia
  2. Tipo de financiamiento = "REACTIVA FINANCIADO 100"
- **Resultado:** Muestra alerta de préstamo requerido

---

## 📊 Modalidades de Financiamiento

### 🔵 REACTIVA FINANCIADO 100
**Características:**
- ✅ GRUPO AVIVIR financia el 100% de:
  - Inscripción
  - Pagos mensuales de contratación
  - Gestión administrativa

**Mensaje al cliente:**
> "GRUPO AVIVIR financiará el 100% de la inscripción, pagos mensuales y la gestión"

---

### 🟢 REACTIVA TRADICIONAL
**Características:**
- ❌ Cliente debe pagar:
  - Inscripción
  - Meses de contratación
- ✅ GRUPO AVIVIR financia:
  - Gestión administrativa

**Mensaje al cliente:**
> "El cliente está obligado a pagar su inscripción y meses de contratación, solo GRUPO AVIVIR financiará la GESTIÓN"

---

### 🟡 FINANCIADO 100
**Características:**
- ✅ Cliente cubre 100% con sus propios fondos
- ❌ Sin financiamiento de GRUPO AVIVIR
- Saldo AFORE suficiente para cubrir todos los costos

---

## 🔗 Referencias Externas

### Hojas Relacionadas
1. **INFORME COSTO MENSUAL**
   - K25: Valor de referencia para cálculos
   - D15: Datos adicionales del cliente
   - J7: Información complementaria

2. **PROYECCIÓN DE PENSIÓN**
   - F44: Factor de cálculo para préstamos

3. **Otras Hojas Generadas:**
   - PROYECCIÓN DE PENSIÓN_1
   - PROYECCIÓN DE PENSIÓN PLUS

---

## 🎯 Casos de Uso Principales

### Caso 1: Cliente con Saldo Suficiente
```
Entrada:
- Saldo AFORE: $150,000
- Valor Referencia: $80,000

Flujo:
1. C13 ($150,000) ≥ K25 ($80,000) ✅
2. Préstamo G14 = 0
3. Tipo: FINANCIADO 100
4. Modalidad: FINANCIADO 100 (Cliente cubre todo)
```

### Caso 2: Cliente con Saldo Insuficiente - Financiado 100
```
Entrada:
- Saldo AFORE: $15,000
- Valor Referencia: $80,000
- Factor F44: $12,000

Flujo:
1. C13 ($15,000) < K25 ($80,000) ❌
2. Préstamo G14 = ($12,000 × 7.5) - $10,000 = $80,000
3. Total: $15,000 + $80,000 = $95,000
4. $95,000 ≥ $80,000 ✅
5. Tipo: FINANCIADO 100
6. Modalidad: Selección del usuario
```

### Caso 3: Cliente con Saldo Insuficiente - Financiado 1
```
Entrada:
- Saldo AFORE: $5,000
- Valor Referencia: $80,000
- Préstamo calculado: $50,000

Flujo:
1. C13 ($5,000) < K25 ($80,000) ❌
2. Préstamo G14 = $50,000
3. Total: $5,000 + $50,000 = $55,000
4. $55,000 < $80,000 ❌
5. Tipo: FINANCIADO 1
6. Requiere financiamiento adicional
7. Modalidad: REACTIVA TRADICIONAL o REACTIVA FINANCIADO 100
```

---

## 🛠️ Consideraciones Técnicas para Implementación

### Para JavaScript/TypeScript

```javascript
class CalculadoraRecuperacionF100 {
    constructor() {
        this.valorReferencia = null; // K25
        this.factorPension = null;   // F44
    }
    
    calcularPrestamo(saldoAfore) {
        if (saldoAfore < this.valorReferencia) {
            return (this.factorPension * 7.5) - 10000;
        }
        return 0;
    }
    
    determinarTipoFinanciamiento(saldoAfore, prestamo) {
        const total = saldoAfore + prestamo;
        return total < this.valorReferencia ? "FINANCIADO 1" : "FINANCIADO 100";
    }
    
    evaluarModalidadReactiva(tipoFinanciamiento) {
        return tipoFinanciamiento === "REACTIVA FINANCIADO 100" 
            ? "REACTIVA TRADICIONAL" 
            : "";
    }
    
    necesitaPrestamoFinanciero(saldoAfore, tipoFinanciamiento) {
        return saldoAfore < this.valorReferencia && 
               tipoFinanciamiento === "REACTIVA FINANCIADO 100";
    }
    
    getMensajeModalidad(modalidad) {
        const mensajes = {
            "REACTIVA TRADICIONAL": 
                "El cliente está obligado a pagar su inscripción y meses de contratación, " +
                "solo GRUPO AVIVIR financiará la GESTIÓN",
            "REACTIVA FINANCIADO 100": 
                "GRUPO AVIVIR financiará el 100% de la inscripción, pagos mensuales y la gestión",
            "FINANCIADO 100": 
                "Cliente con capacidad financiera para cubrir costos"
        };
        return mensajes[modalidad] || "";
    }
}
```

### Para Java

```java
public class CalculadoraRecuperacionF100 {
    private double valorReferencia; // K25
    private double factorPension;   // F44
    
    public double calcularPrestamo(double saldoAfore) {
        if (saldoAfore < valorReferencia) {
            return (factorPension * 7.5) - 10000;
        }
        return 0;
    }
    
    public String determinarTipoFinanciamiento(double saldoAfore, double prestamo) {
        double total = saldoAfore + prestamo;
        return total < valorReferencia ? "FINANCIADO 1" : "FINANCIADO 100";
    }
    
    public String evaluarModalidadReactiva(String tipoFinanciamiento) {
        return "REACTIVA FINANCIADO 100".equals(tipoFinanciamiento) 
            ? "REACTIVA TRADICIONAL" 
            : "";
    }
    
    public boolean necesitaPrestamoFinanciero(double saldoAfore, String tipoFinanciamiento) {
        return saldoAfore < valorReferencia && 
               "REACTIVA FINANCIADO 100".equals(tipoFinanciamiento);
    }
    
    public String getMensajeModalidad(String modalidad) {
        Map<String, String> mensajes = new HashMap<>();
        mensajes.put("REACTIVA TRADICIONAL", 
            "El cliente está obligado a pagar su inscripción y meses de contratación, " +
            "solo GRUPO AVIVIR financiará la GESTIÓN");
        mensajes.put("REACTIVA FINANCIADO 100", 
            "GRUPO AVIVIR financiará el 100% de la inscripción, pagos mensuales y la gestión");
        mensajes.put("FINANCIADO 100", 
            "Cliente con capacidad financiera para cubrir costos");
        return mensajes.getOrDefault(modalidad, "");
    }
}
```

### Para React/Angular

```typescript
interface DatosGenerales {
    nombreAsesor: string;
    nombreCliente: string;
    nss: string;
    curp: string;
    semanasCotizadas: number;
    fechaBaja: Date;
    saldoAfore: number;
    fechaInicioContrato: Date;
    modalidad?: string;
}

interface ResultadosCalculo {
    prestamo: number;
    tipoFinanciamiento: string;
    modalidadSugerida: string;
    necesitaPrestamo: boolean;
    mensajeInformativo: string;
}

const calcularDatosGenerales = (
    datos: DatosGenerales,
    valorReferencia: number,
    factorPension: number
): ResultadosCalculo => {
    // Cálculo de préstamo
    const prestamo = datos.saldoAfore < valorReferencia 
        ? (factorPension * 7.5) - 10000 
        : 0;
    
    // Tipo de financiamiento
    const total = datos.saldoAfore + prestamo;
    const tipoFinanciamiento = total < valorReferencia 
        ? "FINANCIADO 1" 
        : "FINANCIADO 100";
    
    // Modalidad sugerida
    const modalidadSugerida = tipoFinanciamiento === "REACTIVA FINANCIADO 100"
        ? "REACTIVA TRADICIONAL"
        : "";
    
    // Necesita préstamo
    const necesitaPrestamo = datos.saldoAfore < valorReferencia && 
                            tipoFinanciamiento === "REACTIVA FINANCIADO 100";
    
    // Mensaje informativo
    const mensajes: Record<string, string> = {
        "REACTIVA TRADICIONAL": 
            "El cliente está obligado a pagar su inscripción y meses de contratación, " +
            "solo GRUPO AVIVIR financiará la GESTIÓN",
        "REACTIVA FINANCIADO 100": 
            "GRUPO AVIVIR financiará el 100% de la inscripción, pagos mensuales y la gestión",
        "FINANCIADO 100": 
            "Cliente con capacidad financiera para cubrir costos"
    };
    
    const mensajeInformativo = mensajes[datos.modalidad || tipoFinanciamiento] || "";
    
    return {
        prestamo,
        tipoFinanciamiento,
        modalidadSugerida,
        necesitaPrestamo,
        mensajeInformativo
    };
};
```

---

## ✅ Validaciones Recomendadas

### Validaciones de Entrada
1. **NSS:** 11 dígitos numéricos
2. **CURP:** 18 caracteres alfanuméricos
3. **Semanas Cotizadas:** > 0 y ≤ máximo legal
4. **Saldo AFORE:** ≥ 0
5. **Fechas:** Formato válido y lógico temporal

### Validaciones de Negocio
1. Verificar que el valor de referencia (K25) esté disponible
2. Validar que el factor de pensión (F44) sea positivo
3. Confirmar que la modalidad seleccionada sea válida
4. Asegurar que las referencias externas existan

---

## 📈 Métricas y KPIs Sugeridos

1. **Tasa de Financiamiento:**
   - % Clientes FINANCIADO 100
   - % Clientes FINANCIADO 1
   - % Clientes REACTIVA

2. **Análisis de Préstamos:**
   - Monto promedio de préstamos
   - % Clientes que requieren préstamo
   - Distribución de saldos AFORE

3. **Tiempo de Procesamiento:**
   - Tiempo promedio de captura
   - Tasa de error en datos
   - Completitud de información

---

## 🔒 Seguridad y Privacidad

### Datos Sensibles
- NSS (Número de Seguridad Social)
- CURP (identificación personal)
- Saldo AFORE (información financiera)

### Recomendaciones
1. Implementar cifrado para datos sensibles
2. Auditoría de acceso a información del cliente
3. Cumplimiento con normativas de protección de datos
4. Respaldo periódico de información

---

## 📞 Notas Adicionales

- El formulario está diseñado para el proceso de recuperación F100
- La lógica puede variar según actualizaciones de GRUPO AVIVIR
- Valores de referencia deben actualizarse periódicamente
- Integración con sistemas de IMSS/AFORE recomendada

---

**Última actualización:** Enero 2025  
**Versión:** 1.0  
**Autor:** Análisis automatizado del sistema
