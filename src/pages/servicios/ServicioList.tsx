import { useEffect, useState } from "react"
import { servicioService } from "@/api/servicioService"
import type { Servicio } from "@/types/servicio"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function ServicioList() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Servicio | null>(null)
  const [form, setForm] = useState({ tipoServicio: "", descripcion: "" })

  const cargar = () => {
    setLoading(true)
    servicioService()
      .getAll()
      .then(setServicios)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const svc = servicioService()
    try {
      if (editando) {
        await svc.update(editando.idServicio, form)
      } else {
        await svc.create(form)
      }
      setShowForm(false)
      setEditando(null)
      setForm({ tipoServicio: "", descripcion: "" })
      cargar()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este servicio?")) return
    await servicioService().delete(id)
    cargar()
  }

  const openEdit = (s: Servicio) => {
    setEditando(s)
    setForm({ tipoServicio: s.tipoServicio, descripcion: s.descripcion })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
        <Button onClick={() => { setEditando(null); setForm({ tipoServicio: "", descripcion: "" }); setShowForm(true) }}>
          <Plus className="h-4 w-4" /> Nuevo Servicio
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editando ? "Editar Servicio" : "Nuevo Servicio"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Tipo de servicio (ej: Serigrafía)" value={form.tipoServicio} onChange={(e) => setForm({ ...form, tipoServicio: e.target.value })} required />
                <Textarea placeholder="Descripción (opcional)" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
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
          ) : servicios.length === 0 ? (
            <div className="p-6 text-center text-[var(--color-muted-foreground)]">No hay servicios registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[var(--color-muted-foreground)]">
                    <th className="px-6 py-3 font-medium">ID</th>
                    <th className="px-6 py-3 font-medium">Tipo de Servicio</th>
                    <th className="px-6 py-3 font-medium">Descripción</th>
                    <th className="px-6 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {servicios.map((s) => (
                    <tr key={s.idServicio} className="border-b last:border-0 hover:bg-[var(--color-muted)]/50">
                      <td className="px-6 py-3">{s.idServicio}</td>
                      <td className="px-6 py-3 font-medium">{s.tipoServicio}</td>
                      <td className="px-6 py-3 text-[var(--color-muted-foreground)]">{s.descripcion || "-"}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.idServicio)}>
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
