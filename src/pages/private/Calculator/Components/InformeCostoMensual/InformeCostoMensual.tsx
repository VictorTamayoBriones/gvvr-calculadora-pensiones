import './style.css';
import { useInformeCostoMensual } from './useInformeCostoMensual';
import { InformacionAsesor } from './components/InformacionAsesor';
import { InformacionCliente } from './components/InformacionCliente';
import { InformacionContrato } from './components/InformacionContrato';
import { PresupuestoInicial } from './components/PresupuestoInicial';

export default function InformeCostoMensual() {
  const {
    generalData,
    updateGeneralData,
    fechaContratoFormateada,
    tieneVigencia,
    infoVigencia,
    validacionesCliente,
    validacionesContrato,
    handleFechaFirmaChange,
    handleFechaFinChange
  } = useInformeCostoMensual();

  return (
    <div className='InformeCostoMensual flex flex-col gap-4'>
      <header>
        <p>FECHA FIRMA DE CONTRATO: {fechaContratoFormateada || '05/02/26'}</p>
        <h1>RECUPERACIÓN DE DERECHOS PENSIONARIOS</h1>
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

        <PresupuestoInicial
          generalData={generalData}
          onPrestamoFinancieroChange={(value) => updateGeneralData({ prestamoFinanciero: value })}
        />
      </form>
    </div>
  );
}
