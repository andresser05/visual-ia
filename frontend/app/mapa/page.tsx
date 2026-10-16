import { BarraSuperior } from "@/components/barra-superior"
import { MapaVacunacion } from "@/components/mapa-vacunacion"

export const metadata = {
  title: "Puntos de vacunación | VacunaIA",
}

export default function MapaPage() {
  return (
    <main className="min-h-screen">
      <BarraSuperior />
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
