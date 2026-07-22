import { useEffect, useState } from "react"
import { clienteService } from "@/api/clienteService"
import type { Cliente } from "@/types/cliente"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, Search } from "lucide-react"

export default function ClienteList() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Cliente | null>(null)
  const [form, setForm] = useState({ nombre: "", apellido: "", telefono: "" })

  const cargar = () => {
    setLoading(true)
    const svc = clienteService()
    const promise = busqueda ? svc.search(busqueda) : svc.getAll()
    promise.then(setClientes).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [busqueda])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const svc = clienteService()
    try {
      if (editando) {
        await svc.update(editando.idCliente, form)
      } else {
        await svc.create(form)
      }
      setShowForm(false)
      setEditando(null)
      setForm({ nombre: "", apellido: "", telefono: "" })
      cargar()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este cliente?")) return
    await clienteService().delete(id)
    cargar()
  }

  const openEdit = (c: Cliente) => {
    setEditando(c)
    setForm({ nombre: c.nombre, apellido: c.apellido, telefono: c.telefono })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <Button onClick={() => { setEditando(null); setForm({ nombre: "", apellido: "", telefono: "" }); setShowForm(true) }}>
          <Plus className="h-4 w-4" /> Nuevo Cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
        <Input
          placeholder="Buscar por nombre o apellido..."
          className="pl-10"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editando ? "Editar Cliente" : "Nuevo Cliente"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
                <Input placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
                <Input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} required />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editando ? "Actualizar" : "Crear"}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditando(null) }}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-[var(--color-muted-foreground)]">Cargando...</div>
          ) : clientes.length === 0 ? (
            <div className="p-6 text-center text-[var(--color-muted-foreground)]">No hay clientes registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[var(--color-muted-foreground)]">
                    <th className="px-6 py-3 font-medium">ID</th>
                    <th className="px-6 py-3 font-medium">Nombre</th>
                    <th className="px-6 py-3 font-medium">Apellido</th>
                    <th className="px-6 py-3 font-medium">Teléfono</th>
                    <th className="px-6 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c.idCliente} className="border-b last:border-0 hover:bg-[var(--color-muted)]/50">
                      <td className="px-6 py-3">{c.idCliente}</td>
                      <td className="px-6 py-3 font-medium">{c.nombre}</td>
                      <td className="px-6 py-3">{c.apellido}</td>
                      <td className="px-6 py-3">{c.telefono}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(c.idCliente)}>
                            <Trash2 className="h-4 w-4 text-[var(--color-destructive)]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
