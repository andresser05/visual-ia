import Link from "next/link"
import { Syringe } from "lucide-react"
import { MapaVacunacion } from "@/components/mapa-vacunacion"

export const metadata = {
  title: "Puntos de vacunación | VacunaIA",
}

export default function MapaPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Syringe className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">VacunaIA</p>
              <p className="text-xs text-muted-foreground">Sistema de Recomendacion</p>
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Inicio
            </Link>
            <Link href="/mapa" className="text-sm font-medium text-foreground">
              Puntos de vacunación
            </Link>
          </nav>
        </div>
      </header>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Puntos de vacunación cercanos</h1>
            <p className="text-muted-foreground">
              Usa tu ubicación para ver los puntos más cercanos en Barranquilla, o toca uno de la lista para verlo en el mapa.
            </p>
          </div>
          <MapaVacunacion />
        </div>
      </section>
    </main>
  )
}
