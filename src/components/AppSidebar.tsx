import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Calculator, Home, LogOut } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Link, useNavigate } from "react-router"
import { useAuth } from "@/contexts/AuthContext"
import { useCalculator } from "@/contexts/CalculatorContext"
import LOGO from "@/assets/logo_gvvr.webp"

const menuItems = [
  { title: "Inicio",         icon: Home,       url: "/dashboard" },
  { title: "Calculadora",   icon: Calculator,  url: "/calculadora/datosGenerales" },
  // { title: "Reportes",      icon: FileText,    url: "/reportes" },
  // { title: "Usuarios",      icon: Users,       url: "/usuarios" },
  // { title: "Estadísticas",  icon: BarChart3,   url: "/estadisticas" },
  // { title: "Configuración", icon: Settings,    url: "/configuracion" },
]

export default function AppSidebar() {
  const { logout } = useAuth()
  const { clearData } = useCalculator()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    clearData()
    navigate("/login")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <img src={LOGO} style={{ height: "100%", objectFit: "contain" }} alt="Grupo a vivir" />
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
