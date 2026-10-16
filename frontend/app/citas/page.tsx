"use client"

import { useCallback, useEffect, useState } from "react"
import { CalendarCheck, Trash2 } from "lucide-react"
import { BarraSuperior } from "@/components/barra-superior"
import { api } from "@/lib/api"
import { useSesion } from "@/lib/use-sesion"
import { VACUNAS } from "@/lib/vacunas"
import { PUNTOS } from "@/data/puntos-vacunacion"

interface Cita {
  id: string
  punto_id: string
  punto_nombre: string
  vacuna: string
  fecha: string
  hora: string
}

const HORAS = Array.from({ length: 17 }, (_, i) => {
  const minutos = 8 * 60 + i * 30 // 8:00 a 16:00
  const h = String(Math.floor(minutos / 60)).padStart(2, "0")
  const m = String(minutos % 60).padStart(2, "0")
  return `${h}:${m}`
})

export default function CitasPage() {
  const { listo } = useSesion()
  const [citas, setCitas] = useState<Cita[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [puntoId, setPuntoId] = useState("")
  const [vacuna, setVacuna] = useState("")
  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("")

  const hoy = new Date().toISOString().slice(0, 10)

  const cargar = useCallback(async () => {
    try {
      setCitas(await api<Cita[]>("/citas"))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las citas.")
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (listo) cargar()
  }, [listo, cargar])

  const agendar = async (e: React.FormEvent) => {
    e.preventDefault()
    const punto = PUNTOS.find((p) => p.id === puntoId)
    if (!punto) return
    setGuardando(true)
    setError(null)
    try {
      await api<Cita>("/citas", {
        method: "POST",
        body: JSON.stringify({ punto_id: punto.id, punto_nombre: punto.nombre, vacuna, fecha, hora }),
      })
      setPuntoId("")
      setVacuna("")
      setFecha("")
      setHora("")
      await cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo agendar la cita.")
    } finally {
      setGuardando(false)
    }
  }

  const cancelar = async (id: string) => {
    try {
      await api(`/citas/${id}`, { method: "DELETE" })
      setCitas((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cancelar la cita.")
    }
  }

  const campo = "w-full px-4 py-3 rounded-lg border"

  return (
    <main className="min-h-screen">
      <BarraSuperior />
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Mis citas</h1>
            <p className="text-muted-foreground">
              Agenda una cita en uno de los puntos de vacunación del mapa.
            </p>
          </div>

          <form onSubmit={agendar} className="space-y-4 bg-card rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-foreground">Nueva cita</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium">Punto de vacunación</label>
              <select className={campo} value={puntoId} onChange={(e) => setPuntoId(e.target.value)} required>
                <option value="">Seleccione</option>
                {PUNTOS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vacuna</label>
              <select className={campo} value={vacuna} onChange={(e) => setVacuna(e.target.value)} required>
                <option value="">Seleccione</option>
                {VACUNAS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha</label>
                <input className={campo} type="date" min={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora</label>
                <select className={campo} value={hora} onChange={(e) => setHora(e.target.value)} required>
                  <option value="">Seleccione</option>
                  {HORAS.map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={guardando}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60"
            >
              {guardando ? "Agendando..." : "Agendar cita"}
            </button>
            <p className="text-xs text-muted-foreground">
              Prototipo: la cita queda registrada en esta plataforma y no se conecta con el sistema de agendamiento oficial. Confirma con la IPS o la Línea de la Salud (605 3793333).
            </p>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="space-y-3">
            <h2 className="font-semibold text-foreground">Próximas citas</h2>
            {cargando ? (
              <p className="text-muted-foreground animate-pulse">Cargando citas...</p>
            ) : citas.length === 0 ? (
              <p className="text-muted-foreground">No tienes citas agendadas.</p>
            ) : (
              citas.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
                  <CalendarCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{c.vacuna}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.fecha} · {c.hora} · {c.punto_nombre}
                    </p>
                  </div>
                  <button onClick={() => cancelar(c.id)} aria-label={`Cancelar cita de ${c.vacuna}`} className="text-muted-foreground hover:text-red-600">
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
