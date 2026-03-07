import { useState, useEffect } from "react";
import { useCalculator } from "@/contexts/CalculatorContext";
import { calcularMontoPension } from "@/utils/calculoMontoPension";
import { calcularCostoTotalTramite } from "@/utils/calculoCostoTotal";
import { calcularResultadosFinancieros } from "../../GenralData/utils/financialCalculations";
import { formatearMesAnio, formatearFechaCorta, calcularFechaResolucion } from "@/utils/dateCalculations";

// Interfaces for the data structure
export interface CotizacionData {
    cliente: {
        nombre: string;
        curp: string;
        nss: string;
        edad: string;
    };
    contrato: {
        fechaAltaPlanReactiva: string;
        semanasCotizadas: number;
        mesesContrato: number;
        fechaFinContrato: string;
    };
    pensionSinEstrategia: {
        vigenciaDerechos: string;
        pensionMensual: string;
        aguinaldo: string;
        pensionAnual: string;
    };
    pensionConEstrategia: {
        fechaResolucion: string;
        pensionMensual: number;
        aguinaldo: number;
        pensionAnual: number;
    };
    inversion: {
        montoTotalInvertir: number;
        saldoAfore: number;
        creditoFinanciero: number;
        mesesLiquidacionCredito: number;
        totalRecursos: number;
        saldoAFavor: number;
    };
    prestamo: {
        pensionMensual: number;
        descuentoCongelado: number;
        pensionTemporal: number;
        mesesDescuento: number;
    };
}

export const useCotizacionData = () => {
    const { generalData } = useCalculator();
    const [data, setData] = useState<CotizacionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // We calculate all necessary data from the Context
        const populateData = () => {
            setIsLoading(true);

            // 1. Calculate the Pension with strategy
            const pensionResult = generalData.fechaNacimiento && generalData.curp && generalData.fechaInicioContrato && generalData.fechaFinContrato
                ? calcularMontoPension(generalData.fechaNacimiento, generalData.curp, generalData.fechaInicioContrato, generalData.fechaFinContrato)
                : null;

            const pensionMensualCalculada = pensionResult?.success ? (pensionResult.montoPension ?? 0) : 0;
            const aguinaldoCalculado = pensionMensualCalculada; // Aguinaldo is typically 1 month
            const pensionAnualCalculada = (pensionMensualCalculada * 12) + aguinaldoCalculado;

            // Format fecha resolucion EXACTLY through the IMSS rule
            const exactFechaResolucion = generalData.semanasCotizadas && generalData.fechaInicioContrato
                ? calcularFechaResolucion(Number(generalData.semanasCotizadas), generalData.fechaInicioContrato)
                : null;

            // If the date is valid, use the formatter, otherwise fallback
            const fechaResolucionCalculada = exactFechaResolucion && !isNaN(exactFechaResolucion.getTime())
                ? formatearMesAnio(exactFechaResolucion)
                : "";

            // 2. Determine Costs and Investments
            const costoInfo = calcularCostoTotalTramite(generalData.fechaInicioContrato, generalData.fechaFinContrato);
            const costoTotal = costoInfo?.costoTotal ?? 0;

            const financieros = calcularResultadosFinancieros(
                parseFloat(generalData.saldoAfore) || 0,
                generalData.modalidad,
                pensionMensualCalculada,
                costoTotal
            );

            // Determine if there is leftover
            const saldoAfore = parseFloat(generalData.saldoAfore) || 0;
            const totalRecursos = financieros.prestamoSugerido + saldoAfore;
            const saldoAFavor = Math.max(0, totalRecursos - costoTotal);

            const mappedData: CotizacionData = {
                cliente: {
                    nombre: generalData.nombreCliente || "SIN ESPECIFICAR",
                    curp: generalData.curp || "SIN ESPECIFICAR",
                    nss: generalData.nss || "SIN ESPECIFICAR",
                    edad: generalData.edad ? `${generalData.edad} AÑOS` : "SIN ESPECIFICAR",
                },
                contrato: {
                    fechaAltaPlanReactiva: formatearFechaCorta(generalData.fechaInicioContrato),
                    semanasCotizadas: Number(generalData.semanasCotizadas) || 0,
                    mesesContrato: Number(generalData.totalMeses) || 0,
                    fechaFinContrato: formatearFechaCorta(generalData.fechaFinContrato),
                },
                pensionSinEstrategia: {
                    vigenciaDerechos: generalData.sinVigenciaDerechos || "No aplica",
                    pensionMensual: "No aplica", // Default for simulation, later could be calculated properly
                    aguinaldo: "No aplica",
                    pensionAnual: "No aplica",
                },
                pensionConEstrategia: {
                    fechaResolucion: fechaResolucionCalculada,
                    pensionMensual: pensionMensualCalculada,
                    aguinaldo: aguinaldoCalculado,
                    pensionAnual: pensionAnualCalculada,
                },
                inversion: {
                    montoTotalInvertir: costoTotal,
                    saldoAfore: saldoAfore,
                    creditoFinanciero: financieros.prestamoSugerido,
                    mesesLiquidacionCredito: 60, // Fixed config
                    totalRecursos: totalRecursos,
                    saldoAFavor: saldoAFavor,
                },
                prestamo: {
                    pensionMensual: pensionMensualCalculada,
                    descuentoCongelado: pensionMensualCalculada * 0.30, // Usually 30% config
                    pensionTemporal: pensionMensualCalculada * 0.70,
                    mesesDescuento: 60, // Fixed config
                },
            };

            setData(mappedData);
            setIsLoading(false);
        };

        populateData();

    }, [generalData]); // Dependency on the context data

    return { data, isLoading };
};
