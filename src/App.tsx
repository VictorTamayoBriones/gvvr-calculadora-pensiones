import { BrowserRouter } from "react-router"
import { AuthProvider } from "@/contexts/AuthContext"
import AppRoutes from "./routes/AppRoutes"

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App