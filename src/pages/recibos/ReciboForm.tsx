import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { clienteService } from "@/api/clienteService"
import { servicioService } from "@/api/servicioService"
import { reciboService } from "@/api/reciboService"
import type { Cliente } from "@/types/cliente"
import type { Servicio } from "@/types/servicio"
import type { DetalleReciboRequest } from "@/types/recibo"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"

export default function ReciboForm() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [idCliente, setIdCliente] = useState<number>(0)
  const [fechaEntrega, setFechaEntrega] = useState("")
  const [fechaAConvenir, setFechaAConvenir] = useState(false)
  const [adelanto, setAdelanto] = useState("0")
  const [tipo, setTipo] = useState<"RECIBO" | "PROFORMA">("RECIBO")
  const [precios, setPrecios] = useState<Record<number, string>>({})
  const [cantidades, setCantidades] = useState<Record<number, string>>({})
  const [detalles, setDetalles] = useState<(DetalleReciboRequest & { idTemp: number })[]>([])
  const [nextTempId, setNextTempId] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([clienteService().getAll(), servicioService().getAll()])
      .then(([c, s]) => { setClientes(c); setServicios(s) })
      .catch(console.error)
  }, [])

  const agregarDetalle = () => {
    setDetalles([...detalles, { idServicio: 0, precioUnitario: 0, cantidad: 1, observaciones: "", idTemp: nextTempId }])
    setNextTempId(nextTempId + 1)
  }

  const actualizarDetalle = (idTemp: number, field: string, value: string | number) => {
    setDetalles(detalles.map((d) => d.idTemp === idTemp ? { ...d, [field]: value } : d))
  }

  const eliminarDetalle = (idTemp: number) => {
    setDetalles(detalles.filter((d) => d.idTemp !== idTemp))
  }

  const parseNumber = (value: string): number => {
    if (!value) return 0
    const normalized = value.replace(",", ".")
    const parsed = parseFloat(normalized)
    return isNaN(parsed) ? 0 : parsed
  }

  const parseCantidad = (value: string): number => {
    if (!value) return 1
    const normalized = value.replace(",", ".")
    const parsed = parseInt(normalized)
    return isNaN(parsed) || parsed < 1 ? 1 : parsed
  }

  const montoTotal = detalles.reduce((acc, d) => acc + d.precioUnitario * d.cantidad, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (idCliente === 0) {
      alert("Debe seleccionar un cliente")
      return
    }
    if (detalles.length === 0) {
      alert("Debe agregar al menos un servicio al recibo")
      return
    }
    setSubmitting(true)
    try {
      await reciboService().create({
        idCliente,
        fechaEntrega: fechaAConvenir ? null : (fechaEntrega || null),
        adelanto: parseNumber(adelanto),
        fechaAConvenir,
        tipo,
        detalleRecibo: detalles.map(({ idTemp: _, ...rest }) => rest),
      })
      navigate("/recibos")
    } catch (err) {
      console.error(err)
      alert("Error al crear el recibo")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">{tipo === "PROFORMA" ? "Nueva Proforma" : "Nuevo Recibo"}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Tipo de Documento *</label>
                <Select value={tipo} onChange={(e) => setTipo(e.target.value as "RECIBO" | "PROFORMA")}>
                  <option value="RECIBO">Recibo (ORD-)</option>
                  <option value="PROFORMA">Proforma (PRO-)</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Cliente *</label>
                <Select value={idCliente} onChange={(e) => setIdCliente(Number(e.target.value))} required>
                  <option value={0}>Seleccionar cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.idCliente} value={c.idCliente}>{c.nombre} {c.apellido}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Fecha de Entrega</label>
                <div className="flex gap-3 items-center h-10">
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="fechaOpcion"
                      checked={!fechaAConvenir}
                      onChange={() => { setFechaAConvenir(false); setFechaEntrega("") }}
                    />
                    Fecha específica
                  </label>
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="fechaOpcion"
                      checked={fechaAConvenir}
                      onChange={() => { setFechaAConvenir(true); setFechaEntrega("") }}
                    />
                    A convenir
                  </label>
                </div>
                {!fechaAConvenir && (
                  <Input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} className="mt-1" />
                )}
                {fechaAConvenir && (
                  <div className="mt-1 h-10 px-3 flex items-center text-sm text-[var(--color-muted-foreground)] italic border border-dashed rounded-md bg-[var(--color-muted)]/30">
                    Fecha a convenir con el cliente
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Adelanto (Bs.)</label>
                <Input type="number" step="0.01" min="0" value={adelanto} onChange={(e) => setAdelanto(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Servicios / Detalles</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={agregarDetalle}>
              <Plus className="h-4 w-4" /> Agregar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {detalles.length === 0 && (
              <p className="text-sm text-[var(--color-muted-foreground)] text-center py-4">
                No hay servicios agregados. Haga clic en "Agregar" para comenzar.
              </p>
            )}
            {detalles.map((d) => (
              <div key={d.idTemp} className="p-4 border rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-5">
                    <label className="text-xs font-medium mb-1 block">Servicio *</label>
                    <Select value={d.idServicio} onChange={(e) => actualizarDetalle(d.idTemp, "idServicio", Number(e.target.value))} required>
                      <option value={0}>Seleccionar...</option>
                      {servicios.map((s) => (
                        <option key={s.idServicio} value={s.idServicio}>{s.tipoServicio}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium mb-1 block">Cant. *</label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={cantidades[d.idTemp] ?? (d.cantidad ? String(d.cantidad) : "")}
                      onChange={(e) => {
                        const raw = e.target.value
                        setCantidades({ ...cantidades, [d.idTemp]: raw })
                        actualizarDetalle(d.idTemp, "cantidad", parseCantidad(raw))
                      }}
                      placeholder="1"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium mb-1 block">P. Unit. (Bs.) *</label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={precios[d.idTemp] ?? (d.precioUnitario ? String(d.precioUnitario).replace(".", ",") : "")}
                      onChange={(e) => {
                        const raw = e.target.value
                        setPrecios({ ...precios, [d.idTemp]: raw })
                        actualizarDetalle(d.idTemp, "precioUnitario", parseNumber(raw))
                      }}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium mb-1 block">Subtotal</label>
                    <div className="h-10 flex items-center font-medium">
                      ${(d.precioUnitario * d.cantidad).toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <Button type="button" variant="ghost" size="icon" onClick={() => eliminarDetalle(d.idTemp)}>
                      <Trash2 className="h-4 w-4 text-[var(--color-destructive)]" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Descripción del trabajo</label>
                  <Textarea
                    placeholder="Detalla el trabajo a realizar..."
                    value={d.observaciones}
                    onChange={(e) => actualizarDetalle(d.idTemp, "observaciones", e.target.value)}
                    rows={3}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-[var(--color-muted-foreground)]">Monto Total</div>
                <div className="text-2xl font-bold">${montoTotal.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</div>
                <div className="text-sm text-[var(--color-muted-foreground)]">
                  Saldo: ${(montoTotal - parseNumber(adelanto)).toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => navigate("/recibos")}>Cancelar</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creando..." : (tipo === "PROFORMA" ? "Crear Proforma" : "Crear Recibo")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
