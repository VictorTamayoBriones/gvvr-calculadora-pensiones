import type { CotizacionData } from "../hooks/useCotizacionData";

interface InfoGridProps {
    cliente: CotizacionData["cliente"];
    contrato: CotizacionData["contrato"];
}

export const InfoGrid = ({ cliente, contrato }: InfoGridProps) => {
    return (
        <div className="bg-[#f2f4f5] py-3 px-6 mx-2 mb-8 mt-2">
            <div className="grid grid-cols-[1fr_1fr] gap-x-2 text-xs">
                {/* Left Column */}
                <div className="space-y-0.5">
                    <div className="grid grid-cols-[70px_1fr]">
                        <span className="text-right pr-2">NOMBRE:</span>
                        <span>{cliente.nombre}</span>
                    </div>
                    <div className="grid grid-cols-[70px_1fr]">
                        <span className="text-right pr-2">CURP:</span>
                        <span>{cliente.curp}</span>
                    </div>
                    <div className="grid grid-cols-[70px_1fr]">
                        <span className="text-right pr-2">NSS:</span>
                        <span>{cliente.nss}</span>
                    </div>
                    <div className="grid grid-cols-[70px_1fr]">
                        <span className="text-right pr-2">EDAD:</span>
                        <span>{cliente.edad}</span>
                    </div>
                </div>
                {/* Right Column */}
                <div className="space-y-0.5">
                    <div className="grid grid-cols-[250px_50px]">
                        <span className="text-right pr-2">FECHA ALTA PLAN REACTIVA:</span>
                        <span className="text-center">{contrato.fechaAltaPlanReactiva}</span>
                    </div>
                    <div className="grid grid-cols-[250px_50px]">
                        <span className="text-right pr-2">SEMANAS COTIZADAS AL FINAL DEL EJERCICIO:</span>
                        <span className="text-center">{contrato.semanasCotizadas}</span>
                    </div>
                    <div className="grid grid-cols-[250px_50px]">
                        <span className="text-right pr-2">MESES DE CONTRATO:</span>
                        <span className="text-center">{contrato.mesesContrato}</span>
                    </div>
                    <div className="grid grid-cols-[250px_50px]">
                        <span className="text-right pr-2">FECHA FIN DE CONTRATO:</span>
                        <span className="text-center">{contrato.fechaFinContrato}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
