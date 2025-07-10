import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import type { Jugador } from "../models/jugador.model"

@Injectable({
  providedIn: "root",
})
export class JugadorService {
  private readonly STORAGE_KEY = "futbol-equipos-data"

  private equiposSubject = new BehaviorSubject<{ rojo: Jugador[]; azul: Jugador[] }>({
    rojo: [],
    azul: [],
  })

  public equipos$ = this.equiposSubject.asObservable()

  constructor() {
    this.cargarDatos()
  }

  private cargarDatos(): void {
    const datosGuardados = localStorage.getItem(this.STORAGE_KEY)
    if (datosGuardados) {
      try {
        const datos = JSON.parse(datosGuardados)
        this.equiposSubject.next(datos)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      }
    }
  }

  private guardarDatos(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.equiposSubject.value))
  }

  agregarJugador(jugador: Omit<Jugador, "id" | "posicion">): void {
    const equiposActuales = this.equiposSubject.value;
    const nombreLower = jugador.nombre.trim().toLowerCase();
    // Verificar duplicados en ambos equipos
    const existe = equiposActuales.rojo.some(j => j.nombre.trim().toLowerCase() === nombreLower) ||
                   equiposActuales.azul.some(j => j.nombre.trim().toLowerCase() === nombreLower);
    if (existe) {
      alert('Ya existe un jugador con ese nombre en la cancha.');
      return;
    }
    const nuevoJugador: Jugador = {
      ...jugador,
      id: this.generarId(),
      posicion: this.generarPosicionAleatoria(jugador.equipo),
    };
    equiposActuales[jugador.equipo].push(nuevoJugador);
    this.equiposSubject.next(equiposActuales);
    this.guardarDatos();
  }

  editarJugador(id: string, nuevoNombre: string): void {
    const equiposActuales = this.equiposSubject.value

    // Buscar en equipo rojo
    const jugadorRojo = equiposActuales.rojo.find((j) => j.id === id)
    if (jugadorRojo) {
      jugadorRojo.nombre = nuevoNombre
    } else {
      // Buscar en equipo azul
      const jugadorAzul = equiposActuales.azul.find((j) => j.id === id)
      if (jugadorAzul) {
        jugadorAzul.nombre = nuevoNombre
      }
    }

    this.equiposSubject.next(equiposActuales)
    this.guardarDatos()
  }

  eliminarJugador(id: string): void {
    const equiposActuales = this.equiposSubject.value

    equiposActuales.rojo = equiposActuales.rojo.filter((j) => j.id !== id)
    equiposActuales.azul = equiposActuales.azul.filter((j) => j.id !== id)

    this.equiposSubject.next(equiposActuales)
    this.guardarDatos()
  }

  moverJugador(id: string, nuevaPosicion: { x: number; y: number }): void {
    const equiposActuales = this.equiposSubject.value

    // Buscar en ambos equipos
    const jugadorRojo = equiposActuales.rojo.find((j) => j.id === id)
    const jugadorAzul = equiposActuales.azul.find((j) => j.id === id)

    if (jugadorRojo) {
      jugadorRojo.posicion = nuevaPosicion
    } else if (jugadorAzul) {
      jugadorAzul.posicion = nuevaPosicion
    }

    this.equiposSubject.next(equiposActuales)
    this.guardarDatos()
  }

  obtenerJugadoresPorEquipo(equipo: "rojo" | "azul"): Observable<Jugador[]> {
    return new Observable((observer) => {
      this.equipos$.subscribe((equipos) => {
        observer.next(equipos[equipo])
      })
    })
  }

  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private generarPosicionAleatoria(equipo: "rojo" | "azul"): { x: number; y: number } {
    // Generar posiciones dentro de la mitad del campo correspondiente
    const mitadCampo = equipo === "rojo" ? 0.25 : 0.75 // Lado izquierdo o derecho
    const variacion = 0.2 // Variación permitida

    return {
      x: (mitadCampo + (Math.random() - 0.5) * variacion) * 100,
      y: (0.2 + Math.random() * 0.6) * 100, // Entre 20% y 80% de altura
    }
  }

  limpiarEquipo(equipo: "rojo" | "azul"): void {
    const equiposActuales = this.equiposSubject.value
    equiposActuales[equipo] = []
    this.equiposSubject.next(equiposActuales)
    this.guardarDatos()
  }

  limpiarTodo(): void {
    this.equiposSubject.next({ rojo: [], azul: [] })
    localStorage.removeItem(this.STORAGE_KEY)
  }
}
