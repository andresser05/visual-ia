"use client"

import { useState } from "react"
import { Syringe, User, Calendar, Heart, ClipboardList } from "lucide-react"

interface PredictionResponse {
  vacunas_recomendadas: string[]
  success: boolean
  message: string
}

const CONDICIONES_SALUD = [
  "Ninguna",
  "Diabetes",
  "VIH",
  "EPOC",
  "Asma",
  "Embarazo",
  "Enfermedad cardíaca",
  "Inmunosupresión",
  "Cáncer en tratamiento",
  "Insuficiencia renal",
  "Adulto mayor sin comorbilidades",
]

const VACUNAS_APLICADAS_OPTIONS = [
  "COVID-19",
  "Hepatitis A",
  "Hepatitis B",
  "Influenza",
  "MMR (sarampión-paperas-rubéola)",
  "Tdap",
  "Neumococo PCV13",
  "Herpes Zóster",
  "Meningococo",
  "Varicela",
]

export function VaccineForm() {
  const [edad, setEdad] = useState<string>("")
  const [sexo, setSexo] = useState<string>("")
  const [condicionSalud, setCondicionSalud] = useState<string>("")
  const [vacunasSeleccionadas, setVacunasSeleccionadas] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const toggleVacuna = (vacuna: string) => {
    setVacunasSeleccionadas((prev) =>
      prev.includes(vacuna) ? prev.filter((v) => v !== vacuna) : [...prev, vacuna]
    )
  }

  // 🔁 REINICIAR
  const handleReset = () => {
    setEdad("")
    setSexo("")
    setCondicionSalud("")
    setVacunasSeleccionadas([])
    setResult(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    const vacunasAplicadasStr =
      vacunasSeleccionadas.length > 0
        ? vacunasSeleccionadas.join("|")
        : "Ninguna"

    try {
      const response = await fetch("https://visual-ia.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          edad: parseInt(edad),
          sexo: sexo,
          condicion_salud: condicionSalud,
          vacunas_aplicadas: vacunasAplicadasStr,
        }),
      })

      const data: PredictionResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error en la solicitud")
      }

      setResult(data)

      // scroll automático
      window.scrollTo({ top: 600, behavior: "smooth" })

    } catch {
      setError("Error al conectar con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  // ✅ VALIDACIÓN
  const isEdadValida =
    edad !== "" && Number(edad) >= 0 && Number(edad) <= 110

  const isFormValid = isEdadValida && sexo && condicionSalud

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* FORMULARIO */}
      {!result && (
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Edad */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              Edad
            </label>

            <input
              type="number"
              value={edad}
              min={0}
              max={110}
              onChange={(e) => {
                const value = e.target.value

                if (value === "") {
                  setEdad("")
                  return
                }

                const num = Number(value)

                if (num >= 0 && num <= 110) {
                  setEdad(value)
                }
              }}
              className="w-full px-4 py-3 rounded-lg border"
              required
            />

            {edad && !isEdadValida && (
              <p className="text-red-500 text-sm">
                La edad debe estar entre 0 y 110 años
              </p>
            )}
          </div>

          {/* Sexo */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4" />
              Sexo
            </label>

            <div className="grid grid-cols-2 gap-3">
              {["Masculino", "Femenino"].map((s) => (
                <label
                  key={s}
                  className={`p-3 border rounded-lg cursor-pointer text-center ${
                    sexo === s ? "bg-blue-600 text-white" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="sexo"
                    value={s}
                    checked={sexo === s}
                    onChange={(e) => setSexo(e.target.value)}
                    className="hidden"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* Condición */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Heart className="w-4 h-4" />
              Condición de Salud
            </label>

            <select
              value={condicionSalud}
              onChange={(e) => setCondicionSalud(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
              required
            >
              <option value="">Seleccione</option>
              {CONDICIONES_SALUD.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Vacunas */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <ClipboardList className="w-4 h-4" />
              Vacunas Aplicadas
            </label>

            <div className="grid grid-cols-2 gap-2">
              {VACUNAS_APLICADAS_OPTIONS.map((vacuna) => (
                <label key={vacuna} className="flex items-center gap-2 border p-2 rounded">
                  <input
                    type="checkbox"
                    checked={vacunasSeleccionadas.includes(vacuna)}
                    onChange={() => toggleVacuna(vacuna)}
                  />
                  {vacuna}
                </label>
              ))}
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full p-4 bg-blue-600 text-white rounded-lg"
          >
            {loading ? "Analizando..." : "Obtener Recomendaciones"}
          </button>

          {/* Loading */}
          {loading && (
            <div className="text-center py-4">
              <p className="animate-pulse text-blue-600 font-medium">
                Analizando datos...
              </p>
            </div>
          )}

        </form>
      )}

      {/* ERROR */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* RESULTADO */}
      {result && (
        <div className="mt-6 transition-all duration-300">

          <h3 className="text-lg font-bold">Resultado:</h3>

          <div className="mt-4 space-y-3">
            {result.vacunas_recomendadas.length > 0 ? (
              result.vacunas_recomendadas.map((v, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border bg-green-50 border-green-200 flex items-center gap-3"
                >
                  <Syringe className="text-green-600" />
                  <span className="font-medium text-green-800">{v}</span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
                ✅ No se requieren vacunas adicionales
              </div>
            )}
          </div>

          {/* Reiniciar */}
          <button
            onClick={handleReset}
            className="mt-4 w-full p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Reiniciar
          </button>

        </div>
      )}
    </div>
  )
}