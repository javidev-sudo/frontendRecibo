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

export function clienteService() {
  return {
    getAll: () => request<import("@/types/cliente").Cliente[]>("/clientes"),
    getById: (id: number) => request<import("@/types/cliente").Cliente>(`/clientes/${id}`),
    create: (data: { nombre: string; apellido: string; telefono: string }) =>
      request<import("@/types/cliente").Cliente>("/clientes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { nombre: string; apellido: string; telefono: string }) =>
      request<import("@/types/cliente").Cliente>(`/clientes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) => request<void>(`/clientes/${id}`, { method: "DELETE" }),
    search: (q: string) => request<import("@/types/cliente").Cliente[]>(`/clientes/buscar?q=${encodeURIComponent(q)}`),
  }
}
