export type TipoPunto = "PASO" | "CAMINO" | "IPS vacunadora" | "Punto masivo"

export interface PuntoVacunacion {
  id: string
  nombre: string
  tipo: TipoPunto
  barrio: string
  horario: string
  lat: number
  lng: number
  /** false = coordenadas aproximadas, falta confirmarlas con la lista oficial */
  verificado: boolean
}

/**
 * IMPORTANTE: estos puntos son de EJEMPLO para el prototipo.
 * Los nombres salen de sitios que el Distrito ha usado como puntos masivos de
 * vacunación (prensa local), pero las coordenadas son APROXIMADAS.
 *
 * Para dejarlo bien:
 *  1. Descarguen el listado oficial de puntos de la Secretaría Distrital de
 *     Salud (barranquilla.gov.co/salud o Línea de la Salud 605 3793333).
 *  2. Busquen cada dirección en Google Maps, clic derecho -> copiar coordenadas.
 *  3. Reemplacen o agreguen filas aquí y pongan verificado: true.
 *
 * Horarios de referencia (jornada nacional, enero 2026): PASO y CAMINO de
 * 7:00 a.m. a 1:00 p.m.; demás IPS vacunadoras de 8:00 a.m. a 4:00 p.m.
 */
export const PUNTOS: PuntoVacunacion[] = [
  {
    id: "romelio-martinez",
    nombre: "Estadio Romelio Martínez",
    tipo: "Punto masivo",
    barrio: "Barranquilla",
    horario: "Confirmar en la Línea de la Salud",
    lat: 10.9945,
    lng: -74.7959,
    verificado: false,
  },
  {
    id: "elias-chegwin",
    nombre: "Coliseo Elías Chegwin",
    tipo: "Punto masivo",
    barrio: "Barranquilla",
    horario: "Confirmar en la Línea de la Salud",
    lat: 10.9951,
    lng: -74.7905,
    verificado: false,
  },
  {
    id: "edgar-renteria",
    nombre: "Estadio Édgar Rentería",
    tipo: "Punto masivo",
    barrio: "Barranquilla",
    horario: "Confirmar en la Línea de la Salud",
    lat: 10.9893,
    lng: -74.7885,
    verificado: false,
  },
  {
    id: "normal-la-hacienda",
    nombre: "Escuela Normal Superior La Hacienda",
    tipo: "Punto masivo",
    barrio: "La Hacienda",
    horario: "Confirmar en la Línea de la Salud",
    lat: 10.9682,
    lng: -74.8102,
    verificado: false,
  },
  {
    id: "don-bosco",
    nombre: "I.E.D. Centro Social Don Bosco",
    tipo: "Punto masivo",
    barrio: "Barranquilla",
    horario: "Confirmar en la Línea de la Salud",
    lat: 10.9838,
    lng: -74.7894,
    verificado: false,
  },
]
