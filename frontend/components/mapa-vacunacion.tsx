"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { Map as LeafletMap, CircleMarker } from "leaflet"
import "leaflet/dist/leaflet.css"
import { LocateFixed, MapPin, Phone } from "lucide-react"
import { PUNTOS } from "@/data/puntos-vacunacion"

type Coord = [number, number]

const CENTRO: Coord = [10.9685, -74.7813] // Barranquilla

function distanciaKm(a: Coord, b: Coord) {
  const rad = (g: number) => (g * Math.PI) / 180
  const dLat = rad(b[0] - a[0])
  const dLng = rad(b[1] - a[1])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

export function MapaVacunacion() {
  const contenedor = useRef<HTMLDivElement>(null)
  const mapa = useRef<LeafletMap | null>(null)
  const marcadores = useRef(new Map<string, CircleMarker>())
  const marcadorUsuario = useRef<CircleMarker | null>(null)

  const [ubicacion, setUbicacion] = useState<Coord | null>(null)
  const [estado, setEstado] = useState<"inactivo" | "buscando" | "error">("inactivo")

  // Crear el mapa una sola vez
  useEffect(() => {
    let cancelado = false
    ;(async () => {
      const L = (await import("leaflet")).default
      if (cancelado || !contenedor.current) return

      const m = L.map(contenedor.current).setView(CENTRO, 12)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(m)

      PUNTOS.forEach((p) => {
        const marcador = L.circleMarker([p.lat, p.lng], {
          radius: 9,
          color: "#1d4ed8",
          fillColor: "#2563eb",
          fillOpacity: 0.85,
        })
          .addTo(m)
          .bindPopup(
            `<strong>${p.nombre}</strong><br/>${p.tipo} · ${p.barrio}<br/>${p.horario}`
          )
        marcadores.current.set(p.id, marcador)
      })

      mapa.current = m
    })()

    return () => {
      cancelado = true
      mapa.current?.remove()
      mapa.current = null
      marcadores.current.clear()
    }
  }, [])

  // Dibujar la ubicación del usuario cuando exista
  useEffect(() => {
    if (!ubicacion) return
    let activo = true
    ;(async () => {
      const L = (await import("leaflet")).default
      if (!activo || !mapa.current) return
      marcadorUsuario.current?.remove()
      marcadorUsuario.current = L.circleMarker(ubicacion, {
        radius: 8,
        color: "#065f46",
        fillColor: "#10b981",
        fillOpacity: 1,
      })
        .addTo(mapa.current)
        .bindPopup("Tu ubicación")
      mapa.current.flyTo(ubicacion, 14)
    })()
    return () => {
      activo = false
    }
  }, [ubicacion])

  const ubicarme = () => {
    if (!navigator.geolocation) {
      setEstado("error")
      return
    }
    setEstado("buscando")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion([pos.coords.latitude, pos.coords.longitude])
        setEstado("inactivo")
      },
      () => setEstado("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const lista = useMemo(() => {
    const base = PUNTOS.map((p) => ({
      ...p,
      km: ubicacion ? distanciaKm(ubicacion, [p.lat, p.lng]) : null,
    }))
    return ubicacion ? base.sort((a, b) => (a.km ?? 0) - (b.km ?? 0)) : base
  }, [ubicacion])

  const verEnMapa = (id: string, lat: number, lng: number) => {
    mapa.current?.flyTo([lat, lng], 16)
    marcadores.current.get(id)?.openPopup()
    contenedor.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={ubicarme}
          disabled={estado === "buscando"}
          className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60"
        >
          <LocateFixed className="w-4 h-4" />
          {estado === "buscando" ? "Buscando tu ubicación..." : "Usar mi ubicación"}
        </button>
        {estado === "error" && (
          <p className="text-sm text-red-600">
            No pudimos obtener tu ubicación. Revisa el permiso del navegador e inténtalo de nuevo.
          </p>
        )}
      </div>

      <div
        ref={contenedor}
        className="relative z-0 h-[420px] w-full rounded-xl border border-border overflow-hidden"
      />

      <ul className="space-y-3">
        {lista.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => verEnMapa(p.id, p.lat, p.lng)}
              className="w-full text-left p-4 rounded-xl border border-border bg-card hover:bg-muted/50 flex items-start gap-3"
            >
              <MapPin className="w-5 h-5 mt-0.5 text-blue-600 shrink-0" />
              <span className="flex-1">
                <span className="block font-medium text-foreground">{p.nombre}</span>
                <span className="block text-sm text-muted-foreground">
                  {p.tipo} · {p.barrio} · {p.horario}
                </span>
                {!p.verificado && (
                  <span className="block text-xs text-amber-700 mt-1">
                    Ubicación por confirmar
                  </span>
                )}
              </span>
              {p.km !== null && (
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  {p.km.toFixed(1)} km
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-sm">
        <Phone className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          Antes de ir, confirma la ubicación y el horario en la Línea de la Salud de
          Barranquilla (605 3793333) o en barranquilla.gov.co/salud.
        </p>
      </div>
    </div>
  )
}
