"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Send } from "lucide-react"
import { BarraSuperior } from "@/components/barra-superior"
import { api } from "@/lib/api"

interface Mensaje {
  role: "user" | "assistant"
  content: string
}

const SALUDO: Mensaje = {
  role: "assistant",
  content:
    "Hola, soy el asistente de VacunaIA. Puedo responder dudas sobre el esquema de vacunación del PAI de Colombia. ¿Qué quieres saber?",
}

export default function AsistentePage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([SALUDO])
  const [texto, setTexto] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fondo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fondo.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensajes, enviando])

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    const pregunta = texto.trim()
    if (!pregunta || enviando) return

    const nuevos: Mensaje[] = [...mensajes, { role: "user", content: pregunta }]
    setMensajes(nuevos)
    setTexto("")
    setError(null)
    setEnviando(true)

    try {
      // El saludo inicial no se envía: el backend espera que la conversación empiece con el usuario.
      const historial = nuevos.filter((m) => m !== SALUDO)
      const r = await api<{ respuesta: string }>("/asistente", {
        method: "POST",
        body: JSON.stringify({ mensajes: historial }),
      })
      setMensajes([...nuevos, { role: "assistant", content: r.respuesta }])
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo consultar al asistente.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <BarraSuperior />

      <main className="container mx-auto px-4 py-6 flex-1 flex flex-col max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-semibold text-foreground">Asistente de vacunación</h1>
        </div>

        <div className="flex-1 min-h-[50vh] overflow-y-auto rounded-lg border border-border bg-card p-4 space-y-3">
          {mensajes.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <p
                className={
                  "max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm " +
                  (m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground")
                }
              >
                {m.content}
              </p>
            </div>
          ))}
          {enviando && <p className="text-sm text-muted-foreground">Escribiendo...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div ref={fondo} />
        </div>

        <form onSubmit={enviar} className="mt-3 flex gap-2">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={1000}
            placeholder="Escribe tu pregunta sobre vacunas..."
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={enviando || !texto.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Enviar
          </button>
        </form>

        {/* Aviso fijo: siempre visible, no depende de la respuesta del modelo */}
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Información orientativa. Confirma siempre con tu EPS o personal de salud.
        </p>
      </main>
    </div>
  )
}
