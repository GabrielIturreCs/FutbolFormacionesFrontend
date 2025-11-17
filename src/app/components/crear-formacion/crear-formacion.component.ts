import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';

interface Jugador {
  _id: string;
  nombre: string;
  numero?: number;
  equipo: string;
  goles: number;
  asistencias: number;
  fotoUrl?: string;
}

interface EstadisticasPartido {
  goles: number;
  asistencias: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
}

interface JugadorFormacion {
  jugadorId: string;
  posicion: {
    x: number;
    y: number;
  };
  numero?: number;
  estadisticas?: EstadisticasPartido;
}

interface Equipo {
  nombre: string;
  color: string;
  jugadores: JugadorFormacion[];
}

interface Partido {
  _id?: string;
  nombre: string;
  descripcion?: string;
  fecha?: Date;
  hora?: string;
  equipos: {
    local: Equipo;
    visitante: Equipo;
  };
}

@Component({
  selector: 'app-crear-formacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="hero-section text-center py-4 bg-dark text-white">
        <div class="container">
          <h1 class="display-4 fw-bold mb-3">
            <i class="bi bi-calendar-event-fill text-warning me-3"></i>
            {{ esEdicion ? 'Editar' : 'Crear' }} Partido
          </h1>
          <p class="lead">{{ esEdicion ? 'Modifica' : 'Crea' }} tu partido y registra estadísticas</p>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="container py-4">
        <form (ngSubmit)="guardarFormacion()">
          <!-- Información básica -->
          <div class="row mb-4">
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5><i class="bi bi-info-circle me-2"></i>Información del Partido</h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label">Nombre del Partido *</label>
                    <input type="text" class="form-control"
                           [(ngModel)]="formacion.nombre"
                           name="nombre" required
                           placeholder="Ej: Final 2024, Amistoso vs Azul">
                  </div>
                  <div class="row">
                    <div class="col-6">
                      <div class="mb-3">
                        <label class="form-label">Fecha *</label>
                        <input type="date" class="form-control"
                               [(ngModel)]="formacion.fecha"
                               name="fecha" required>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="mb-3">
                        <label class="form-label">Hora *</label>
                        <input type="time" class="form-control"
                               [(ngModel)]="formacion.hora"
                               name="hora" required>
                      </div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Descripción</label>
                    <textarea class="form-control"
                              [(ngModel)]="formacion.descripcion"
                              name="descripcion"
                              rows="2"
                              placeholder="Descripción opcional del partido"></textarea>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5><i class="bi bi-gear me-2"></i>Configuración de Equipos</h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-6">
                      <h6>Equipo Local</h6>
                      <div class="mb-3">
                        <label class="form-label">Nombre</label>
                        <input type="text" class="form-control"
                               [(ngModel)]="formacion.equipos.local.nombre"
                               name="localNombre" required>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Color</label>
                        <input type="color" class="form-control form-control-color"
                               [(ngModel)]="formacion.equipos.local.color"
                               name="localColor" required>
                      </div>
                    </div>
                    <div class="col-6">
                      <h6>Equipo Visitante</h6>
                      <div class="mb-3">
                        <label class="form-label">Nombre</label>
                        <input type="text" class="form-control"
                               [(ngModel)]="formacion.equipos.visitante.nombre"
                               name="visitanteNombre" required>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Color</label>
                        <input type="color" class="form-control form-control-color"
                               [(ngModel)]="formacion.equipos.visitante.color"
                               name="visitanteColor" required>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Campo de fútbol -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5><i class="bi bi-pitch me-2"></i>Campo de Fútbol</h5>
                  <div class="btn-group" role="group">
                    <button type="button" class="btn btn-outline-primary btn-sm"
                            (click)="seleccionarEquipo('local')"
                            [class.active]="equipoSeleccionado === 'local'">
                      <i class="bi bi-person-fill me-1"></i>
                      {{ formacion.equipos.local.nombre || 'Local' }}
                    </button>
                    <button type="button" class="btn btn-outline-primary btn-sm"
                            (click)="seleccionarEquipo('visitante')"
                            [class.active]="equipoSeleccionado === 'visitante'">
                      <i class="bi bi-person-fill me-1"></i>
                      {{ formacion.equipos.visitante.nombre || 'Visitante' }}
                    </button>
                  </div>
                </div>
                <div class="card-body">
                  <div class="campo-container">
                    <div class="campo-futbol"
                         (click)="agregarJugadorEnPosicion($event)"
                         (dragover)="onDragOver($event)"
                         (drop)="onDrop($event)">
                      
                      <!-- Líneas del campo -->
                      <div class="linea-central"></div>
                      <div class="circulo-central"></div>
                      <div class="area-izquierda"></div>
                      <div class="area-derecha"></div>
                      <div class="area-pequena-izquierda"></div>
                      <div class="area-pequena-derecha"></div>
                      <div class="arco-izquierdo"></div>
                      <div class="arco-derecho"></div>
                      
                      <!-- Jugadores del equipo seleccionado -->
                      <div *ngFor="let jugador of formacion.equipos[equipoSeleccionado].jugadores; let i = index"
                           class="jugador"
                           [class.jugador-local]="equipoSeleccionado === 'local'"
                           [class.jugador-visitante]="equipoSeleccionado === 'visitante'"
                           [style.left.%]="jugador.posicion.x"
                           [style.top.%]="jugador.posicion.y"
                           [attr.draggable]="true"
                           (dragstart)="onDragStart($event, jugador, equipoSeleccionado)"
                           (click)="editarJugador(jugador, equipoSeleccionado)">
                        <div class="jugador-avatar" [style.background-color]="formacion.equipos[equipoSeleccionado].color">
                          <ng-container *ngIf="getFotoUrlById(jugador.jugadorId) !== 'assets/img/avatar-default.png'; else icono">
                            <img [src]="getFotoUrlById(jugador.jugadorId)" class="jugador-foto-campo" alt="Foto" />
                          </ng-container>
                          <ng-template #icono>
                            <i class="bi bi-person-fill jugador-foto-campo"></i>
                          </ng-template>
                        </div>
                        <div class="jugador-nombre">{{ getJugadorNombre(jugador.jugadorId) }}</div>
                        <div class="jugador-numero">{{ jugador.numero || '?' }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="text-center mt-3">
                    <p class="text-muted">
                      <i class="bi bi-info-circle me-1"></i>
                      Haz clic en el campo para agregar jugadores del equipo {{ equipoSeleccionado === 'local' ? formacion.equipos.local.nombre : formacion.equipos.visitante.nombre }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel de jugadores disponibles -->
          <div class="row mb-4">
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5><i class="bi bi-people-fill me-2"></i>Jugadores Disponibles</h5>
                </div>
                <div class="card-body">
                  <div class="input-group mb-3">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                    <input type="text" class="form-control"
                           placeholder="Buscar jugador..."
                           [(ngModel)]="filtroJugadores"
                           name="filtroJugadores"
                           (input)="filtrarJugadores()">
                  </div>
                  
                  <div class="jugadores-lista">
                    <div *ngFor="let jugador of jugadoresFiltrados"
                         class="jugador-item"
                         [class.equipo-rojo]="jugador.equipo === 'rojo'"
                         [class.equipo-azul]="jugador.equipo === 'azul'"
                         (click)="seleccionarJugador(jugador)">
                      <div class="jugador-avatar-mini">
                        <ng-container *ngIf="getFotoUrl(jugador) !== 'assets/img/avatar-default.png'; else iconoMini">
                          <img [src]="getFotoUrl(jugador)" class="jugador-foto-mini" alt="Foto" />
                        </ng-container>
                        <ng-template #iconoMini>
                          <i class="bi bi-person-circle jugador-foto-mini"></i>
                        </ng-template>
                      </div>
                      <div class="jugador-info flex-grow-1">
                        <strong>{{ jugador.nombre }}</strong>
                        <small class="text-muted d-block">#{{ jugador.numero || 'N/A' }} · {{ jugador.equipo === 'rojo' ? 'Equipo Rojo' : 'Equipo Azul' }}</small>
                      </div>
                      <div class="jugador-stats">
                        <span class="badge bg-success me-1">{{ jugador.goles }}⚽</span>
                        <span class="badge bg-info">{{ jugador.asistencias }}🅰️</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5><i class="bi bi-list-check me-2"></i>Jugadores en el Partido - {{ equipoSeleccionado === 'local' ? formacion.equipos.local.nombre : formacion.equipos.visitante.nombre }}</h5>
                </div>
                <div class="card-body">
                  <div *ngIf="formacion.equipos[equipoSeleccionado].jugadores.length === 0" class="text-center text-muted py-4">
                    <i class="bi bi-person-x fs-1 mb-3"></i>
                    <p>No hay jugadores en el partido</p>
                  </div>
                  
                  <div class="jugadores-formacion">
                    <div *ngFor="let jugador of formacion.equipos[equipoSeleccionado].jugadores; let i = index"
                         class="jugador-formacion-item mb-3">
                      <div class="d-flex align-items-center justify-content-between mb-2">
                        <div class="jugador-info">
                          <strong>{{ getJugadorNombre(jugador.jugadorId) }}</strong>
                          <small class="text-muted d-block">#{{ jugador.numero || '?' }}</small>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-danger"
                                (click)="removerJugador(jugador, equipoSeleccionado)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                      
                      <!-- Estadísticas del partido -->
                      <div class="estadisticas-partido">
                        <div class="row g-2">
                          <div class="col-3">
                            <label class="form-label small">⚽ Goles</label>
                            <input type="number" class="form-control form-control-sm" min="0" max="20"
                                   [(ngModel)]="jugador.estadisticas.goles"
                                   [name]="'goles-' + i"
                                   placeholder="0">
                          </div>
                          <div class="col-3">
                            <label class="form-label small">👟 Asist.</label>
                            <input type="number" class="form-control form-control-sm" min="0" max="20"
                                   [(ngModel)]="jugador.estadisticas.asistencias"
                                   [name]="'asist-' + i"
                                   placeholder="0">
                          </div>
                          <div class="col-3">
                            <label class="form-label small">🟨</label>
                            <input type="number" class="form-control form-control-sm" min="0" max="2"
                                   [(ngModel)]="jugador.estadisticas.tarjetasAmarillas"
                                   [name]="'amar-' + i"
                                   placeholder="0">
                          </div>
                          <div class="col-3">
                            <label class="form-label small">🟥</label>
                            <input type="number" class="form-control form-control-sm" min="0" max="1"
                                   [(ngModel)]="jugador.estadisticas.tarjetasRojas"
                                   [name]="'roja-' + i"
                                   placeholder="0">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="text-center">
            <button type="submit" class="btn btn-success btn-lg me-3" [disabled]="!formacionValida()">
              <i class="bi bi-check-circle me-2"></i>
              {{ esEdicion ? 'Actualizar' : 'Guardar' }} Formación
            </button>
            <a routerLink="/formaciones" class="btn btn-outline-secondary btn-lg me-3">
              <i class="bi bi-arrow-left me-2"></i>
              Cancelar
            </a>
            <a routerLink="/gestion-jugadores" class="btn btn-warning btn-lg">
              <i class="bi bi-gear me-2"></i>
              Gestión Jugadores
            </a>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para editar jugador en formación -->
    <div class="modal fade" id="editarJugadorModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Editar Jugador en Formación</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Número</label>
              <input type="number" class="form-control"
                     [(ngModel)]="jugadorEditando.numero"
                     min="1" max="99">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="guardarEdicionJugador()">
              <i class="bi bi-check me-1"></i>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./crear-formacion.component.scss']
})
export class CrearFormacionComponent implements OnInit {
  formacion: Partido = {
    nombre: '',
    descripcion: '',
    fecha: new Date(),
    hora: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    equipos: {
      local: { nombre: 'Equipo Local', color: '#dc3545', jugadores: [] },
      visitante: { nombre: 'Equipo Visitante', color: '#007bff', jugadores: [] }
    }
  };
  
  jugadores: Jugador[] = [];
  jugadoresFiltrados: Jugador[] = [];
  filtroJugadores = '';
  equipoSeleccionado: 'local' | 'visitante' = 'local';
  esEdicion = false;
  jugadorEditando: JugadorFormacion & { numero?: number } = { 
    jugadorId: '', 
    posicion: { x: 0, y: 0 }, 
    numero: undefined 
  };
  equipoEditando: 'local' | 'visitante' = 'local';
  private jugadorArrastrado: { jugador: JugadorFormacion; equipo: 'local' | 'visitante' } | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.cargarJugadores();
    this.filtrarJugadores();
    
    // Verificar si es edición
    const formacionId = this.route.snapshot.params['id'];
    if (formacionId) {
      this.esEdicion = true;
      this.cargarFormacion(formacionId);
    }
  }

  cargarJugadores(): void {
    this.http.get<any>(this.configService.getFullApiUrl('/formaciones/jugadores-disponibles'))
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

  cargarFormacion(id: string): void {
    this.http.get<any>(`${this.configService.getApiUrl()}/api/formaciones/${id}`)
      .subscribe({
        next: (response) => {
          this.formacion = response.data.formacion;
        },
        error: (error) => {
          console.error('Error cargando formación:', error);
        }
      });
  }

  filtrarJugadores(): void {
    // Obtener IDs de jugadores ya seleccionados en ambos equipos
    const idsEnFormacion = [
      ...this.formacion.equipos.local.jugadores.map((j: JugadorFormacion) => j.jugadorId),
      ...this.formacion.equipos.visitante.jugadores.map((j: JugadorFormacion) => j.jugadorId)
    ];

    // Filtrar por equipo según selección: rojo = local, azul = visitante
    const equipoPermitido = this.equipoSeleccionado === 'local' ? 'rojo' : 'azul';

    let jugadoresFiltradosPorEquipo = this.jugadores.filter(j => 
      j.equipo === equipoPermitido && !idsEnFormacion.includes(j._id)
    );

    if (!this.filtroJugadores.trim()) {
      this.jugadoresFiltrados = jugadoresFiltradosPorEquipo;
    } else {
      this.jugadoresFiltrados = jugadoresFiltradosPorEquipo.filter(jugador =>
        (jugador.nombre.toLowerCase().includes(this.filtroJugadores.toLowerCase()) ||
        (jugador.numero && jugador.numero.toString().includes(this.filtroJugadores)))
      );
    }
  }

  seleccionarEquipo(equipo: 'local' | 'visitante'): void {
    this.equipoSeleccionado = equipo;
    this.filtrarJugadores(); // Actualizar lista cuando cambia el equipo seleccionado
  }

  agregarJugadorEnPosicion(event: MouseEvent): void {
    // Solo procesar si el click es directamente en el campo
    if ((event.target as HTMLElement).classList.contains('campo-futbol')) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      
      // Limitar posiciones dentro del campo
      const posicionX = Math.max(5, Math.min(95, x));
      const posicionY = Math.max(5, Math.min(95, y));
      
      this.mostrarModalSeleccionJugador(posicionX, posicionY);
    }
  }

  mostrarModalSeleccionJugador(x: number, y: number): void {
    // Por simplicidad, usar el primer jugador disponible
    // En una implementación real, mostrarías un modal de selección
    const jugadorSeleccionado = this.jugadoresFiltrados[0];
    if (jugadorSeleccionado) {
      this.agregarJugador(jugadorSeleccionado, x, y);
    } else {
      alert('No hay jugadores disponibles. Agrega jugadores primero.');
    }
  }

  agregarJugador(jugador: Jugador, x: number, y: number): void {
    // Verificar si el jugador ya está en algún equipo
    const yaEnLocal = this.formacion.equipos.local.jugadores.some((j: JugadorFormacion) => j.jugadorId === jugador._id);
    const yaEnVisitante = this.formacion.equipos.visitante.jugadores.some((j: JugadorFormacion) => j.jugadorId === jugador._id);

    if (yaEnLocal || yaEnVisitante) {
      alert('Este jugador ya está en el partido');
      return;
    }

    const nuevoJugador: JugadorFormacion = {
      jugadorId: jugador._id,
      posicion: { x, y },
      numero: jugador.numero,
      estadisticas: {
        goles: 0,
        asistencias: 0,
        tarjetasAmarillas: 0,
        tarjetasRojas: 0
      }
    };

    this.formacion.equipos[this.equipoSeleccionado].jugadores.push(nuevoJugador);
    this.filtrarJugadores(); // Refrescar lista visual
  }

  seleccionarJugador(jugador: Jugador): void {
    this.agregarJugador(jugador, 50, 50);
  }

  removerJugador(jugador: JugadorFormacion, equipo: 'local' | 'visitante'): void {
    this.formacion.equipos[equipo].jugadores = this.formacion.equipos[equipo].jugadores.filter(
      (j: JugadorFormacion) => j.jugadorId !== jugador.jugadorId
    );
    this.filtrarJugadores(); // Refrescar lista visual
  }

  editarJugador(jugador: JugadorFormacion, equipo: 'local' | 'visitante'): void {
    event?.stopPropagation(); // Evitar que se active el click del campo
    this.jugadorEditando = { ...jugador, numero: jugador.numero };
    this.equipoEditando = equipo;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('editarJugadorModal'));
    modal.show();
  }

  guardarEdicionJugador(): void {
    const jugadorIndex = this.formacion.equipos[this.equipoEditando].jugadores.findIndex(
      (j: JugadorFormacion) => j.jugadorId === this.jugadorEditando.jugadorId
    );
    
    if (jugadorIndex !== -1) {
      this.formacion.equipos[this.equipoEditando].jugadores[jugadorIndex] = { ...this.jugadorEditando };
    }
    
    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('editarJugadorModal'));
    modal.hide();
  }

  getJugadorNombre(jugadorId: string): string {
    const jugador = this.jugadores.find(j => j._id === jugadorId);
    return jugador ? jugador.nombre : 'Jugador';
  }

  // Función robusta para obtener la URL del jugador (igual que en gestión jugadores)
  getFotoUrl(jugador: Jugador | any): string {
    if (!jugador) return 'assets/img/avatar-default.png';
    if (jugador.fotoUrl && typeof jugador.fotoUrl === 'string' && jugador.fotoUrl.startsWith('http')) {
      return jugador.fotoUrl;
    }
    return 'assets/img/avatar-default.png';
  }

  // Función auxiliar para obtener la foto de un jugador por ID
  getFotoUrlById(jugadorId: string): string {
    const jugador = this.jugadores.find(j => j._id === jugadorId);
    return this.getFotoUrl(jugador);
  }

  // FUNCIONES DE DRAG AND DROP MEJORADAS
  onDragStart(event: DragEvent, jugador: JugadorFormacion, equipo: 'local' | 'visitante'): void {
    this.jugadorArrastrado = { jugador, equipo };
    event.dataTransfer?.setData('text/plain', JSON.stringify({ jugador, equipo }));
    
    // Agregar clase visual de arrastre
    (event.target as HTMLElement).classList.add('dragging');
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    
    if (this.jugadorArrastrado) {
      const campo = (event.target as HTMLElement).closest('.campo-futbol') as HTMLElement;
      if (!campo) return;
      
      const rect = campo.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      
      // Limitar posiciones dentro del campo
      const posicionX = Math.max(5, Math.min(95, x));
      const posicionY = Math.max(5, Math.min(95, y));
      
      // Actualizar posición del jugador
      const jugadorIndex = this.formacion.equipos[this.jugadorArrastrado.equipo].jugadores.findIndex(
        (j: JugadorFormacion) => j.jugadorId === this.jugadorArrastrado!.jugador.jugadorId
      );
      
      if (jugadorIndex !== -1) {
        this.formacion.equipos[this.jugadorArrastrado.equipo].jugadores[jugadorIndex].posicion = { 
          x: posicionX, 
          y: posicionY 
        };
      }
      
      this.jugadorArrastrado = null;
    }
    
    // Remover clases de arrastre
    document.querySelectorAll('.jugador.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
  }

  guardarFormacion(): void {
    if (!this.formacionValida()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const url = this.esEdicion 
      ? `${this.configService.getApiUrl()}/api/formaciones/${this.formacion._id}`
      : this.configService.getFullApiUrl('/formaciones');
    
    const request = this.esEdicion 
      ? this.http.put<any>(url, this.formacion)
      : this.http.post<any>(url, this.formacion);

    request.subscribe({
      next: () => {
        alert(`Formación ${this.esEdicion ? 'actualizada' : 'creada'} exitosamente`);
        window.location.href = '/formaciones';
      },
      error: (error) => {
        console.error(`Error ${this.esEdicion ? 'actualizando' : 'creando'} formación:`, error);
        alert(`Error al ${this.esEdicion ? 'actualizar' : 'crear'} formación`);
      }
    });
  }

  formacionValida(): boolean {
    return !!(
      this.formacion.nombre &&
      this.formacion.equipos.local.nombre &&
      this.formacion.equipos.visitante.nombre &&
      this.formacion.equipos.local.color &&
      this.formacion.equipos.visitante.color
    );
  }
}