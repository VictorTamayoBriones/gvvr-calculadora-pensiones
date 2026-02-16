import { BrowserRouter } from "react-router"
import { AuthProvider } from "@/contexts/AuthContext"
import { CalculatorProvider } from "@/contexts/CalculatorContext"
import { AdminConfigProvider } from "@/contexts/AdminConfigContext"
import AppRoutes from "./routes/AppRoutes"

export function App() {
  return (
    <AdminConfigProvider>
      <AuthProvider>
        <CalculatorProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CalculatorProvider>
      </AuthProvider>
    </AdminConfigProvider>
  )
}

export default App