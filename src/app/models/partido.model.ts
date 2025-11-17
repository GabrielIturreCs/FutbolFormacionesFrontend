// Modelo completo para gestión de partidos con calificaciones y estadísticas

export interface Calificacion {
  usuarioId: string;
  usuarioNombre: string;
  puntuacion: number; // 1-10
  fecha: Date;
}

export interface EstadisticasPartido {
  goles: number;
  asistencias: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  minutosJugados: number;
}

export interface Sustitucion {
  jugadorSale: string; // ID del jugador que sale
  jugadorEntra: string; // ID del jugador que entra
  minuto: number;
  motivo?: string; // Ej: "Lesión", "Táctica", etc.
}

export interface JugadorPartido {
  jugadorId: string;
  numero?: number;
  posicion?: {
    x: number;
    y: number;
  };
  esTitular: boolean; // true = titular en cancha, false = suplente
  estadisticas: EstadisticasPartido;
  calificaciones: Calificacion[];
  promedioCalificacion?: number; // Calculado automáticamente
}

export interface EquipoPartido {
  nombre: string;
  color: string;
  jugadores: JugadorPartido[];
  sustitucionesTitulares: JugadorPartido[]; // Jugadores titulares (en cancha)
  suplentes: JugadorPartido[]; // Jugadores en banca
  sustitucionesRealizadas: Sustitucion[];
}

export interface Partido {
  _id?: string;
  nombre: string; // Ej: "Final Copa 2024"
  descripcion?: string;
  fecha: Date;
  hora: string; // Formato "HH:mm"
  lugar?: string;
  equipos: {
    local: EquipoPartido;
    visitante: EquipoPartido;
  };
  resultado?: {
    local: number;
    visitante: number;
  };
  mvp?: {
    jugadorId: string;
    jugadorNombre: string;
    equipo: 'local' | 'visitante';
    promedioCalificacion: number;
  };
  estado: 'programado' | 'en_curso' | 'finalizado';
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaz para enviar calificaciones desde el frontend
export interface NuevaCalificacion {
  partidoId: string;
  equipoTipo: 'local' | 'visitante';
  jugadorId: string;
  usuarioId: string;
  usuarioNombre: string;
  puntuacion: number;
}
