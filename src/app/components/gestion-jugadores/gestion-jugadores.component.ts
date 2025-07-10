import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Jugador {
  _id: string;
  nombre: string;
  numero?: number;
  equipo: 'rojo' | 'azul';
  posicionJugador?: string;
  goles: number;
  asistencias: number;
  partidosJugados: number;
  posicion: {
    x: number;
    y: number;
  };
  activo: boolean;
}

@Component({
  selector: 'app-gestion-jugadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="hero-section text-center py-4 bg-dark text-white">
        <div class="container">
          <h1 class="display-4 fw-bold mb-3">
            <i class="bi bi-people-fill text-warning me-3"></i>
            Gestión de Jugadores
          </h1>
          <p class="lead">Administra tu plantel completo</p>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="container py-4">
        <!-- Estadísticas generales -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="stat-card bg-primary text-white rounded p-3 text-center">
              <i class="bi bi-people-fill fs-2"></i>
              <h3>{{ jugadores.length }}</h3>
              <p class="mb-0">Total Jugadores</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card bg-danger text-white rounded p-3 text-center">
              <i class="bi bi-person-fill fs-2"></i>
              <h3>{{ jugadoresRojos.length }}</h3>
              <p class="mb-0">Equipo Rojo</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card bg-info text-white rounded p-3 text-center">
              <i class="bi bi-person-fill fs-2"></i>
              <h3>{{ jugadoresAzules.length }}</h3>
              <p class="mb-0">Equipo Azul</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card bg-success text-white rounded p-3 text-center">
              <i class="bi bi-dribbble fs-2"></i>
              <h3>{{ totalGoles }}</h3>
              <p class="mb-0">Total Goles</p>
            </div>
          </div>
        </div>

        <!-- Barra de acciones -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input type="text" class="form-control" 
                     placeholder="Buscar jugador..." 
                     [(ngModel)]="filtroBusqueda"
                     (input)="filtrarJugadores()">
            </div>
          </div>
          <div class="col-md-6 text-end">
            <button class="btn btn-success btn-lg me-2" (click)="abrirModalCrear()">
              <i class="bi bi-person-plus-fill me-2"></i>
              Nuevo Jugador
            </button>
            <a routerLink="/formaciones" class="btn btn-info btn-lg">
              <i class="bi bi-diagram-3-fill me-2"></i>
              Formaciones
            </a>
          </div>
        </div>

        <!-- Tabla de jugadores -->
        <div class="card shadow">
          <div class="card-header bg-dark text-white">
            <h5 class="mb-0">
              <i class="bi bi-list-ul me-2"></i>
              Plantel Completo
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-dark">
                  <tr>
                    <th scope="col">Jugador</th>
                    <th scope="col" class="text-center">Número</th>
                    <th scope="col" class="text-center">Posición</th>
                    <th scope="col" class="text-center">Equipo</th>
                    <th scope="col" class="text-center">Goles</th>
                    <th scope="col" class="text-center">Asistencias</th>
                    <th scope="col" class="text-center">Partidos</th>
                    <th scope="col" class="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let jugador of jugadoresFiltrados">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="jugador-avatar me-3" 
                             [class.equipo-rojo]="jugador.equipo === 'rojo'"
                             [class.equipo-azul]="jugador.equipo === 'azul'">
                          <i class="bi bi-person-fill"></i>
                        </div>
                        <div>
                          <strong>{{ jugador.nombre }}</strong>
                          <br>
                          <small class="text-muted">ID: {{ jugador._id.slice(-6) }}</small>
                        </div>
                      </div>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-dark">{{ jugador.numero || 'N/A' }}</span>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-secondary">{{ jugador.posicionJugador || 'N/A' }}</span>
                    </td>
                    <td class="text-center">
                      <span class="badge" 
                            [class.bg-danger]="jugador.equipo === 'rojo'"
                            [class.bg-primary]="jugador.equipo === 'azul'">
                        {{ jugador.equipo === 'rojo' ? 'Rojo' : 'Azul' }}
                      </span>
                    </td>
                    <td class="text-center">
                      <div class="d-flex align-items-center justify-content-center">
                        <button class="btn btn-sm btn-outline-danger me-2" 
                                (click)="cambiarGoles(jugador, -1)">
                          <i class="bi bi-dash"></i>
                        </button>
                        <span class="badge bg-success fs-6 mx-2">{{ jugador.goles }}</span>
                        <button class="btn btn-sm btn-outline-success me-2" 
                                (click)="cambiarGoles(jugador, 1)">
                          <i class="bi bi-plus"></i>
                        </button>
                      </div>
                    </td>
                    <td class="text-center">
                      <div class="d-flex align-items-center justify-content-center">
                        <button class="btn btn-sm btn-outline-danger me-2" 
                                (click)="cambiarAsistencias(jugador, -1)">
                          <i class="bi bi-dash"></i>
                        </button>
                        <span class="badge bg-info mx-2">{{ jugador.asistencias }}</span>
                        <button class="btn btn-sm btn-outline-info me-2" 
                                (click)="cambiarAsistencias(jugador, 1)">
                          <i class="bi bi-plus"></i>
                        </button>
                      </div>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-secondary">{{ jugador.partidosJugados }}</span>
                    </td>
                    <td class="text-center">
                      <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary me-1" 
                                (click)="editarJugador(jugador)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning me-1" 
                                (click)="cambiarEstado(jugador)">
                          <i class="bi" [class.bi-eye]="jugador.activo" [class.bi-eye-slash]="!jugador.activo"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                (click)="eliminarJugador(jugador)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="text-center mt-4">
          <button class="btn btn-primary btn-lg me-3" (click)="cargarJugadores()">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Actualizar
          </button>
          <a routerLink="/" class="btn btn-outline-secondary btn-lg me-3">
            <i class="bi bi-house me-2"></i>
            Volver al Campo
          </a>
          <a routerLink="/top-goleadores" class="btn btn-success btn-lg">
            <i class="bi bi-trophy me-2"></i>
            Ver Top Goleadores
          </a>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar jugador -->
    <div class="modal fade" id="jugadorModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ esEdicion ? 'Editar' : 'Crear' }} Jugador</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Nombre *</label>
                    <input type="text" class="form-control" 
                           [(ngModel)]="jugadorForm.nombre" 
                           name="nombre" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Número</label>
                    <input type="number" class="form-control" 
                           [(ngModel)]="jugadorForm.numero" 
                           name="numero" min="1" max="99">
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Equipo *</label>
                    <select class="form-select" [(ngModel)]="jugadorForm.equipo" name="equipo" required>
                      <option value="">Seleccionar equipo</option>
                      <option value="rojo">Equipo Rojo</option>
                      <option value="azul">Equipo Azul</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Posición</label>
                    <select class="form-select" [(ngModel)]="jugadorForm.posicionJugador" name="posicionJugador">
                      <option value="">Seleccionar posición</option>
                      <option value="Portero">Portero</option>
                      <option value="Defensa">Defensa</option>
                      <option value="Mediocampista">Mediocampista</option>
                      <option value="Delantero">Delantero</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Estado</label>
                    <select class="form-select" [(ngModel)]="jugadorForm.activo" name="activo">
                      <option [ngValue]="true">Activo</option>
                      <option [ngValue]="false">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Goles</label>
                    <input type="number" class="form-control" 
                           [(ngModel)]="jugadorForm.goles" 
                           name="goles" min="0">
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Asistencias</label>
                    <input type="number" class="form-control" 
                           [(ngModel)]="jugadorForm.asistencias" 
                           name="asistencias" min="0">
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Partidos Jugados</label>
                    <input type="number" class="form-control" 
                           [(ngModel)]="jugadorForm.partidosJugados" 
                           name="partidosJugados" min="0">
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Posición X (%)</label>
                    <input type="number" class="form-control" 
                           [(ngModel)]="jugadorForm.posicion.x" 
                           name="posicionX" min="0" max="100">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Posición Y (%)</label>
                    <input type="number" class="form-control" 
                           [(ngModel)]="jugadorForm.posicion.y" 
                           name="posicionY" min="0" max="100">
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="guardarJugador()">
              <i class="bi bi-check-lg me-1"></i>
              {{ esEdicion ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div class="modal fade" id="confirmModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ confirmacionTitulo }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>{{ confirmacionMensaje }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" (click)="confirmarAccion()">
              <i class="bi bi-check-lg me-1"></i>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./gestion-jugadores.component.scss']
})
export class GestionJugadoresComponent implements OnInit {
  jugadores: Jugador[] = [];
  jugadoresFiltrados: Jugador[] = [];
  filtroBusqueda = '';
  
  jugadorForm: any = {
    nombre: '',
    numero: null,
    equipo: '',
    posicionJugador: '',
    goles: 0,
    asistencias: 0,
    partidosJugados: 0,
    posicion: { x: 50, y: 50 },
    activo: true
  };
  
  esEdicion = false;
  jugadorSeleccionado: Jugador | null = null;
  confirmacionTitulo = '';
  confirmacionMensaje = '';
  accionConfirmar: (() => void) | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarJugadores();
  }

  cargarJugadores(): void {
    this.http.get<any>('http://localhost:3000/api/jugadores')
      .subscribe({
        next: (response) => {
          this.jugadores = response.data;
          this.filtrarJugadores();
        },
        error: (error) => {
          console.error('Error cargando jugadores:', error);
        }
      });
  }

  filtrarJugadores(): void {
    if (!this.filtroBusqueda.trim()) {
      this.jugadoresFiltrados = this.jugadores;
    } else {
      this.jugadoresFiltrados = this.jugadores.filter(jugador =>
        jugador.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        (jugador.numero && jugador.numero.toString().includes(this.filtroBusqueda)) ||
        jugador.equipo.toLowerCase().includes(this.filtroBusqueda.toLowerCase())
      );
    }
  }

  abrirModalCrear(): void {
    this.esEdicion = false;
    this.jugadorForm = {
      nombre: '',
      numero: null,
      equipo: '',
      posicionJugador: '',
      goles: 0,
      asistencias: 0,
      partidosJugados: 0,
      posicion: { x: 50, y: 50 },
      activo: true
    };
    const modal = new (window as any).bootstrap.Modal(document.getElementById('jugadorModal'));
    modal.show();
  }

  editarJugador(jugador: Jugador): void {
    this.esEdicion = true;
    this.jugadorSeleccionado = jugador;
    this.jugadorForm = { ...jugador };
    const modal = new (window as any).bootstrap.Modal(document.getElementById('jugadorModal'));
    modal.show();
  }

  guardarJugador(): void {
    if (!this.jugadorForm.nombre.trim() || !this.jugadorForm.equipo) {
      alert('Nombre y equipo son obligatorios');
      return;
    }

    if (this.esEdicion && this.jugadorSeleccionado) {
      // Actualizar jugador existente
      this.http.put<any>(`http://localhost:3000/api/jugadores/${this.jugadorSeleccionado._id}`, this.jugadorForm)
        .subscribe({
          next: () => {
            this.cargarJugadores();
            const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('jugadorModal'));
            modal.hide();
          },
          error: (error) => {
            console.error('Error actualizando jugador:', error);
            alert('Error al actualizar jugador');
          }
        });
    } else {
      // Crear nuevo jugador
      this.http.post<any>('http://localhost:3000/api/jugadores', this.jugadorForm)
        .subscribe({
          next: () => {
            this.cargarJugadores();
            const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('jugadorModal'));
            modal.hide();
          },
          error: (error) => {
            console.error('Error creando jugador:', error);
            alert('Error al crear jugador');
          }
        });
    }
  }

  cambiarGoles(jugador: Jugador, cantidad: number): void {
    const nuevosGoles = Math.max(0, jugador.goles + cantidad);
    this.http.put<any>(`http://localhost:3000/api/jugadores/${jugador._id}`, {
      ...jugador,
      goles: nuevosGoles
    }).subscribe({
      next: () => {
        this.cargarJugadores();
      },
      error: (error) => {
        console.error('Error cambiando goles:', error);
      }
    });
  }

  cambiarAsistencias(jugador: Jugador, cantidad: number): void {
    const nuevasAsistencias = Math.max(0, jugador.asistencias + cantidad);
    this.http.put<any>(`http://localhost:3000/api/jugadores/${jugador._id}`, {
      ...jugador,
      asistencias: nuevasAsistencias
    }).subscribe({
      next: () => {
        this.cargarJugadores();
      },
      error: (error) => {
        console.error('Error cambiando asistencias:', error);
      }
    });
  }

  cambiarEstado(jugador: Jugador): void {
    this.confirmacionTitulo = jugador.activo ? 'Desactivar Jugador' : 'Activar Jugador';
    this.confirmacionMensaje = `¿Estás seguro de que quieres ${jugador.activo ? 'desactivar' : 'activar'} a ${jugador.nombre}?`;
    this.jugadorSeleccionado = jugador;
    this.accionConfirmar = () => {
      this.http.put<any>(`http://localhost:3000/api/jugadores/${jugador._id}`, {
        ...jugador,
        activo: !jugador.activo
      }).subscribe({
        next: () => {
          this.cargarJugadores();
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
          modal.hide();
        },
        error: (error) => {
          console.error('Error cambiando estado:', error);
        }
      });
    };
    const modal = new (window as any).bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
  }

  eliminarJugador(jugador: Jugador): void {
    this.confirmacionTitulo = 'Eliminar Jugador';
    this.confirmacionMensaje = `¿Estás seguro de que quieres eliminar a ${jugador.nombre}? Esta acción no se puede deshacer.`;
    this.jugadorSeleccionado = jugador;
    this.accionConfirmar = () => {
      this.http.delete<any>(`http://localhost:3000/api/jugadores/${jugador._id}`)
        .subscribe({
          next: () => {
            this.cargarJugadores();
            const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
            modal.hide();
          },
          error: (error) => {
            console.error('Error eliminando jugador:', error);
          }
        });
    };
    const modal = new (window as any).bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
  }

  confirmarAccion(): void {
    if (this.accionConfirmar) {
      this.accionConfirmar();
    }
  }

  get jugadoresRojos(): Jugador[] {
    return this.jugadores.filter(j => j.equipo === 'rojo');
  }

  get jugadoresAzules(): Jugador[] {
    return this.jugadores.filter(j => j.equipo === 'azul');
  }

  get totalGoles(): number {
    return this.jugadores.reduce((total, jugador) => total + jugador.goles, 0);
  }
} 