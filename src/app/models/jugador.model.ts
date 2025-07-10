export interface Jugador {
  id: string
  nombre: string
  equipo: "rojo" | "azul"
  posicion: {
    x: number
    y: number
  }
  numero?: number
  fotoUrl?: string
}

export interface Equipo {
  nombre: string
  color: "rojo" | "azul"
  jugadores: Jugador[]
}
