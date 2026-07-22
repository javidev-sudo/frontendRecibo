import type { Recibo } from "@/types/recibo"
import type { Pago } from "@/types/pago"

interface ReciboPrintableProps {
  recibo: Recibo
  pagos: Pago[]
  mostrarPrecioUnitario?: boolean
}

export default function ReciboPrintable({ recibo, pagos, mostrarPrecioUnitario = true }: ReciboPrintableProps) {
  const totalPagos = pagos.reduce((acc, p) => acc + p.monto, 0)
  const TELEFONO = "(+591) 70905814 • Santa Cruz, Bolivia"
  const firmaImg = localStorage.getItem("recibo-firma-autorizada")

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Arial, sans-serif",
        width: "216mm",
        padding: "15mm",
        color: "#1a1a1a",
        backgroundColor: "#fff",
        fontSize: "12px",
        lineHeight: "1.5",
      }}
    >
      {/* Logo a la izquierda con texto debajo */}
      <div style={{ borderBottom: "2px solid #333", paddingBottom: "12px", marginBottom: "16px" }}>
        <img
          src={localStorage.getItem("recibo-logo") || "/logo.svg"}
          alt="Logo"
          style={{ width: "90px", height: "90px", objectFit: "contain", display: "block", marginBottom: "8px" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
        />
        <p style={{ margin: "0 0 2px", fontSize: "10px", color: "#1a1a1a", fontWeight: 600 }}>
          Agencia de Diseño e Impresión
        </p>
        <p style={{ margin: "0", fontSize: "8px", color: "#555" }}>
          Telf: {TELEFONO}
        </p>
      </div>

      {/* Título del recibo y fechas */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
            {recibo.tipo === "PROFORMA" ? "PROFORMA" : "RECIBO"} {recibo.codigo || `#${recibo.idRecibo}`}
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#666" }}>
            Estado:{" "}
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "4px",
                fontWeight: 600,
                fontSize: "10px",
                color: "#080808",
              }}
            >
              {recibo.estadoPago}
            </span>
          </p>
        </div>
        <div style={{ textAlign: "right", fontSize: "11px" }}>
          <div><strong>Emisión:</strong> {new Date(recibo.fechaEmision).toLocaleDateString("es-BO")}</div>
          <div><strong>Entrega:</strong> {recibo.fechaAConvenir ? "A convenir" : (recibo.fechaEntrega ? new Date(recibo.fechaEntrega).toLocaleDateString("es-BO") : "—")}</div>
        </div>
      </div>

      {/* Datos del cliente */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "6px",
          padding: "12px",
          marginBottom: "16px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3 style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: 600, color: "#555" }}>CLIENTE</h3>
        <div style={{ fontSize: "13px" }}>
          <strong>Nombre:</strong> {recibo.nombreCliente} {recibo.apellidoCliente}
        </div>
      </div>

      {/* Tabla de servicios */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "16px",
          fontSize: "11px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#333", color: "#fff" }}>
            <th style={{ padding: "8px 6px", textAlign: "left" }}>Servicio</th>
            {mostrarPrecioUnitario && (
              <th style={{ padding: "8px 6px", textAlign: "right" }}>Precio Unit.</th>
            )}
            <th style={{ padding: "8px 6px", textAlign: "center" }}>Cant.</th>
            <th style={{ padding: "8px 6px", textAlign: "right" }}>Subtotal</th>
            <th style={{ padding: "8px 6px", textAlign: "left" }}>Descripción del trabajo</th>
          </tr>
        </thead>
        <tbody>
          {recibo.detalles.map((d, i) => (
            <tr
              key={d.idDetalleRecibo}
              style={{
                backgroundColor: i % 2 === 0 ? "#fff" : "#f5f5f5",
                borderBottom: "1px solid #eee",
              }}
            >
              <td style={{ padding: "7px 6px" }}>{d.nombreServicio}</td>
              {mostrarPrecioUnitario && (
                <td style={{ padding: "7px 6px", textAlign: "right" }}>
                  Bs. {d.precioUnitario.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                </td>
              )}
              <td style={{ padding: "7px 6px", textAlign: "center" }}>{d.cantidad}</td>
              <td style={{ padding: "7px 6px", textAlign: "right", fontWeight: 600 }}>
                Bs. {d.subtotal.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
              </td>
              <td style={{ padding: "7px 6px", color: "#666" }}>{d.observaciones || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Resumen financiero */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "6px",
          padding: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px" }}>
          <span>Monto Total:</span>
          <strong>Bs. {recibo.montoTotal.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px" }}>
          <span>Adelanto:</span>
          <span>Bs. {recibo.adelanto.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px" }}>
          <span>Total Pagos:</span>
          <span>Bs. {totalPagos.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "2px solid #333",
            paddingTop: "8px",
            marginTop: "4px",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          <span>Saldo Pendiente:</span>
          <span style={{ color: recibo.saldo > 0 ? "#f59e0b" : "#22c55e" }}>
            Bs. {recibo.saldo.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Pagos realizados */}
      {pagos.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>PAGOS REGISTRADOS</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={{ padding: "6px", textAlign: "left" }}>Fecha</th>
                <th style={{ padding: "6px", textAlign: "right" }}>Monto</th>
                <th style={{ padding: "6px", textAlign: "center" }}>Tipo</th>
                <th style={{ padding: "6px", textAlign: "left" }}>Observación</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.idPago} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "5px 6px" }}>{new Date(p.fecha).toLocaleDateString("es-BO")}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right" }}>
                    Bs. {p.monto.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "5px 6px", textAlign: "center" }}>{p.tipoPago}</td>
                  <td style={{ padding: "5px 6px", color: "#666" }}>{p.observacion || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Firmas */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "80px", marginBottom: "30px" }}>
        <div style={{ textAlign: "center", width: "40%" }}>
          <div style={{ height: "70px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            {firmaImg ? (
              <img
                src={firmaImg}
                alt="Firma Autorizada"
                style={{ maxWidth: "160px", maxHeight: "70px", objectFit: "contain" }}
              />
            ) : null}
          </div>
          <div style={{ borderTop: "1px solid #333", marginBottom: "6px" }} />
          <p style={{ margin: 0, fontSize: "12px", fontWeight: 600 }}>Firma Autorizada</p>
        </div>
        <div style={{ textAlign: "center", width: "40%" }}>
          <div style={{ height: "70px" }} />
          <div style={{ borderTop: "1px solid #333", marginBottom: "6px" }} />
          <p style={{ margin: 0, fontSize: "12px", fontWeight: 600 }}>Firma Cliente / Recibí Conforme</p>
        </div>
      </div>

      {/* Pie de página */}
      <div
        style={{
          borderTop: "1px solid #ddd",
          paddingTop: "12px",
          textAlign: "center",
          fontSize: "10px",
          color: "#999",
        }}
      >
        <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#666", fontWeight: 500 }}>
          Gracias por confiar en nuestros servicios.
        </p>
        <p style={{ margin: 0 }}>Documento generado el {new Date().toLocaleDateString("es-BO")}</p>
      </div>
    </div>
  )
}
