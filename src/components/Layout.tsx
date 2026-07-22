import { useState, useEffect } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { LayoutDashboard, Users, Wrench, FileText, Menu, X } from "lucide-react"
import LogoUpload from "@/components/LogoUpload"
import SignatureUpload from "@/components/SignatureUpload"

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/servicios", label: "Servicios", icon: Wrench },
  { to: "/recibos", label: "Recibos", icon: FileText },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Botón hamburguesa para móvil */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-900 text-white border border-white/10 shadow-lg"
        aria-label="Abrir menú"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay oscuro para móvil */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40 h-screen w-64
          bg-gradient-to-b from-zinc-900 to-zinc-950 text-white
          flex flex-col shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="p-6 text-xl font-bold tracking-tight border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">
              R
            </div>
            <span>Recibos</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-red-600/20 text-white shadow-sm"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <LogoUpload />
          <SignatureUpload />
        </div>
        <div className="p-4 border-t border-white/10 text-xs text-white/40">
          Sistema de Recibos v1.0
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
