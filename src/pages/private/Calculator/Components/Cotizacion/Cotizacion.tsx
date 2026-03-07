import { useState } from "react";
import { useCotizacionData } from "./hooks/useCotizacionData";
import { useCalculator } from "@/contexts/CalculatorContext";
import { Header } from "./components/Header";
import { InfoGrid } from "./components/InfoGrid";
import { PensionCards } from "./components/PensionCards";
import { InvestmentDetails } from "./components/InvestmentDetails";
import { FooterNotes } from "./components/FooterNotes";

// Import Tables
import { TablaRetoma } from "../InformeCostoMensual/components/TablaRetoma";
import { TablaF100 } from "../InformeCostoMensual/components/TablaF100";

type ViewTab = 'PROYECTO' | 'RETOMA' | 'F100';

export default function Cotizacion() {
  const { data, isLoading } = useCotizacionData();
  const { generalData } = useCalculator();
  const [activeTab, setActiveTab] = useState<ViewTab>('PROYECTO');

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <p>Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto bg-white p-6 font-sans text-[13px] text-black">

      {/* View Toggle */}
      {/* <div className="flex justify-center mb-6 space-x-2">
        <button
          onClick={() => setActiveTab('PROYECTO')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'PROYECTO'
              ? 'bg-[#1d2f5d] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Proyecto de Pensión
        </button>
        <button
          onClick={() => setActiveTab('RETOMA')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'RETOMA'
              ? 'bg-[#1d2f5d] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Tabla Retoma
        </button>
        <button
          onClick={() => setActiveTab('F100')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'F100'
              ? 'bg-[#1d2f5d] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Tabla Financiado 100%
        </button>
      </div> */}

      {activeTab === 'PROYECTO' && (
        <>
          <Header />

          <InfoGrid cliente={data.cliente} contrato={data.contrato} />

          <PensionCards
            pensionSinEstrategia={data.pensionSinEstrategia}
            pensionConEstrategia={data.pensionConEstrategia}
          />

          <InvestmentDetails
            inversion={data.inversion}
            prestamo={data.prestamo}
          />

          <FooterNotes />
        </>
      )}

      {activeTab === 'RETOMA' && (
        <div className="mt-4">
          <TablaRetoma generalData={generalData} />
        </div>
      )}

      {activeTab === 'F100' && (
        <div className="mt-4">
          <TablaF100 generalData={generalData} />
        </div>
      )}
    </div>
  );
}
