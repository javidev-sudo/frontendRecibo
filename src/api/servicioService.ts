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

export function servicioService() {
  return {
    getAll: () => request<import("@/types/servicio").Servicio[]>("/servicios"),
    getById: (id: number) => request<import("@/types/servicio").Servicio>(`/servicios/${id}`),
    create: (data: { tipoServicio: string; descripcion: string }) =>
      request<import("@/types/servicio").Servicio>("/servicios", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { tipoServicio: string; descripcion: string }) =>
      request<import("@/types/servicio").Servicio>(`/servicios/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) => request<void>(`/servicios/${id}`, { method: "DELETE" }),
  }
}
