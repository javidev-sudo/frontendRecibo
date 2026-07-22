export interface Pago {
  idPago: number
  idRecibo: number
  fecha: string
  monto: number
  tipoPago: "EFECTIVO" | "QR"
  observacion: string
}

export interface PagoRequest {
  idRecibo: number
  monto: number
  tipoPago: "EFECTIVO" | "QR"
  observacion: string
}
