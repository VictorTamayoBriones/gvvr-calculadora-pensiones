import { Navigate, Outlet } from "react-router"
import { useAuth } from "@/contexts/AuthContext"

export default function PrivateRoute() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
