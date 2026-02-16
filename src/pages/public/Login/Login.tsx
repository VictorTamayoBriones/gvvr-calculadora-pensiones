import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useLogin } from "./useLogin"
import LOGO from "@/assets/retirate_bien.webp"

export default function Login() {
  const { user, setUser, password, setPassword, handleSubmit } = useLogin()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-8 shadow-lg">

        <div className="flex justify-center">
          <img src={LOGO} alt="Logo" className="w-24 h-24" />
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
            <p className="text-sm text-gray-500 mt-2">Accede a tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">Usuario</Label>
              <Input
                id="user"
                type="text"
                placeholder="Ingresa tu usuario"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
            >
              Iniciar Sesión
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
