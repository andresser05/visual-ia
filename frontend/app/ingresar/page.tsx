"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BarraSuperior } from "@/components/barra-superior"
import { api, guardarSesion, type Usuario } from "@/lib/api"

export default function IngresarPage() {
  const router = useRouter()
  const [modo, setModo] = useState<"ingresar" | "registro">("ingresar")
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [clave, setClave] = useState("")
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError(null)
    try {
      const esRegistro = modo === "registro"
      const respuesta = await api<{ token: string; usuario: Usuario }>(
        esRegistro ? "/auth/registro" : "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(esRegistro ? { nombre, email, clave } : { email, clave }),
        }
      )
      guardarSesion(respuesta.token, respuesta.usuario)
      router.push("/carnet")
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la solicitud.")
    } finally {
      setCargando(false)
    }
  }

  const campo = "w-full px-4 py-3 rounded-lg border"

  return (
    <main className="min-h-screen">
      <BarraSuperior />
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-md space-y-6">
          <h1 className="text-3xl font-bold text-foreground">
            {modo === "ingresar" ? "Ingresar" : "Crear cuenta"}
          </h1>
          <p className="text-muted-foreground">
            Con tu cuenta puedes guardar tu carnet de vacunación y agendar citas.
          </p>

          <form onSubmit={enviar} className="space-y-4 bg-card rounded-2xl border border-border p-6">
            {modo === "registro" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre completo</label>
                <input className={campo} value={nombre} onChange={(e) => setNombre(e.target.value)} minLength={2} required />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Correo electrónico</label>
              <input className={campo} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <input
                className={campo}
                type="password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                minLength={6}
                maxLength={64}
                required
              />
              {modo === "registro" && (
                <p className="text-xs text-muted-foreground">Mínimo 6 caracteres.</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60"
            >
              {cargando ? "Procesando..." : modo === "ingresar" ? "Ingresar" : "Crear cuenta"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setModo(modo === "ingresar" ? "registro" : "ingresar")
              setError(null)
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {modo === "ingresar" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Ingresa"}
          </button>
        </div>
      </section>
    </main>
  )
}
