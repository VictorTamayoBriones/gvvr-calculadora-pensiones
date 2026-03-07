import type { CotizacionData } from "../hooks/useCotizacionData";
import { formatCurrency } from "../utils/format";

interface PensionCardsProps {
    pensionSinEstrategia: CotizacionData["pensionSinEstrategia"];
    pensionConEstrategia: CotizacionData["pensionConEstrategia"];
}

export const PensionCards = ({
    pensionSinEstrategia,
    pensionConEstrategia,
}: PensionCardsProps) => {
    return (
        <div className="flex flex-col items-center gap-6 mb-10 relative">
            {/* Left side text for resolved pension */}
            <div className="absolute left-0 top-[120px] flex flex-col items-center w-[180px]">
                <div className="font-bold text-[11px] text-center leading-tight mb-1">
                    FECHA DE RESOLUCION DE PENSIÓN
                </div>
                <div className="font-bold text-[13px] border-b-[2px] border-b-yellow-500 uppercase px-1">
                    {pensionConEstrategia.fechaResolucion}
                </div>
            </div>

            {/* Sin Estrategia */}
            <div className="border-[2px] border-[#379d74] rounded-2xl py-3 px-6 w-[380px] relative">
                <h3 className="text-center text-[12px] mb-2">
                    <span className="underline decoration-1 underline-offset-2 tracking-wide font-semibold">
                        PENSIÓN SIN ESTRATEGIA:
                    </span>
                </h3>
                <div className="grid grid-cols-[140px_1fr] gap-x-2 gap-y-0.5 pb-2 text-[12px]">
                    <span className="text-right">Vigencia de derechos:</span>
                    <span className="pl-6">
                        {pensionSinEstrategia.vigenciaDerechos}
                    </span>
                    <span className="text-right">Pensión mensual:</span>
                    <span className="pl-6">
                        {pensionSinEstrategia.pensionMensual}
                    </span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-x-2 gap-y-0.5 text-[12px]">
                    <span className="text-right">Aguinaldo:</span>
                    <span className="pl-6">{pensionSinEstrategia.aguinaldo}</span>
                    <span className="text-right">Pensión anual:</span>
                    <span className="pl-6">{pensionSinEstrategia.pensionAnual}</span>
                </div>
            </div>

            {/* Con Estrategia */}
            <div className="border-[2.5px] border-[#1d2f5d] rounded-2xl py-3 px-6 w-[380px] shadow-sm relative">
                <h3 className="text-center text-[12px] mb-3">
                    <span className="underline decoration-1 underline-offset-2 tracking-wide font-semibold">
                        PENSIÓN CON ESTRATEGIA
                    </span>
                </h3>
                <div className="grid grid-cols-[140px_30px_1fr] gap-y-1 pb-3 text-[12px]">
                    <span className="text-right">Pensión mensual:</span>
                    <span className="text-center">$</span>
                    <span className="text-right pr-12">
                        {formatCurrency(pensionConEstrategia.pensionMensual)}
                    </span>
                </div>
                <div className="grid grid-cols-[140px_30px_1fr] gap-y-1 text-[12px]">
                    <span className="text-right">Aguinaldo:</span>
                    <span className="text-center">$</span>
                    <span className="text-right pr-12">
                        {formatCurrency(pensionConEstrategia.aguinaldo)}
                    </span>

                    <span className="text-right">Pensión anual:</span>
                    <span className="text-center">$</span>
                    <span className="text-right pr-12">
                        {formatCurrency(pensionConEstrategia.pensionAnual)}
                    </span>
                </div>
            </div>
        </div>
    );
};
