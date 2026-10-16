"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Syringe, Trash2 } from "lucide-react"
import { BarraSuperior } from "@/components/barra-superior"
import { api } from "@/lib/api"
import { useSesion } from "@/lib/use-sesion"
import { VACUNAS } from "@/lib/vacunas"

interface Dosis {
  id: string
  vacuna: string
  fecha: string
  lugar: string | null
}

export default function CarnetPage() {
  const { usuario, listo } = useSesion()
  const [dosis, setDosis] = useState<Dosis[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [vacuna, setVacuna] = useState("")
  const [fecha, setFecha] = useState("")
  const [lugar, setLugar] = useState("")

  const hoy = new Date().toISOString().slice(0, 10)

  const cargar = useCallback(async () => {
    try {
      setDosis(await api<Dosis[]>("/carnet"))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el carnet.")
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (listo) cargar()
  }, [listo, cargar])

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setError(null)
    try {
      await api<Dosis>("/carnet", {
        method: "POST",
        body: JSON.stringify({ vacuna, fecha, lugar: lugar || null }),
      })
      setVacuna("")
      setFecha("")
      setLugar("")
      await cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la dosis.")
    } finally {
      setGuardando(false)
    }
  }

  const borrar = async (id: string) => {
    try {
      await api(`/carnet/${id}`, { method: "DELETE" })
      setDosis((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la dosis.")
    }
  }

  const campo = "w-full px-4 py-3 rounded-lg border"

  return (
    <main className="min-h-screen">
      <BarraSuperior />
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Carnet digital</h1>
            <p className="text-muted-foreground">
              {usuario ? `${usuario.nombre}, ` : ""}registra las vacunas que ya te aplicaron. Es un registro personal de apoyo y no reemplaza tu carnet oficial.
            </p>
          </div>

          <form onSubmit={agregar} className="space-y-4 bg-card rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-foreground">Agregar dosis</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vacuna</label>
                <select className={campo} value={vacuna} onChange={(e) => setVacuna(e.target.value)} required>
                  <option value="">Seleccione</option>
                  {VACUNAS.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de aplicación</label>
                <input className={campo} type="date" max={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lugar (opcional)</label>
              <input className={campo} value={lugar} maxLength={120} onChange={(e) => setLugar(e.target.value)} />
            </div>
            <button
              type="submit"
              disabled={guardando}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar dosis"}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="space-y-3">
            <h2 className="font-semibold text-foreground">Mis vacunas</h2>
            {cargando ? (
              <p className="text-muted-foreground animate-pulse">Cargando carnet...</p>
            ) : dosis.length === 0 ? (
              <p className="text-muted-foreground">
                Aún no has registrado dosis. Agrega la primera con el formulario, o{" "}
                <Link href="/" className="text-blue-600 hover:text-blue-700">
                  consulta qué vacunas te recomienda el sistema
                </Link>
                .
              </p>
            ) : (
              dosis.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
                  <Syringe className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{d.vacuna}</p>
                    <p className="text-sm text-muted-foreground">
                      {d.fecha}
                      {d.lugar ? ` · ${d.lugar}` : ""}
                    </p>
                  </div>
                  <button onClick={() => borrar(d.id)} aria-label={`Eliminar ${d.vacuna}`} className="text-muted-foreground hover:text-red-600">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
