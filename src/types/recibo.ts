export interface DetalleRecibo {
  idDetalleRecibo: number
  nombreServicio: string
  precioUnitario: number
  cantidad: number
  subtotal: number
  observaciones: string
}

export interface Recibo {
  idRecibo: number
  codigo: string
  nombreCliente: string
  apellidoCliente: string
  fechaEntrega: string | null
  fechaEmision: string
  montoTotal: number
  adelanto: number
  saldo: number
  detalle: string
  fechaAConvenir: boolean
  tipo: "PROFORMA" | "RECIBO"
  estadoPago: "PENDIENTE" | "PAGADO" | "CANCELADO"
  detalles: DetalleRecibo[]
}

export interface ReciboRequest {
  idCliente: number
  fechaEntrega: string | null
  adelanto: number
  detalle?: string
  fechaAConvenir: boolean
  tipo: "PROFORMA" | "RECIBO"
  detalleRecibo: DetalleReciboRequest[]
}

export interface DetalleReciboRequest {
  idServicio: number
  precioUnitario: number
  cantidad: number
  observaciones: string
}
