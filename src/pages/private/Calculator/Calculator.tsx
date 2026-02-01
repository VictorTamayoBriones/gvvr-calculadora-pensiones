import { NavLink, Outlet } from "react-router";
import type { NavLinkRenderProps } from "react-router";
import './stepper.css';

export default function Calculator() {


  return (
    <>
      <div className="stepper">
        <NavLink className={({isActive}: NavLinkRenderProps)=>  `step ${isActive ? 'selected' : ''}`} to="/calculadora/datosGenerales" >
          <p>Datos Generales</p>
        </NavLink>
        <NavLink className={({isActive}: NavLinkRenderProps)=>  `step ${isActive ? 'selected' : ''}`} to="/calculadora/cotizacion" >
          <p>Cotización</p>
        </NavLink>
      </div>
      <Outlet/>
    </>
  )
}
