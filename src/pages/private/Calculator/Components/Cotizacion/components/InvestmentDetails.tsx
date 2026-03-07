import type { CotizacionData } from "../hooks/useCotizacionData";
import { formatCurrencyDecimals } from "../utils/format";

interface InvestmentDetailsProps {
    inversion: CotizacionData["inversion"];
    prestamo: CotizacionData["prestamo"];
}

export const InvestmentDetails = ({
    inversion,
}: InvestmentDetailsProps) => {
    return (
        <div className="max-w-[750px] mx-auto space-y-6 mb-12 text-[13px]">
            {/* Header: ¿Cuánto debo invertir? */}
            <div className="flex justify-center flex-row items-center gap-4">
                <span className="font-bold text-[14px]">
                    ¿Cuánto debo invertir para mi proyecto?:
                </span>
                <span className="font-bold text-[14px]">$</span>
                <span className="text-right w-[80px] -ml-2 text-[14px]">
                    {formatCurrencyDecimals(inversion.montoTotalInvertir)}
                </span>
            </div>

            {/* Fila Forma de Pago principal */}
            <div className="flex flex-col items-center mt-8">
                <div className="font-bold text-center mb-4 text-[13px]">
                    FORMA DE PAGO
                </div>

                <div className="w-full pl-10 pr-4">
                    {/* Saldo AFORE */}
                    <div className="grid grid-cols-[1fr_30px_90px_150px] items-end text-[13px] gap-x-1 mb-2">
                        <span className="text-right pr-2">
                            <span className="border-b-[1.5px] border-black">
                                Saldo en AFORE (SAR 92, Retiro 97 y Vivienda)
                            </span>{" "}
                            :
                        </span>
                        <span className="text-center font-semibold">$</span>
                        <span className="text-right pr-2">
                            {formatCurrencyDecimals(inversion.saldoAfore)}
                        </span>
                        <span></span>
                    </div>

                    {/* Crédito Financiero */}
                    <div className="grid grid-cols-[1fr_30px_90px_150px] items-end text-[13px] gap-x-1 mb-2">
                        <span className="text-right pr-2">
                            <span className="border-b-[1.5px] border-black">
                                Crédito con una institución financiera regulada por el IMSS
                            </span>{" "}
                            :
                        </span>
                        <span className="text-center font-semibold pb-1">$</span>
                        <span className="text-right pr-2 border-b-[1.5px] border-black pb-1">
                            {formatCurrencyDecimals(inversion.creditoFinanciero)}
                        </span>
                        <span className="text-[12px] pl-2 pb-1 text-gray-800">
                            (Liquidación a {inversion.mesesLiquidacionCredito} meses)
                        </span>
                    </div>

                    {/* Total Recursos */}
                    <div className="grid grid-cols-[1fr_30px_90px_150px] items-center text-[13px] gap-x-1 mb-10">
                        <span className="text-right pr-2">
                            Total de recursos para mi proyecto :
                        </span>
                        <span className="text-center font-semibold">$</span>
                        <span className="text-right pr-2">
                            {formatCurrencyDecimals(inversion.totalRecursos)}
                        </span>
                        <span></span>
                    </div>

                    {/* Saldo a Favor */}
                    <div className="grid grid-cols-[1fr_30px_90px_150px] items-end text-[13px] gap-x-1">
                        <span className="text-right pr-2">
                            <span className="border-b-[1.5px] border-black">
                                Saldo a favor liquidando el proyecto
                            </span>{" "}
                            :
                        </span>
                        <span className="text-center font-semibold pb-1">$</span>
                        <span className="text-center border-b-[1.5px] border-black pb-1 mb-1 font-semibold mx-2 ml-4">
                            {inversion.saldoAFavor > 0 ? formatCurrencyDecimals(inversion.saldoAFavor) : "-"}
                        </span>
                        <span></span>
                    </div>
                </div>
            </div>
        </div>
    );
};
