"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Syringe } from "lucide-react"
import { cerrarSesion, leerToken, leerUsuario, type Usuario } from "@/lib/api"

const ENLACES = [
  { href: "/", texto: "Recomendación" },
  { href: "/mapa", texto: "Puntos de vacunación" },
  { href: "/carnet", texto: "Carnet" },
  { href: "/citas", texto: "Citas" },
]

export function BarraSuperior() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  useEffect(() => {
    setUsuario(leerToken() ? leerUsuario() : null)
  }, [])

  const salir = () => {
    cerrarSesion()
    setUsuario(null)
    router.push("/")
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Syringe className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">VacunaIA</p>
            <p className="text-xs text-muted-foreground">PAI Digital</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {e.texto}
            </Link>
          ))}
          {usuario ? (
            <button onClick={salir} className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Salir ({usuario.nombre.split(" ")[0]})
            </button>
          ) : (
            <Link href="/ingresar" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
