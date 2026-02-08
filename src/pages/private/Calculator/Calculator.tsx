import { NavLink, Outlet } from "react-router";
import type { NavLinkRenderProps } from "react-router";
import { useCalculator } from "@/contexts/CalculatorContext";
import './stepper.css';

function CalculatorStepper() {
  const { isDataPersisted } = useCalculator();

  return (
    <div className="stepper">
      <NavLink
        className={({isActive}: NavLinkRenderProps) => `step ${isActive ? 'selected' : ''}`}
        to="/calculadora/datosGenerales"
      >
        <p>Datos Generales</p>
      </NavLink>
      <NavLink
        className={({isActive}: NavLinkRenderProps) => `step ${isActive ? 'selected' : ''} ${!isDataPersisted ? 'disabled' : ''}`}
        to="/calculadora/InformeCostoMensual"
        onClick={(e) => {
          if (!isDataPersisted) {
            e.preventDefault();
          }
        }}
        style={{ pointerEvents: !isDataPersisted ? 'none' : 'auto', opacity: !isDataPersisted ? 0.5 : 1 }}
      >
        <p>Informe Costo Mensual</p>
      </NavLink>
      <NavLink
        className={({isActive}: NavLinkRenderProps) => `step ${isActive ? 'selected' : ''} ${!isDataPersisted ? 'disabled' : ''}`}
        to="/calculadora/cotizacion"
        onClick={(e) => {
          if (!isDataPersisted) {
            e.preventDefault();
          }
        }}
        style={{ pointerEvents: !isDataPersisted ? 'none' : 'auto', opacity: !isDataPersisted ? 0.5 : 1 }}
      >
        <p>Cotización</p>
      </NavLink>
    </div>
  );
}

export default function Calculator() {
  return (
    <>
      <CalculatorStepper />
      <Outlet/>
    </>
  )
}
