const API_URL = "/api"

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message || "Error en la petición")
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export function pagoService() {
  return {
    getByReciboId: (idRecibo: number) =>
      request<import("@/types/pago").Pago[]>(`/recibos/${idRecibo}/pagos`),
    create: (idRecibo: number, data: { monto: number; tipoPago: "EFECTIVO" | "QR"; observacion: string }) =>
      request<import("@/types/pago").Pago>(`/recibos/${idRecibo}/pagos`, {
        method: "POST",
        body: JSON.stringify({ ...data, idRecibo }),
      }),
    delete: (id: number) => request<void>(`/pagos/${id}`, { method: "DELETE" }),
  }
}
