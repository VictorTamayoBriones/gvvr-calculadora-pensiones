import { NavLink, Outlet } from "react-router";
import type { NavLinkRenderProps } from "react-router";
import { CalculatorProvider } from "@/contexts/CalculatorContext";
import './stepper.css';

export default function Calculator() {
  return (
    <CalculatorProvider>
      <div className="stepper">
        <NavLink className={({isActive}: NavLinkRenderProps)=>  `step ${isActive ? 'selected' : ''}`} to="/calculadora/datosGenerales" >
          <p>Datos Generales</p>
        </NavLink>
        <NavLink className={({isActive}: NavLinkRenderProps)=>  `step ${isActive ? 'selected' : ''}`} to="/calculadora/InformeCostoMensual" >
          <p>Informe Costo Mensual</p>
        </NavLink>
        <NavLink className={({isActive}: NavLinkRenderProps)=>  `step ${isActive ? 'selected' : ''}`} to="/calculadora/cotizacion" >
          <p>Cotización</p>
        </NavLink>
      </div>
      <Outlet/>
    </CalculatorProvider>
  )
}
