import { useEffect, useState } from "react"
import { reciboService } from "@/api/reciboService"
import type { Recibo } from "@/types/recibo"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle, DollarSign } from "lucide-react"

export default function Dashboard() {
  const [recibos, setRecibos] = useState<Recibo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reciboService()
      .getAll()
      .then(setRecibos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const total = recibos.length
  const pendientes = recibos.filter((r) => r.estadoPago === "PENDIENTE").length
  const pagados = recibos.filter((r) => r.estadoPago === "PAGADO").length
  const montoTotal = recibos.reduce((acc, r) => acc + r.montoTotal, 0)

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-[var(--color-muted-foreground)]">Cargando...</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-zinc-700 to-zinc-900 h-1" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-muted-foreground)]">Total Recibos</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center">
              <FileText className="h-4 w-4 text-zinc-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--color-foreground)]">{total}</div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-1" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-muted-foreground)]">Pendientes</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-900/50 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">{pendientes}</div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-1" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-muted-foreground)]">Pagados</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-900/50 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{pagados}</div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 h-1" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-muted-foreground)]">Monto Total</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-900/50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--color-foreground)]">
              ${montoTotal.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimos Recibos</CardTitle>
        </CardHeader>
        <CardContent>
          {recibos.length === 0 ? (
            <p className="text-[var(--color-muted-foreground)] text-sm text-center py-8">No hay recibos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[var(--color-muted-foreground)]">
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Tipo</th>
                    <th className="pb-3 font-medium">Cliente</th>
                    <th className="pb-3 font-medium">Fecha Entrega</th>
                    <th className="pb-3 font-medium">Monto Total</th>
                    <th className="pb-3 font-medium">Saldo</th>
                    <th className="pb-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recibos.slice(0, 5).map((recibo) => (
                    <tr key={recibo.idRecibo} className="border-b last:border-0 hover:bg-[var(--color-muted)]/50 transition-colors">
                      <td className="py-3 font-medium">{recibo.codigo || `#${recibo.idRecibo}`}</td>
                      <td className="py-3">
                        <Badge variant={recibo.tipo === "PROFORMA" ? "secondary" : "default"}>{recibo.tipo}</Badge>
                      </td>
                      <td className="py-3">{recibo.nombreCliente} {recibo.apellidoCliente}</td>
                      <td className="py-3">{recibo.fechaAConvenir ? <em className="text-[var(--color-muted-foreground)]">A convenir</em> : (recibo.fechaEntrega ? new Date(recibo.fechaEntrega).toLocaleDateString("es-BO") : "-")}</td>
                      <td className="py-3">${recibo.montoTotal.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</td>
                      <td className="py-3">${recibo.saldo.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</td>
                      <td className="py-3">
                        <Badge variant={recibo.estadoPago === "PAGADO" ? "success" : recibo.estadoPago === "PENDIENTE" ? "warning" : "destructive"}>
                          {recibo.estadoPago}
                        </Badge>
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
