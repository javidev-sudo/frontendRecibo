import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { reciboService } from "@/api/reciboService"
import type { Recibo } from "@/types/recibo"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Eye } from "lucide-react"

export default function ReciboList() {
  const [recibos, setRecibos] = useState<Recibo[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const cargar = () => {
    setLoading(true)
    reciboService()
      .getAll()
      .then(setRecibos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este recibo?")) return
    await reciboService().delete(id)
    cargar()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Recibos</h1>
        <Button onClick={() => navigate("/recibos/crear")}>
          <Plus className="h-4 w-4" /> Nuevo Recibo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-[var(--color-muted-foreground)]">Cargando...</div>
          ) : recibos.length === 0 ? (
            <div className="p-6 text-center text-[var(--color-muted-foreground)]">No hay recibos registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[var(--color-muted-foreground)]">
                    <th className="px-6 py-3 font-medium">ID</th>
                    <th className="px-6 py-3 font-medium">Tipo</th>
                    <th className="px-6 py-3 font-medium">Cliente</th>
                    <th className="px-6 py-3 font-medium">Fecha Emisión</th>
                    <th className="px-6 py-3 font-medium">Fecha Entrega</th>
                    <th className="px-6 py-3 font-medium">Monto Total</th>
                    <th className="px-6 py-3 font-medium">Adelanto</th>
                    <th className="px-6 py-3 font-medium">Saldo</th>
                    <th className="px-6 py-3 font-medium">Estado</th>
                    <th className="px-6 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {recibos.map((r) => (
                    <tr key={r.idRecibo} className="border-b last:border-0 hover:bg-[var(--color-muted)]/50">
                      <td className="px-6 py-3 font-medium">{r.codigo || `#${r.idRecibo}`}</td>
                      <td className="px-6 py-3">
                        <Badge variant={r.tipo === "PROFORMA" ? "secondary" : "default"}>{r.tipo}</Badge>
                      </td>
                      <td className="px-6 py-3">{r.nombreCliente} {r.apellidoCliente}</td>
                      <td className="px-6 py-3">{new Date(r.fechaEmision).toLocaleDateString("es-BO")}</td>
                      <td className="px-6 py-3">{r.fechaAConvenir ? <em className="text-[var(--color-muted-foreground)]">A convenir</em> : (r.fechaEntrega ? new Date(r.fechaEntrega).toLocaleDateString("es-BO") : "-")}</td>
                      <td className="px-6 py-3">${r.montoTotal.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-3">${r.adelanto.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-3">${r.saldo.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-3">
                        <Badge variant={r.estadoPago === "PAGADO" ? "success" : r.estadoPago === "PENDIENTE" ? "warning" : "destructive"}>
                          {r.estadoPago}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/recibos/${r.idRecibo}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(r.idRecibo)}>
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
