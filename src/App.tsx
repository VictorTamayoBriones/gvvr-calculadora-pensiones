import { BrowserRouter } from "react-router"
import { AuthProvider } from "@/contexts/AuthContext"
import { CalculatorProvider } from "@/contexts/CalculatorContext"
import AppRoutes from "./routes/AppRoutes"

export function App() {
  return (
    <AuthProvider>
      <CalculatorProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CalculatorProvider>
    </AuthProvider>
  )
}

export default App