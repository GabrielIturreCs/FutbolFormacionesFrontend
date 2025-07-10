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
  fotoUrl?: string; // Agregado campo fotoUrl
}

interface JugadorFormacion {
  jugadorId: string;
  posicion: {
    x: number;
    y: number;
  };
  numero?: number;
}

interface Equipo {
  nombre: string;
  color: string;
  jugadores: JugadorFormacion[];
}

interface Formacion {
  _id?: string;
  nombre: string;
  descripcion?: string;
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
            <i class="bi bi-diagram-3-fill text-warning me-3"></i>
            {{ esEdicion ? 'Editar' : 'Crear' }} Formación
          </h1>
          <p class="lead">{{ esEdicion ? 'Modifica' : 'Crea' }} tu formación táctica</p>
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
                  <h5><i class="bi bi-info-circle me-2"></i>Información de la Formación</h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label">Nombre de la Formación *</label>
                    <input type="text" class="form-control"
                           [(ngModel)]="formacion.nombre"
                           name="nombre" required
                           placeholder="Ej: Final 2024, Amistoso vs Azul">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Descripción</label>
                    <textarea class="form-control"
                              [(ngModel)]="formacion.descripcion"
                              name="descripcion"
                              rows="3"
                              placeholder="Descripción opcional de la formación"></textarea>
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
                      
                      <!-- Jugadores del equipo local -->
                      <div *ngFor="let jugador of formacion.equipos.local.jugadores; let i = index"
                           class="jugador jugador-local"
                           [style.left.%]="jugador.posicion.x"
                           [style.top.%]="jugador.posicion.y"
                           [attr.draggable]="true"
                           (dragstart)="onDragStart($event, jugador, 'local')"
                           (click)="editarJugador(jugador, 'local')">
                        <div class="jugador-avatar" [style.background-color]="formacion.equipos.local.color">
                          <img *ngIf="getFotoUrl(jugador.jugadorId)" [src]="getFotoUrl(jugador.jugadorId)" class="jugador-foto-campo" alt="Foto" />
                          <i *ngIf="!getFotoUrl(jugador.jugadorId)" class="bi bi-person-fill jugador-foto-campo"></i>
                        </div>
                        <div class="jugador-nombre">{{ getJugadorNombre(jugador.jugadorId) }}</div>
                        <div class="jugador-numero">{{ jugador.numero || '?' }}</div>
                      </div>
                      
                      <!-- Jugadores del equipo visitante -->
                      <div *ngFor="let jugador of formacion.equipos.visitante.jugadores; let i = index"
                           class="jugador jugador-visitante"
                           [style.left.%]="jugador.posicion.x"
                           [style.top.%]="jugador.posicion.y"
                           [attr.draggable]="true"
                           (dragstart)="onDragStart($event, jugador, 'visitante')"
                           (click)="editarJugador(jugador, 'visitante')">
                        <div class="jugador-avatar" [style.background-color]="formacion.equipos.visitante.color">
                          <img *ngIf="getFotoUrl(jugador.jugadorId)" [src]="getFotoUrl(jugador.jugadorId)" class="jugador-foto-campo" alt="Foto" />
                          <i *ngIf="!getFotoUrl(jugador.jugadorId)" class="bi bi-person-fill jugador-foto-campo"></i>
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
                         (click)="seleccionarJugador(jugador)">
                      <div class="jugador-avatar-mini">
                        <img *ngIf="jugador.fotoUrl && jugador.fotoUrl.startsWith('http')" [src]="jugador.fotoUrl" class="jugador-foto-mini" alt="Foto" />
                        <i *ngIf="!jugador.fotoUrl || !jugador.fotoUrl.startsWith('http')" class="bi bi-person-circle jugador-foto-mini"></i>
                      </div>
                      <div class="jugador-info">
                        <strong>{{ jugador.nombre }}</strong>
                        <small class="text-muted">#{{ jugador.numero || 'N/A' }}</small>
                      </div>
                      <div class="jugador-stats">
                        <span class="badge bg-success me-1">{{ jugador.goles }} goles</span>
                        <span class="badge bg-info">{{ jugador.asistencias }} asistencias</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5><i class="bi bi-list-check me-2"></i>Jugadores en Formación</h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-6">
                      <h6>{{ formacion.equipos.local.nombre || 'Local' }}</h6>
                      <div class="jugadores-formacion">
                        <div *ngFor="let jugador of formacion.equipos.local.jugadores"
                             class="jugador-formacion-item">
                          <div class="jugador-info">
                            <strong>{{ getJugadorNombre(jugador.jugadorId) }}</strong>
                            <small class="text-muted">#{{ jugador.numero || '?' }}</small>
                          </div>
                          <button type="button" class="btn btn-sm btn-outline-danger"
                                  (click)="removerJugador(jugador, 'local')">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="col-6">
                      <h6>{{ formacion.equipos.visitante.nombre || 'Visitante' }}</h6>
                      <div class="jugadores-formacion">
                        <div *ngFor="let jugador of formacion.equipos.visitante.jugadores"
                             class="jugador-formacion-item">
                          <div class="jugador-info">
                            <strong>{{ getJugadorNombre(jugador.jugadorId) }}</strong>
                            <small class="text-muted">#{{ jugador.numero || '?' }}</small>
                          </div>
                          <button type="button" class="btn btn-sm btn-outline-danger"
                                  (click)="removerJugador(jugador, 'visitante')">
                            <i class="bi bi-trash"></i>
                          </button>
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
  formacion: Formacion = {
    nombre: '',
    descripcion: '',
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
      ...this.formacion.equipos.local.jugadores.map(j => j.jugadorId),
      ...this.formacion.equipos.visitante.jugadores.map(j => j.jugadorId)
    ];
    if (!this.filtroJugadores.trim()) {
      this.jugadoresFiltrados = this.jugadores.filter(j => !idsEnFormacion.includes(j._id));
    } else {
      this.jugadoresFiltrados = this.jugadores.filter(jugador =>
        (!idsEnFormacion.includes(jugador._id)) &&
        (jugador.nombre.toLowerCase().includes(this.filtroJugadores.toLowerCase()) ||
        (jugador.numero && jugador.numero.toString().includes(this.filtroJugadores)))
      );
    }
  }

  seleccionarEquipo(equipo: 'local' | 'visitante'): void {
    this.equipoSeleccionado = equipo;
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
    const yaEnLocal = this.formacion.equipos.local.jugadores.some(j => j.jugadorId === jugador._id);
    const yaEnVisitante = this.formacion.equipos.visitante.jugadores.some(j => j.jugadorId === jugador._id);
    
    if (yaEnLocal || yaEnVisitante) {
      alert('Este jugador ya está en la formación');
      return;
    }

    const nuevoJugador: JugadorFormacion = {
      jugadorId: jugador._id,
      posicion: { x, y },
      numero: jugador.numero
    };
    
    this.formacion.equipos[this.equipoSeleccionado].jugadores.push(nuevoJugador);
  }

  seleccionarJugador(jugador: Jugador): void {
    // Agregar jugador al equipo seleccionado en posición central
    this.agregarJugador(jugador, 50, 50);
  }

  removerJugador(jugador: JugadorFormacion, equipo: 'local' | 'visitante'): void {
    this.formacion.equipos[equipo].jugadores = this.formacion.equipos[equipo].jugadores.filter(
      j => j.jugadorId !== jugador.jugadorId
    );
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

  // Añadir función para obtener la foto del jugador
  getFotoUrl(jugadorId: string): string {
    const jugador = this.jugadores.find(j => j._id === jugadorId);
    return jugador && jugador.fotoUrl && jugador.fotoUrl.startsWith('http')
      ? jugador.fotoUrl
      : '';
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