import { useInformeCostoMensual } from './useInformeCostoMensual';
import { InformacionAsesor } from './components/InformacionAsesor';
import { InformacionCliente } from './components/InformacionCliente';
import { InformacionContrato } from './components/InformacionContrato';
import { PresupuestoInicial } from './components/PresupuestoInicial';
import { PeriodoEjercicio } from './components/PeriodoEjercicio';
import { DatosPension } from './components/DatosPension';
import { Modalidades } from './components/Modalidades';

export default function InformeCostoMensual() {
  const {
    generalData,
    updateGeneralData,
    fechaContratoFormateada,
    tieneVigencia,
    infoVigencia,
    validacionesCliente,
    validacionesContrato,
    validacionesPresupuesto,
    impactoPrestamo,
    handleFechaFirmaChange,
    handleFechaFinChange
  } = useInformeCostoMensual();

  return (
    <div className='w-full flex flex-col gap-4'>
      <header className="flex flex-col justify-between w-full pb-5">
        <p className="self-end mb-5 font-medium border-b border-black relative after:content-[''] after:absolute after:w-full after:h-[1px] after:bg-black after:-bottom-1 after:left-0">
          FECHA FIRMA DE CONTRATO: {fechaContratoFormateada || '05/02/26'}
        </p>
        <h1 className="font-bold text-2xl sm:text-[26px] text-center [word-spacing:5px]">
          RECUPERACIÓN DE DERECHOS PENSIONARIOS
        </h1>
      </header>

      <form className='flex flex-col gap-4'>
        <InformacionAsesor nombreAsesor={generalData.nombreAsesor} />

        <InformacionCliente
          generalData={generalData}
          tieneVigencia={tieneVigencia}
          infoVigencia={infoVigencia}
          validaciones={validacionesCliente}
        />

        <InformacionContrato
          generalData={generalData}
          validaciones={validacionesContrato}
          onFechaFirmaChange={handleFechaFirmaChange}
          onFechaFinChange={handleFechaFinChange}
        />

        <PeriodoEjercicio generalData={generalData} />

        <DatosPension generalData={generalData} impactoPrestamo={impactoPrestamo.impactoPension} />

        <PresupuestoInicial
          generalData={generalData}
          validaciones={validacionesPresupuesto}
          onPrestamoFinancieroChange={(value) => updateGeneralData({ prestamoFinanciero: value })}
          mensajeAplicabilidad={impactoPrestamo.mensajeAplicabilidad}
          saldoAFavor={impactoPrestamo.saldoAFavor}
        />

        <Modalidades generalData={generalData} />
      </form>
    </div>
  );
}
