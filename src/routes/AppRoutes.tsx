import { Route, Routes } from "react-router"
import Login from "@/pages/public/Login/Login"
import Dashboard from "@/pages/private/Dashboard/Dashboard"
import PrivateRoute from "@/guards/PrivateRoute"
import PrivateLayout from "@/layouts/PrivateLayout"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route element={<PrivateLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Route>
    </Routes>
  )
}
