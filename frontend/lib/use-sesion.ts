"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { leerToken, leerUsuario, type Usuario } from "@/lib/api"

/** Devuelve el usuario con sesión; si no hay y es requerida, manda a /ingresar. */
export function useSesion() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    const u = leerToken() ? leerUsuario() : null
    if (!u) {
      router.replace("/ingresar")
      return
    }
    setUsuario(u)
    setListo(true)
  }, [router])

  return { usuario, listo }
}