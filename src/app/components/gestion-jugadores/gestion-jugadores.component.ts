import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';

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
  fotoUrl?: string; // Added fotoUrl to the interface
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
                          <ng-container *ngIf="getFotoUrl(jugador) !== 'assets/img/avatar-default.png'; else icono">
                            <img [src]="getFotoUrl(jugador)" alt="Foto" class="jugador-foto-campo" />
                          </ng-container>
                          <ng-template #icono>
                            <i class="bi bi-person-circle jugador-foto-campo"></i>
                          </ng-template>
                        </div>
                        <div class="flex-grow-1 text-center">
                          <div class="jugador-numero mb-1">{{ jugador.numero || 'N/A' }}</div>
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
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">
              <i class="bi bi-person-plus-fill me-2"></i>
              {{ esEdicion ? 'Editar' : 'Crear' }} Jugador
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form>
              <!-- Información básica -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="text-primary mb-3">
                    <i class="bi bi-info-circle me-2"></i>
                    Información Básica
                  </h6>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-person me-1"></i>
                      Nombre del Jugador *
                    </label>
                    <input type="text" class="form-control form-control-lg" 
                           [(ngModel)]="jugadorForm.nombre" 
                           name="nombre" 
                           placeholder="Ej: Lionel Messi"
                           required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-hash me-1"></i>
                      Número de Camiseta
                    </label>
                    <input type="number" class="form-control form-control-lg" 
                           [(ngModel)]="jugadorForm.numero" 
                           name="numero" 
                           placeholder="Ej: 10"
                           min="1" max="99">
                  </div>
                </div>
              </div>
              
              <!-- Equipo y Posición -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="text-success mb-3">
                    <i class="bi bi-shield me-2"></i>
                    Equipo y Posición
                  </h6>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-people me-1"></i>
                      Equipo *
                    </label>
                    <select class="form-select form-select-lg" [(ngModel)]="jugadorForm.equipo" name="equipo" required>
                      <option value="">🏟️ Seleccionar equipo</option>
                      <option value="rojo">🔴 Equipo Rojo</option>
                      <option value="azul">🔵 Equipo Azul</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-geo-alt me-1"></i>
                      Posición en el Campo
                    </label>
                    <select class="form-select form-select-lg" [(ngModel)]="jugadorForm.posicionJugador" name="posicionJugador">
                      <option value="">⚽ Seleccionar posición</option>
                      <option value="Portero">🥅 Portero</option>
                      <option value="Defensa">🛡️ Defensa</option>
                      <option value="Mediocampista">⚙️ Mediocampista</option>
                      <option value="Delantero">⚽ Delantero</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Estadísticas -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="text-warning mb-3">
                    <i class="bi bi-graph-up me-2"></i>
                    Estadísticas
                  </h6>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-trophy me-1"></i>
                      Goles Marcados
                    </label>
                    <input type="number" class="form-control form-control-lg" 
                           [(ngModel)]="jugadorForm.goles" 
                           name="goles" 
                           placeholder="0"
                           min="0">
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-hand-index me-1"></i>
                      Asistencias
                    </label>
                    <input type="number" class="form-control form-control-lg" 
                           [(ngModel)]="jugadorForm.asistencias" 
                           name="asistencias" 
                           placeholder="0"
                           min="0">
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-calendar-event me-1"></i>
                      Partidos Jugados
                    </label>
                    <input type="number" class="form-control form-control-lg" 
                           [(ngModel)]="jugadorForm.partidosJugados" 
                           name="partidosJugados" 
                           placeholder="0"
                           min="0">
                  </div>
                </div>
              </div>

              <!-- Estado -->
              <div class="row">
                <div class="col-12">
                  <h6 class="text-info mb-3">
                    <i class="bi bi-toggle-on me-2"></i>
                    Estado del Jugador
                  </h6>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-person-check me-1"></i>
                      Estado
                    </label>
                    <select class="form-select form-select-lg" [(ngModel)]="jugadorForm.activo" name="activo">
                      <option [ngValue]="true">✅ Activo</option>
                      <option [ngValue]="false">❌ Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Foto del Jugador (opcional) -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="text-secondary mb-3">
                    <i class="bi bi-image me-2"></i>
                    Foto del Jugador (opcional)
                  </h6>
                  <input type="file" class="form-control" accept="image/*"
                         (change)="onFotoChange($event)">
                  <div *ngIf="fotoPreview" class="mt-2">
                    <img [src]="fotoPreview" alt="Preview" style="max-width: 120px; border-radius: 8px; border: 1px solid #ccc;" />
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary btn-lg" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-1"></i>
              Cancelar
            </button>
            <button type="button" class="btn btn-success btn-lg" (click)="guardarJugador()">
              <i class="bi bi-check-circle me-1"></i>
              {{ esEdicion ? 'Actualizar' : 'Crear' }} Jugador
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
    activo: true
  };
  
  esEdicion = false;
  jugadorSeleccionado: Jugador | null = null;
  confirmacionTitulo = '';
  confirmacionMensaje = '';
  accionConfirmar: (() => void) | null = null;
  fotoFile: File | null = null;
  fotoPreview: string | null = null;
  error: string | null = null;

  constructor(private http: HttpClient, private configService: ConfigService) {}

  ngOnInit(): void {
    this.cargarJugadores();
  }

  cargarJugadores(): void {
    this.http.get<any>(this.configService.getFullApiUrl('/jugadores'))
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

  onFotoChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fotoFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.fotoFile = null;
      this.fotoPreview = null;
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
      activo: true,
      fotoUrl: ''
    };
    this.fotoFile = null;
    this.fotoPreview = null;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('jugadorModal'));
    modal.show();
  }

  editarJugador(jugador: Jugador): void {
    this.esEdicion = true;
    this.jugadorSeleccionado = jugador;
    this.jugadorForm = { ...jugador };
    this.fotoFile = null;
    this.fotoPreview = jugador.fotoUrl || null;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('jugadorModal'));
    modal.show();
  }

  guardarJugador(): void {
    this.error = null;
    if (!this.jugadorForm.nombre.trim() || !this.jugadorForm.equipo) {
      alert('Nombre y equipo son obligatorios');
      return;
    }
    const guardar = (fotoUrl?: string) => {
      const jugadorData = { ...this.jugadorForm, fotoUrl: fotoUrl || this.jugadorForm.fotoUrl };
      if (this.esEdicion && this.jugadorSeleccionado) {
        this.http.put<any>(`${this.configService.getApiUrl()}/api/jugadores/${this.jugadorSeleccionado._id}`, jugadorData)
          .subscribe({
            next: () => {
              this.cargarJugadores();
              this.fotoFile = null;
              this.fotoPreview = null;
              const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('jugadorModal'));
              modal.hide();
            },
            error: (error) => {
              console.error('Error actualizando jugador:', error);
              alert('Error al actualizar jugador');
            }
          });
      } else {
        this.http.post<any>(this.configService.getFullApiUrl('/jugadores'), jugadorData)
          .subscribe({
            next: () => {
              this.cargarJugadores();
              this.fotoFile = null;
              this.fotoPreview = null;
              const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('jugadorModal'));
              modal.hide();
            },
            error: (error) => {
              console.error('Error creando jugador:', error);
              alert('Error al crear jugador');
            }
          });
      }
    };
    if (this.fotoFile) {
      const formData = new FormData();
      formData.append('foto', this.fotoFile);
      this.http.post<any>(`${this.configService.getApiUrl()}/api/jugadores/upload-foto`, formData)
        .subscribe({
          next: (res) => {
            guardar(res.url);
          },
          error: (error) => {
            let msg = 'Error al subir la foto';
            if (error?.error?.error) {
              msg = error.error.error;
            }
            this.error = msg;
            alert(msg);
            guardar();
          }
        });
    } else {
      guardar();
    }
  }

  cambiarGoles(jugador: Jugador, cantidad: number): void {
    const nuevosGoles = Math.max(0, jugador.goles + cantidad);
    this.http.put<any>(`${this.configService.getApiUrl()}/api/jugadores/${jugador._id}`, {
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
    this.http.put<any>(`${this.configService.getApiUrl()}/api/jugadores/${jugador._id}`, {
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
      this.http.put<any>(`${this.configService.getApiUrl()}/api/jugadores/${jugador._id}`, {
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
      this.http.delete<any>(`${this.configService.getApiUrl()}/api/jugadores/${jugador._id}`)
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

  getFotoUrl(jugador: Jugador): string {
    // Si tiene fotoUrl (Cloudinary), úsala. Si no, usa el avatar por defecto
    return jugador.fotoUrl && jugador.fotoUrl.startsWith('http')
      ? jugador.fotoUrl
      : 'assets/img/avatar-default.png';
  }
}