import type { Recibo } from "@/types/recibo"
import type { Pago } from "@/types/pago"

interface TicketPrintableProps {
  recibo: Recibo
  pagos: Pago[]
  mostrarPrecioUnitario?: boolean
}

export default function TicketPrintable({ recibo, pagos, mostrarPrecioUnitario = true }: TicketPrintableProps) {
  const totalPagos = pagos.reduce((acc, p) => acc + p.monto, 0)
  const HEAVY = "=".repeat(56)
  const THIN = "-".repeat(56)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    const s = dateStr.split("T")[0]
    const [y, m, d] = s.split("-")
    return `${d}/${m}/${y}`
  }

  return (
    <div
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        width: "80mm",
        padding: "4mm",
        color: "#000",
        backgroundColor: "#fff",
        fontSize: "10px",
        lineHeight: "1.4",
        textAlign: "center",
      }}
    >
      {/* Logo centrado, más grande y no deformado */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "3mm" }}>
        <img
          src={localStorage.getItem("recibo-logo") || "/logo.svg"}
          alt="Logo"
          style={{ maxWidth: "70px", maxHeight: "70px", objectFit: "contain", display: "block" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
        />
      </div>

      {/* Datos del negocio */}
      <div style={{ marginBottom: "2mm" }}>
        <div style={{ fontWeight: 600 }}>Agencia de Diseño e Impresión</div>
        <div>Tel: 70905814</div>
        <div>Santa Cruz, Bolivia</div>
      </div>

      {/* Separador pesado */}
      <div style={{ fontWeight: 700, whiteSpace: "pre", marginBottom: "2mm" }}>{HEAVY}</div>

      {/* Título */}
      <div style={{ fontWeight: 700, fontSize: "12px", marginBottom: "1mm" }}>
        ORDEN DE TRABAJO
      </div>
      <div style={{ fontSize: "11px", marginBottom: "2mm" }}>
        N° {recibo.codigo || `#${recibo.idRecibo}`}
      </div>

      {/* Separador pesado */}
      <div style={{ fontWeight: 700, whiteSpace: "pre", marginBottom: "2mm" }}>{HEAVY}</div>

      {/* Datos del cliente */}
      <div style={{ marginBottom: "2mm", fontSize: "9px", textAlign: "left" }}>
        <div style={{ display: "flex" }}>
          <span style={{ width: "14mm", fontWeight: 700 }}>FECHA</span>
          <span style={{ width: "2mm" }}>:</span>
          <span>{formatDate(recibo.fechaEmision)}</span>
        </div>
        <div style={{ display: "flex" }}>
          <span style={{ width: "14mm", fontWeight: 700 }}>CLIENTE</span>
          <span style={{ width: "2mm" }}>:</span>
          <span>{recibo.nombreCliente} {recibo.apellidoCliente}</span>
        </div>
        <div style={{ display: "flex" }}>
          <span style={{ width: "14mm", fontWeight: 700 }}>ENTREGA</span>
          <span style={{ width: "2mm" }}>:</span>
          <span>
            {recibo.fechaAConvenir
              ? "A convenir"
              : recibo.fechaEntrega
                ? formatDate(recibo.fechaEntrega)
                : "-"}
          </span>
        </div>
      </div>

      {/* Separador fino */}
      <div style={{ whiteSpace: "pre", marginBottom: "1mm" }}>{THIN}</div>

      {/* Tabla de servicios con columnas espaciadas */}
      <div style={{ marginBottom: "1mm", fontSize: "9px", textAlign: "left" }}>
        <div style={{ display: "flex", fontWeight: 700, paddingBottom: "1mm" }}>
          <span style={{ width: "18mm" }}>Servicio</span>
          <span style={{ width: "8mm", textAlign: "center" }}>Cant</span>
          <span style={{ width: "14mm", textAlign: "left", paddingLeft: "2mm" }}>Descrip.</span>
          {mostrarPrecioUnitario && (
            <span style={{ width: "11mm", textAlign: "right", paddingLeft: "2mm" }}>P.Unit</span>
          )}
          <span style={{ width: "13mm", textAlign: "right", paddingLeft: "2mm" }}>SubTotal</span>
        </div>
      </div>

      <div style={{ whiteSpace: "pre", marginBottom: "1mm" }}>{THIN}</div>

      <div style={{ marginBottom: "2mm", fontSize: "9px", textAlign: "left" }}>
        {recibo.detalles.map((d) => (
          <div key={d.idDetalleRecibo} style={{ display: "flex", marginBottom: "1mm" }}>
            <span style={{ width: "18mm" }}>{d.nombreServicio}</span>
            <span style={{ width: "8mm", textAlign: "center" }}>{d.cantidad}</span>
            <span style={{ width: "14mm", textAlign: "left", paddingLeft: "2mm", fontSize: "8px" }}>
              {d.observaciones || "-"}
            </span>
            {mostrarPrecioUnitario && (
              <span style={{ width: "11mm", textAlign: "right", paddingLeft: "2mm" }}>
                {d.precioUnitario.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
              </span>
            )}
            <span style={{ width: "13mm", textAlign: "right", paddingLeft: "2mm" }}>
              {d.subtotal.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>

      <div style={{ whiteSpace: "pre", marginBottom: "2mm" }}>{THIN}</div>

      {/* PAGOS Y CUOTAS */}
      <div style={{ marginBottom: "1mm", fontSize: "9px", textAlign: "left" }}>
        <div style={{ fontWeight: 700, marginBottom: "1mm", textAlign: "center" }}>PAGOS Y CUOTAS</div>
        {pagos.length === 0 && (!recibo.adelanto || Number(recibo.adelanto) === 0) ? (
          <div style={{ marginBottom: "2mm", textAlign: "center" }}>Sin pagos registrados</div>
        ) : (
          <>
            {recibo.adelanto && Number(recibo.adelanto) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Anticipo</span>
                <span>Bs. {Number(recibo.adelanto).toLocaleString("es-BO", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {pagos.map((p) => (
              <div key={p.idPago} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{p.tipoPago} - {formatDate(p.fecha)}</span>
                <span>Bs. {p.monto.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ whiteSpace: "pre", marginBottom: "2mm" }}>{THIN}</div>

      {/* Resumen final */}
      <div style={{ marginBottom: "2mm", fontSize: "10px", textAlign: "left" }}>
        <div style={{ display: "flex" }}>
          <span style={{ width: "32mm" }}>Costo Total :</span>
          <span style={{ flex: 1, textAlign: "right", fontWeight: 700 }}>
            Bs. {recibo.montoTotal.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div style={{ display: "flex" }}>
          <span style={{ width: "32mm" }}>Total Pagado:</span>
          <span style={{ flex: 1, textAlign: "right", fontWeight: 700 }}>
            Bs. {totalPagos.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div style={{ display: "flex" }}>
          <span style={{ width: "32mm" }}>SALDO       :</span>
          <span style={{ flex: 1, textAlign: "right", fontWeight: 700 }}>
            Bs. {recibo.saldo.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Separador pesado */}
      <div style={{ fontWeight: 700, whiteSpace: "pre", marginBottom: "2mm" }}>{HEAVY}</div>

      {/* Pie */}
      <div style={{ fontSize: "9px" }}>
        Gracias por confiar en nuestros servicios.
      </div>
    </div>
  )
}
