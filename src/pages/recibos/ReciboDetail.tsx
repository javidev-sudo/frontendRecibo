import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { reciboService } from "@/api/reciboService"
import { pagoService } from "@/api/pagoService"
import type { Recibo } from "@/types/recibo"
import type { Pago } from "@/types/pago"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, Download, Receipt, Eye, X, FileText, CheckCircle2 } from "lucide-react"
import html2pdf from "html2pdf.js"
import ReciboPrintable from "@/components/ReciboPrintable"
import TicketPrintable from "@/components/TicketPrintable"

export default function ReciboDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [recibo, setRecibo] = useState<Recibo | null>(null)
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [showPagoForm, setShowPagoForm] = useState(false)
  const [pagoForm, setPagoForm] = useState({ monto: "", tipoPago: "EFECTIVO" as "EFECTIVO" | "QR", observacion: "" })
  const [mostrarPrecioUnitario, setMostrarPrecioUnitario] = useState(true)
  const [mostrarPreview, setMostrarPreview] = useState(false)
  const reciboRef = useRef<HTMLDivElement>(null)
  const ticketRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const cargar = () => {
    if (!id) return
    setLoading(true)
    Promise.all([
      reciboService().getById(Number(id)),
      pagoService().getByReciboId(Number(id)),
    ])
      .then(([r, p]) => { setRecibo(r); setPagos(p) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [id])

  const handlePago = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      await pagoService().create(Number(id), {
        monto: parseFloat(pagoForm.monto),
        tipoPago: pagoForm.tipoPago,
        observacion: pagoForm.observacion,
      })
      setPagoForm({ monto: "", tipoPago: "EFECTIVO", observacion: "" })
      setShowPagoForm(false)
      cargar()
    } catch (err) {
      console.error(err)
      alert("Error al registrar el pago")
    }
  }

  const handleDeletePago = async (idPago: number) => {
    if (!confirm("¿Eliminar este pago?")) return
    await pagoService().delete(idPago)
    cargar()
  }

  const handleConvertir = async () => {
    if (!recibo) return
    if (!confirm("¿Convertir esta proforma en recibo definitivo? Esta acción no se puede deshacer.")) return
    try {
      await reciboService().convertirARecibo(recibo.idRecibo)
      cargar()
    } catch (err) {
      console.error(err)
      alert("Error al convertir la proforma")
    }
  }

  const handleDownloadPDF = () => {
    const element = reciboRef.current
    if (!element) return
    const codigo = recibo?.codigo || `recibo-${recibo?.idRecibo}`
    html2pdf()
      .from(element)
      .set({
        margin: 5,
        filename: `${codigo}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "letter", orientation: "portrait" },
      })
      .save()
  }

  const handleDownloadTicket = () => {
    const element = ticketRef.current
    if (!element) return
    let codigo = recibo?.codigo || `recibo-${recibo?.idRecibo}`
    if (recibo?.codigo) {
      const prefix = recibo.tipo === "PROFORMA" ? "TKPRO-" : "TKORD-"
      codigo = prefix + recibo.codigo.replace(/^(PRO-|ORD-)/, "")
    }
    html2pdf()
      .from(element)
      .set({
        margin: 2,
        filename: `${codigo}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: "mm", format: [80, 297], orientation: "portrait" },
      })
      .save()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-[var(--color-muted-foreground)]">Cargando...</div>
  }

  if (!recibo) {
    return <div className="text-center py-12 text-[var(--color-muted-foreground)]">Recibo no encontrado.</div>
  }

  const totalPagos = pagos.reduce((acc, p) => acc + p.monto, 0)

  return (
      <div className={`flex flex-col lg:flex-row gap-4 ${mostrarPreview ? '' : ''}`}>
      <div className={`space-y-6 ${mostrarPreview ? 'lg:w-1/2' : 'w-full max-w-4xl'} transition-all`}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4 flex-wrap">
            <Button variant="ghost" size="icon" onClick={() => navigate("/recibos")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{recibo.codigo || `Recibo #${recibo.idRecibo}`}</h1>
            <Badge variant={recibo.tipo === "PROFORMA" ? "secondary" : "default"}>
              {recibo.tipo}
            </Badge>
            <Badge variant={recibo.estadoPago === "PAGADO" ? "success" : recibo.estadoPago === "PENDIENTE" ? "warning" : "destructive"}>
              {recibo.estadoPago}
            </Badge>
          </div>
          <div className="flex gap-2 flex-wrap items-center md:ml-auto">
            {recibo.tipo === "PROFORMA" && (
              <Button variant="default" size="sm" onClick={handleConvertir}>
                <CheckCircle2 className="h-4 w-4" /> <span className="hidden sm:inline">Convertir a Recibo</span><span className="sm:hidden">Convertir</span>
              </Button>
            )}
            <label className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] cursor-pointer">
              <input
                type="checkbox"
                checked={mostrarPrecioUnitario}
                onChange={(e) => setMostrarPrecioUnitario(e.target.checked)}
                className="rounded"
              />
              <span className="hidden sm:inline">Precio Unit.</span>
            </label>
            <Button variant="outline" size="sm" onClick={() => setMostrarPreview(!mostrarPreview)}>
              <Eye className="h-4 w-4" /> <span className="hidden md:inline">{mostrarPreview ? "Ocultar" : "Vista Previa"}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4" /> <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadTicket}>
              <Receipt className="h-4 w-4" /> <span className="hidden sm:inline">Ticket</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Recibo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Cliente:</span>
                <span className="font-medium">{recibo.nombreCliente} {recibo.apellidoCliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Fecha Emisión:</span>
                <span>{new Date(recibo.fechaEmision).toLocaleDateString("es-BO")}</span>
              </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted-foreground)]">Fecha Entrega:</span>
              <span>{recibo.fechaAConvenir ? <em className="text-[var(--color-muted-foreground)]">A convenir</em> : (recibo.fechaEntrega ? new Date(recibo.fechaEntrega).toLocaleDateString("es-BO") : "-")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
          </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Monto Total:</span>
                <span className="font-bold text-lg">${recibo.montoTotal.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Adelanto:</span>
                <span>${recibo.adelanto.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Total Pagos:</span>
                <span>${totalPagos.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Saldo:</span>
                <span className="font-bold text-lg">${recibo.saldo.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalles / Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[var(--color-muted-foreground)]">
                    <th className="pb-2 font-medium">Servicio</th>
                    {mostrarPrecioUnitario && <th className="pb-2 font-medium">Precio Unit.</th>}
                    <th className="pb-2 font-medium">Cantidad</th>
                    <th className="pb-2 font-medium">Subtotal</th>
                    <th className="pb-2 font-medium">Descripción del trabajo</th>
                  </tr>
                </thead>
                <tbody>
                  {recibo.detalles.map((d) => (
                    <tr key={d.idDetalleRecibo} className="border-b last:border-0">
                      <td className="py-2 font-medium">{d.nombreServicio}</td>
                      {mostrarPrecioUnitario && (
                        <td className="py-2">${d.precioUnitario.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</td>
                      )}
                      <td className="py-2">{d.cantidad}</td>
                      <td className="py-2 font-medium">${d.subtotal.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</td>
                      <td className="py-2 text-[var(--color-muted-foreground)]">{d.observaciones || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pagos</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowPagoForm(!showPagoForm)}>
              <Plus className="h-4 w-4" /> Registrar Pago
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showPagoForm && (
              <form onSubmit={handlePago} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg bg-[var(--color-muted)]/30">
                <Input type="number" step="0.01" min="0" placeholder="Monto (Bs.)" value={pagoForm.monto} onChange={(e) => setPagoForm({ ...pagoForm, monto: e.target.value })} required />
                <Select value={pagoForm.tipoPago} onChange={(e) => setPagoForm({ ...pagoForm, tipoPago: e.target.value as "EFECTIVO" | "QR" })}>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="QR">QR</option>
                </Select>
                <Input placeholder="Observación" value={pagoForm.observacion} onChange={(e) => setPagoForm({ ...pagoForm, observacion: e.target.value })} />
                <Button type="submit">Guardar</Button>
              </form>
            )}

            {pagos.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)] text-center py-4">No hay pagos registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-[var(--color-muted-foreground)]">
                      <th className="pb-2 font-medium">Fecha</th>
                      <th className="pb-2 font-medium">Monto</th>
                      <th className="pb-2 font-medium">Tipo</th>
                      <th className="pb-2 font-medium">Observación</th>
                      <th className="pb-2 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagos.map((p) => (
                      <tr key={p.idPago} className="border-b last:border-0">
                        <td className="py-2">{new Date(p.fecha).toLocaleDateString("es-BO")}</td>
                        <td className="py-2 font-medium">${p.monto.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</td>
                        <td className="py-2">
                          <Badge variant="secondary">{p.tipoPago}</Badge>
                        </td>
                        <td className="py-2 text-[var(--color-muted-foreground)]">{p.observacion || "-"}</td>
                        <td className="py-2 text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePago(p.idPago)}>
                            <Trash2 className="h-4 w-4 text-[var(--color-destructive)]" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Componente oculto para generar el PDF */}
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <div ref={reciboRef}>
            <ReciboPrintable recibo={recibo} pagos={pagos} mostrarPrecioUnitario={mostrarPrecioUnitario} />
          </div>
        </div>

        {/* Componente oculto para generar el ticket */}
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <div ref={ticketRef}>
            <TicketPrintable recibo={recibo} pagos={pagos} mostrarPrecioUnitario={mostrarPrecioUnitario} />
          </div>
        </div>
      </div>

      {/* Panel lateral de Vista Previa */}
      {mostrarPreview && (
        <div className="w-full lg:w-1/2 lg:sticky lg:top-0 h-[calc(100vh-2rem)] border border-[var(--color-border)] rounded-lg bg-white overflow-hidden flex flex-col mt-4 lg:mt-0">
          <div className="flex items-center justify-between p-3 border-b bg-zinc-50">
            <div className="flex items-center gap-2 text-zinc-700 font-medium text-sm">
              <FileText className="h-4 w-4" />
              Vista Previa
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMostrarPreview(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-zinc-100">
            <div
              ref={previewRef}
              style={{
                transform: "scale(0.6)",
                transformOrigin: "top left",
                width: "fit-content",
              }}
            >
              <ReciboPrintable recibo={recibo} pagos={pagos} mostrarPrecioUnitario={mostrarPrecioUnitario} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
