import { Route, Routes } from "react-router"
import PrivateRoute from "@/guards/PrivateRoute"
import PrivateLayout from "@/layouts/PrivateLayout"
import { Login } from "@PublicPages";
import { Dashboard, Calculator } from "@PrivatePages";
import Cotizacion from "@/pages/private/Calculator/Components/Cotizacion/Cotizacion";
import GeneralData from "@/pages/private/Calculator/Components/GenralData/GeneralData";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route element={<PrivateLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route element={<Calculator/>} >
            <Route path="/calculadora/datosGenerales" element={<GeneralData/>} />
            <Route path="/calculadora/cotizacion" element={<Cotizacion/>} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
