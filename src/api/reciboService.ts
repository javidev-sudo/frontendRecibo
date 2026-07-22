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

export function reciboService() {
  return {
    getAll: () => request<import("@/types/recibo").Recibo[]>("/recibos"),
    getById: (id: number) => request<import("@/types/recibo").Recibo>(`/recibos/${id}`),
    create: (data: import("@/types/recibo").ReciboRequest) =>
      request<import("@/types/recibo").Recibo>("/recibos", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: number) => request<void>(`/recibos/${id}`, { method: "DELETE" }),
    convertirARecibo: (id: number) =>
      request<import("@/types/recibo").Recibo>(`/recibos/${id}/convertir`, { method: "POST" }),
  }
}
