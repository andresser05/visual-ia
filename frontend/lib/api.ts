export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://visual-ia.onrender.com"

const CLAVE_TOKEN = "pai_token"
const CLAVE_USUARIO = "pai_usuario"

export interface Usuario {
  id: string
  nombre: string
  email: string
}

export function guardarSesion(token: string, usuario: Usuario) {
  localStorage.setItem(CLAVE_TOKEN, token)
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario))
}

export function leerToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CLAVE_TOKEN)
}

export function leerUsuario(): Usuario | null {
  if (typeof window === "undefined") return null
  try {
    const crudo = localStorage.getItem(CLAVE_USUARIO)
    return crudo ? (JSON.parse(crudo) as Usuario) : null
  } catch {
    return null
  }
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE_TOKEN)
  localStorage.removeItem(CLAVE_USUARIO)
}

export async function api<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = leerToken()
  let respuesta: Response
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((opciones.headers as Record<string, string>) ?? {}),
      },
    })
  } catch {
    throw new Error("No se pudo conectar con el servidor. Si es la primera consulta, espera unos segundos y reintenta.")
  }

  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    if (respuesta.status === 401 && token) cerrarSesion()
    const detalle = datos?.detail
    if (typeof detalle === "string") throw new Error(detalle)
    if (Array.isArray(detalle)) throw new Error("Revisa los datos del formulario.")
    throw new Error("No se pudo completar la solicitud.")
  }
  return datos as T
}