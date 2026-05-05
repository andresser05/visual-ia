import { Syringe, Shield, Brain, Heart } from "lucide-react"
import { VaccineForm } from "@/components/vaccine-form"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Syringe className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">VacunaIA</h1>
              <p className="text-xs text-muted-foreground">Sistema de Recomendacion</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Inicio
            </a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Acerca de
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Brain className="w-4 h-4" />
              Potenciado por Inteligencia Artificial
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight text-balance">
              Sistema Inteligente de Recomendacion de Vacunas
            </h1>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Utilizando aprendizaje automatico para proporcionar recomendaciones personalizadas de vacunas 
              basadas en su edad, sexo y condicion de salud.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-y border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Analisis Inteligente</h3>
              <p className="text-sm text-muted-foreground">
                Modelo de clasificacion multietiqueta basado en regresion logistica
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Recomendaciones Seguras</h3>
              <p className="text-sm text-muted-foreground">
                Vacunas recomendadas: VPH, Td, Neumococo, Meningococo, Herpes Zoster
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Personalizado</h3>
              <p className="text-sm text-muted-foreground">
                Considera su edad, sexo, condicion de salud y vacunas previas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Obtenga sus Recomendaciones
              </h2>
              <p className="text-muted-foreground">
                Complete el formulario con su informacion para recibir recomendaciones personalizadas
              </p>
            </div>
            
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <VaccineForm />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 border-t border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Acerca del Sistema
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Este sistema utiliza un modelo de clasificacion multietiqueta basado en regresion logistica 
              para predecir las vacunas recomendadas para una persona. El modelo fue entrenado con datos 
              que consideran la edad, sexo, condicion de salud y vacunas previamente aplicadas del usuario.
            </p>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Vacunas que el sistema puede recomendar:</strong>
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {["Herpes Zoster", "Meningococo", "Neumococo PCV13", "Neumococo PPSV23", "Td (refuerzo)", "VPH"].map((v) => (
                  <span key={v} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Sistema de Recomendacion de Vacunas - Proyecto de IA
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Este sistema es solo para fines educativos. Consulte siempre a un profesional de la salud.
          </p>
        </div>
      </footer>
    </main>
  )
}
